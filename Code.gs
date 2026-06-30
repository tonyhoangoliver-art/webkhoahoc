// ============================================
// JAVASCRIPT - CHẠY TRÊN BROWSER
// ============================================

// ⚠️ THAY ĐỔI URL NÀY BẰNG DEPLOYMENT ID CỦA BẠN
const API_URL = 'https://script.google.com/macros/d/AKfycbwLCD-FRsNvAASrfffTqSj0uqWCslfuSH7s4McTyb7G6uQkpj043l9e9IpW0WNpZA-bEQ/usercontent';

let currentUser = null;
let currentAdmin = null;
let allCategories = [];
let allCourses = [];
let allLessons = [];
let allUsers = [];
let allPayments = [];
let allEnrollments = [];

// ============================================
// 1. KHỞI TẠO KHI LOAD TRANG
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  console.log('Trang đã load');
  loadCategories();
  loadCourses();
  checkLogin();
});

// ============================================
// 2. KIỂM TRA ĐĂNG NHẬP
// ============================================
function checkLogin() {
  const user = localStorage.getItem('currentUser');
  const admin = localStorage.getItem('currentAdmin');

  if (user) {
    currentUser = JSON.parse(user);
    console.log('Người dùng đã đăng nhập:', currentUser.name);
  }
  if (admin) {
    currentAdmin = JSON.parse(admin);
    console.log('Admin đã đăng nhập');
  }
}

// ============================================
// 3. LOAD DANH MỤC TỪ API
// ============================================
async function loadCategories() {
  try {
    const response = await fetch(`${API_URL}?action=getCategories`);
    const data = await response.json();
    allCategories = data;
    displayCategories(data);
    console.log('Đã tải danh mục:', data.length);
  } catch (error) {
    console.error('Lỗi tải danh mục:', error);
    alert('Lỗi kết nối API. Kiểm tra URL deployment.');
  }
}

// ============================================
// 4. HIỂN THỊ DANH MỤC
// ============================================
function displayCategories(categories) {
  const container = document.getElementById('categoriesContainer');
  if (!container) return;

  container.innerHTML = '';

  if (categories.length === 0) {
    container.innerHTML = '<p>Chưa có danh mục</p>';
    return;
  }

  categories.forEach(cat => {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.innerHTML = `
      <div style="font-size: 3rem;">${cat.icon}</div>
      <h3>${cat.name}</h3>
      <p>${cat.description}</p>
      <button class="btn-primary" onclick="filterCoursesByCategory('${cat.id}')">
        Xem Khóa Học
      </button>
    `;
    container.appendChild(card);
  });
}

// ============================================
// 5. LOAD KHÓA HỌC TỪ API
// ============================================
async function loadCourses(categoryId = null) {
  try {
    const url = categoryId
      ? `${API_URL}?action=getCourses&categoryId=${categoryId}`
      : `${API_URL}?action=getCourses`;
    const response = await fetch(url);
    const data = await response.json();
    allCourses = data;
    displayCourses(data);
    console.log('Đã tải khóa học:', data.length);
  } catch (error) {
    console.error('Lỗi tải khóa học:', error);
  }
}

// ============================================
// 6. HIỂN THỊ KHÓA HỌC
// ============================================
function displayCourses(courses) {
  const container = document.getElementById('coursesContainer');
  if (!container) return;

  container.innerHTML = '';

  if (courses.length === 0) {
    container.innerHTML = '<p>Chưa có khóa học</p>';
    return;
  }

  courses.forEach(course => {
    const finalPrice = course.price * (1 - course.discount / 100);
    const card = document.createElement('div');
    card.className = 'course-card';
    card.innerHTML = `
      <img src="${course.image}" alt="${course.name}" 
           style="width:100%; height:150px; object-fit:cover; border-radius:5px;"
           onerror="this.src='https://via.placeholder.com/300x200'">
      <h3>${course.name}</h3>
      <p>${course.description}</p>
      <div class="price">
        ${course.discount > 0 ? `<span style="text-decoration:line-through;">${course.price.toLocaleString()} VND</span><br>` : ''}
        <strong>${finalPrice.toLocaleString()} VND</strong>
      </div>
      <p>👨‍🏫 ${course.teacher}</p>
      <p>📚 ${course.lessons} bài học</p>
      <button class="btn-primary" onclick="viewCourseDetail('${course.id}')">
        Chi Tiết & Đăng Ký
      </button>
    `;
    container.appendChild(card);
  });
}

// ============================================
// 7. LỌC KHÓA HỌC THEO DANH MỤC
// ============================================
function filterCoursesByCategory(categoryId) {
  const filtered = allCourses.filter(c => c.categoryId === categoryId);
  displayCourses(filtered);
  document.getElementById('courses').scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// 8. XEM CHI TIẾT KHÓA HỌC
// ============================================
async function viewCourseDetail(courseId) {
  const course = allCourses.find(c => c.id === courseId);
  if (!course) return;

  const modal = document.getElementById('courseModal');
  const detail = document.getElementById('courseDetail');

  // Load bài học
  const lessons = await loadLessonsForCourse(courseId);

  const finalPrice = course.price * (1 - course.discount / 100);
  detail.innerHTML = `
    <h2>${course.name}</h2>
    <img src="${course.image}" alt="${course.name}" 
         style="width:100%; height:300px; object-fit:cover; border-radius:10px; margin:1rem 0;"
         onerror="this.src='https://via.placeholder.com/300x200'">
    <p><strong>Mô Tả:</strong> ${course.description}</p>
    <p><strong>Giáo Viên:</strong> ${course.teacher}</p>
    <p><strong>Giá:</strong> <span style="color:#ffd700; font-size:1.2rem;">${finalPrice.toLocaleString()} VND</span></p>
    <p><strong>Số Bài Học:</strong> ${course.lessons}</p>
    <h3>📖 Danh Sách Bài Học:</h3>
    <ul style="margin-left:2rem;">
      ${lessons.length > 0 
        ? lessons.map(l => `<li><strong>Tuần ${l.week}:</strong> ${l.title} (${l.duration})</li>`).join('')
        : '<li>Chưa có bài học</li>'
      }
    </ul>
    <button class="btn-primary" onclick="enrollCourse('${course.id}', ${finalPrice})">
      🛒 Đăng Ký Khóa Học
    </button>
  `;

  modal.style.display = 'flex';
}

// ============================================
// 9. LOAD BÀI HỌC CHO KHÓA
// ============================================
async function loadLessonsForCourse(courseId) {
  try {
    const response = await fetch(`${API_URL}?action=getLessons&courseId=${courseId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Lỗi tải bài học:', error);
    return [];
  }
}

// ============================================
// 10. ĐĂNG KÝ KHÓA HỌC
// ============================================
function enrollCourse(courseId, price) {
  if (!currentUser) {
    const name = prompt('Nhập tên của bạn:');
    if (!name) return;

    const email = prompt('Nhập email của bạn:');
    if (!email) return;

    const phone = prompt('Nhập số điện thoại:');
    if (!phone) return;

    // Tạo người dùng mới
    registerUser(name, email, phone, courseId, price);
  } else {
    processPayment(currentUser.id, courseId, price);
  }
}

// ============================================
// 11. ĐĂNG KÝ NGƯỜI DÙNG MỚI
// ============================================
async function registerUser(name, email, phone, courseId, price) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      payload: JSON.stringify({
        action: 'addUser',
        name: name,
        email: email,
        phone: phone,
        address: '',
        birthDate: ''
      })
    });
    const result = await response.json();

    if (result.success) {
      currentUser = { id: result.userId, name: name, email: email };
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      processPayment(result.userId, courseId, price);
    }
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    alert('Lỗi đăng ký người dùng');
  }
}

// ============================================
// 12. XỬ LÝ THANH TOÁN
// ============================================
function processPayment(userId, courseId, price) {
  const methods = ['Thẻ Tín Dụng', 'Ví Điện Tử', 'Chuyển Khoản'];
  const methodList = methods.map((m, i) => `${i+1}. ${m}`).join('\n');
  const choice = prompt(`Chọn phương thức thanh toán:\n${methodList}`);

  if (!choice || choice < 1 || choice > 3) {
    alert('Phương thức không hợp lệ');
    return;
  }

  const method = methods[choice - 1];

  // Thêm thanh toán
  addPaymentRecord(userId, courseId, price, method);

  // Thêm đăng ký
  addEnrollmentRecord(userId, courseId);

  alert(`✅ Thanh toán thành công!\nPhương thức: ${method}\nSố tiền: ${price.toLocaleString()} VND\n\nBạn có thể bắt đầu học ngay!`);
  closeCourseModal();
}

// ============================================
// 13. THÊM THANH TOÁN
// ============================================
async function addPaymentRecord(userId, courseId, amount, method) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      payload: JSON.stringify({
        action: 'addPayment',
        userId: userId,
        courseId: courseId,
        amount: amount,
        method: method
      })
    });
    const result = await response.json();
    console.log('Thanh toán thêm:', result);
  } catch (error) {
    console.error('Lỗi thêm thanh toán:', error);
  }
}

// ============================================
// 14. THÊM ĐĂNG KÝ
// ============================================
async function addEnrollmentRecord(userId, courseId) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      payload: JSON.stringify({
        action: 'addEnrollment',
        userId: userId,
        courseId: courseId
      })
    });
    const result = await response.json();
    console.log('Đăng ký thêm:', result);
  } catch (error) {
    console.error('Lỗi thêm đăng ký:', error);
  }
}

// ============================================
// 15. HIỂN THỊ CÁC TRANG
// ============================================
function showHome() {
  document.getElementById('home').style.display = 'block';
  document.getElementById('categories').style.display = 'block';
  document.getElementById('courses').style.display = 'block';
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('admin').style.display = 'none';
}

function showCourses() {
  document.getElementById('home').style.display = 'none';
  document.getElementById('categories').style.display = 'block';
  document.getElementById('courses').style.display = 'block';
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('admin').style.display = 'none';
}

function showDashboard() {
  if (!currentUser) {
    alert('Vui lòng đăng nhập trước!');
    return;
  }
  document.getElementById('home').style.display = 'none';
  document.getElementById('categories').style.display = 'none';
  document.getElementById('courses').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
  document.getElementById('admin').style.display = 'none';
  loadUserDashboard();
}

function showAdmin() {
  if (!currentAdmin) {
    const password = prompt('Nhập mật khẩu admin:');
    // Mật khẩu: admin123 (hash SHA256)
    if (password !== 'admin123') {
      alert('❌ Mật khẩu sai!');
      return;
    }
    currentAdmin = { id: 'ADM001', name: 'Admin' };
    localStorage.setItem('currentAdmin', JSON.stringify(currentAdmin));
  }

  document.getElementById('home').style.display = 'none';
  document.getElementById('categories').style.display = 'none';
  document.getElementById('courses').style.display = 'none';
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('admin').style.display = 'block';
  loadAdminDashboard();
}

// ============================================
// 16. LOAD DASHBOARD NGƯỜI DÙNG
// ============================================
async function loadUserDashboard() {
  try {
    const enrollments = await fetch(`${API_URL}?action=getEnrollments&userId=${currentUser.id}`)
      .then(r => r.json());
    const payments = await fetch(`${API_URL}?action=getPayments&userId=${currentUser.id}`)
      .then(r => r.json());

    // Hiển thị khóa học
    const myCoursesContainer = document.getElementById('myCoursesContainer');
    myCoursesContainer.innerHTML = enrollments.map(e => {
      const course = allCourses.find(c => c.id === e.courseId);
      return `
        <div style="padding:1rem; border:2px solid #ffd700; margin:0.5rem 0; border-radius:5px; background:#f9f9f9;">
          <h4>📚 ${course?.name || 'Khóa Học'}</h4>
          <p><strong>Trạng Thái:</strong> ${e.status}</p>
          <p><strong>Tiến Độ:</strong> ${e.progress}%</p>
          <div style="background:#ddd; height:15px; border-radius:5px; overflow:hidden;">
            <div style="background:linear-gradient(90deg, #ffd700, #ffed4e); height:100%; width:${e.progress}%;"></div>
          </div>
        </div>
      `;
    }).join('');

    if (enrollments.length === 0) {
      myCoursesContainer.innerHTML = '<p>Bạn chưa đăng ký khóa học nào</p>';
    }

    // Hiển thị thanh toán
    const paymentsContainer = document.getElementById('paymentsContainer');
    paymentsContainer.innerHTML = payments.map(p => `
      <div style="padding:1rem; border:1px solid #ddd; margin:0.5rem 0; border-radius:5px; background:#f9f9f9;">
        <p><strong>💰 Số Tiền:</strong> ${p.amount.toLocaleString()} VND</p>
        <p><strong>🏦 Phương Thức:</strong> ${p.method}</p>
        <p><strong>✅ Trạng Thái:</strong> <span style="color:green; font-weight:bold;">${p.status}</span></p>
        <p><strong>📅 Ngày:</strong> ${new Date(p.date).toLocaleDateString('vi-VN')}</p>
      </div>
    `).join('');

    if (payments.length === 0) {
      paymentsContainer.innerHTML = '<p>Chưa có giao dịch thanh toán</p>';
    }
  } catch (error) {
    console.error('Lỗi tải dashboard:', error);
  }
}

// ============================================
// 17. LOAD ADMIN DASHBOARD
// ============================================
async function loadAdminDashboard() {
  try {
    const users = await fetch(`${API_URL}?action=getUsers`).then(r => r.json()).catch(() => []);
    const payments = await fetch(`${API_URL}?action=getAllPayments`).then(r => r.json()).catch(() => []);

    // Tính toán thống kê
    const totalUsers = users.length;
    const totalCourses = allCourses.length;
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('totalCourses').textContent = totalCourses;
    document.getElementById('totalRevenue').textContent = totalRevenue.toLocaleString() + ' VND';

    // Load bảng
    loadAdminTables(users, payments);
  } catch (error) {
    console.error('Lỗi tải admin dashboard:', error);
  }
}

// ============================================
// 18. LOAD BẢNG ADMIN
// ============================================
function loadAdminTables(users, payments) {
  // Danh mục
  const categoriesTable = document.getElementById('categoriesTable');
  categoriesTable.innerHTML = allCategories.map(c => `
    <tr>
      <td>${c.id}</td>
      <td>${c.name}</td>
      <td>${c.description}</td>
      <td>
        <button onclick="editCategory('${c.id}')" class="btn-primary" style="padding:0.5rem 1rem;">✏️ Sửa</button>
        <button onclick="deleteCategory('${c.id}')" style="padding:0.5rem 1rem; background:#ff4444; color:white; border:none; border-radius:3px; cursor:pointer;">🗑️ Xóa</button>
      </td>
    </tr>
  `).join('');

  // Khóa học
  const coursesTable = document.getElementById('coursesTable');
  coursesTable.innerHTML = allCourses.map(c => `
    <tr>
      <td>${c.id}</td>
      <td>${c.name}</td>
      <td>${c.price.toLocaleString()} VND</td>
      <td>${c.teacher}</td>
      <td><span style="background:#90EE90; padding:0.3rem 0.8rem; border-radius:3px;">${c.status}</span></td>
      <td>
        <button onclick="editCourse('${c.id}')" class="btn-primary" style="padding:0.5rem 1rem;">✏️ Sửa</button>
        <button onclick="deleteCourse('${c.id}')" style="padding:0.5rem 1rem; background:#ff4444; color:white; border:none; border-radius:3px; cursor:pointer;">🗑️ Xóa</button>
      </td>
    </tr>
  `).join('');

  // Người dùng
  const usersTable = document.getElementById('usersTable');
  usersTable.innerHTML = users.map(u => `
    <tr>
      <td>${u.id}</td>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>${u.phone}</td>
      <td>${new Date(u.registerDate).toLocaleDateString('vi-VN')}</td>
      <td>
        <button onclick="viewUser('${u.id}')" style="padding:0.5rem 1rem; background:#4444ff; color:white; border:none; border-radius:3px; cursor:pointer;">👁️ Xem</button>
      </td>
    </tr>
  `).join('');

  // Thanh toán
  const paymentsTable = document.getElementById('paymentsTable');
  paymentsTable.innerHTML = payments.map(p => `
    <tr>
      <td>${p.id}</td>
      <td>${p.userId}</td>
      <td>${p.courseId}</td>
      <td>${p.amount.toLocaleString()} VND</td>
      <td>${p.method}</td>
      <td><span style="background:#90EE90; padding:0.3rem 0.8rem; border-radius:3px;">${p.status}</span></td>
      <td>${new Date(p.date).toLocaleDateString('vi-VN')}</td>
    </tr>
  `).join('');
}

// ============================================
// 19. SWITCH ADMIN TAB
// ============================================
function switchAdminTab(tabName) {
  // Ẩn tất cả tab
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.classList.remove('active');
    tab.style.display = 'none';
  });

  // Ẩn tất cả nút
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Hiển thị tab được chọn
  const tab = document.getElementById(tabName + '-tab');
  if (tab) {
    tab.classList.add('active');
    tab.style.display = 'block';
  }

  // Highlight nút
  event.target.classList.add('active');
}

// ============================================
// 20. FORM MODAL
// ============================================
function openCategoryForm() {
  document.getElementById('modalTitle').textContent = '➕ Thêm Danh Mục';
  document.getElementById('formFields').innerHTML = `
    <div class="form-group">
      <label>Tên Danh Mục</label>
      <input type="text" id="categoryName" required>
    </div>
    <div class="form-group">
      <label>Mô Tả</label>
      <textarea id="categoryDesc" required></textarea>
    </div>
    <div class="form-group">
      <label>Icon</label>
      <input type="text" id="categoryIcon" value="📚" required>
    </div>
  `;
  document.getElementById('dynamicForm').dataset.type = 'category';
  document.getElementById('modalForm').style.display = 'flex';
}

function openCourseForm() {
  document.getElementById('modalTitle').textContent = '➕ Thêm Khóa Học';
  document.getElementById('formFields').innerHTML = `
    <div class="form-group">
      <label>Tên Khóa Học</label>
      <input type="text" id="courseName" required>
    </div>
    <div class="form-group">
      <label>Danh Mục</label>
      <select id="courseCategory" required>
        ${allCategories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Giá (VND)</label>
      <input type="number" id="coursePrice" required>
    </div>
    <div class="form-group">
      <label>Giảm Giá (%)</label>
      <input type="number" id="courseDiscount" value="0">
    </div>
    <div class="form-group">
      <label>Giáo Viên</label>
      <input type="text" id="courseTeacher" required>
    </div>
    <div class="form-group">
      <label>Mô Tả</label>
      <textarea id="courseDesc" required></textarea>
    </div>
  `;
  document.getElementById('dynamicForm').dataset.type = 'course';
  document.getElementById('modalForm').style.display = 'flex';
}

function openLessonForm() {
  document.getElementById('modalTitle').textContent = '➕ Thêm Bài Học';
  document.getElementById('formFields').innerHTML = `
    <div class="form-group">
      <label>Khóa Học</label>
      <select id="lessonCourse" required>
        ${allCourses.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Tiêu Đề</label>
      <input type="text" id="lessonTitle" required>
    </div>
    <div class="form-group">
      <label>Tuần</label>
      <input type="number" id="lessonWeek" required>
    </div>
    <div class="form-group">
      <label>Nội Dung</label>
      <textarea id="lessonContent" required></textarea>
    </div>
    <div class="form-group">
      <label>URL Video</label>
      <input type="url" id="lessonVideo">
    </div>
    <div class="form-group">
      <label>Thời Lượng</label>
      <input type="text" id="lessonDuration" placeholder="45 phút">
    </div>
  `;
  document.getElementById('dynamicForm').dataset.type = 'lesson';
  document.getElementById('modalForm').style.display = 'flex';
}

function handleFormSubmit(event) {
  event.preventDefault();
  const type = document.getElementById('dynamicForm').dataset.type;

  if (type === 'category') {
    const name = document.getElementById('categoryName').value;
    const desc = document.getElementById('categoryDesc').value;
    const icon = document.getElementById('categoryIcon').value;
    addCategoryRecord(name, desc, icon);
  } else if (type === 'course') {
    const name = document.getElementById('courseName').value;
    const catId = document.getElementById('courseCategory').value;
    const price = document.getElementById('coursePrice').value;
    const discount = document.getElementById('courseDiscount').value;
    const teacher = document.getElementById('courseTeacher').value;
    const desc = document.getElementById('courseDesc').value;
    addCourseRecord(name, catId, desc, price, discount, teacher);
  } else if (type === 'lesson') {
    const courseId = document.getElementById('lessonCourse').value;
    const title = document.getElementById('lessonTitle').value;
    const week = document.getElementById('lessonWeek').value;
    const content = document.getElementById('lessonContent').value;
    const video = document.getElementById('lessonVideo').value;
    const duration = document.getElementById('lessonDuration').value;
    addLessonRecord(courseId, title, week, content, video, duration);
  }

  closeModal();
}

// ============================================
// 21. THÊM DANH MỤC
// ============================================
async function addCategoryRecord(name, desc, icon) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      payload: JSON.stringify({
        action: 'addCategory',
        name: name,
        description: desc,
        icon: icon
      })
    });
    const result = await response.json();
    if (result.success) {
      alert('✅ Thêm danh mục thành công!');
      loadCategories();
    }
  } catch (error) {
    console.error('Lỗi:', error);
    alert('❌ Lỗi thêm danh mục');
  }
}

// ============================================
// 22. THÊM KHÓA HỌC
// ============================================
async function addCourseRecord(name, catId, desc, price, discount, teacher) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      payload: JSON.stringify({
        action: 'addCourse',
        name: name,
        categoryId: catId,
        description: desc,
        price: parseInt(price),
        discount: parseInt(discount),
        teacher: teacher,
        image: 'https://via.placeholder.com/300x200'
      })
    });
    const result = await response.json();
    if (result.success) {
      alert('✅ Thêm khóa học thành công!');
      loadCourses();
    }
  } catch (error) {
    console.error('Lỗi:', error);
    alert('❌ Lỗi thêm khóa học');
  }
}

// ============================================
// 23. THÊM BÀI HỌC
// ============================================
async function addLessonRecord(courseId, title, week, content, video, duration) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      payload: JSON.stringify({
        action: 'addLesson',
        courseId: courseId,
        title: title,
        week: parseInt(week),
        content: content,
        videoUrl: video,
        duration: duration
      })
    });
    const result = await response.json();
    if (result.success) {
      alert('✅ Thêm bài học thành công!');
    }
  } catch (error) {
    console.error('Lỗi:', error);
    alert('❌ Lỗi thêm bài học');
  }
}

// ============================================
// 24. ĐÓNG MODAL
// ============================================
function closeModal() {
  document.getElementById('modalForm').style.display = 'none';
}

function closeCourseModal() {
  document.getElementById('courseModal').style.display = 'none';
}

// ============================================
// 25. ĐĂNG XUẤT
// ============================================
function logout() {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('currentAdmin');
  currentUser = null;
  currentAdmin = null;
  showHome();
  alert('👋 Đã đăng xuất!');
}

// ============================================
// 26. HELPER FUNCTIONS
// ============================================
function editCategory(id) {
  alert('Tính năng sửa đang phát triển');
}

function deleteCategory(id) {
  alert('Tính năng xóa đang phát triển');
}

function editCourse(id) {
  alert('Tính năng sửa đang phát triển');
}

function deleteCourse(id) {
  alert('Tính năng xóa đang phát triển');
}

function viewUser(id) {
  alert('Xem chi tiết người dùng: ' + id);
}
