import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  Timestamp,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

/* ---------- Firebase config ---------- */
const firebaseConfig = {
  apiKey: "AIzaSyAvXmhq6Gj75Jbuxqph4rJGmlLz6axXIoc",
  authDomain: "unitybjj-254ce.firebaseapp.com",
  projectId: "unitybjj-254ce",
  storageBucket: "unitybjj-254ce.appspot.com",
  messagingSenderId: "120660951337",
  appId: "1:120660951337:web:25bf767fadf75dcb5d3738"
};

initializeApp(firebaseConfig);
const auth = getAuth();
const db   = getFirestore();

/* ---------- 1 · populate dropdowns ---------- */
function populate(selectId, values) {
  const sel = document.getElementById(selectId);
  values.forEach(v => {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = v;
    sel.appendChild(o);
  });
}

populate("nacionalidade", [
  "Afghan","South African","Albanian","German","Andorran","Angolan",
  "Antiguan and Barbudan","Saudi","Algerian","Argentinian","Armenian",
  "Australian","Austrian","Azerbaijani","Bahamian","Bangladeshi",
  "Barbadian","Belgian","Belizean","Beninese","Bolivian","Brazilian",
  "British","Bulgarian","Burkinabé","Burundian","Cape Verdean",
  "Cameroonian","Canadian","Chilean","Chinese","Colombian","Congolese",
  "Costa Rican","Croatian","Cuban","Danish","Egyptian","Ecuadorian",
  "Spanish","American","Filipino","French","Greek","Guatemalan",
  "Haitian","Dutch","Honduran","Indian","Indonesian","Italian",
  "Japanese","Mozambican","Mexican","Portuguese","Russian",
  "South Korean","Venezuelan"
]);

populate("faixa",
  ["White","Blue","Purple","Brown","Black"]
);

/* ---------- 2 · generate sequential nAluno ---------- */
async function generateNAluno() {
  const year = new Date().getFullYear().toString();
  const q    = query(collection(db, "student"), where("start_year", "==", year));
  const snap = await getDocs(q);
  const count = snap.size + 1;                  // next number this year
  return { value: `${year}${String(count).padStart(3,"0")}`, year };
}

/* ---------- 3 · form submit ---------- */
async function registerUser(e) {
  e.preventDefault();
  const f = e.target;

  // grab fields
  const data = {
  name        : f.nome.value,
  email       : f.email.value,
  password    : f.password.value,
  birth       : f["data-nascimento"].value ? Timestamp.fromDate(new Date(f["data-nascimento"].value)) : null,
  address     : f.morada.value,
  nationality : f.nacionalidade.value,
  gender      : f.genero.value,
  belt        : f.faixa.value,
  height      : f.altura.value,
  weight      : f.peso.value
};

  try {
    /* 3.1 create auth account */
    const { user } = await createUserWithEmailAndPassword(
      auth, data.email, data.password
    );
    const uid = user.uid;

    /* 3.2 generate student number */
    const n   = await generateNAluno();

    /* 3.3 general profile (/users) */
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, {
  email       : data.email,
  name        : data.name,
  address     : data.address,
  birth_date  : data.birth, 
  nationality : data.nationality,
  gender      : data.gender,
  created_at  : Timestamp.now(),
  role        : doc(db, "cargo", "3"),
  phone       : ""
});

    /* 3.4 student profile (/student) */
    await setDoc(doc(db, "student", uid), {
      nAluno      : n.value,
      nationality : data.nationality,
      faixa       : data.belt,
      height      : data.height,   // cm
      weight      : data.weight,   // kg
      start_date  : Timestamp.now(),
      birth_date  : data.birth,
      start_year  : n.year,
      user        : userRef
    });

    /* 3.5 success ➜ show ID & redirect */
    document.getElementById("nAlunoOutput").textContent = n.value;
    alert(`Registration successful!\nYour student number is ${n.value}`);
    window.location.href = "login.html";

  } catch (err) {
    console.error(err.message);
    alert("Error: " + err.message);

    /* keep dropdown/value selections */
    f.nacionalidade.value = data.nationality;
    f.faixa.value         = data.belt;
  }
}

/* ---------- 4 · hook up ---------- */
document.getElementById("registerForm").addEventListener("submit", registerUser);
