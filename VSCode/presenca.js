// Firebase configuration
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

async function fetchClassData() {
  const container = document.getElementById("firebaseData");
  container.innerHTML = "<p>Loading current class info...</p>";

  const daysOfWeek = [
    "domingo", "segunda-feira", "terça-feira", "quarta-feira",
    "quinta-feira", "sexta-feira", "sábado"
  ];

  const now = new Date();
  const currentDay = daysOfWeek[now.getDay()];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  console.log("Today:", currentDay);
  console.log("Current Time (minutes):", currentMinutes);

  try {
    const querySnapshot = await db.collection("Class").get();
    container.innerHTML = "";
    let found = false;

    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      const classDay = (data.DiaDaSemana || "").toLowerCase();
      const classTime = data.Hora;
      const title = data.title || "(Sem título)";

      console.log("Checking class:", title);
      console.log("Class Day:", classDay);
      console.log("Class Time:", classTime);

      if (!classDay || !classTime) {
        console.warn("Missing day or time, skipping.");
        continue;
      }

      if (classDay !== currentDay) {
        console.log("Day doesn't match.");
        continue;
      }

      const [classHour, classMinute] = classTime.split(":").map(Number);
      const classStartMinutes = classHour * 60 + classMinute;
      const classEndMinutes = classStartMinutes + 60; // 1-hour duration

      if (currentMinutes >= classStartMinutes && currentMinutes <= classEndMinutes) {
        console.log("✅ Class is currently running!");

        let teacherName = "N/A";

        // Fetch teacher's user name
        if (data.teacher) {
  try {
    const staffDoc = await data.teacher.get();
    const staffData = staffDoc.data();

    console.log("Fetched staff data:", staffData);

    if (staffData && staffData.user && typeof staffData.user.get === 'function') {
      const userDoc = await staffData.user.get();
      const userData = userDoc.data();
      console.log("Fetched user data:", userData);
      teacherName = userData?.name || "Sem nome";
    } else {
      console.warn("staffData.user não é uma referência válida:", staffData.user);
    }
  } catch (err) {
    console.error("Erro ao buscar professor:", err);
  }
}


        const classCard = document.createElement("div");
        classCard.innerHTML = `
          <h3>${title}</h3>
          <p><strong>Dia:</strong> ${classDay}</p>
          <p><strong>Hora:</strong> ${classTime}</p>
          <p><strong>Professor:</strong> ${teacherName}</p>
          <hr>
        `;
        container.appendChild(classCard);
        found = true;
      } else {
        console.log("Class is not currently running.");
      }
    }

    if (!found) {
      container.innerHTML = "<p>No current class is running at this time.</p>";
    }
  } catch (error) {
    console.error("Error getting class data:", error);
    container.innerHTML = "<p>Failed to load class data.</p>";
  }
}


// Handle user ID input
function submitUserId() {
  const userIdInput = document.getElementById("userId");
  const userId = userIdInput.value.trim();

  if (userId === "") {
    alert("Please enter a valid User ID.");
    return;
  }

  alert(`User ID submitted: ${userId}`);
}

// Run on page load
document.addEventListener("DOMContentLoaded", fetchClassData);
