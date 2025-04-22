document.addEventListener('DOMContentLoaded', function() {
    // Display admin username
    const adminUsername = localStorage.getItem('name');
    if (adminUsername) {
        document.getElementById('adminName').textContent = adminUsername;
    } else {
        // If no name found, use email as fallback
        const adminEmail = localStorage.getItem('email');
        if (adminEmail) {
            document.getElementById('adminName').textContent = adminEmail.split('@')[0];
        }
    }

    if (localStorage.getItem('role') !== '1') {
        localStorage.clear();
        window.location.href = 'GenericHomePage.html';
        return;
    }

    // Load dashboard data
    loadDashboardData();

    // Initialize last login display
    initLastLogin();

    // Setup logout functionality
    setupLogout();

    // Mobile menu toggle
    setupMobileMenu();
});

function loadDashboardData() {
    const mockData = {
        totalMembers: 142,
        activeMembers: 118,
        pendingPayments: 7,
        todaysClasses: 3,
        recentActivities: [
            "John Doe renewed membership",
            "New member Sarah Smith registered",
            "Class schedule updated for June",
            "5 pending payments processed"
        ]
    };

    document.getElementById('totalMembers').textContent = mockData.totalMembers;
    document.getElementById('activeMembers').textContent = mockData.activeMembers;
    document.getElementById('pendingPayments').textContent = mockData.pendingPayments;
    document.getElementById('todaysClasses').textContent = mockData.todaysClasses;

    const activityList = document.querySelector('.activity-list');
    activityList.innerHTML = '';
    mockData.recentActivities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-bullet"></div>
            <p>${activity}</p>
        `;
        activityList.appendChild(activityItem);
    });
}

function initLastLogin() {
    const lastLogin = localStorage.getItem('lastLogin') || new Date().toLocaleString();
    document.getElementById('lastLogin').textContent = lastLogin;

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
        // Only allow showing modal if user is logged in and admin
        if (localStorage.getItem('isLoggedIn') == 'true' || localStorage.getItem('role') == '1') {
            localStorage.clear();
            window.location.href = 'GenericHomePage.html';
            return;
        }
        toggleModal(true);
    });

    closeBtn.addEventListener('click', () => toggleModal(false));
    cancelLogout.addEventListener('click', () => toggleModal(false));

    confirmLogout.addEventListener('click', () => {
        setTimeout(() => {
            localStorage.clear();
            window.location.href = 'GenericHomePage.html';
        }, 300);
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
