document.addEventListener("DOMContentLoaded", function() {
    const hamburger = document.querySelector(".hamburger");
    const menuList = document.querySelector(".menu-list");

    hamburger.addEventListener("click", function() {
        menuList.classList.toggle("show-menu");
    });
});