import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// 🔐 Configuração do seu projeto Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAvXmhq6Gj75Jbuxqph4rJGmlLz6axXIoc",
    authDomain: "unitybjj-254ce.firebaseapp.com",
    projectId: "unitybjj-254ce",
    storageBucket: "unitybjj-254ce.firebasestorage.app",
    messagingSenderId: "120660951337",
    appId: "1:120660951337:web:25bf767fadf75dcb5d3738",
    measurementId: "G-6ZL2SRMBD5"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Função de login
async function loginUser(event) {
    event.preventDefault();  // Evita o comportamento padrão de submit do formulário

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        // Faz o login usando o email e senha
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Se o login for bem-sucedido, redireciona para a homepage
        window.location.href = "GenericHomepage.html";  // Altere para o caminho correto da sua homepage

    } catch (error) {
        console.error("Erro ao fazer login: ", error.message);
        alert('Erro: ' + error.message);  // Exibe uma mensagem de erro se o login falhar
    }
}

// Adiciona o evento de submit ao formulário de login
document.getElementById("loginForm").addEventListener("submit", loginUser);
