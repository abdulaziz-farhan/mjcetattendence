function login() {
  const role = document.getElementById("role").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username === "" || password === "") {
    alert("Please fill in all fields.");
    return;
  }

  // Hide the login section
  document.getElementById("login").style.display = "none";

  // Show the respective dashboard based on the role
  if (role === "teacher") {
    document.getElementById("teacherDashboard").style.display = "block";
    alert(`Welcome, ${username}! You are logged in as a Teacher.`);
  } else if (role === "student") {
    document.getElementById("studentDashboard").style.display = "block";
    alert(`Welcome, ${username}! You are logged in as a Student.`);
  } else {
    alert("Invalid role selected.");
  }
}

// Calendar Functionality for Teacher Dashboard
const currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

function updateCalendar() {
  const calendarGrid = document.getElementById("teacherCalendar");
  const calendarMonthYear = document.getElementById("calendarMonthYear");

  // Clear existing calendar days
  calendarGrid.innerHTML = "";

  // Update month and year display
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  calendarMonthYear.textContent = `${monthNames[currentMonth]} ${currentYear}`;

  // Get the first day and number of days in the current month
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Generate blank days for the first week
  for (let i = 0; i < firstDay; i++) {
    const blankDay = document.createElement("div");
    blankDay.classList.add("calendar-day");
    blankDay.style.visibility = "hidden"; // Hide blank days
    calendarGrid.appendChild(blankDay);
  }

  // Generate calendar days
  for (let day = 1; day <= daysInMonth; day++) {
    const calendarDay = document.createElement("div");
    calendarDay.classList.add("calendar-day");
    calendarDay.textContent = day;

    // Example: Mark specific days
    if (day === 5 || day === 15) {
      calendarDay.classList.add("marked"); // Marked days
    } else if (day === 10) {
      calendarDay.classList.add("declared"); // Declared days
    }

    calendarDay.addEventListener("click", () => {
      alert(`You clicked on ${day} ${monthNames[currentMonth]} ${currentYear}`);
    });

    calendarGrid.appendChild(calendarDay);
  }
}

function changeMonth(direction) {
  currentMonth += direction;

  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  } else if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }

  updateCalendar();
}

// Initialize Calendar on Page Load
window.onload = function () {
  updateCalendar();
};

let attendanceData = {};
let totalPresent = 0;
let totalAbsent = 0;

function login() {
  const role = document.getElementById("role").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username === "" || password === "") {
    alert("Please fill in all fields.");
    return;
  }

  document.getElementById("login").style.display = "none";

  if (role === "teacher") {
    document.getElementById("teacherDashboard").style.display = "block";
    alert(`Welcome, ${username}! You are logged in as a Teacher.`);
  } else if (role === "student") {
    document.getElementById("studentDashboard").style.display = "block";
    alert(`Welcome, ${username}! You are logged in as a Student.`);
    generateAttendanceChart();
  } else {
    alert("Invalid role selected.");
  }
}

function changeMonth(direction) {
  currentMonth += direction;

  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  } else if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }

  updateCalendar();
}

function updateCalendar() {
  const calendarGrid = document.getElementById("teacherCalendar");
  const calendarMonthYear = document.getElementById("calendarMonthYear");

  calendarGrid.innerHTML = "";

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  calendarMonthYear.textContent = `${monthNames[currentMonth]} ${currentYear}`;

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const blankDay = document.createElement("div");
    blankDay.classList.add("calendar-day");
    blankDay.style.visibility = "hidden";
    calendarGrid.appendChild(blankDay);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const calendarDay = document.createElement("div");
    calendarDay.classList.add("calendar-day");
    calendarDay.textContent = day;

    calendarDay.addEventListener("click", () => {
      generateAttendanceForm(day);
    });

    calendarGrid.appendChild(calendarDay);
  }
}

function generateAttendanceForm(selectedDate) {
  const attendanceForm = document.getElementById("attendanceForm");
  attendanceForm.innerHTML = `<h4>Mark Attendance for ${selectedDate} ${currentMonth + 1} ${currentYear}</h4>`;

  const students = ["Student 1", "Student 2", "Student 3", "Student 4"];
  attendanceData[selectedDate] = {};

  students.forEach((student) => {
    const studentRow = document.createElement("div");
    studentRow.innerHTML = `
      <label>${student}</label>
      <input type="checkbox" id="${student}" onchange="markStudentAttendance('${selectedDate}', '${student}')">
    `;
    attendanceForm.appendChild(studentRow);
  });
}

function markStudentAttendance(date, student) {
  const isPresent = document.getElementById(student).checked;
  attendanceData[date][student] = isPresent;
}

function submitAttendance() {
  const selectedDate = Object.keys(attendanceData)[0];
  const students = attendanceData[selectedDate];

  let presentCount = 0;
  let absentCount = 0;

  for (const student in students) {
    if (students[student]) {
      presentCount++;
    } else {
      absentCount++;
    }
  }

  totalPresent += presentCount;
  totalAbsent += absentCount;

  document.getElementById("attendanceStatus").textContent = `Attendance submitted for ${selectedDate}. Present: ${presentCount}, Absent: ${absentCount}.`;
  document.getElementById("totalPresent").textContent = totalPresent;
  document.getElementById("totalAbsent").textContent = totalAbsent;
}

function generateAttendanceChart() {
  const ctx = document.getElementById("attendanceChart").getContext("2d");
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Present", "Absent"],
      datasets: [
        {
          data: [totalPresent, totalAbsent],
          backgroundColor: ["#4caf50", "#f44336"],
        },
      ],
    },
    options: {
      responsive: true,
    },
  });
}

window.onload = function () {
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  updateCalendar();
};

function viewAttendance() {
  const branch = document.getElementById("branchStudent").value;
  const section = document.getElementById("sectionStudent").value;

  const attendanceDetails = document.getElementById("attendanceDetails");
  attendanceDetails.textContent = `Viewing attendance for Branch: ${branch}, Section: ${section}.`;

  // Display the statistical graph section
  const statisticalGraph = document.getElementById("statisticalGraph");
  statisticalGraph.style.display = "block";