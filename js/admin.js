/**
 * Module Quản Trị Admin Phụ Huynh (Mật khẩu: 123456789)
 * Hỗ trợ nạp dữ liệu từ: Excel (.xlsx/.csv), Word (.docx), Hình ảnh (.jpg/.png)
 * Lưu trữ bền vững bằng IndexedDB (hỗ trợ ảnh dung lượng lớn không lo tràn localStorage)
 */
const Admin = {
  DB_NAME: "HV6_CustomDataDB",
  STORE_NAME: "custom_store",
  selectedImageDataUrl: "",
  customData: {
    lessons: { math: [], lit: [] },
    flashcards: { math: [], lit: [] },
    quizzes: { math: [], lit: [] }
  },

  async init() {
    await this.loadCustomData();
    this.mergeIntoStudyData();
  },

  /* ================= INDEXEDDB STORAGE ================= */
  openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.DB_NAME, 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async loadCustomData() {
    try {
      const db = await this.openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(this.STORE_NAME, "readonly");
        const store = tx.objectStore(this.STORE_NAME);
        const getReq = store.get("payload");
        getReq.onsuccess = () => {
          if (getReq.result) {
            this.customData = getReq.result;
          }
          resolve();
        };
        getReq.onerror = () => resolve();
      });
    } catch (e) {
      console.warn("IndexedDB fallback:", e);
    }
  },

  async saveCustomData() {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.STORE_NAME, "readwrite");
        const store = tx.objectStore(this.STORE_NAME);
        const putReq = store.put(this.customData, "payload");
        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(putReq.error);
      });
    } catch (e) {
      App.showToast("Lỗi lưu bộ nhớ trình duyệt: " + e.message);
    }
  },

  mergeIntoStudyData() {
    ["math", "lit"].forEach(subj => {
      STUDY_DATA.lessons[subj] = [
        ...BASE_STUDY_DATA.lessons[subj],
        ...(this.customData.lessons[subj] || [])
      ];
      STUDY_DATA.flashcards[subj] = [
        ...BASE_STUDY_DATA.flashcards[subj],
        ...(this.customData.flashcards[subj] || [])
      ];
      STUDY_DATA.quizzes[subj] = [
        ...BASE_STUDY_DATA.quizzes[subj],
        ...(this.customData.quizzes[subj] || [])
      ];
    });

    if (typeof App !== "undefined") {
      App.renderHomeProgress();
      App.renderStudyView();
      App.updateQuizCounts();
    }
    this.renderCustomItemsList();
  },

  /* ================= AUTHENTICATION (123456789) ================= */
  openAuthModal() {
    const input = document.getElementById("admin-pass-input");
    const err = document.getElementById("admin-auth-error");
    input.value = "";
    err.classList.add("hidden");
    document.getElementById("admin-auth-modal").classList.remove("hidden");
    setTimeout(() => input.focus(), 100);
  },

  closeAuthModal() {
    document.getElementById("admin-auth-modal").classList.add("hidden");
  },

  login() {
    const val = document.getElementById("admin-pass-input").value.trim();
    const err = document.getElementById("admin-auth-error");

    if (val === APP_CONFIG.ADMIN_PASSWORD) {
      this.closeAuthModal();
      this.openAdminPanel();
    } else {
      err.textContent = "❌ Mật khẩu chưa đúng! Vui lòng nhập 123456789.";
      err.classList.remove("hidden");
    }
  },

  openAdminPanel() {
    document.getElementById("sheet-url-input").value = App.state.sheetUrl || "";
    document.getElementById("parent-config-msg").textContent = "";
    document.getElementById("verify-result").classList.add("hidden");
    this.renderCustomItemsList();
    document.getElementById("admin-panel-modal").classList.remove("hidden");
  },

  closeAdminPanel() {
    document.getElementById("admin-panel-modal").classList.add("hidden");
  },

  switchAdminTab(tab) {
    ["upload", "manage", "track"].forEach(t => {
      document.getElementById(`atab-${t}`).classList.toggle("active", t === tab);
      document.getElementById(`admin-view-${t}`).classList.toggle("hidden", t !== tab);
    });
  },

  /* ================= 1. EXCEL UPLOAD & TEMPLATE ================= */
  downloadExcelTemplate() {
    if (typeof XLSX === "undefined") {
      App.showToast("Đang tải thư viện Excel, vui lòng thử lại sau 2 giây.");
      return;
    }
    const wb = XLSX.utils.book_new();

    // Sheet 1: Trắc nghiệm
    const quizRows = [
      ["Môn (Toán/Văn)", "Chuyên đề", "Câu hỏi", "Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D", "Đáp án đúng (A/B/C/D)", "Giải thích"],
      ["Toán", "Số nguyên", "Kết quả của (-12) + (-8) là:", "-20", "20", "-4", "4", "A", "Cộng hai số nguyên âm: -(12 + 8) = -20."],
      ["Văn", "Biện pháp tu từ", "Từ nào sau đây là từ ghép?", "Lung linh", "Xinh xắn", "Sách vở", "Rì rào", "C", "Sách và vở đều có nghĩa nên là từ ghép."]
    ];
    const wsQuiz = XLSX.utils.aoa_to_sheet(quizRows);
    XLSX.utils.book_append_sheet(wb, wsQuiz, "TracNghiem");

    // Sheet 2: Lý thuyết
    const lessonRows = [
      ["Môn (Toán/Văn)", "Nhãn chuyên đề", "Tiêu đề bài học", "Nội dung kiến thức", "Ví dụ minh họa"],
      ["Toán", "Ôn tập tuần 1", "Quy tắc chuyển vế", "Khi chuyển một số hạng từ vế này sang vế kia của một đẳng thức, ta phải đổi dấu số hạng đó.", "Ví dụ: x + 5 = 2 => x = 2 - 5 = -3."]
    ];
    const wsLesson = XLSX.utils.aoa_to_sheet(lessonRows);
    XLSX.utils.book_append_sheet(wb, wsLesson, "LyThuyet");

    XLSX.writeFile(wb, "Mau_Nhap_Bai_Tap_Lop_6.xlsx");
    App.showToast("Đã tải file Excel mẫu!");
  },

  handleExcelUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const statusEl = document.getElementById("excel-upload-status");

    if (typeof XLSX === "undefined") {
      statusEl.style.color = "#dc2626";
      statusEl.textContent = "⚠️ Chưa tải được thư viện đọc Excel (cần kết nối Internet).";
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        let addedQuiz = 0;
        let addedLesson = 0;

        workbook.SheetNames.forEach(sheetName => {
          const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
          if (rows.length < 2) return;

          for (let i = 1; i < rows.length; i++) {
            const r = rows[i];
            if (!r || r.length < 4) continue;

            const rawSubj = String(r[0] || "").toLowerCase();
            const subj = (rawSubj.includes("văn") || rawSubj.includes("lit")) ? "lit" : "math";

            // Nếu có >= 8 cột -> Dòng câu hỏi trắc nghiệm
            if (r.length >= 8 && r[2] && r[3] && r[4]) {
              const ansLetter = String(r[7] || "A").trim().toUpperCase();
              const ansMap = { A: 0, B: 1, C: 2, D: 3 };
              this.customData.quizzes[subj].push({
                id: `cq_${Date.now()}_${i}`,
                isCustom: true,
                topic: String(r[1] || "Bài tập giao thêm"),
                question: String(r[2]),
                options: [
                  String(r[3] || ""),
                  String(r[4] || ""),
                  String(r[5] || "Đáp án khác"),
                  String(r[6] || "Cả 3 đáp án trên")
                ],
                answer: ansMap[ansLetter] !== undefined ? ansMap[ansLetter] : 0,
                explanation: String(r[8] || "Theo đáp án chuẩn của Phụ huynh.")
              });
              addedQuiz++;
            } else if (r[2] && r[3]) {
              // Dòng lý thuyết
              this.customData.lessons[subj].push({
                id: `cl_${Date.now()}_${i}`,
                isCustom: true,
                tag: String(r[1] || "Tài liệu Bố/Mẹ gửi"),
                title: String(r[2]),
                body: String(r[3]),
                example: String(r[4] || "Ghi nhớ kỹ kiến thức trên nhé!")
              });
              addedLesson++;
            }
          }
        });

        await this.saveCustomData();
        this.mergeIntoStudyData();
        statusEl.style.color = "#16a34a";
        statusEl.textContent = `✅ Thành công! Đã nhập ${addedQuiz} câu trắc nghiệm và ${addedLesson} bài lý thuyết từ "${file.name}".`;
        event.target.value = "";
      } catch (err) {
        statusEl.style.color = "#dc2626";
        statusEl.textContent = "❌ Lỗi đọc file Excel: " + err.message;
      }
    };
    reader.readAsArrayBuffer(file);
  },

  /* ================= 2. WORD (.DOCX) UPLOAD ================= */
  handleWordUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const statusEl = document.getElementById("word-upload-status");
    const subj = document.getElementById("word-subject-select").value;

    if (typeof mammoth === "undefined") {
      statusEl.style.color = "#dc2626";
      statusEl.textContent = "⚠️ Chưa tải được thư viện đọc Word (cần kết nối Internet).";
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const result = await mammoth.extractRawText({ arrayBuffer: e.target.result });
        const rawText = (result.value || "").trim();
        if (!rawText) {
          statusEl.style.color = "#dc2626";
          statusEl.textContent = "⚠️ File Word trống hoặc không đọc được chữ.";
          return;
        }

        // Thử phân tích định dạng câu hỏi trắc nghiệm: Câu 1: ... A. ... B. ... C. ... D. ... Đáp án: A
        const parsedQuizzes = this.parseWordQuestions(rawText);

        if (parsedQuizzes.length > 0) {
          parsedQuizzes.forEach((q, idx) => {
            this.customData.quizzes[subj].push({
              id: `wq_${Date.now()}_${idx}`,
              isCustom: true,
              ...q
            });
          });
          await this.saveCustomData();
          this.mergeIntoStudyData();
          statusEl.style.color = "#16a34a";
          statusEl.textContent = `✅ Đã tách tự động ${parsedQuizzes.length} câu trắc nghiệm từ file Word "${file.name}"!`;
        } else {
          // Nếu là văn bản tự luận / tóm tắt -> lưu thành Bài học lý thuyết
          const cleanTitle = file.name.replace(/\.docx$/i, "");
          this.customData.lessons[subj].push({
            id: `wl_${Date.now()}`,
            isCustom: true,
            tag: "Tài liệu Word • Phụ huynh",
            title: cleanTitle,
            body: rawText.slice(0, 2500),
            example: "Tài liệu ôn tập được trích xuất từ file Word."
          });
          await this.saveCustomData();
          this.mergeIntoStudyData();
          statusEl.style.color = "#16a34a";
          statusEl.textContent = `✅ Đã lưu nội dung "${cleanTitle}" vào mục Tóm tắt lý thuyết!`;
        }
        event.target.value = "";
      } catch (err) {
        statusEl.style.color = "#dc2626";
        statusEl.textContent = "❌ Lỗi đọc file Word: " + err.message;
      }
    };
    reader.readAsArrayBuffer(file);
  },

  parseWordQuestions(text) {
    const blocks = text.split(/(?=Câu\s+\d+\s*[:.])/i).map(b => b.trim()).filter(Boolean);
    const questions = [];

    blocks.forEach(block => {
      const qMatch = block.match(/^Câu\s+\d+\s*[:.]\s*([\s\S]*?)(?=
\s*A\s*[.)])/i);
      const aMatch = block.match(/
\s*A\s*[.)]\s*([\s\S]*?)(?=
\s*B\s*[.)])/i);
      const bMatch = block.match(/
\s*B\s*[.)]\s*([\s\S]*?)(?=
\s*C\s*[.)])/i);
      const cMatch = block.match(/
\s*C\s*[.)]\s*([\s\S]*?)(?=
\s*D\s*[.)])/i);
      const dMatch = block.match(/
\s*D\s*[.)]\s*([\s\S]*?)(?=
\s*(?:Đáp án|Giải thích|$))/i);

      if (qMatch && aMatch && bMatch && cMatch && dMatch) {
        const ansMatch = block.match(/Đáp án\s*[:.]\s*([ABCD])/i);
        const expMatch = block.match(/Giải thích\s*[:.]\s*([\s\S]*)$/i);
        const ansMap = { A: 0, B: 1, C: 2, D: 3 };
        const letter = ansMatch ? ansMatch[1].toUpperCase() : "A";

        questions.push({
          topic: "Đề Word giao thêm",
          question: qMatch[1].trim(),
          options: [aMatch[1].trim(), bMatch[1].trim(), cMatch[1].trim(), dMatch[1].trim()],
          answer: ansMap[letter] ?? 0,
          explanation: expMatch ? expMatch[1].trim() : "Đáp án theo tài liệu Word của Phụ huynh."
        });
      }
    });

    return questions;
  },

  /* ================= 3. IMAGE UPLOAD & COMPRESSION ================= */
  toggleImgQuizFields() {
    const type = document.getElementById("img-type-select").value;
    document.getElementById("img-quiz-extra").classList.toggle("hidden", type !== "quiz");
  },

  handleImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    document.getElementById("img-file-label").textContent = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Nén kích thước tối đa chiều rộng 800px để tiết kiệm bộ nhớ & tải nhanh trên điện thoại
        const canvas = document.createElement("canvas");
        const maxW = 800;
        const scale = img.width > maxW ? maxW / img.width : 1;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        this.selectedImageDataUrl = canvas.toDataURL("image/jpeg", 0.8);
        document.getElementById("img-preview").src = this.selectedImageDataUrl;
        document.getElementById("img-preview-wrap").classList.remove("hidden");
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  async saveImageEntry() {
    const type = document.getElementById("img-type-select").value;
    const subj = document.getElementById("img-subject-select").value;
    const title = document.getElementById("img-title-input").value.trim() || "Bài tập hình ảnh";
    const desc = document.getElementById("img-desc-input").value.trim();
    const statusEl = document.getElementById("img-upload-status");

    if (!this.selectedImageDataUrl && !desc) {
      statusEl.style.color = "#dc2626";
      statusEl.textContent = "⚠️ Vui lòng chọn hình ảnh hoặc nhập nội dung câu hỏi.";
      return;
    }

    if (type === "lesson") {
      this.customData.lessons[subj].push({
        id: `img_l_${Date.now()}`,
        isCustom: true,
        tag: "Hình ảnh • Phụ huynh",
        title: title,
        body: desc || "Quan sát hình ảnh bên dưới và ghi nhớ kiến thức nhé.",
        imageUrl: this.selectedImageDataUrl,
        example: "Tài liệu hình ảnh do Bố/Mẹ tải lên."
      });
    } else {
      const optA = document.getElementById("img-opt-a").value.trim() || "Đáp án A";
      const optB = document.getElementById("img-opt-b").value.trim() || "Đáp án B";
      const optC = document.getElementById("img-opt-c").value.trim() || "Đáp án C";
      const optD = document.getElementById("img-opt-d").value.trim() || "Đáp án D";
      const correct = Number(document.getElementById("img-correct-opt").value);
      const explain = document.getElementById("img-explain-input").value.trim() || "Xem kỹ hình minh họa để đối chiếu kết quả.";

      this.customData.quizzes[subj].push({
        id: `img_q_${Date.now()}`,
        isCustom: true,
        topic: title,
        question: desc || "Quan sát hình ảnh dưới đây và chọn đáp án đúng:",
        imageUrl: this.selectedImageDataUrl,
        options: [optA, optB, optC, optD],
        answer: correct,
        explanation: explain
      });
    }

    await this.saveCustomData();
    this.mergeIntoStudyData();

    // Reset form
    this.selectedImageDataUrl = "";
    document.getElementById("image-file-input").value = "";
    document.getElementById("img-file-label").textContent = "Chọn hoặc chụp hình ảnh (.jpg, .png)";
    document.getElementById("img-preview-wrap").classList.add("hidden");
    document.getElementById("img-title-input").value = "";
    document.getElementById("img-desc-input").value = "";

    statusEl.style.color = "#16a34a";
    statusEl.textContent = "✅ Đã thêm nội dung kèm hình ảnh vào ứng dụng!";
    App.showToast("Đã cập nhật kho dữ liệu!");
  },

  /* ================= MANAGE & EXPORT / IMPORT ================= */
  renderCustomItemsList() {
    const listEl = document.getElementById("custom-items-list");
    const badgeEl = document.getElementById("custom-total-badge");
    if (!listEl) return;

    const items = [];
    ["math", "lit"].forEach(subj => {
      const sLabel = subj === "math" ? "Toán 6" : "Văn 6";
      (this.customData.lessons[subj] || []).forEach((item, idx) => {
        items.push({ cat: "lessons", subj, idx, title: item.title, meta: `${sLabel} • Lý thuyết ${item.imageUrl ? "(Có ảnh)" : ""}` });
      });
      (this.customData.quizzes[subj] || []).forEach((item, idx) => {
        items.push({ cat: "quizzes", subj, idx, title: item.question, meta: `${sLabel} • Trắc nghiệm ${item.imageUrl ? "(Có ảnh)" : ""}` });
      });
    });

    if (badgeEl) badgeEl.textContent = items.length;

    if (items.length === 0) {
      listEl.innerHTML = `<p class="hint-text">Chưa có bài học hay câu hỏi nào được nạp thêm.</p>`;
      return;
    }

    listEl.innerHTML = items.map(it => `
      <div class="custom-item-row">
        <div style="flex:1; min-width:0;">
          <div style="font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${it.title}</div>
          <div class="custom-item-meta">${it.meta}</div>
        </div>
        <button class="btn-del-item" onclick="Admin.deleteCustomItem('${it.cat}', '${it.subj}', ${it.idx})">Xóa</button>
      </div>
    `).join("");
  },

  async deleteCustomItem(cat, subj, idx) {
    this.customData[cat][subj].splice(idx, 1);
    await this.saveCustomData();
    this.mergeIntoStudyData();
    App.showToast("Đã xóa mục dữ liệu.");
  },

  async clearAllCustomData() {
    if (!confirm("Bạn có chắc muốn xóa toàn bộ bài học và câu hỏi đã tải lên không?")) return;
    this.customData = {
      lessons: { math: [], lit: [] },
      flashcards: { math: [], lit: [] },
      quizzes: { math: [], lit: [] }
    };
    await this.saveCustomData();
    this.mergeIntoStudyData();
    App.showToast("Đã khôi phục về dữ liệu gốc.");
  },

  exportFullDataJs() {
    const content = `/**
 * Kho dữ liệu đã được cập nhật từ trang Admin Phụ Huynh
 * Thay thế tệp js/data.js trên GitHub bằng tệp này để đồng bộ cho mọi thiết bị.
 */
const BASE_STUDY_DATA = ${JSON.stringify(STUDY_DATA, null, 2)};

const STUDY_DATA = JSON.parse(JSON.stringify(BASE_STUDY_DATA));
`;
    this.downloadFile(content, "data.js", "application/javascript;charset=utf-8");
    App.showToast("Đã xuất tệp data.js! Bạn có thể up đè lên GitHub.");
  },

  exportCustomJson() {
    const content = JSON.stringify(this.customData, null, 2);
    this.downloadFile(content, "bai-tap-lop-6-bo-sung.json", "application/json;charset=utf-8");
    App.showToast("Đã xuất gói dữ liệu .JSON!");
  },

  importCustomJson(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed.lessons && parsed.quizzes) {
          this.customData = parsed;
          await this.saveCustomData();
          this.mergeIntoStudyData();
          App.showToast("✅ Đã nhập gói dữ liệu thành công!");
        } else {
          App.showToast("⚠️ Tệp JSON không đúng định dạng của ứng dụng.");
        }
      } catch (err) {
        App.showToast("❌ Lỗi đọc tệp JSON.");
      }
    };
    reader.readAsText(file);
  },

  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
