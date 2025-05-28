import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Your Firebase config here (replace with your real config)
const firebaseConfig = {
    apiKey: "AIzaSyAvXmhq6Gj75Jbuxqph4rJGmlLz6axXIoc",
    authDomain: "unitybjj-254ce.firebaseapp.com",
    projectId: "unitybjj-254ce",
    storageBucket: "unitybjj-254ce.appspot.com",
    messagingSenderId: "120660951337",
    appId: "1:120660951337:web:25bf767fadf75dcb5d3738"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let members = [];
let filteredMembers = [];
let sortOrder = "asc";

const membersBody = document.getElementById("membersBody");
const searchInput = document.getElementById("searchInput");
const beltFilter = document.getElementById("beltFilter");
const statusFilter = document.getElementById("statusFilter");
const sortNameBtn = document.getElementById("sortNameBtn");

async function fetchMembers() {
    members = [];

    const studentsSnapshot = await getDocs(collection(db, "student"));

    for (const studentDoc of studentsSnapshot.docs) {
    const studentData = studentDoc.data();

    const userRef = studentData.user;
    let userData = {};
    if (userRef) {
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            userData = userDoc.data();
        }
    }

    const status = studentData.studentStatus || "Null";

    console.log(`User: ${userData.name || "No Name"} - Status: ${status}`);

    members.push({
        id: studentDoc.id,
        name: userData.name || "No Name",
        email: userData.email || "No Email",
        belt: studentData.faixa || "Unknown",
        status: status,
    });
}

    filteredMembers = [...members];
    renderTable();
}

function renderTable() {
    membersBody.innerHTML = "";

    filteredMembers.forEach((member) => {
        const tr = document.createElement("tr");

        const nameTd = document.createElement("td");
        nameTd.textContent = member.name;

        const beltTd = document.createElement("td");
        beltTd.textContent = member.belt;

        const emailTd = document.createElement("td");
        emailTd.textContent = member.email;

        const status = document.createElement("td");
        status.textContent = member.status;

        const editTd = document.createElement("td");
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.classList.add("editBtn");
        editTd.appendChild(editBtn);

        tr.appendChild(nameTd);
        tr.appendChild(beltTd);
        tr.appendChild(emailTd);
        tr.appendChild(status);
        tr.appendChild(editTd);

        membersBody.appendChild(tr);
    });
}

function filterAndSort() {
    const searchTerm = searchInput.value.toLowerCase();
    const belt = beltFilter.value;
    const status = statusFilter.value;

    filteredMembers = members.filter((m) => {
        const matchesName = m.name.toLowerCase().includes(searchTerm);
        const matchesBelt = belt === "" || m.belt === belt;
        const matchesStatus = status === "" || m.status.toLowerCase() === status.toLowerCase();
        return matchesName && matchesBelt && matchesStatus;
    });

    filteredMembers.sort((a, b) => {
        if (sortOrder === "asc") {
            return a.name.localeCompare(b.name);
        } else {
            return b.name.localeCompare(a.name);
        }
    });

    renderTable();
}

searchInput.addEventListener("input", filterAndSort);
beltFilter.addEventListener("change", filterAndSort);
statusFilter.addEventListener("change", filterAndSort);
fetchMembers();
