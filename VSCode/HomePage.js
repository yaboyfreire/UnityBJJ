
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginBtn = document.querySelector('.LoginBtn');
    const membershipItem = document.querySelector('.menu-list li:nth-child(2)');
    
    // Check if user is logged in on page load
    let isLoggedIn = localStorage.getItem('isLoggedIn');

    // Create dropdown structure
    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown';
    
    const dropdownContent = document.createElement('div');
    dropdownContent.className = 'dropdown-content';
    dropdownContent.innerHTML = ` 
        <a href="desempenhoac.html">My Account</a>
        <a href="pagamentos.html">Payments</a>
        <a href="#">Progress</a>
        <a href="medalsPage.html">Medals</a>
        <a href="checkatendennce.html">Attendace</a>
        <a href="Competitions.html">Upcoming Competitions</a>
        <a href="#" class="logout-link">Logout</a>
    `;
    
    membershipItem.appendChild(dropdown);
    dropdown.appendChild(dropdownContent);

    // Initialize UI based on login state
    updateLoginUI();

    // Event Listeners
    loginBtn.addEventListener('click', toggleLoginState);
    membershipItem.addEventListener('click', handleMembershipClick);
    dropdownContent.addEventListener('click', handleDropdownClick);
    document.addEventListener('click', handleDocumentClick);

    // Get modal and its elements
    const logoutModal = document.getElementById('logoutModal');
    const confirmLogoutBtn = document.getElementById('confirmLogout');
    const cancelLogoutBtn = document.getElementById('cancelLogout');
    const closeModalBtn = document.querySelector('.close-btn');

    // Functions
    function toggleLoginState() {
        if (isLoggedIn) {
            // Show the custom modal instead of the default browser confirm
            logoutModal.style.display = 'block';
        } else {
            // Redirect to login page when "Login" is clicked
            window.location.href = "login.html";
        }
    }

    function updateLoginUI() {
        if (isLoggedIn) {
            // Logged in state
            membershipItem.querySelector('a').textContent = 'Membership ▼';
            loginBtn.textContent = 'LOGOUT';
            membershipItem.classList.add('dropdown-active');
            
            // Update Join Now! button to show user's profile name
            const profileBtn = document.querySelector('.button1');
            
            // Get the user's name from localStorage and set it as the profile button text
            const username = localStorage.getItem('name') || 'User';  // Default to 'User' if name is not available
            profileBtn.textContent = username;
    
            // Set the profile button click action
            profileBtn.onclick = function() {
                // Redirect to profile page
                window.location.href = 'profile.html';  // Ensure you have a profile page
            };
    
            // Add hover events
            membershipItem.addEventListener('mouseenter', showDropdown);
            dropdown.addEventListener('mouseleave', hideDropdown);
        } else {
            // Logged out state
            membershipItem.querySelector('a').textContent = 'Become a member';
            loginBtn.textContent = 'LOGIN';
            membershipItem.classList.remove('dropdown-active');
            hideDropdown();
            
            // Reset Join Now! button
            const profileBtn = document.querySelector('.button1');
            profileBtn.textContent = 'JOIN NOW!';
            profileBtn.onclick = function() {
                // Redirect to sign up page
                window.location.href = 'signup.html';  // Ensure you have a signup page
            };
    
            // Remove hover events
            membershipItem.removeEventListener('mouseenter', showDropdown);
            dropdown.removeEventListener('mouseleave', hideDropdown);
        }
    }
    

    function showDropdown() {
        dropdownContent.style.display = 'block';
        // Center dropdown below menu item
        const rect = membershipItem.getBoundingClientRect();
        dropdownContent.style.left = `calc(50% - ${rect.width/2}px)`;
        dropdownContent.style.minWidth = `${rect.width}px`;
    }

    function hideDropdown() {
        setTimeout(() => {
            if (!dropdownContent.matches(':hover') && !membershipItem.matches(':hover')) {
                dropdownContent.style.display = 'none';
            }
        }, 200);
    }

    function handleMembershipClick(e) {
        // If the clicked target is "Upcoming Competitions", don't prevent the default behavior
        if (e.target.tagName === 'A' && e.target.getAttribute('href') === 'Competitions.html') {
            return; // Let the link work
        }

        if (e.target.tagName === 'A' && e.target.getAttribute('href') === 'desempenhoac.html') {
            return; // Let the link work
        }

        if (e.target.tagName === 'A' && e.target.getAttribute('href') === 'medalsPage.html') {
            return; // Let the link work
        }

        if (e.target.tagName === 'A' && e.target.getAttribute('href') === 'checkatendennce.html') {
            return; // Let the link work
        }

        if (e.target.tagName === 'A' && e.target.getAttribute('href') === 'pagamentos.html') {
            return; // Let the link work
        }
    
        if (isLoggedIn && e.target.tagName === 'A' && !e.target.classList.contains('logout-link')) {
            e.preventDefault(); // Prevent default behavior for other links
            dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
        }
    }

    function handleDropdownClick(e) {
        if (e.target.classList.contains('logout-link')) {
            e.preventDefault();
            toggleLoginState();
        }
    }

    function handleDocumentClick(e) {
        if (!membershipItem.contains(e.target)) {
            hideDropdown();
        }
    }

    // Modal event listeners
    confirmLogoutBtn.addEventListener('click', function() {
        // Log out the user
        localStorage.setItem('isLoggedIn', 'false');
        isLoggedIn = false;
        updateLoginUI();
        logoutModal.style.display = 'none'; // Close the modal
    });

    cancelLogoutBtn.addEventListener('click', function() {
        // Close the modal without logging out
        logoutModal.style.display = 'none';
    });

    closeModalBtn.addEventListener('click', function() {
        logoutModal.style.display = 'none';
    });

    // Close the modal if the user clicks outside the modal
    window.addEventListener('click', function(event) {
        if (event.target === logoutModal) {
            logoutModal.style.display = 'none';
        }
    });
});