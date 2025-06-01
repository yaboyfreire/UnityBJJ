import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Firebase config
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
let currentMemberId = null;

const membersBody = document.getElementById("membersBody");
const searchInput = document.getElementById("searchInput");
const beltFilter = document.getElementById("beltFilter");
const statusFilter = document.getElementById("statusFilter");
const sortNameBtn = document.getElementById("sortNameBtn");

const editModal = document.getElementById("editModal");
const editNameInput = document.getElementById("editName");
const editEmailInput = document.getElementById("editEmail");
const editBeltInput = document.getElementById("editBelt");
const editStatusInput = document.getElementById("editStatus");
const saveEditBtn = document.getElementById("saveEditBtn");

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

        members.push({
            id: studentDoc.id,
            userRef: studentData.user,
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

        const statusTd = document.createElement("td");
        statusTd.textContent = member.status;

        const editTd = document.createElement("td");
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.classList.add("editBtn");
        editBtn.addEventListener("click", () => handleEdit(member));
        editTd.appendChild(editBtn);

        tr.appendChild(nameTd);
        tr.appendChild(beltTd);
        tr.appendChild(emailTd);
        tr.appendChild(statusTd);
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
        return sortOrder === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
    });

    renderTable();
}

function handleEdit(member) {
    currentMemberId = member.id;

    editNameInput.value = member.name;
    editEmailInput.value = member.email;
    editBeltInput.value = member.belt;
    editStatusInput.value = member.status;

    editModal.classList.remove("hidden");
}

// Save edited data
saveEditBtn.addEventListener("click", async () => {
    if (!currentMemberId) return;

    const newName = editNameInput.value;
    const newEmail = editEmailInput.value;
    const newBelt = editBeltInput.value;
    const newStatus = editStatusInput.value;

    // Update user and student collections
    const studentDocRef = doc(db, "student", currentMemberId);
    const studentDocSnap = await getDoc(studentDocRef);
    const studentData = studentDocSnap.data();

    // Update user info (in users collection)
    if (studentData.user) {
        const userRef = studentData.user;
        await updateDoc(userRef, {
            name: newName,
            email: newEmail,
        });
    }

    // Update student info
    await updateDoc(studentDocRef, {
        faixa: newBelt,
        studentStatus: newStatus,
    });

    editModal.classList.add("hidden");
    fetchMembers(); // Refresh data
});

// Filter listeners
searchInput.addEventListener("input", filterAndSort);
beltFilter.addEventListener("change", filterAndSort);
statusFilter.addEventListener("change", filterAndSort);
sortNameBtn?.addEventListener("click", () => {
    sortOrder = sortOrder === "asc" ? "desc" : "asc";
    filterAndSort();
});
document.getElementById('cancelEditBtn').addEventListener('click', () => {
    editModal.classList.add('hidden');
});
// Initial fetch
fetchMembers();
