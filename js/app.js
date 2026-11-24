/**
 * Logic điều khiển chính của ứng dụng Học Vui Lớp 6
 */
const App = {
  state: {
    xp: 0,
    streak: 1,
    completedLessons: [],
    studySubject: "math",
    studyMode: "theory",
    flashcardIndex: 0,
    tipIndex: 0,
    sheetUrl: "",
    // Quiz runtime
    quizSubject: null,
    quizIndex: 0,
    quizScore: 0,
    quizWrongList: [],
    quizSeconds: 0,
    quizTimerId: null,
    lastReportText: ""
  },

  async init() {
    this.loadState();
    if (typeof Admin !== "undefined") {
      await Admin.init();
    }
    this.renderHeaderStats();
    this.renderHomeProgress();
    this.updateQuizCounts();
    this.nextTip(true);
    this.renderStudyView();
  },

  loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem("hv6_state_v2") || "{}");
      this.state.xp = saved.xp || 0;
      this.state.streak = saved.streak || 1;
      this.state.completedLessons = saved.completedLessons || [];
      this.state.sheetUrl = saved.sheetUrl || APP_CONFIG.DEFAULT_GOOGLE_SHEET_URL || "";
    } catch (e) {
      console.warn("Không đọc được localStorage:", e);
    }
  },

  saveState() {
    localStorage.setItem("hv6_state_v2", JSON.stringify({
      xp: this.state.xp,
      streak: this.state.streak,
      completedLessons: this.state.completedLessons,
      sheetUrl: this.state.sheetUrl
    }));
  },

  showToast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.remove("hidden");
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.add("hidden"), 2600);
  },

  renderHeaderStats() {
    document.getElementById("xp-count").textContent = this.state.xp;
    document.getElementById("streak-count").textContent = this.state.streak;
  },

  renderHomeProgress() {
    const total = STUDY_DATA.lessons.math.length + STUDY_DATA.lessons.lit.length;
    const done = this.state.completedLessons.length;
    const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
    document.getElementById("overall-progress-text").textContent = `${done}/${total} bài (${pct}%)`;
    document.getElementById("overall-progress-fill").style.width = `${pct}%`;
  },

  updateQuizCounts() {
    const mEl = document.getElementById("math-quiz-count");
    const lEl = document.getElementById("lit-quiz-count");
    if (mEl) mEl.textContent = STUDY_DATA.quizzes.math.length;
    if (lEl) lEl.textContent = STUDY_DATA.quizzes.lit.length;
  },

  nextTip(isInit = false) {
    if (!isInit) {
      this.state.tipIndex = (this.state.tipIndex + 1) % STUDY_DATA.tips.length;
    } else {
      this.state.tipIndex = Math.floor(Math.random() * STUDY_DATA.tips.length);
    }
    document.getElementById("daily-tip-text").textContent = STUDY_DATA.tips[this.state.tipIndex];
  },

  switchTab(tabName) {
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));

    document.getElementById(`view-${tabName}`).classList.add("active");
    document.getElementById(`nav-${tabName}`).classList.add("active");
  },

  goToStudy(subject) {
    this.state.studySubject = subject;
    this.state.flashcardIndex = 0;
    this.switchTab("study");
    this.renderStudyView();
  },

  setStudySubject(subject) {
    this.state.studySubject = subject;
    this.state.flashcardIndex = 0;
    this.renderStudyView();
  },

  setStudyMode(mode) {
    this.state.studyMode = mode;
    this.renderStudyView();
  },

  renderStudyView() {
    const subj = this.state.studySubject;
    const mode = this.state.studyMode;

    const btnMath = document.getElementById("study-tab-math");
    const btnLit = document.getElementById("study-tab-lit");
    btnMath.className = "switch-btn" + (subj === "math" ? " active-math" : "");
    btnLit.className = "switch-btn" + (subj === "lit" ? " active-lit" : "");

    document.getElementById("mode-theory").classList.toggle("active", mode === "theory");
    document.getElementById("mode-flashcard").classList.toggle("active", mode === "flashcard");

    const theoryEl = document.getElementById("study-theory-container");
    const fcEl = document.getElementById("study-flashcard-container");

    if (mode === "theory") {
      theoryEl.classList.remove("hidden");
      fcEl.classList.add("hidden");
      this.renderLessons();
    } else {
      theoryEl.classList.add("hidden");
      fcEl.classList.remove("hidden");
      this.renderFlashcard();
    }
  },

  renderLessons() {
    const subj = this.state.studySubject;
    const list = STUDY_DATA.lessons[subj];
    const container = document.getElementById("study-theory-container");

    container.innerHTML = list.map(lesson => {
      const isDone = this.state.completedLessons.includes(lesson.id);
      const safeTitle = lesson.title.replace(/'/g, "\'");
      const imgHtml = lesson.imageUrl
        ? `<div class="lesson-img-wrap"><img src="${lesson.imageUrl}" alt="${lesson.title}" /></div>`
        : "";
      const customBadge = lesson.isCustom ? `<span class="custom-pill">Bố/Mẹ giao</span>` : "";

      return `
        <article class="lesson-card">
          <div class="lesson-top">
            <span class="lesson-tag ${subj}">${lesson.tag}</span>
            ${customBadge}
          </div>
          <h4>${lesson.title}</h4>
          <p class="lesson-body">${lesson.body}</p>
          ${imgHtml}
          <div class="lesson-example">${lesson.example}</div>
          <button class="btn full-width ${isDone ? "btn-done" : "btn-primary"}"
                  onclick="App.markLessonDone('${lesson.id}', '${safeTitle}')">
            ${isDone ? "✓ Đã hoàn thành bài học" : `Đã hiểu bài (+${APP_CONFIG.XP_PER_LESSON} XP)`}
          </button>
        </article>
      `;
    }).join("");
  },

  markLessonDone(lessonId, lessonTitle) {
    if (this.state.completedLessons.includes(lessonId)) {
      this.showToast("Bạn đã hoàn thành chuyên đề này rồi!");
      return;
    }
    this.state.completedLessons.push(lessonId);
    this.state.xp += APP_CONFIG.XP_PER_LESSON;
    this.saveState();
    this.renderHeaderStats();
    this.renderHomeProgress();
    this.renderLessons();
    this.showToast(`Tuyệt vời! +${APP_CONFIG.XP_PER_LESSON} XP`);

    const subjName = this.state.studySubject === "math" ? "Toán học 6" : "Ngữ văn 6";
    this.syncToGoogleSheet({
      thoi_gian: this.formatDateTime(new Date()),
      loai_hoat_dong: "Học lý thuyết",
      mon_hoc: subjName,
      ten_bai: lessonTitle,
      diem_so: "Hoàn thành",
      ty_le_dung: "100%",
      thoi_gian_lam: "-",
      cau_lam_sai: "Không có",
      tong_xp: this.state.xp,
      ma_xac_thuc: this.generateVerifyCode(subjName, "Hoàn thành", this.state.xp)
    }, true);
  },

  renderFlashcard() {
    const cards = STUDY_DATA.flashcards[this.state.studySubject];
    const idx = this.state.flashcardIndex % cards.length;
    const card = cards[idx];

    document.getElementById("flashcard-inner").classList.remove("is-flipped");
    document.getElementById("flashcard-counter").textContent = `Thẻ ${idx + 1} / ${cards.length}`;
    document.getElementById("fc-front-text").textContent = card.front;
    document.getElementById("fc-back-text").textContent = card.back;
  },

  flipCard() {
    document.getElementById("flashcard-inner").classList.toggle("is-flipped");
  },

  nextCard() {
    const cards = STUDY_DATA.flashcards[this.state.studySubject];
    this.state.flashcardIndex = (this.state.flashcardIndex + 1) % cards.length;
    this.renderFlashcard();
  },

  prevCard() {
    const cards = STUDY_DATA.flashcards[this.state.studySubject];
    this.state.flashcardIndex = (this.state.flashcardIndex - 1 + cards.length) % cards.length;
    this.renderFlashcard();
  },

  /* ================= QUIZ LOGIC ================= */
  startQuiz(subject) {
    this.state.quizSubject = subject;
    this.state.quizIndex = 0;
    this.state.quizScore = 0;
    this.state.quizWrongList = [];
    this.state.quizSeconds = 0;

    document.getElementById("quiz-select-screen").classList.add("hidden");
    document.getElementById("quiz-result-screen").classList.add("hidden");
    document.getElementById("quiz-active-screen").classList.remove("hidden");

    clearInterval(this.state.quizTimerId);
    this.updateTimerDisplay();
    this.state.quizTimerId = setInterval(() => {
      this.state.quizSeconds++;
      this.updateTimerDisplay();
    }, 1000);

    this.renderQuestion();
  },

  updateTimerDisplay() {
    document.getElementById("quiz-timer").textContent = `⏱️ ${this.formatSeconds(this.state.quizSeconds)}`;
  },

  formatSeconds(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  },

  renderQuestion() {
    const questions = STUDY_DATA.quizzes[this.state.quizSubject];
    const idx = this.state.quizIndex;
    const q = questions[idx];

    document.getElementById("quiz-progress-label").textContent = `Câu ${idx + 1}/${questions.length}`;
    document.getElementById("quiz-progress-bar").style.width = `${((idx + 1) / questions.length) * 100}%`;
    document.getElementById("q-topic-tag").textContent = q.topic;
    document.getElementById("q-text").textContent = q.question;

    const imgBox = document.getElementById("q-image-box");
    const imgEl = document.getElementById("q-image");
    if (q.imageUrl) {
      imgEl.src = q.imageUrl;
      imgBox.classList.remove("hidden");
    } else {
      imgBox.classList.add("hidden");
    }

    const feedbackEl = document.getElementById("q-feedback");
    feedbackEl.classList.add("hidden");
    document.getElementById("btn-next-question").classList.add("hidden");

    const letters = ["A", "B", "C", "D"];
    const optionsEl = document.getElementById("q-options");
    optionsEl.innerHTML = q.options.map((opt, i) => `
      <button class="option-btn" onclick="App.selectAnswer(${i})">
        <strong>${letters[i]}.</strong> ${opt}
      </button>
    `).join("");
  },

  selectAnswer(chosenIndex) {
    const questions = STUDY_DATA.quizzes[this.state.quizSubject];
    const q = questions[this.state.quizIndex];
    const buttons = document.querySelectorAll(".option-btn");

    buttons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.answer) btn.classList.add("correct");
      if (idx === chosenIndex && chosenIndex !== q.answer) btn.classList.add("wrong");
    });

    const feedbackEl = document.getElementById("q-feedback");
    const titleEl = document.getElementById("q-feedback-title");
    const expEl = document.getElementById("q-feedback-exp");

    feedbackEl.classList.remove("hidden", "ok", "err");

    if (chosenIndex === q.answer) {
      this.state.quizScore++;
      feedbackEl.classList.add("ok");
      titleEl.textContent = "✅ Chính xác! Giỏi lắm!";
    } else {
      this.state.quizWrongList.push(`Câu ${this.state.quizIndex + 1} (${q.topic})`);
      feedbackEl.classList.add("err");
      titleEl.textContent = "❌ Chưa chính xác rồi!";
    }

    expEl.textContent = q.explanation;
    const nextBtn = document.getElementById("btn-next-question");
    nextBtn.textContent = this.state.quizIndex + 1 < questions.length ? "Câu tiếp theo →" : "Xem kết quả tổng kết 🏆";
    nextBtn.classList.remove("hidden");
  },

  nextQuestion() {
    const questions = STUDY_DATA.quizzes[this.state.quizSubject];
    if (this.state.quizIndex + 1 < questions.length) {
      this.state.quizIndex++;
      this.renderQuestion();
    } else {
      this.finishQuiz();
    }
  },

  quitQuiz() {
    clearInterval(this.state.quizTimerId);
    this.resetQuizView();
  },

  resetQuizView() {
    document.getElementById("quiz-active-screen").classList.add("hidden");
    document.getElementById("quiz-result-screen").classList.add("hidden");
    document.getElementById("quiz-select-screen").classList.remove("hidden");
  },

  finishQuiz() {
    clearInterval(this.state.quizTimerId);
    const questions = STUDY_DATA.quizzes[this.state.quizSubject];
    const total = questions.length;
    const score = this.state.quizScore;
    const earnedXp = score * APP_CONFIG.XP_PER_CORRECT_QUIZ;
    const durationStr = this.formatSeconds(this.state.quizSeconds);
    const subjName = this.state.quizSubject === "math" ? "Toán học 6" : "Ngữ văn 6";
    const deckName = this.state.quizSubject === "math"
      ? "Đề ôn tập Toán học Lớp 6"
      : "Đề ôn tập Ngữ văn Lớp 6";

    this.state.xp += earnedXp;
    this.saveState();
    this.renderHeaderStats();

    document.getElementById("quiz-active-screen").classList.add("hidden");
    document.getElementById("quiz-result-screen").classList.remove("hidden");

    const ratio = score / total;
    document.getElementById("result-emoji").textContent = ratio >= 0.8 ? "🏆" : ratio >= 0.5 ? "👏" : "💪";
    document.getElementById("result-heading").textContent = ratio >= 0.8 ? "Xuất sắc quá!" : ratio >= 0.5 ? "Hoàn thành tốt!" : "Cố gắng hơn lần sau nhé!";
    document.getElementById("result-sub").textContent = `Môn ${subjName} • ${deckName}`;
    document.getElementById("res-score").textContent = `${score}/${total}`;
    document.getElementById("res-time").textContent = durationStr;
    document.getElementById("res-xp").textContent = `+${earnedXp} XP`;

    const scoreText = `${score}/${total}`;
    const pctText = `${Math.round(ratio * 100)}%`;
    const wrongText = this.state.quizWrongList.length > 0 ? this.state.quizWrongList.join(", ") : "Không có";
    const verifyCode = this.generateVerifyCode(subjName, scoreText, this.state.xp);
    const nowStr = this.formatDateTime(new Date());

    const reportMsg = [
      `📊 BÁO CÁO HỌC TẬP - HỌC VUI LỚP 6`,
      `• Thời gian: ${nowStr}`,
      `• Môn học: ${subjName}`,
      `• Bài tập: ${deckName}`,
      `• Kết quả: ${scoreText} câu đúng (${pctText})`,
      `• Thời gian làm: ${durationStr}`,
      `• Câu cần ôn lại: ${wrongText}`,
      `• Tổng điểm tích lũy: ${this.state.xp} XP`,
      `• Mã xác thực: ${verifyCode}`
    ].join("\n");

    this.state.lastReportText = reportMsg;
    document.getElementById("report-preview-text").textContent = reportMsg;

    this.syncToGoogleSheet({
      thoi_gian: nowStr,
      loai_hoat_dong: "Trắc nghiệm",
      mon_hoc: subjName,
      ten_bai: deckName,
      diem_so: scoreText,
      ty_le_dung: pctText,
      thoi_gian_lam: durationStr,
      cau_lam_sai: wrongText,
      tong_xp: this.state.xp,
      ma_xac_thuc: verifyCode
    }, false);
  },

  /* ================= ANTI-TAMPER & GOOGLE SHEETS ================= */
  generateVerifyCode(subject, scoreStr, totalXp) {
    const raw = `${subject}|${scoreStr}|${totalXp}|${APP_CONFIG.VERIFY_SALT}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash) + raw.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).toUpperCase().padStart(4, "0").slice(0, 4);
    return `#HV6-${hex}`;
  },

  formatDateTime(date) {
    const pad = n => String(n).padStart(2, "0");
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  },

  async syncToGoogleSheet(payload, silent = false) {
    const statusEl = document.getElementById("sheet-sync-status");
    const url = this.state.sheetUrl;

    if (!url) {
      if (!silent && statusEl) {
        statusEl.className = "sync-status warn";
        statusEl.textContent = "ℹ️ Chưa gắn link Google Sheets (Bấm Gửi kết quả bên dưới để gửi qua Zalo).";
      }
      return false;
    }

    if (!silent && statusEl) {
      statusEl.className = "sync-status info";
      statusEl.textContent = "⏳ Đang tự động lưu điểm vào Google Sheets...";
    }

    try {
      await fetch(url, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });
      if (!silent && statusEl) {
        statusEl.className = "sync-status success";
        statusEl.textContent = "✅ Đã tự động lưu kết quả vào Google Sheets của Bố/Mẹ!";
      }
      return true;
    } catch (err) {
      if (!silent && statusEl) {
        statusEl.className = "sync-status warn";
        statusEl.textContent = "⚠️ Lỗi mạng khi gửi Google Sheets. Hãy dùng nút gửi Zalo bên dưới.";
      }
      return false;
    }
  },

  copyReportText() {
    if (!this.state.lastReportText) return;
    navigator.clipboard.writeText(this.state.lastReportText).then(() => {
      this.showToast("Đã sao chép phiếu điểm!");
    });
  },

  async shareReport() {
    const text = this.state.lastReportText;
    if (!text) return;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Kết quả Học Vui Lớp 6", text });
        return;
      } catch (e) {}
    }
    this.copyReportText();
    this.showToast("Đã copy phiếu điểm! Hãy dán vào Zalo gửi Bố/Mẹ.");
  },

  saveSheetUrl() {
    const val = document.getElementById("sheet-url-input").value.trim();
    const msgEl = document.getElementById("parent-config-msg");
    if (val && !val.startsWith("https://script.google.com/")) {
      msgEl.style.color = "#dc2626";
      msgEl.textContent = "⚠️ Link không hợp lệ (phải bắt đầu bằng https://script.google.com/...).";
      return;
    }
    this.state.sheetUrl = val;
    this.saveState();
    msgEl.style.color = "#16a34a";
    msgEl.textContent = val ? "✅ Đã lưu link Google Sheets thành công!" : "ℹ️ Đã xóa link Google Sheets.";
  },

  async sendTestReport() {
    const url = document.getElementById("sheet-url-input").value.trim();
    const msgEl = document.getElementById("parent-config-msg");
    if (!url) {
      msgEl.style.color = "#dc2626";
      msgEl.textContent = "⚠️ Vui lòng dán link Google Apps Script trước khi Test.";
      return;
    }
    this.state.sheetUrl = url;
    this.saveState();
    msgEl.style.color = "#2563eb";
    msgEl.textContent = "⏳ Đang gửi dữ liệu kiểm thử...";

    const ok = await this.syncToGoogleSheet({
      thoi_gian: this.formatDateTime(new Date()),
      loai_hoat_dong: "Kiểm thử kết nối",
      mon_hoc: "Toán học 6",
      ten_bai: "Dữ liệu Test từ Admin Phụ Huynh",
      diem_so: "6/6",
      ty_le_dung: "100%",
      thoi_gian_lam: "01:15",
      cau_lam_sai: "Không có",
      tong_xp: this.state.xp,
      ma_xac_thuc: this.generateVerifyCode("Toán học 6", "6/6", this.state.xp)
    }, true);

    if (ok) {
      msgEl.style.color = "#16a34a";
      msgEl.textContent = "✅ Đã gửi xong! Bạn hãy mở file Google Sheets kiểm tra dòng mới nhé.";
    } else {
      msgEl.style.color = "#dc2626";
      msgEl.textContent = "❌ Gửi thất bại, vui lòng kiểm tra lại kết nối mạng.";
    }
  },

  async pasteToVerify() {
    try {
      const text = await navigator.clipboard.readText();
      document.getElementById("verify-input").value = text;
    } catch (e) {
      this.showToast("Trình duyệt chặn dán tự động, bạn hãy nhấn giữ và chọn Dán nhé.");
    }
  },

  verifyReportMessage() {
    const text = document.getElementById("verify-input").value;
    const resBox = document.getElementById("verify-result");
    resBox.classList.remove("hidden", "valid", "invalid");

    const subjMatch = text.match(/Môn học:\s*(.+)/);
    const scoreMatch = text.match(/Kết quả:\s*(\d+\/\d+)/);
    const xpMatch = text.match(/Tổng điểm tích lũy:\s*(\d+)\s*XP/);
    const codeMatch = text.match(/Mã xác thực:\s*(#HV6-[A-F0-9]{4})/i);

    if (!subjMatch || !scoreMatch || !xpMatch || !codeMatch) {
      resBox.classList.add("invalid");
      resBox.textContent = "⚠️ Không tìm thấy đủ thông tin phiếu điểm hoặc thiếu mã #HV6-XXXX.";
      return;
    }

    const expected = this.generateVerifyCode(subjMatch[1].trim(), scoreMatch[1].trim(), Number(xpMatch[1]));
    const actual = codeMatch[1].toUpperCase();

    if (expected === actual) {
      resBox.classList.add("valid");
      resBox.textContent = `✅ HỢP LỆ: Phiếu điểm chính xác từ ứng dụng (${actual}), không có dấu hiệu chỉnh sửa.`;
    } else {
      resBox.classList.add("invalid");
      resBox.textContent = `🚨 CẢNH BÁO: Dữ liệu đã bị chỉnh sửa! Mã trong tin nhắn (${actual}) không khớp với điểm số.`;
    }
  }
};

document.addEventListener("DOMContentLoaded", () => App.init());
