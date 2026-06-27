/**
 * TONY ACADEMY - v38.0 (Data Seeded)
 */
const ADMIN_EMAIL = "tonyhoang.oliver@gmail.com";
const ADMIN_PASS = "Admin@2026#Hoangpro";

function doGet() {
  checkAndSetupSheets();
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle("Tony Academy")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function checkAndSetupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = {
    "Users": ["UID", "Name", "Email", "Phone", "Birthday", "Password", "Role", "Coins", "PurchasedCourses"],
    "Courses": ["ID", "Title", "Description", "Price", "ThumbnailURL"],
    "Lessons": ["ID", "CourseID", "Title", "VideoURL"],
    "Orders": ["OrderID", "UserEmail", "Type", "Amount", "Status", "Date", "Coins"]
  };
  
  for (let name in sheets) {
    let sheet = ss.getSheetByName(name) || ss.insertSheet(name);
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, sheets[name].length).setValues([sheets[name]]).setFontWeight("bold");
      
      // TẠO DỮ LIỆU MẪU NẾU SHEET TRỐNG
      if (name === "Courses") {
        sheet.appendRow(["PRO-001", "Khóa học Master Web Design", "Học thiết kế chuyên nghiệp", 150000, "https://img.freepik.com/free-vector/web-design-concept-illustration_114360-4447.jpg"]);
      }
      if (name === "Lessons") {
        sheet.appendRow(["L1", "PRO-001", "Bài 1: Giới thiệu về UI/UX", "https://www.youtube.com/watch?v=dQw4w9WgXcQ"]);
        sheet.appendRow(["L2", "PRO-001", "Bài 2: Công cụ thiết kế Figma", "https://www.youtube.com/watch?v=dQw4w9WgXcQ"]);
        sheet.appendRow(["L3", "PRO-001", "Bài 3: Nguyên lý màu sắc", "https://www.youtube.com/watch?v=dQw4w9WgXcQ"]);
      }
      if (name === "Users") {
        sheet.appendRow(["TONY-8888", "Người Dùng Thử", "user@gmail.com", "0909123456", "2000-01-01", "123456", "Học viên", 500000, ""]);
      }
    }
  }
  SpreadsheetApp.flush();
}

// --- CÁC HÀM GET DATA ---
function getCourses() {
  const data = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Courses").getDataRange().getValues();
  const h = data.shift();
  return data.map(r => { let o = {}; h.forEach((k, i) => o[k] = r[i]); return o; });
}

function getUserData(email) {
  const data = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users").getDataRange().getValues();
  const u = data.find(r => r[2] === email);
  if (!u) return null;
  return { 
    uid: u[0], name: u[1], email: u[2], phone: u[3], 
    birthday: u[4] ? Utilities.formatDate(new Date(u[4]), "GMT+7", "yyyy-MM-dd") : "", 
    role: u[6], coins: Number(u[7] || 0), 
    purchased: String(u[8] || "").split(",").filter(x => x) 
  };
}

function getAdminData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return {
    courses: ss.getSheetByName("Courses").getDataRange().getValues(),
    lessons: ss.getSheetByName("Lessons").getDataRange().getValues(),
    users: ss.getSheetByName("Users").getDataRange().getValues(),
    orders: ss.getSheetByName("Orders").getDataRange().getValues().reverse()
  };
}

// --- HÀNH ĐỘNG ---
function loginUser(e, p) {
  if (e === ADMIN_EMAIL && p === ADMIN_PASS) return { success: true, user: { name: "Admin", email: e, role: "Quản trị viên" } };
  const data = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users").getDataRange().getValues();
  const u = data.find(r => r[2] == e && r[5] == p);
  return u ? { success: true, user: { name: u[1], email: u[2] } } : { success: false };
}

function registerUser(o) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const uid = "TONY-" + Math.floor(1000 + Math.random() * 9000);
  ss.getSheetByName("Users").appendRow([uid, o.name, o.email, o.phone, o.birthday, o.password, "Học viên", 0, ""]);
  SpreadsheetApp.flush(); return { success: true };
}

function updateProfile(o) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Users");
  const data = sheet.getDataRange().getValues();
  for(let i=1; i<data.length; i++) {
    if(data[i][2] === o.email) {
      sheet.getRange(i+1, 2).setValue(o.name);
      sheet.getRange(i+1, 4).setValue(o.phone);
      sheet.getRange(i+1, 5).setValue(o.birthday);
      if(o.password) sheet.getRange(i+1, 6).setValue(o.password);
      SpreadsheetApp.flush(); return true;
    }
  }
}

function getLessons(courseId) {
  const data = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Lessons").getDataRange().getValues();
  return data.filter(r => r[1] === courseId).map(r => ({ id: r[0], title: r[2], url: r[3] }));
}

function buyCourse(email, courseId, price) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const userSheet = ss.getSheetByName("Users");
  const data = userSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][2] === email) {
      const currentCoins = Number(data[i][7] || 0);
      if (currentCoins < price) return { success: false, msg: "Không đủ Xu!" };
      let p = String(data[i][8] || "");
      userSheet.getRange(i + 1, 8).setValue(currentCoins - price);
      userSheet.getRange(i + 1, 9).setValue(p ? p + "," + courseId : courseId);
      SpreadsheetApp.flush(); return { success: true };
    }
  }
}

function createCoinOrder(email, amount, coins) {
  const orderId = "ORD-" + Date.now();
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Orders").appendRow([orderId, email, "RECHARGE", amount, "Pending", new Date(), coins]);
  SpreadsheetApp.flush(); return { orderId, amount };
}

function approveOrder(orderId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const orderSheet = ss.getSheetByName("Orders");
  const userSheet = ss.getSheetByName("Users");
  const oData = orderSheet.getDataRange().getValues();
  for(let i=1; i<oData.length; i++) {
    if(oData[i][0] === orderId) {
      orderSheet.getRange(i+1, 5).setValue("Completed");
      const uData = userSheet.getDataRange().getValues();
      for(let j=1; j<uData.length; j++) {
        if(uData[j][2] === oData[i][1]) {
          userSheet.getRange(j+1, 8).setValue(Number(uData[j][7] || 0) + Number(oData[i][6]));
          break;
        }
      }
      SpreadsheetApp.flush(); return true;
    }
  }
}
