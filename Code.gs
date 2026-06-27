// ============================================
// GOOGLE APPS SCRIPT - BACKEND API
// UNICA - Nền Tảng Học Tập Trực Tuyến
// ============================================

const SHEET_ID = "1a2JprTd3C_Cvb0-AP7CQJYg-SXTaizJeOPsj2yGlWYY";
const ss = SpreadsheetApp.openById(SHEET_ID);

// ============================================
// 1. QUẢN LÝ KHÓA HỌC (COURSES)
// ============================================

function addCourse(data) {
  try {
    const sheet = ss.getSheetByName("Courses");
    const courseId = "C" + Date.now();
    
    sheet.appendRow([
      courseId,
      data.name,
      data.description,
      data.price,
      data.instructor,
      data.category,
      data.image_url || 'https://via.placeholder.com/300x200',
      data.duration_hours || 0,
      data.level || "Beginner",
      0,
      0,
      "active",
      new Date(),
      new Date()
    ]);
    
    return { success: true, course_id: courseId };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function getCourses() {
  try {
    const sheet = ss.getSheetByName("Courses");
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const courses = [];
    for (let i = 1; i < data.length; i++) {
      const course = {};
      headers.forEach((header, index) => {
        course[header] = data[i][index];
      });
      courses.push(course);
    }
    
    return courses;
  } catch (error) {
    return [];
  }
}

function getCourseById(courseId) {
  try {
    const courses = getCourses();
    return courses.find(c => c.course_id === courseId) || null;
  } catch (error) {
    return null;
  }
}

function updateCourse(courseId, data) {
  try {
    const sheet = ss.getSheetByName("Courses");
    const data_range = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data_range.length; i++) {
      if (data_range[i][0] === courseId) {
        sheet.getRange(i + 1, 2, 1, 13).setValues([[
          data.name,
          data.description,
          data.price,
          data.instructor,
          data.category,
          data.image_url,
          data.duration_hours,
          data.level,
          data.total_students,
          data.rating,
          data.status,
          new Date(),
          new Date()
        ]]);
        return { success: true };
      }
    }
    
    return { success: false, error: "Course not found" };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function deleteCourse(courseId) {
  try {
    const sheet = ss.getSheetByName("Courses");
    const data_range = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data_range.length; i++) {
      if (data_range[i][0] === courseId) {
        sheet.deleteRow(i + 1);
        return { success: true };
      }
    }
    
    return { success: false, error: "Course not found" };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// ============================================
// 2. QUẢN LÝ NGƯỜI DÙNG (USERS)
// ============================================

function registerUser(email, password, fullName, phone) {
  try {
    const sheet = ss.getSheetByName("Users");
    const userId = "U" + Date.now();
    
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === email) {
        return { success: false, error: "Email đã tồn tại" };
      }
    }
    
    if (password.length < 8) {
      return { success: false, error: "Mật khẩu phải có ít nhất 8 ký tự" };
    }
    
    const passwordHash = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      password
    );
    
    sheet.appendRow([
      userId,
      email,
      Utilities.base64Encode(passwordHash),
      fullName,
      phone,
      '',
      0,
      0,
      0,
      'user',
      'active',
      new Date(),
      new Date()
    ]);
    
    return { success: true, user_id: userId };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function loginUser(email, password) {
  try {
    const sheet = ss.getSheetByName("Users");
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === email) {
        const storedHash = data[i][2];
        const inputHash = Utilities.base64Encode(
          Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password)
        );
        
        if (storedHash === inputHash) {
          sheet.getRange(i + 1, 13).setValue(new Date());
          
          return {
            success: true,
            user_id: data[i][0],
            email: data[i][1],
            full_name: data[i][3],
            phone: data[i][4],
            balance: data[i][6],
            role: data[i][9]
          };
        }
      }
    }
    
    return { success: false, error: "Email hoặc mật khẩu không đúng" };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function getUserBalance(userId) {
  try {
    const sheet = ss.getSheetByName("Users");
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        return { balance: data[i][6] };
      }
    }
    
    return { error: "User not found" };
  } catch (error) {
    return { error: error.toString() };
  }
}

function getUserInfo(userId) {
  try {
    const sheet = ss.getSheetByName("Users");
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        const user = {};
        headers.forEach((header, index) => {
          user[header] = data[i][index];
        });
        return user;
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

function getAllUsers() {
  try {
    const sheet = ss.getSheetByName("Users");
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const users = [];
    for (let i = 1; i < data.length; i++) {
      const user = {};
      headers.forEach((header, index) => {
        user[header] = data[i][index];
      });
      users.push(user);
    }
    
    return users;
  } catch (error) {
    return [];
  }
}

// ============================================
// 3. QUẢN LÝ GIAO DỊCH NẠP XU
// ============================================

function depositXu(userId, amount) {
  try {
    const settings = getSettings();
    const minDeposit = parseInt(settings.min_deposit) || 10000;
    const maxDeposit = parseInt(settings.max_deposit) || 10000000;
    
    if (amount < minDeposit || amount > maxDeposit) {
      return { 
        success: false, 
        error: `Số tiền phải từ ${minDeposit.toLocaleString()} đến ${maxDeposit.toLocaleString()}` 
      };
    }
    
    const usersSheet = ss.getSheetByName("Users");
    const transSheet = ss.getSheetByName("Transactions");
    const transId = "T" + Date.now();
    
    const userData = usersSheet.getDataRange().getValues();
    
    for (let i = 1; i < userData.length; i++) {
      if (userData[i][0] === userId) {
        const balanceBefore = userData[i][6];
        const newBalance = balanceBefore + amount;
        usersSheet.getRange(i + 1, 7).setValue(newBalance);
        
        transSheet.appendRow([
          transId,
          userId,
          'deposit',
          amount,
          balanceBefore,
          newBalance,
          'Nạp xu',
          'wallet',
          '',
          'completed',
          'Nạp thành công',
          new Date()
        ]);
        
        return {
          success: true,
          transaction_id: transId,
          new_balance: newBalance
        };
      }
    }
    
    return { success: false, error: "User not found" };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function getTransactionHistory(userId) {
  try {
    const sheet = ss.getSheetByName("Transactions");
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const transactions = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === userId) {
        const trans = {};
        headers.forEach((header, index) => {
          trans[header] = data[i][index];
        });
        transactions.push(trans);
      }
    }
    
    return transactions.reverse();
  } catch (error) {
    return [];
  }
}

function getAllTransactions() {
  try {
    const sheet = ss.getSheetByName("Transactions");
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const transactions = [];
    for (let i = 1; i < data.length; i++) {
      const trans = {};
      headers.forEach((header, index) => {
        trans[header] = data[i][index];
      });
      transactions.push(trans);
    }
    
    return transactions.reverse();
  } catch (error) {
    return [];
  }
}

// ============================================
// 4. QUẢN LÝ ĐƠN HÀNG (ORDERS)
// ============================================

function createOrder(userId, courseId, amount) {
  try {
    const ordersSheet = ss.getSheetByName("Orders");
    const usersSheet = ss.getSheetByName("Users");
    const orderId = "O" + Date.now();
    
    const userData = usersSheet.getDataRange().getValues();
    let userBalance = 0;
    let userRowIndex = -1;
    
    for (let i = 1; i < userData.length; i++) {
      if (userData[i][0] === userId) {
        userBalance = userData[i][6];
        userRowIndex = i;
        break;
      }
    }
    
    if (userBalance < amount) {
      return { success: false, error: "Số dư không đủ" };
    }
    
    const newBalance = userBalance - amount;
    usersSheet.getRange(userRowIndex + 1, 7).setValue(newBalance);
    
    const course = getCourseById(courseId);
    
    ordersSheet.appendRow([
      orderId,
      userId,
      courseId,
      course.name,
      amount,
      0,
      amount,
      'xu',
      'completed',
      '',
      new Date(),
      new Date()
    ]);
    
    addEnrollment(userId, courseId);
    
    return {
      success: true,
      order_id: orderId,
      new_balance: newBalance
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function getOrders(userId) {
  try {
    const sheet = ss.getSheetByName("Orders");
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const orders = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === userId) {
        const order = {};
        headers.forEach((header, index) => {
          order[header] = data[i][index];
        });
        orders.push(order);
      }
    }
    
    return orders.reverse();
  } catch (error) {
    return [];
  }
}

function getAllOrders() {
  try {
    const sheet = ss.getSheetByName("Orders");
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const orders = [];
    for (let i = 1; i < data.length; i++) {
      const order = {};
      headers.forEach((header, index) => {
        order[header] = data[i][index];
      });
      orders.push(order);
    }
    
    return orders.reverse();
  } catch (error) {
    return [];
  }
}

// ============================================
// 5. QUẢN LÝ GIAO DỊCH HỌC (ENROLLMENTS)
// ============================================

function addEnrollment(userId, courseId) {
  try {
    const sheet = ss.getSheetByName("Enrollments");
    const enrollmentId = "E" + Date.now();
    
    const course = getCourseById(courseId);
    
    sheet.appendRow([
      enrollmentId,
      userId,
      courseId,
      course.name,
      0,
      0,
      0,
      new Date(),
      'active',
      '',
      false,
      new Date()
    ]);
    
    return { success: true, enrollment_id: enrollmentId };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function getUserEnrollments(userId) {
  try {
    const sheet = ss.getSheetByName("Enrollments");
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const enrollments = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === userId) {
        const enrollment = {};
        headers.forEach((header, index) => {
          enrollment[header] = data[i][index];
        });
        enrollments.push(enrollment);
      }
    }
    
    return enrollments;
  } catch (error) {
    return [];
  }
}

function updateProgress(enrollmentId, progress) {
  try {
    const sheet = ss.getSheetByName("Enrollments");
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === enrollmentId) {
        sheet.getRange(i + 1, 5).setValue(progress);
        
        if (progress >= 100) {
          sheet.getRange(i + 1, 9).setValue("completed");
          sheet.getRange(i + 1, 10).setValue(new Date());
          sheet.getRange(i + 1, 11).setValue(true);
        }
        
        return { success: true };
      }
    }
    
    return { success: false, error: "Enrollment not found" };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function getAllEnrollments() {
  try {
    const sheet = ss.getSheetByName("Enrollments");
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const enrollments = [];
    for (let i = 1; i < data.length; i++) {
      const enrollment = {};
      headers.forEach((header, index) => {
        enrollment[header] = data[i][index];
      });
      enrollments.push(enrollment);
    }
    
    return enrollments;
  } catch (error) {
    return [];
  }
}

// ============================================
// 6. QUẢN LÝ VIDEO KHÓA HỌC
// ============================================

function getCourseVideos(courseId) {
  try {
    const videos = {
      'C001': [
        { id: 1, title: 'Giới Thiệu HTML', duration: 15, locked: false },
        { id: 2, title: 'Cơ Bản CSS', duration: 20, locked: false },
        { id: 3, title: 'JavaScript Cơ Bản', duration: 25, locked: false },
        { id: 4, title: 'DOM Manipulation', duration: 30, locked: true },
        { id: 5, title: 'Event Handling', duration: 28, locked: true },
        { id: 6, title: 'Async/Await', duration: 35, locked: true }
      ],
      'C002': [
        { id: 1, title: 'React Hooks Cơ Bản', duration: 20, locked: false },
        { id: 2, title: 'useState Hook', duration: 25, locked: false },
        { id: 3, title: 'useEffect Hook', duration: 30, locked: false },
        { id: 4, title: 'Custom Hooks', duration: 35, locked: true },
        { id: 5, title: 'Redux Integration', duration: 40, locked: true }
      ],
      'C003': [
        { id: 1, title: 'Flutter Setup', duration: 15, locked: false },
        { id: 2, title: 'Widgets Cơ Bản', duration: 20, locked: false },
        { id: 3, title: 'Layout & Navigation', duration: 25, locked: false },
        { id: 4, title: 'State Management', duration: 30, locked: true },
        { id: 5, title: 'API Integration', duration: 35, locked: true }
      ],
      'C004': [
        { id: 1, title: 'Python Cơ Bản', duration: 20, locked: false },
        { id: 2, title: 'Pandas & NumPy', duration: 25, locked: false },
        { id: 3, title: 'Data Visualization', duration: 30, locked: false },
        { id: 4, title: 'Machine Learning', duration: 40, locked: true },
        { id: 5, title: 'Model Deployment', duration: 35, locked: true }
      ],
      'C005': [
        { id: 1, title: 'Design Principles', duration: 25, locked: false },
        { id: 2, title: 'Figma Basics', duration: 30, locked: false },
        { id: 3, title: 'Prototyping', duration: 28, locked: false },
        { id: 4, title: 'User Testing', duration: 35, locked: true },
        { id: 5, title: 'Design Systems', duration: 40, locked: true }
      ],
      'C006': [
        { id: 1, title: 'AI Fundamentals', duration: 30, locked: false },
        { id: 2, title: 'Neural Networks', duration: 40, locked: false },
        { id: 3, title: 'Deep Learning', duration: 45, locked: false },
        { id: 4, title: 'NLP & Computer Vision', duration: 50, locked: true },
        { id: 5, title: 'Deployment & Ethics', duration: 40, locked: true }
      ],
      'C007': [
        { id: 1, title: 'Node.js Setup', duration: 15, locked: false },
        { id: 2, title: 'Express Framework', duration: 25, locked: false },
        { id: 3, title: 'Database Design', duration: 30, locked: false },
        { id: 4, title: 'Authentication', duration: 35, locked: true },
        { id: 5, title: 'API Security', duration: 40, locked: true }
      ],
      'C008': [
        { id: 1, title: 'Vue.js Intro', duration: 20, locked: false },
        { id: 2, title: 'Components & Props', duration: 25, locked: false },
        { id: 3, title: 'State Management', duration: 30, locked: false },
        { id: 4, title: 'Vue Router', duration: 35, locked: true },
        { id: 5, title: 'Deployment', duration: 25, locked: true }
      ]
    };
    
    return videos[courseId] || [];
  } catch (error) {
    return [];
  }
}

function checkCourseAccess(userId, courseId) {
  try {
    const enrollments = getUserEnrollments(userId);
    const hasAccess = enrollments.some(e => e.course_id === courseId);
    return { has_access: hasAccess };
  } catch (error) {
    return { has_access: false };
  }
}

// ============================================
// 7. QUẢN LÝ CÀI ĐẶT
// ============================================

function getSettings() {
  try {
    const sheet = ss.getSheetByName("Settings");
    const data = sheet.getDataRange().getValues();
    
    const settings = {};
    for (let i = 1; i < data.length; i++) {
      settings[data[i][0]] = data[i][1];
    }
    
    return settings;
  } catch (error) {
    return {};
  }
}

function updateSetting(key, value) {
  try {
    const sheet = ss.getSheetByName("Settings");
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        sheet.getRange(i + 1, 2).setValue(value);
        sheet.getRange(i + 1, 4).setValue(new Date());
        return { success: true };
      }
    }
    
    return { success: false, error: "Setting not found" };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// ============================================
// 8. THỐNG KÊ & BÁO CÁO
// ============================================

function getStatistics() {
  try {
    const courses = getCourses();
    const users = getAllUsers();
    const orders = getAllOrders();
    const transactions = getAllTransactions();
    const enrollments = getAllEnrollments();
    
    let totalRevenue = 0;
    let completedOrders = 0;
    orders.forEach(order => {
      if (order.status === 'completed') {
        totalRevenue += order.final_amount || 0;
        completedOrders++;
      }
    });
    
    let activeUsers = 0;
    users.forEach(user => {
      if (user.status === 'active') {
        activeUsers++;
      }
    });
    
    let completedCourses = 0;
    enrollments.forEach(enrollment => {
      if (enrollment.status === 'completed') {
        completedCourses++;
      }
    });
    
    return {
      total_courses: courses.length,
      total_users: users.length,
      active_users: activeUsers,
      total_orders: orders.length,
      completed_orders: completedOrders,
      total_revenue: totalRevenue,
      total_enrollments: enrollments.length,
      completed_enrollments: completedCourses,
      total_transactions: transactions.length
    };
  } catch (error) {
    return { error: error.toString() };
  }
}

function getDashboardData(userId) {
  try {
    const user = getUserInfo(userId);
    const enrollments = getUserEnrollments(userId);
    const orders = getOrders(userId);
    const transactions = getTransactionHistory(userId);
    
    return {
      user: user,
      enrollments: enrollments,
      orders: orders,
      transactions: transactions,
      stats: {
        courses_purchased: orders.length,
        courses_learning: enrollments.filter(e => e.status === 'active').length,
        courses_completed: enrollments.filter(e => e.status === 'completed').length,
        total_spent: orders.reduce((sum, o) => sum + (o.final_amount || 0), 0)
      }
    };
  } catch (error) {
    return { error: error.toString() };
  }
}

// ============================================
// 9. WEB APP ENDPOINT
// ============================================

function doPost(e) {
  const action = e.parameter.action;
  const data = JSON.parse(e.postData.contents);
  
  let result = {};
  
  try {
    switch(action) {
      case "addCourse":
        result = addCourse(data);
        break;
      case "getCourses":
        result = getCourses();
        break;
      case "getCourseById":
        result = getCourseById(data.course_id);
        break;
      case "updateCourse":
        result = updateCourse(data.course_id, data);
        break;
      case "deleteCourse":
        result = deleteCourse(data.course_id);
        break;
      case "registerUser":
        result = registerUser(data.email, data.password, data.full_name, data.phone);
        break;
      case "loginUser":
        result = loginUser(data.email, data.password);
        break;
      case "getUserBalance":
        result = getUserBalance(data.user_id);
        break;
      case "getUserInfo":
        result = getUserInfo(data.user_id);
        break;
      case "getAllUsers":
        result = getAllUsers();
        break;
      case "depositXu":
        result = depositXu(data.user_id, data.amount);
        break;
      case "getTransactionHistory":
        result = getTransactionHistory(data.user_id);
        break;
      case "getAllTransactions":
        result = getAllTransactions();
        break;
      case "createOrder":
        result = createOrder(data.user_id, data.course_id, data.amount);
        break;
      case "getOrders":
        result = getOrders(data.user_id);
        break;
      case "getAllOrders":
        result = getAllOrders();
        break;
      case "getUserEnrollments":
        result = getUserEnrollments(data.user_id);
        break;
      case "updateProgress":
        result = updateProgress(data.enrollment_id, data.progress);
        break;
      case "getAllEnrollments":
        result = getAllEnrollments();
        break;
      case "getCourseVideos":
        result = getCourseVideos(data.course_id);
        break;
      case "checkCourseAccess":
        result = checkCourseAccess(data.user_id, data.course_id);
        break;
      case "getSettings":
        result = getSettings();
        break;
      case "updateSetting":
        result = updateSetting(data.key, data.value);
        break;
      case "getStatistics":
        result = getStatistics();
        break;
      case "getDashboardData":
        result = getDashboardData(data.user_id);
        break;
      default:
        result = { error: "Unknown action: " + action };
    }
  } catch (err) {
    result = { error: err.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return HtmlService.createHtmlOutput(
    "<h1 style='text-align: center; margin-top: 50px;'>🎓 UNICA API is running</h1>" +
    "<p style='text-align: center; color: #666;'>Nền tảng học tập trực tuyến</p>"
  );
}
