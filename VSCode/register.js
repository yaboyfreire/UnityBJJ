import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, setDoc, Timestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAvXmhq6Gj75Jbuxqph4rJGmlLz6axXIoc",
    authDomain: "unitybjj-254ce.firebaseapp.com",
    projectId: "unitybjj-254ce",
    storageBucket: "unitybjj-254ce.appspot.com",
    messagingSenderId: "120660951337",
    appId: "1:120660951337:web:25bf767fadf75dcb5d3738"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function registerUser(event) {
    event.preventDefault();

    const name = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const dateOfBirth = document.getElementById("data-nascimento").value;
    const address = document.getElementById("morada").value;
    const nationality = document.getElementById("nacionalidade").value;
    const gender = document.getElementById("genero").value;
    const belt = document.getElementById("faixa").value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const uid = user.uid;

        const roleRef = doc(db, "cargo", "3"); // Role: Student

        // 📝 Save user using their UID as document ID
        const userRef = doc(db, "users", uid);
        await setDoc(userRef, {
            email,
            name,
            address,
            birth_date: dateOfBirth,
            nationality,
            gender,
            created_at: Timestamp.now(),
            role: roleRef,
            phone: ""
        });

        // Create student profile
        const studentRef = doc(db, "student", uid);
        await setDoc(studentRef, {
            faixa: belt,
            height: "",
            start_date: Timestamp.now(),
            status: 1,
            user: userRef,
            weight: ""
        });

        alert('Registration successful!');
        window.location.href = 'login.html';

    } catch (error) {
        console.error("Error registering user: ", error.message);
        alert('Error: ' + error.message);
    }
}

document.querySelector("form").addEventListener("submit", registerUser);
