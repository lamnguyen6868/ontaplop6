/**
 * Kho dữ liệu gốc kiến thức, thẻ ghi nhớ và câu hỏi trắc nghiệm Lớp 6 (GDPT 2018)
 */
const BASE_STUDY_DATA = {
  tips: [
    "Khi nhân hai lũy thừa cùng cơ số, ta giữ nguyên cơ số và cộng các số mũ: a^m · a^n = a^(m+n).",
    "Muốn tìm ước chung lớn nhất (ƯCLN), hãy phân tích các số ra thừa số nguyên tố rồi chọn các thừa số chung với số mũ nhỏ nhất.",
    "Biện pháp ẩn dụ là gọi tên sự vật, hiện tượng này bằng tên sự vật, hiện tượng khác có nét tương đồng (không dùng từ 'như').",
    "Truyện truyền thuyết thường kể về các nhân vật, sự kiện liên quan đến lịch sử thời quá khứ và có yếu tố kỳ ảo.",
    "Cộng hai số nguyên khác dấu: ta tìm hiệu hai phần số tự nhiên của chúng (số lớn trừ số nhỏ) rồi đặt trước kết quả dấu của số có phần tự nhiên lớn hơn."
  ],

  lessons: {
    math: [
      {
        id: "math_1",
        tag: "Số học • Chương 1",
        title: "Lũy thừa với số mũ tự nhiên",
        body: "Lũy thừa bậc n của số tự nhiên a là tích của n thừa số bằng nhau, mỗi thừa số bằng a: a^n = a · a · ... · a (n thừa số, n ≠ 0). Quy ước: a^1 = a; a^0 = 1 (với a ≠ 0).",
        example: "Ví dụ: 2^3 · 2^2 = 2^(3+2) = 2^5 = 32;  5^6 : 5^4 = 5^(6-4) = 5^2 = 25."
      },
      {
        id: "math_2",
        tag: "Số học • Chương 2",
        title: "Dấu hiệu chia hết cho 2, 3, 5, 9",
        body: "• Chia hết cho 2: chữ số tận cùng là 0, 2, 4, 6, 8.\n• Chia hết cho 5: chữ số tận cùng là 0 hoặc 5.\n• Chia hết cho 3 (hoặc 9): tổng các chữ số chia hết cho 3 (hoặc 9).",
        example: "Ví dụ: Số 1260 tận cùng là 0 nên chia hết cho cả 2 và 5; tổng các chữ số là 1+2+6+0 = 9 nên chia hết cho cả 3 và 9."
      },
      {
        id: "math_3",
        tag: "Số nguyên • Chương 3",
        title: "Quy tắc dấu ngoặc với số nguyên",
        body: "• Khi bỏ dấu ngoặc có dấu '+' đằng trước, ta giữ nguyên dấu của các số hạng trong ngoặc.\n• Khi bỏ dấu ngoặc có dấu '-' đằng trước, ta phải đổi dấu tất cả các số hạng trong ngoặc ('+' thành '-' và '-' thành '+').",
        example: "Ví dụ: 15 - (15 - 27) = 15 - 15 + 27 = 27."
      },
      {
        id: "math_4",
        tag: "Hình học trực quan",
        title: "Chu vi và diện tích hình thoi, hình bình hành",
        body: "• Hình bình hành có cạnh đáy a, chiều cao h: S = a · h.\n• Hình thoi có độ dài hai đường chéo m và n: S = (m · n) / 2.",
        example: "Ví dụ: Hình thoi có hai đường chéo dài 6 cm và 8 cm thì diện tích là: (6 · 8) / 2 = 24 (cm²)."
      }
    ],
    lit: [
      {
        id: "lit_1",
        tag: "Đọc hiểu • Thể loại",
        title: "Truyền thuyết và Cổ tích",
        body: "• Truyền thuyết: Kể về nhân vật, sự kiện lịch sử quá khứ, thể hiện thái độ đánh giá của nhân dân (VD: Thánh Gióng, Sơn Tinh - Thủy Tinh).\n• Cổ tích: Kể về cuộc đời các kiểu nhân vật (người mồ côi, người dũng sĩ...), thể hiện ước mơ công bằng (VD: Thạch Sanh, Em bé thông minh).",
        example: "Mẹo phân biệt: Truyền thuyết gắn với địa danh, di tích lịch sử có thật; Cổ tích thường mở đầu bằng 'Ngày xửa ngày xưa...'."
      },
      {
        id: "lit_2",
        tag: "Tiếng Việt • Biện pháp tu từ",
        title: "So sánh và Nhân hóa",
        body: "• So sánh: Đối chiếu sự vật này với sự vật khác có nét tương đồng (thường có từ: như, là, tựa, bao nhiêu... bấy nhiêu).\n• Nhân hóa: Gọi hoặc tả con vật, cây cối, đồ vật bằng những từ ngữ vốn dùng cho con người.",
        example: "Ví dụ nhân hóa: 'Ông mặt trời thức dậy' (dùng từ 'ông' và hoạt động 'thức dậy' của người cho mặt trời)."
      },
      {
        id: "lit_3",
        tag: "Tiếng Việt • Từ vựng",
        title: "Từ đơn và Từ phức (Từ ghép, Từ láy)",
        body: "• Từ đơn: Gồm 1 tiếng có nghĩa (nhà, học, chạy).\n• Từ ghép: Gồm 2 tiếng trở lên có quan hệ với nhau về nghĩa (sách vở, xe đạp).\n• Từ láy: Các tiếng có quan hệ láy âm (long lanh, rì rào, xinh xắn).",
        example: "Lưu ý: 'Tươi tốt' là từ ghép (cả hai tiếng đều có nghĩa), còn 'tươi tắn' là từ láy."
      }
    ]
  },

  flashcards: {
    math: [
      { front: "Công thức nhân hai lũy thừa cùng cơ số?", back: "a^m · a^n = a^(m + n) (Giữ nguyên cơ số, cộng các số mũ)" },
      { front: "Số nguyên tố là gì?", back: "Là số tự nhiên lớn hơn 1, chỉ có 2 ước là 1 và chính nó (VD: 2, 3, 5, 7, 11...)." },
      { front: "Diện tích hình thang tính như thế nào?", back: "S = ((a + b) · h) / 2 (Đáy lớn cộng đáy nhỏ, nhân chiều cao rồi chia đôi)." },
      { front: "Tích của hai số nguyên âm là số gì?", back: "Là một số nguyên dương. Ví dụ: (-4) · (-5) = +20." },
      { front: "Khi bỏ dấu ngoặc đằng trước có dấu trừ (-), ta làm gì?", back: "Đổi dấu tất cả các số hạng bên trong ngoặc (+ thành -, - thành +)." },
      { front: "Số 0 có phải là số nguyên dương không?", back: "Không. Số 0 không phải là số nguyên dương cũng không phải là số nguyên âm." }
    ],
    lit: [
      { front: "Thế nào là biện pháp tu từ Ẩn dụ?", back: "Gọi tên sự vật, hiện tượng này bằng tên sự vật, hiện tượng khác có nét tương đồng để tăng sức gợi hình, gợi cảm." },
      { front: "Cụm danh từ có cấu tạo mấy phần?", back: "Gồm 3 phần: Phần phụ trước (số lượng) + Phần trung tâm (danh từ) + Phần phụ sau (đặc điểm, vị trí)." },
      { front: "Nhân vật chính trong 'Bài học đường đời đầu tiên' là ai?", back: "Dế Mèn (trích từ tác phẩm 'Dế Mèn phiêu lưu ký' của nhà văn Tô Hoài)." },
      { front: "Từ 'lung linh' là từ ghép hay từ láy?", back: "Là từ láy (láy phụ âm đầu 'l')." },
      { front: "Truyện 'Thánh Gióng' thuộc thể loại nào?", back: "Truyền thuyết (kể về công cuộc chống giặc Ân thời Hùng Vương thứ sáu)." },
      { front: "Biện pháp Điệp ngữ có tác dụng gì?", back: "Lặp lại từ ngữ hoặc cả câu để làm nổi bật ý, gây cảm xúc mạnh và tạo nhịp điệu cho câu văn, câu thơ." }
    ]
  },

  quizzes: {
    math: [
      {
        topic: "Lũy thừa",
        question: "Kết quả của phép tính 3^4 : 3^2 viết dưới dạng một lũy thừa là:",
        options: ["3^6", "3^2", "1^2", "3^8"],
        answer: 1,
        explanation: "Áp dụng công thức chia hai lũy thừa cùng cơ số: 3^4 : 3^2 = 3^(4-2) = 3^2."
      },
      {
        topic: "Dấu hiệu chia hết",
        question: "Trong các số sau, số nào chia hết cho cả 2, 3, 5 và 9?",
        options: ["1350", "2450", "1230", "3105"],
        answer: 0,
        explanation: "Số 1350 tận cùng là 0 nên chia hết cho 2 và 5. Tổng các chữ số: 1 + 3 + 5 + 0 = 9 chia hết cho cả 3 và 9."
      },
      {
        topic: "Số nguyên",
        question: "Kết quả của phép tính (-18) + 25 là:",
        options: ["-43", "43", "-7", "7"],
        answer: 3,
        explanation: "Cộng hai số nguyên khác dấu: lấy 25 - 18 = 7, mang dấu của số lớn hơn (+25) nên kết quả là 7."
      },
      {
        topic: "Quy tắc dấu ngoặc",
        question: "Bỏ dấu ngoặc biểu thức: 120 - (120 - 45) ta được kết quả là:",
        options: ["-45", "45", "195", "-195"],
        answer: 1,
        explanation: "120 - (120 - 45) = 120 - 120 + 45 = 0 + 45 = 45."
      },
      {
        topic: "Ước chung lớn nhất",
        question: "ƯCLN(12, 18) bằng bao nhiêu?",
        options: ["2", "3", "6", "36"],
        answer: 2,
        explanation: "12 = 2^2 · 3; 18 = 2 · 3^2. Thừa số nguyên tố chung với số mũ nhỏ nhất là 2 · 3 = 6."
      },
      {
        topic: "Hình học trực quan",
        question: "Một hình thoi có độ dài hai đường chéo là 10 cm và 8 cm. Diện tích hình thoi đó là:",
        options: ["80 cm²", "40 cm²", "18 cm²", "36 cm²"],
        answer: 1,
        explanation: "Diện tích hình thoi S = (m · n) / 2 = (10 · 8) / 2 = 40 (cm²)."
      }
    ],
    lit: [
      {
        topic: "Biện pháp tu từ",
        question: "Câu thơ 'Mặt trời xuống biển như hòn lửa' sử dụng biện pháp tu từ nào?",
        options: ["Nhân hóa", "So sánh", "Ẩn dụ", "Hoán dụ"],
        answer: 1,
        explanation: "Câu thơ đối chiếu hình ảnh 'mặt trời' với 'hòn lửa' thông qua từ so sánh 'như'."
      },
      {
        topic: "Cấu tạo từ",
        question: "Từ nào dưới đây là từ láy?",
        options: ["Sách vở", "Xanh xao", "Xe đạp", "Tươi tốt"],
        answer: 1,
        explanation: "'Xanh xao' láy phụ âm đầu 'x' (tiếng 'xao' không có nghĩa độc lập khi đứng một mình)."
      },
      {
        topic: "Thể loại văn học",
        question: "Tác phẩm 'Thánh Gióng' thuộc thể loại văn học dân gian nào?",
        options: ["Truyện cổ tích", "Truyền thuyết", "Truyện ngụ ngôn", "Truyện cười"],
        answer: 1,
        explanation: "'Thánh Gióng' kể về nhân vật và sự kiện liên quan đến lịch sử chống giặc ngoại xâm thời Hùng Vương, có yếu tố kỳ ảo."
      },
      {
        topic: "Biện pháp tu từ",
        question: "Trong câu 'Tre xung phong vào xe tăng, đại bác', tác giả đã dùng biện pháp tu từ gì?",
        options: ["Nhân hóa", "Nói quá", "Chơi chữ", "Điệp ngữ"],
        answer: 0,
        explanation: "Tác giả dùng hành động 'xung phong' vốn của con người (chiến sĩ) để miêu tả cây tre."
      },
      {
        topic: "Ngữ pháp",
        question: "Trong cụm danh từ 'tất cả những bạn học sinh chăm ngoan ấy', từ trung tâm là:",
        options: ["Tất cả", "Những", "Bạn học sinh", "Chăm ngoan"],
        answer: 2,
        explanation: "'Bạn học sinh' là danh từ trung tâm; 'tất cả những' là phần phụ trước; 'chăm ngoan ấy' là phần phụ sau."
      },
      {
        topic: "Đọc hiểu văn bản",
        question: "Bài học lớn nhất mà Dế Mèn rút ra sau cái chết của Dế Choắt là gì?",
        options: [
          "Phải biết đào hang thật sâu",
          "Không nên trêu chọc chị Cốc",
          "Ở đời mà có thói hung hăng bậy bạ, có óc mà không biết nghĩ sớm muộn cũng mang vạ vào mình",
          "Phải luôn đi du lịch một mình"
        ],
        answer: 2,
        explanation: "Đây chính là bài học đường đời đầu tiên đầy ân hận mà Dế Mèn rút ra ở cuối đoạn trích."
      }
    ]
  }
};

// Kho dữ liệu hợp nhất (Dữ liệu gốc + Dữ liệu Phụ huynh nạp thêm)
const STUDY_DATA = JSON.parse(JSON.stringify(BASE_STUDY_DATA));
