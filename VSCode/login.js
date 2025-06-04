import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAvXmhq6Gj75Jbuxqph4rJGmlLz6axXIoc",
    authDomain: "unitybjj-254ce.firebaseapp.com",
    projectId: "unitybjj-254ce",
    storageBucket: "unitybjj-254ce.appspot.com",
    messagingSenderId: "120660951337",
    appId: "1:120660951337:web:25bf767fadf75dcb5d3738",
    measurementId: "G-6ZL2SRMBD5"
};

// Init services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log("✅ Logged in UID:", user.uid);

        // Set the login state in localStorage
        localStorage.setItem('isLoggedIn', 'true');

        // Get user document from 'users' collection
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
            alert("We couldn't find this user.");
            return;
        }

        const userData = userDocSnap.data();
        const roleRef = userData.role;

        if (!roleRef) {
            alert("User role is not defined.");
            return;
        }

        // Get role document
        const roleSnap = await getDoc(roleRef);
        if (!roleSnap.exists()) {
            alert("Role document not found.");
            return;
        }

        const roleId = roleRef.path.split('/')[1]; // Extract role ID from path

        // Store basic user information in localStorage
        localStorage.setItem('userUid', user.uid);
        localStorage.setItem('name', userData.name || 'User');
        localStorage.setItem('role', roleId);
        localStorage.setItem('email', user.email);
        
        // If user is a student (role 3), load and store student data
        if (roleId === "3") {
            await loadAndStoreStudentData(user.uid);
            window.location.href = "GenericHomepage.html"; // student page
        }else if (roleId === "1" || roleId === "2") {
            window.location.href = "adminHomePage.html"; // staff or admin
        } else {
            alert("Unknown role.");
        }

    } catch (error) {
        console.error("❌ Login error:", error.message);
        alert('Login failed: ' + error.message);
    }
}

async function loadAndStoreStudentData(userId) {
    const studentRef = doc(db, "student", userId);  // Use `doc()` to reference a specific document
    const studentSnap = await getDoc(studentRef);

    if (studentSnap.exists()) {
        localStorage.setItem("studentData", JSON.stringify(studentSnap.data()));
    } else {
        alert("No such student found!");
    }
}
  

document.getElementById("loginForm").addEventListener("submit", loginUser);
