// Add active class to the current page's navigation item
const currentPage = window.location.pathname;
const navItems = document.querySelectorAll('.nav-item');

navItems.forEach(item => {
    if (item.getAttribute('href') === currentPage) {
        item.classList.add('active');
    }
});