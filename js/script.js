// ==========================================
// STUDENT PORTAL - AUTHENTICATION SCRIPT
// ==========================================

// ---------- CHECK IF USER IS LOGGED IN ----------
function isLoggedIn() {
    var user = localStorage.getItem("studentPortalUser");
    if (user) {
        return true;
    } else {
        return false;
    }
}

// ---------- GET CURRENT USER ----------
function getCurrentUser() {
    var user = localStorage.getItem("studentPortalUser");
    if (user) {
        return JSON.parse(user);
    } else {
        return null;
    }
}

// ---------- REGISTER ----------
function registerUser(name, email, password) {
    var existingUser = localStorage.getItem("studentPortalUser_" + email);
    if (existingUser) {
        return { success: false, message: "Email already registered!" };
    }

    var userData = {
        name: name,
        email: email,
        password: password,
        registeredOn: new Date().toISOString()
    };

    localStorage.setItem("studentPortalUser_" + email, JSON.stringify(userData));
    return { success: true, message: "Registration successful! Please login." };
}

// ---------- LOGIN ----------
function loginUser(email, password) {
    var userData = localStorage.getItem("studentPortalUser_" + email);

    if (!userData) {
        return { success: false, message: "Email not registered. Please register first." };
    }

    var user = JSON.parse(userData);

    if (user.password !== password) {
        return { success: false, message: "Incorrect password!" };
    }

    localStorage.setItem("studentPortalUser", JSON.stringify(user));
    return { success: true, message: "Login successful!" };
}

// ---------- LOGOUT (with confirmation dialog) ----------
function logoutUser() {
    var confirmLogout = confirm("Are you sure you want to logout?");

    if (confirmLogout) {
        localStorage.removeItem("studentPortalUser");
        window.location.href = "login.html";
    }
}

// ---------- UPDATE NAVIGATION (HIDE/SHOW DASHBOARD + REGISTER + CHANGE LOGIN TO LOGOUT) ----------
function updateNavigation() {
    var navList = document.querySelector("nav ul");
    if (!navList) return;

    var loggedIn = isLoggedIn();

    // 1. Handle Dashboard Dropdown Visibility
    var dashboardLi = navList.querySelector("li.dropdown");
    if (dashboardLi) {
        if (loggedIn) {
            dashboardLi.style.display = "inline-block"; // Show
        } else {
            dashboardLi.style.display = "none"; // Hide
        }
    }

    // 2. Handle Register Link Visibility + Login/Logout button change
    var allLinks = navList.querySelectorAll("li a");
    for (var i = 0; i < allLinks.length; i++) {
        var linkHref = allLinks[i].getAttribute("href");
        var parentLi = allLinks[i].parentElement;

        // Hide "Register" link when logged in
        if (linkHref === "register.html") {
            if (loggedIn) {
                parentLi.style.display = "none";
            } else {
                parentLi.style.display = "inline-block";
            }
        }

        // Change "Login" to "Logout" when logged in
        if (linkHref === "login.html") {
            if (loggedIn) {
                allLinks[i].textContent = "Logout";
                allLinks[i].setAttribute("href", "#");
                allLinks[i].onclick = function (e) {
                    e.preventDefault();
                    logoutUser();
                    return false;
                };
            }
        }
    }
}

// ---------- PROTECT PAGE (redirect if not logged in) ----------
function protectPage() {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
    }
}

// ---------- REDIRECT IF ALREADY LOGGED IN ----------
function redirectIfLoggedIn() {
    if (isLoggedIn()) {
        window.location.href = "dashboard.html";
    }
}

// ---------- REGISTER FORM HANDLER ----------
function handleRegisterForm() {
    var form = document.querySelector("form");
    if (!form) return;

    form.onsubmit = function (e) {
        e.preventDefault();

        var name = document.getElementById("fullname").value;
        var email = document.getElementById("email").value;
        var password = document.getElementById("password").value;
        var confirmPassword = document.getElementById("confirm-password").value;

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        var result = registerUser(name, email, password);
        alert(result.message);

        if (result.success) {
            window.location.href = "login.html";
        }
    };
}

// ---------- LOGIN FORM HANDLER ----------
function handleLoginForm() {
    var form = document.querySelector("form");
    if (!form) return;

    form.onsubmit = function (e) {
        e.preventDefault();

        var email = document.getElementById("login-email").value;
        var password = document.getElementById("login-password").value;

        var result = loginUser(email, password);

        if (result.success) {
            alert("Login successful! Redirecting...");
            window.location.href = "dashboard.html";
        } else {
            alert(result.message);
        }
    };
}

// ---------- UPDATE DASHBOARD WELCOME MESSAGE ----------
function updateWelcomeMessage() {
    var welcomePara = document.querySelector(".page-section > p");
    if (welcomePara) {
        var user = getCurrentUser();
        if (user) {
            welcomePara.textContent = "Welcome back, " + user.name + "!";
        }
    }
}

// ---------- UPDATE PROFILE INFO ----------
function updateProfileInfo() {
    var user = getCurrentUser();
    if (!user) return;

    var profileName = document.querySelector(".profile-header-info h3");
    if (profileName) {
        profileName.textContent = user.name;
    }

    var detailRows = document.querySelectorAll(".detail-row");
    for (var i = 0; i < detailRows.length; i++) {
        var label = detailRows[i].querySelector(".label");
        var value = detailRows[i].querySelector(".value");
        if (label && value && label.textContent === "Email") {
            value.textContent = user.email;
        }
        if (label && value && label.textContent === "Full Name") {
            value.textContent = user.name;
        }
    }
}

// ---------- RUN ON PAGE LOAD ----------
window.onload = function () {
    var page = window.location.pathname.split("/").pop();

    // Update navigation (hide dashboard + register if not logged in, change login to logout if logged in)
    updateNavigation();

    // Page-specific logic
    if (page === "register.html") {
        handleRegisterForm();
        redirectIfLoggedIn();
    }
    else if (page === "login.html") {
        handleLoginForm();
        redirectIfLoggedIn();
    }
    else if (page === "dashboard.html") {
        protectPage();
        updateWelcomeMessage();
    }
    else if (page === "profile.html") {
        protectPage();
        updateProfileInfo();
    }
    else if (page === "courses.html" || page === "attendance.html" ||
        page === "assignment.html" || page === "result.html" ||
        page === "faculties.html") {
        protectPage();
    }
};