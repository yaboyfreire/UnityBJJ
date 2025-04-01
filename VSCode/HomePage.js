document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginBtn = document.querySelector('.LoginBtn');
    const membershipItem = document.querySelector('.menu-list li:nth-child(2)');
    
    // State management
    let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    // Create dropdown structure
    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown';
    
    const dropdownContent = document.createElement('div');
    dropdownContent.className = 'dropdown-content';
    dropdownContent.innerHTML = `
        <a href="#">My Account</a>
        <a href="#">Payments</a>
        <a href="#">Progress</a>
        <a href="#">Upcoming Competitions</a>
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

    // Functions
    function toggleLoginState() {
        isLoggedIn = !isLoggedIn;
        localStorage.setItem('isLoggedIn', isLoggedIn.toString());
        updateLoginUI();
    }

    function updateLoginUI() {
        if (isLoggedIn) {
            // Logged in state
            membershipItem.querySelector('a').textContent = 'Membership ▼';
            loginBtn.textContent = 'LOGOUT';
            membershipItem.classList.add('dropdown-active');
            
            // Add hover events
            membershipItem.addEventListener('mouseenter', showDropdown);
            dropdown.addEventListener('mouseleave', hideDropdown);
        } else {
            // Logged out state
            membershipItem.querySelector('a').textContent = 'Become a member';
            loginBtn.textContent = 'LOGIN';
            membershipItem.classList.remove('dropdown-active');
            hideDropdown();
            
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
        if (isLoggedIn && e.target.tagName === 'A' && !e.target.classList.contains('logout-link')) {
            e.preventDefault();
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
});