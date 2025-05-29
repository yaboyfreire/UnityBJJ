// Firebase configuration (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyAvXmhq6Gj75Jbuxqph4rJGmlLz6axXIoc",
  authDomain: "unitybjj-254ce.firebaseapp.com",
  projectId: "unitybjj-254ce",
  storageBucket: "unitybjj-254ce.appspot.com",
  messagingSenderId: "120660951337",
  appId: "1:120660951337:web:25bf767fadf75dcb5d3738"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// DOM elements
const dateDisplay = document.getElementById('dateDisplay');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const attendanceContainer = document.getElementById('attendanceContainer');

// Current date
let currentDate = new Date();

// Format date for display (DD-MM-YYYY)
function formatDisplayDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

// Format date for Firebase query (e.g., "29 de maio de 2025")
function formatFirebaseDate(date) {
  return `${date.getDate()} de ${getMonthName(date.getMonth())} de ${date.getFullYear()}`;
}

// Get month name in Portuguese
function getMonthName(monthIndex) {
  const months = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
  ];
  return months[monthIndex];
}

// Update the date display and load attendance data
function updateDisplay() {
  const formattedDate = formatDisplayDate(currentDate);
  dateDisplay.textContent = `📅 ${formattedDate}`;
  
  loadAttendanceData(currentDate);
}

// Load attendance data for the selected date
async function loadAttendanceData(date) {
  const firebaseFormattedDate = formatFirebaseDate(date);
  attendanceContainer.innerHTML = '<div class="loading">Loading attendance data...</div>';

  try {
    // Query classes for the selected date
    const classesSnapshot = await db.collection("Class")
      .where("Data", "==", firebaseFormattedDate)
      .get();

    if (classesSnapshot.empty) {
      attendanceContainer.innerHTML = '<div class="no-classes">No classes found for this date.</div>';
      return;
    }

    // Clear container
    attendanceContainer.innerHTML = '';

    // Process each class
    for (const classDoc of classesSnapshot.docs) {
      const classData = classDoc.data();
      const classId = classDoc.id;

      // Get class title from document or teacher reference
      let classTitle = await getClassTitle(classData, classId);

      // Create class section
      const classSection = document.createElement('div');
      classSection.className = 'class-section';
      classSection.innerHTML = `
        <h2 class="class-title">${classTitle}</h2>
        <div class="students-list">
          <h3>Students Present:</h3>
          <ul class="student-attendance-list" id="students-${classId}">
            <!-- Students will be added here -->
          </ul>
        </div>
      `;
      attendanceContainer.appendChild(classSection);

      // Load and display student attendance for this class
      await displayStudentAttendance(classId);
    }
  } catch (error) {
    console.error("Error loading attendance data:", error);
    attendanceContainer.innerHTML = `<div class="error">Error loading attendance data: ${error.message}</div>`;
  }
}

// Get class title from class data or teacher reference
async function getClassTitle(classData, classId) {
  let classTitle = "Unknown Class";
  
  if (classData.title) {
    return classData.title;
  }
  
  if (classData.teacher) {
    try {
      const teacherDoc = await classData.teacher.get();
      if (teacherDoc.exists) {
        return teacherDoc.data().title || classTitle;
      }
    } catch (error) {
      console.error(`Error fetching teacher for class ${classId}:`, error);
    }
  }
  
  return classTitle;
}

// Display student attendance for a specific class
async function displayStudentAttendance(classId) {
  const studentList = document.getElementById(`students-${classId}`);
  
  try {
    const presenceSnapshot = await db.collection("StudentPresence")
      .where("Class", "==", db.collection("Class").doc(classId))
      .get();

    if (presenceSnapshot.empty) {
      studentList.innerHTML = '<li>No students attended this class</li>';
      return;
    }

    for (const presenceDoc of presenceSnapshot.docs) {
      const presenceData = presenceDoc.data();
      
      try {
        // 1. Get the student document first
        const studentRef = presenceData.student;
        if (!studentRef) continue;
        
        const studentDoc = await studentRef.get();
        if (!studentDoc.exists) {
          addStudentListItem(studentList, `Missing student (ID: ${studentRef.id})`, 'orange');
          continue;
        }

        // 2. Get the user reference from student document
        const userRef = studentDoc.data().user;
        if (!userRef) {
          addStudentListItem(studentList, `Student ${studentRef.id} has no user reference`, 'orange');
          continue;
        }

        // 3. Get the user document
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
          addStudentListItem(studentList, `Missing user (ID: ${userRef.id})`, 'orange');
          continue;
        }

        // 4. Get the name from user document
        const userData = userDoc.data();
        const studentName = userData.displayName || userData.name || 
                           userData.nome || `Student ${studentRef.id}`;
        
        addStudentListItem(studentList, studentName);
        
      } catch (error) {
        console.error(`Error processing attendance ${presenceDoc.id}:`, error);
        addStudentListItem(studentList, `Error loading student data`, 'red');
      }
    }
  } catch (error) {
    console.error(`Error loading attendance for class ${classId}:`, error);
    studentList.innerHTML = '<li class="error">Error loading student data</li>';
  }
}

// Helper function to add list items
function addStudentListItem(list, text, color = '') {
  const li = document.createElement('li');
  li.textContent = text;
  if (color) li.style.color = color;
  list.appendChild(li);
}

// Event listeners for date navigation
prevBtn.addEventListener('click', () => {
  currentDate.setDate(currentDate.getDate() - 1);
  updateDisplay();
});

nextBtn.addEventListener('click', () => {
  currentDate.setDate(currentDate.getDate() + 1);
  updateDisplay();
});

// Initial load
updateDisplay();