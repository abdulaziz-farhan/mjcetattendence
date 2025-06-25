<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MJCET Attendance System</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: Arial; margin: 0; padding: 0; background: #f4f4f4; }
    header { background: #2e86de; padding: 1em; color: white; text-align: center; }
    .login-container, .dashboard { display: none; padding: 2em; max-width: 900px; margin: auto; background: white; box-shadow: 0 0 10px #ccc; margin-top: 2em; }
    label { display: block; margin: 1em 0 0.5em; }
    input, select, button { padding: 0.5em; width: 100%; margin-bottom: 1em; }
    table { width: 100%; border-collapse: collapse; margin-top: 1em; }
    th, td { border: 1px solid #ccc; padding: 0.5em; text-align: center; }
    .calendar-wrapper { display: flex; flex-direction: column; align-items: center; }
    .calendar-header { display: flex; justify-content: space-between; width: 100%; margin-bottom: 1em; }
    .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; width: 100%; }
    .calendar-day { background: #dff9fb; padding: 10px; text-align: center; border-radius: 5px; cursor: pointer; }
    .calendar-day.declared { background: #f6e58d; }
    .calendar-day.marked { background: #7bed9f; }
    #attendanceChart { max-width: 400px; margin-top: 2em; }
  </style>
</head>
<body>
  <header>
    <h1>MJCET Attendance Portal</h1>
  </header>

  <div class="login-container" id="login">
    <h2>Login</h2>
    <label for="role">Select Role:</label>
    <select id="role">
      <option value="teacher">Teacher</option>
      <option value="student">Student</option>
    </select>
    <label for="username">Username:</label>
    <input type="text" id="username">
    <label for="password">Password:</label>
    <input type="password" id="password">
    <button onclick="login()">Login</button>
  </div>

  <div class="dashboard" id="teacherDashboard">
    <h2>Teacher Dashboard</h2>
    <div class="calendar-wrapper">
      <div class="calendar-header">
        <button onclick="changeMonth(-1)">&lt;</button>
        <h3 id="calendarMonthYear"></h3>
        <button onclick="changeMonth(1)">&gt;</button>
      </div>
      <div class="calendar-grid" id="teacherCalendar"></div>
    </div>
    <h3>Mark Attendance for <span id="selectedDate"></span></h3>
    <table>
      <thead><tr><th>Student</th><th>Present</th></tr></thead>
      <tbody id="attendanceTable"></tbody>
    </table>
    <button onclick="submitAttendance()">Submit Attendance</button>
    <button onclick="declareNoClass()">Declare No Class</button>
  </div>

  <div class="dashboard" id="studentDashboard">
    <h2>Student Dashboard</h2>
    <p><strong>Name:</strong> <span id="studentName"></span></p>
    <div class="calendar-wrapper">
      <div class="calendar-header">
        <button onclick="changeMonth(-1)">&lt;</button>
        <h3 id="calendarMonthYear"></h3>
        <button onclick="changeMonth(1)">&gt;</button>
      </div>
      <div class="calendar-grid" id="studentCalendar"></div>
    </div>
    <p><strong>Attended:</strong> <span id="attendedCount">0</span></p>
    <p><strong>Missed:</strong> <span id="missedCount">0</span></p>
    <p><strong>Total Conducted:</strong> <span id="totalCount">0</span></p>
    <canvas id="attendanceChart"></canvas>
  </div>

  <script>
    const students = Array.from({ length: 20 }, (_, i) => `Student ${i + 1}`);
    const users = {
      teacher: { username: "teacher", password: "1234" },
      students: Object.fromEntries(students.map((s, i) => [`s${i + 1}`, { name: s, password: "1234" }]))
    };
    const attendance = {}; // date => { s1: true/false, ..., noclass: true/false }
    let currentUser = {};
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    document.getElementById('login').style.display = 'block';

    function login() {
      const role = document.getElementById('role').value;
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      if (role === 'teacher') {
        if (username === users.teacher.username && password === users.teacher.password) {
          currentUser = { role };
          showTeacherDashboard();
        } else {
          alert('Invalid teacher login');
        }
      } else {
        const student = users.students[username];
        if (student && student.password === password) {
          currentUser = { role, username, name: student.name };
          showStudentDashboard();
        } else {
          alert('Invalid student login');
        }
      }
    }

    function showTeacherDashboard() {
      document.getElementById('login').style.display = 'none';
      document.getElementById('teacherDashboard').style.display = 'block';
      drawCalendar('teacherCalendar', dateClicked);
    }

    function showStudentDashboard() {
      document.getElementById('login').style.display = 'none';
      document.getElementById('studentDashboard').style.display = 'block';
      document.getElementById('studentName').textContent = currentUser.name;
      drawCalendar('studentCalendar');
      updateStats();
    }

    function changeMonth(delta) {
      currentMonth += delta;
      if (currentMonth > 11) { currentMonth = 0; currentYear++; }
      else if (currentMonth < 0) { currentMonth = 11; currentYear--; }
      const calendarId = currentUser.role === 'teacher' ? 'teacherCalendar' : 'studentCalendar';
      drawCalendar(calendarId, currentUser.role === 'teacher' ? dateClicked : null);
    }

    function drawCalendar(id, clickHandler) {
      const cal = document.getElementById(id);
      cal.innerHTML = '';
      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0);
      document.getElementById('calendarMonthYear').textContent = `${firstDay.toLocaleString('default', { month: 'long' })} ${currentYear}`;

      for (let i = 0; i < firstDay.getDay(); i++) {
        const empty = document.createElement('div');
        cal.appendChild(empty);
      }

      for (let d = 1; d <= lastDay.getDate(); d++) {
        const dateObj = new Date(currentYear, currentMonth, d);
        const date = dateObj.toISOString().split('T')[0];
        const div = document.createElement('div');
        div.textContent = d;
        div.classList.add('calendar-day');
        if (attendance[date]?.noclass) div.classList.add('declared');
        if (attendance[date] && Object.keys(attendance[date]).includes('s1')) div.classList.add('marked');
        if (clickHandler) div.onclick = () => clickHandler(date);
        cal.appendChild(div);
      }
    }

    function dateClicked(date) {
      document.getElementById('selectedDate').textContent = date;
      const tbody = document.getElementById('attendanceTable');
      tbody.innerHTML = '';
      students.forEach((s, i) => {
        const sid = `s${i + 1}`;
        const tr = document.createElement('tr');
        const td1 = document.createElement('td');
        td1.textContent = s;
        const td2 = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = attendance[date]?.[sid] ?? false;
        td2.appendChild(checkbox);
        tr.append(td1, td2);
        tbody.appendChild(tr);
      });
    }

    function submitAttendance() {
      const date = document.getElementById('selectedDate').textContent;
      if (!date) return alert('Select a date');
      attendance[date] = {};
      document.querySelectorAll('#attendanceTable input').forEach((cb, i) => {
        attendance[date][`s${i + 1}`] = cb.checked;
      });
      alert('Attendance submitted');
      drawCalendar('teacherCalendar', dateClicked);
    }

    function declareNoClass() {
      const date = document.getElementById('selectedDate').textContent;
      if (!date) return alert('Select a date');
      attendance[date] = { noclass: true };
      alert('Class declared as cancelled');
      drawCalendar('teacherCalendar', dateClicked);
    }

    function updateStats() {
      let attended = 0, missed = 0, total = 0;
      Object.entries(attendance).forEach(([date, record]) => {
        if (record.noclass) return;
        const marked = record[currentUser.username];
        if (marked === true) attended++;
        else missed++;
        total++;
      });
      document.getElementById('attendedCount').textContent = attended;
      document.getElementById('missedCount').textContent = missed;
      document.getElementById('totalCount').textContent = total;
      drawPieChart(attended, missed);
    }

    function drawPieChart(present, absent) {
      const ctx = document.getElementById('attendanceChart').getContext('2d');
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Attended', 'Missed'],
          datasets: [{
            label: 'Attendance',
            data: [present, absent],
            backgroundColor: ['#2ecc71', '#e74c3c']
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: 'Your Attendance' }
          }
        }
      });
    }
  </script>
</body>
</html>
