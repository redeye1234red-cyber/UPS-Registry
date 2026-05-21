function goToApp(app) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Show selected page
    const pageId = app === 'home' ? 'homePage' : app + 'Page';
    const page = document.getElementById(pageId);
    if (page) {
        page.classList.add('active');
    }

    // Show/hide back button
    const backBtn = document.getElementById('backBtn');
    if (app === 'home') {
        backBtn.classList.remove('show');
    } else {
        backBtn.classList.add('show');
    }

    // Scroll to top
    window.scrollTo(0, 0);
}

// Hamburger menu functionality
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const logo = document.querySelector('.logo');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

// Logo click goes to home
if (logo) {
    logo.addEventListener('click', () => {
        goToApp('home');
        navMenu.classList.remove('active');
        if (hamburger) hamburger.classList.remove('active');
    });
}

// Close menu when link is clicked
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        if (hamburger) hamburger.classList.remove('active');
    });
});

// Initialize
goToApp('home');