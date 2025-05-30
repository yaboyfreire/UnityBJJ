// Firebase initialization (make sure this is at the top)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    onSnapshot,
    orderBy,
    limit,
    doc // Adicione esse se estiver usando `doc()`
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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

// Main initialization
document.addEventListener('DOMContentLoaded', function () {
    // Verify admin role first for security
    if (localStorage.getItem('role') !== '1') {
        window.location.href = 'GenericHomePage.html';
        return;
    }

    // Display admin username
    displayAdminInfo();

    // Initialize components
    initLastLogin();
    setupLogout();
    setupMobileMenu();

    // Load data and setup real-time listeners
    loadDashboardData();
    setupRealtimeListeners();
});



// Display admin information
function displayAdminInfo() {
    const adminNameElement = document.getElementById('adminName');
    const adminUsername = localStorage.getItem('name');

    if (adminUsername) {
        adminNameElement.textContent = adminUsername;
    } else {
        const adminEmail = localStorage.getItem('email');
        if (adminEmail) {
            adminNameElement.textContent = adminEmail.split('@')[0];
        }
    }
}

async function getActiveMembersCount() {
    const membersRef = collection(db, "student");

    const snapshot = await getDocs(membersRef);
    const activeCount = snapshot.docs.filter(doc => {
        return doc.data().studentStatus === "Active";
    }).length;

    return activeCount;
}

async function getPendingPaymentsCount() {
    const paymentRef = collection(db, "Payment");
    const snapshot = await getDocs(paymentRef);

    const pendingCount = snapshot.docs.filter(doc => {
        const statusRef = doc.data().Status;
        return statusRef && statusRef.path === "PaymentStatus/2";
    }).length;

    return pendingCount;
}

// Dashboard data functions
async function loadDashboardData() {
    try {
        showLoadingState(true);

        const [totalMembers, activeMembers, pendingPayments, todaysClasses] = await Promise.all([
            getTotalMembersCount(),
            getActiveMembersCount(),
            getPendingPaymentsCount(),
            getTodaysClassesCount()
        ]);

        updateDashboardUI(totalMembers, activeMembers, pendingPayments, todaysClasses);

    } catch (error) {
        console.error("Error loading dashboard data:", error);
        showErrorNotification("Failed to load dashboard data");
    } finally {
        showLoadingState(false);
    }
}

async function getTotalMembersCount() {
    const membersRef = collection(db, "student");
    const snapshot = await getDocs(membersRef);
    return snapshot.size;
}

function updateDashboardUI(totalMembers, activeMembers, pendingPayments, todaysClasses) {
    document.getElementById('totalMembers').textContent = totalMembers;
    document.getElementById('activeMembers').textContent = activeMembers;
    document.getElementById('pendingPayments').textContent = pendingPayments;
    document.getElementById('todaysClasses').textContent = todaysClasses;
}



// Real-time listeners
function setupRealtimeListeners() {
    setupMembersListener();
    setupPaymentsListener();
    setupClassesListener();
}

function setupMembersListener() {
    const membersRef = collection(db, "student");
    onSnapshot(membersRef, (snapshot) => {
        const total = snapshot.size;
        const active = snapshot.docs.filter(doc => {
            const statusRef = doc.data().Status;
            return statusRef && statusRef.path === "studentStatus/2";
        }).length;

        document.getElementById('totalMembers').textContent = total;
        document.getElementById('activeMembers').textContent = active;
    });
}

function setupPaymentsListener() {
    const paymentRef = collection(db, "Payment");
    onSnapshot(paymentRef, (snapshot) => {
        const pendingPayments = snapshot.docs.filter(doc => {
            const statusRef = doc.data().Status;
            return statusRef && statusRef.path === "PaymentStatus/2";
        }).length;

        document.getElementById('pendingPayments').textContent = pendingPayments;
    });
}

function getTodayWeekdayName() {
    const weekdays = [
        "domingo", "segunda-feira", "terça-feira",
        "quarta-feira", "quinta-feira", "sexta-feira", "sábado"
    ];

    return weekdays[new Date().getDay()];
}

async function getTodaysClassesCount() {
    const weekdayToday = getTodayWeekdayName();
    console.log("Today is:", weekdayToday);
    const classesQuery = query(
        collection(db, "Class"),
        where("DiaDaSemana", "==",weekdayToday)
    );

    const snapshot = await getDocs(classesQuery);
    return snapshot.size;
}

function setupClassesListener() {
    const weekdayToday = getTodayWeekdayName();

    const classesQuery = query(
        collection(db, "Class"),
        where("DiaDaSemana", "==", weekdayToday)
    );

    onSnapshot(classesQuery, (snapshot) => {
        document.getElementById('todaysClasses').textContent = snapshot.size;
    });
}
    

// Utility functions
function initLastLogin() {
    const lastLogin = localStorage.getItem('lastLogin') || new Date().toLocaleString();
    document.getElementById('lastLogin').textContent = lastLogin;

    // Update if more than 1 minute old or doesn't exist
    if (!localStorage.getItem('lastLogin') ||
        (new Date() - new Date(lastLogin)) > 60000) {
        localStorage.setItem('lastLogin', new Date().toLocaleString());
    }
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutModal = document.getElementById('logoutModal');
    const closeBtn = document.querySelector('.close-btn');
    const confirmLogout = document.getElementById('confirmLogout');
    const cancelLogout = document.getElementById('cancelLogout');

    const toggleModal = (show) => {
        logoutModal.style.display = show ? 'block' : 'none';
    };

    logoutBtn.addEventListener('click', () => {
        if (localStorage.getItem('isLoggedIn') === 'true' || localStorage.getItem('role') === '1') {
            toggleModal(true);
        }
    });

    closeBtn.addEventListener('click', () => toggleModal(false));
    cancelLogout.addEventListener('click', () => toggleModal(false));

    confirmLogout.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'GenericHomePage.html';
    });

    window.addEventListener('click', (e) => {
        if (e.target === logoutModal) {
            toggleModal(false);
        }
    });
}

function setupMobileMenu() {
    const hamburger = document.querySelector('.humbarger');
    const menuList = document.querySelector('.menu-list');

    hamburger.addEventListener('click', () => {
        menuList.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    document.querySelectorAll('.menu-list a').forEach(link => {
        link.addEventListener('click', () => {
            menuList.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
}

function showLoadingState(show) {
    const loadingElement = document.getElementById('loadingOverlay');
    if (loadingElement) {
        loadingElement.style.display = show ? 'flex' : 'none';
    }
}

function showErrorNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);
}