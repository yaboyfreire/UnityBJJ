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

let currentClassDocId = null; // To track which class is running

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

  console.log(`📅 Today is: ${currentDay} | Current time (minutes): ${currentMinutes}`);

  try {
    const querySnapshot = await db.collection("Class").get();
    container.innerHTML = "";
    let found = false;

    console.log(`🔍 Found ${querySnapshot.size} class documents.`);

    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      const classDay = (data.DiaDaSemana || "").toLowerCase();
      const classTime = data.Hora;
      const title = data.title || "(Sem título)";

      if (!classDay || !classTime || classDay !== currentDay) continue;

      const [classHour, classMinute] = classTime.split(":").map(Number);
      const classStartMinutes = classHour * 60 + classMinute;
      const classEndMinutes = classStartMinutes + 60;

      console.log(`➡️ Checking class "${title}" at ${classTime} (${classDay})`);

      if (currentMinutes >= classStartMinutes && currentMinutes <= classEndMinutes) {
        console.log("✅ Class is currently running");

        let teacherName = "N/A";
        if (data.teacher) {
          try {
            const staffDoc = await data.teacher.get();
            const staffData = staffDoc.data();
            if (staffData && staffData.user && typeof staffData.user.get === 'function') {
              const userDoc = await staffData.user.get();
              teacherName = userDoc.data()?.name || "Sem nome";
            }
          } catch (err) {
            console.error("Erro ao buscar professor:", err);
          }
        }

        const classCard = document.createElement("div");
        classCard.className = "class-card";
        classCard.innerHTML = `
          <h3>${title}</h3>
          <p><strong>Dia:</strong> ${classDay}</p>
          <p><strong>Hora:</strong> ${classTime}</p>
          <p><strong>Professor:</strong> ${teacherName}</p>
          <hr>
          <div id="matchResult"></div>
        `;
        container.appendChild(classCard);

        currentClassDocId = doc.id;
        found = true;
        break;
      } else {
        console.log("⏱ Class is not currently active.");
      }
    }

    if (!found) {
      console.warn("⚠️ No active class found for the current day/time.");
      container.innerHTML = "<p>No current class is running at this time.</p>";
    }
  } catch (error) {
    console.error("Error getting class data:", error);
    container.innerHTML = "<p>❌ Failed to load class data.</p>";
  }
}

async function submitUserId() {
  const input     = document.getElementById("userId");
  const nAluno    = input.value.trim();
  const resultDiv = document.getElementById("matchResult");

  // Clear any previous feedback
  resultDiv.innerHTML = "";

  if (!currentClassDocId) {
    resultDiv.innerHTML =
      `<div style="background:#ffc107;padding:10px;">Nenhuma aula ativa no momento.</div>`;
    return;
  }
  if (!nAluno) {
    resultDiv.innerHTML =
      `<div style="background:#ffc107;padding:10px;">Insira um número de aluno.</div>`;
    return;
  }

  console.log("🔍 Procurando aluno com nAluno =", nAluno);

  try {
    /* 1️⃣  Localizar o aluno pelo nAluno ---------------------------------- */
    const studentSnap = await db
      .collection("student")
      .where("nAluno", "==", nAluno)
      .limit(1)
      .get();

    if (studentSnap.empty) {
      console.warn("❌ nAluno não encontrado.");
      resultDiv.innerHTML =
        `<div style="background:#dc3545;color:white;padding:10px;border-radius:5px;">
          Número não encontrado.
        </div>`;
      return;
    }

    const studentDoc = studentSnap.docs[0];
    const studentRef = studentDoc.ref;
    console.log("✅ Aluno encontrado:", studentRef.path);

    /* 2️⃣  Procurar ou criar presença para esta aula ---------------------- */
    const presenceQuery = db.collection("StudentPresence")
      .where("student", "==", studentRef)
      .where("Class",   "==", db.doc(`Class/${currentClassDocId}`))
      .limit(1);

    const presenceSnap = await presenceQuery.get();

    if (presenceSnap.empty) {
      console.log("🆕 Sem presença anterior – criando com Status/1");

      await db.collection("StudentPresence").add({
        student : studentRef,
        Class   : db.doc(`Class/${currentClassDocId}`),
        Status  : db.doc("ClassStatus/1"),          // PRESENTE
        Data      : firebase.firestore.FieldValue.serverTimestamp()
      });

      resultDiv.innerHTML =
        `<div style="background:#28a745;color:white;padding:10px;border-radius:5px;">
          Presença registrada com sucesso! ✅
        </div>`;
      return;
    }

    /* 3️⃣  Já existe presença – verificar status -------------------------- */
    const presenceDoc   = presenceSnap.docs[0];
    const presenceData  = presenceDoc.data();
    const statusRef     = presenceData.Status;
    const statusId      = statusRef.path.split("/").pop(); // "1" ou "2"

    console.log("ℹ️  Status atual =", statusId);

    if (statusId === "1") {
      // Já presente
      resultDiv.innerHTML =
        `<div style="background:#28a745;color:white;padding:10px;border-radius:5px;">
          Presença já confirmada!
        </div>`;
    } else if (statusId === "2") {
      // Estava ausente → atualizar para presente
      await presenceDoc.ref.update({
        Status: db.doc("ClassStatus/1")
      });
      resultDiv.innerHTML =
        `<div style="background:#007bff;color:white;padding:10px;border-radius:5px;">
          Presença atualizada para confirmada! ✅
        </div>`;
      console.log("✅ Status alterado de 2 para 1");
    } else {
      // Status desconhecido
      resultDiv.innerHTML =
        `<div style="background:#ffc107;color:black;padding:10px;border-radius:5px;">
          Status desconhecido (${statusId}). Verifique o cadastro.
        </div>`;
    }

  } catch (err) {
    console.error("🚨 Erro ao registrar/verificar presença:", err);
    resultDiv.innerHTML =
      `<div style="background:#dc3545;color:white;padding:10px;">
        Erro ao registrar presença.
      </div>`;
  }
}

document.addEventListener("DOMContentLoaded", fetchClassData);
