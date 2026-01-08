// js/auth.js
// Authentication functions for register and login pages

// Helper: hash password using Web Crypto API (client-side stopgap)
async function hashPassword(password) {
    const enc = new TextEncoder();
    const data = enc.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Ensure there is at most one administrator
function normalizeAdmins(users) {
    const adminUsers = users.filter(u => u.role === 'admin');
    if (adminUsers.length > 1) {
        // Keep the admin with the smallest id and convert others to alumni
        const keep = adminUsers.reduce((a, b) => (a.id < b.id ? a : b));
        users.forEach(u => {
            if (u.role === 'admin' && u.id !== keep.id) {
                u.role = 'alumni';
            }
        });
        localStorage.setItem('alumniUsers', JSON.stringify(users));
    }
}

// Initialize demo data if localStorage is empty
async function initializeDemoData() {
    let users = JSON.parse(localStorage.getItem('alumniUsers')) || [];
    
    // Normalize any accidental multiple admins
    normalizeAdmins(users);
    users = JSON.parse(localStorage.getItem('alumniUsers')) || users;
    
    if (users.length === 0) {
        // Create demo admin account (store hashed passwords)
        const adminUser = {
            id: 1,
            name: "Admin User",
            email: "admin@alumni.edu",
            role: "admin",
            department: "Computer Science",
            graduationYear: 2015,
            company: "University Admin",
            position: "System Administrator",
            skills: "Management, Analytics, Administration",
            linkedin: "https://linkedin.com/in/admin",
            mentorship: true
        };
        adminUser.passwordHash = await hashPassword('putnew');
        
        // Create demo alumni accounts (at least 5 per department)
        const demoAlumni = [
            // CSE (5 alumni)
            { id: 2, name: "John Smith", email: "john.smith@alumni.edu", role: "alumni", department: "CSE", graduationYear: 2020, company: "TechWorks", position: "Software Engineer", skills: "JavaScript, React, Node.js", linkedin: "https://linkedin.com/in/johnsmith", mentorship: true },
            { id: 12, name: "Alice Brown", email: "alice.brown@alumni.edu", role: "alumni", department: "CSE", graduationYear: 2019, company: "DataSys", position: "Data Scientist", skills: "Python, ML, SQL", linkedin: "https://linkedin.com/in/alicebrown", mentorship: false },
            { id: 13, name: "Bob Davis", email: "bob.davis@alumni.edu", role: "alumni", department: "CSE", graduationYear: 2021, company: "WebDev Inc", position: "Frontend Developer", skills: "HTML, CSS, Vue.js", linkedin: "https://linkedin.com/in/bobdavis", mentorship: true },
            { id: 14, name: "Charlie Evans", email: "charlie.evans@alumni.edu", role: "alumni", department: "CSE", graduationYear: 2018, company: "SecureTech", position: "Security Analyst", skills: "Cybersecurity, Networking", linkedin: "https://linkedin.com/in/charlieevans", mentorship: false },
            { id: 15, name: "Diana Foster", email: "diana.foster@alumni.edu", role: "alumni", department: "CSE", graduationYear: 2022, company: "AI Labs", position: "AI Engineer", skills: "TensorFlow, Python", linkedin: "https://linkedin.com/in/dianafoster", mentorship: true },
            // ECE (5 alumni)
            { id: 3, name: "Priya Kumar", email: "priya.kumar@alumni.edu", role: "alumni", department: "ECE", graduationYear: 2019, company: "Circuits Ltd", position: "Embedded Engineer", skills: "C, Embedded Systems, FPGA", linkedin: "https://linkedin.com/in/priyak", mentorship: false },
            { id: 16, name: "Eve Garcia", email: "eve.garcia@alumni.edu", role: "alumni", department: "ECE", graduationYear: 2017, company: "SignalTech", position: "Signal Processing Engineer", skills: "MATLAB, DSP", linkedin: "https://linkedin.com/in/evegarcia", mentorship: true },
            { id: 17, name: "Frank Harris", email: "frank.harris@alumni.edu", role: "alumni", department: "ECE", graduationYear: 2020, company: "RF Solutions", position: "RF Engineer", skills: "RF Design, Antennas", linkedin: "https://linkedin.com/in/frankharris", mentorship: false },
            { id: 18, name: "Grace Ingram", email: "grace.ingram@alumni.edu", role: "alumni", department: "ECE", graduationYear: 2016, company: "IoT Devices", position: "IoT Engineer", skills: "IoT, Sensors, Arduino", linkedin: "https://linkedin.com/in/graceingram", mentorship: true },
            { id: 19, name: "Henry Jackson", email: "henry.jackson@alumni.edu", role: "alumni", department: "ECE", graduationYear: 2021, company: "VLSI Corp", position: "VLSI Designer", skills: "VLSI, Verilog", linkedin: "https://linkedin.com/in/henryjackson", mentorship: false },
            // EEE (5 alumni)
            { id: 4, name: "Rahul Verma", email: "rahul.verma@alumni.edu", role: "alumni", department: "EEE", graduationYear: 2018, company: "PowerGrid", position: "Electrical Engineer", skills: "Power Systems, MATLAB", linkedin: "https://linkedin.com/in/rahulv", mentorship: true },
            { id: 20, name: "Ivy Kelly", email: "ivy.kelly@alumni.edu", role: "alumni", department: "EEE", graduationYear: 2017, company: "ControlSys", position: "Control Engineer", skills: "Control Systems, PLC", linkedin: "https://linkedin.com/in/ivykelly", mentorship: false },
            { id: 21, name: "Jack Lee", email: "jack.lee@alumni.edu", role: "alumni", department: "EEE", graduationYear: 2019, company: "Renewable Energy", position: "Solar Engineer", skills: "Solar PV, Inverters", linkedin: "https://linkedin.com/in/jacklee", mentorship: true },
            { id: 22, name: "Karen Miller", email: "karen.miller@alumni.edu", role: "alumni", department: "EEE", graduationYear: 2020, company: "Automation Ltd", position: "Automation Engineer", skills: "SCADA, Robotics", linkedin: "https://linkedin.com/in/karenmiller", mentorship: false },
            { id: 23, name: "Liam Nelson", email: "liam.nelson@alumni.edu", role: "alumni", department: "EEE", graduationYear: 2022, company: "High Voltage", position: "HV Engineer", skills: "High Voltage, Transformers", linkedin: "https://linkedin.com/in/liamnelson", mentorship: true },
            // Mechanical (5 alumni)
            { id: 5, name: "Asha Patel", email: "asha.patel@alumni.edu", role: "alumni", department: "Mechanical", graduationYear: 2017, company: "MechWorks", position: "Design Engineer", skills: "AutoCAD, SolidWorks, Manufacturing", linkedin: "https://linkedin.com/in/ashap", mentorship: false },
            { id: 24, name: "Nina Olson", email: "nina.olson@alumni.edu", role: "alumni", department: "Mechanical", graduationYear: 2018, company: "ThermoEng", position: "Thermal Engineer", skills: "Heat Transfer, CFD", linkedin: "https://linkedin.com/in/ninaolson", mentorship: true },
            { id: 25, name: "Oscar Parker", email: "oscar.parker@alumni.edu", role: "alumni", department: "Mechanical", graduationYear: 2019, company: "FluidDyn", position: "Fluid Engineer", skills: "Fluid Mechanics, ANSYS", linkedin: "https://linkedin.com/in/oscarparker", mentorship: false },
            { id: 26, name: "Paula Quinn", email: "paula.quinn@alumni.edu", role: "alumni", department: "Mechanical", graduationYear: 2020, company: "Robotics Inc", position: "Robotics Engineer", skills: "Robotics, Mechatronics", linkedin: "https://linkedin.com/in/paulaquinn", mentorship: true },
            { id: 27, name: "Quinn Roberts", email: "quinn.roberts@alumni.edu", role: "alumni", department: "Mechanical", graduationYear: 2021, company: "AeroMech", position: "Aerospace Mech Engineer", skills: "Aerospace, Composites", linkedin: "https://linkedin.com/in/quinnroberts", mentorship: false },
            // Civil (5 alumni)
            { id: 6, name: "Vikram Singh", email: "vikram.singh@alumni.edu", role: "alumni", department: "Civil", graduationYear: 2016, company: "InfraBuild", position: "Site Engineer", skills: "Structural Design, AutoCAD", linkedin: "https://linkedin.com/in/vikrams", mentorship: true },
            { id: 28, name: "Rachel Taylor", email: "rachel.taylor@alumni.edu", role: "alumni", department: "Civil", graduationYear: 2017, company: "GeoTech", position: "Geotechnical Engineer", skills: "Soil Mechanics, Foundations", linkedin: "https://linkedin.com/in/racheltaylor", mentorship: false },
            { id: 29, name: "Sam Underwood", email: "sam.underwood@alumni.edu", role: "alumni", department: "Civil", graduationYear: 2018, company: "EnvEng", position: "Environmental Engineer", skills: "Environmental Impact, Water Treatment", linkedin: "https://linkedin.com/in/samunderwood", mentorship: true },
            { id: 30, name: "Tina Vargas", email: "tina.vargas@alumni.edu", role: "alumni", department: "Civil", graduationYear: 2019, company: "TransPlan", position: "Transportation Engineer", skills: "Traffic Engineering, GIS", linkedin: "https://linkedin.com/in/tinavargas", mentorship: false },
            { id: 31, name: "Uma Wilson", email: "uma.wilson@alumni.edu", role: "alumni", department: "Civil", graduationYear: 2020, company: "StructEng", position: "Structural Engineer", skills: "Structural Analysis, STAAD", linkedin: "https://linkedin.com/in/umawilson", mentorship: true },
            // MBA (5 alumni)
            { id: 7, name: "Neha Gupta", email: "neha.gupta@alumni.edu", role: "alumni", department: "MBA", graduationYear: 2018, company: "MarketWise", position: "Strategy Analyst", skills: "Strategy, Excel, SQL", linkedin: "https://linkedin.com/in/nehag", mentorship: false },
            { id: 32, name: "Victor Xu", email: "victor.xu@alumni.edu", role: "alumni", department: "MBA", graduationYear: 2019, company: "FinanceCorp", position: "Financial Analyst", skills: "Finance, Modeling, Valuation", linkedin: "https://linkedin.com/in/victorxu", mentorship: true },
            { id: 33, name: "Wendy Young", email: "wendy.young@alumni.edu", role: "alumni", department: "MBA", graduationYear: 2020, company: "HR Solutions", position: "HR Manager", skills: "HR, Recruitment, Talent Management", linkedin: "https://linkedin.com/in/wendyyoung", mentorship: false },
            { id: 34, name: "Xavier Zhang", email: "xavier.zhang@alumni.edu", role: "alumni", department: "MBA", graduationYear: 2021, company: "OpsMgmt", position: "Operations Manager", skills: "Operations, Lean, Six Sigma", linkedin: "https://linkedin.com/in/xavierzhang", mentorship: true },
            { id: 35, name: "Yara Zimmerman", email: "yara.zimmerman@alumni.edu", role: "alumni", department: "MBA", graduationYear: 2022, company: "MarketingPro", position: "Marketing Manager", skills: "Digital Marketing, SEO, Analytics", linkedin: "https://linkedin.com/in/yarazimmerman", mentorship: false },
            // Diploma (5 alumni)
            { id: 8, name: "Arjun Rao", email: "arjun.rao@alumni.edu", role: "alumni", department: "Diploma", graduationYear: 2015, company: "FactoryLine", position: "Maintenance Supervisor", skills: "PLC, Maintenance", linkedin: "https://linkedin.com/in/arjunr", mentorship: false },
            { id: 36, name: "Zoe Adams", email: "zoe.adams@alumni.edu", role: "alumni", department: "Diploma", graduationYear: 2016, company: "TechSupport", position: "Technical Support", skills: "Troubleshooting, Hardware", linkedin: "https://linkedin.com/in/zoeadams", mentorship: true },
            { id: 37, name: "Aaron Baker", email: "aaron.baker@alumni.edu", role: "alumni", department: "Diploma", graduationYear: 2017, company: "AssemblyLine", position: "Production Supervisor", skills: "Production, Quality Control", linkedin: "https://linkedin.com/in/aaronbaker", mentorship: false },
            { id: 38, name: "Bella Carter", email: "bella.carter@alumni.edu", role: "alumni", department: "Diploma", graduationYear: 2018, company: "FieldService", position: "Field Technician", skills: "Field Service, Repairs", linkedin: "https://linkedin.com/in/bellacarter", mentorship: true },
            { id: 39, name: "Caleb Diaz", email: "caleb.diaz@alumni.edu", role: "alumni", department: "Diploma", graduationYear: 2019, company: "LabTech", position: "Lab Technician", skills: "Lab Equipment, Testing", linkedin: "https://linkedin.com/in/calebdiaz", mentorship: false }
        ];

        // Hash demo alumni passwords (default 'alumni123')
        for (const u of demoAlumni) {
            u.passwordHash = await hashPassword('alumni123');
        }

        users.push(adminUser, ...demoAlumni);
        localStorage.setItem('alumniUsers', JSON.stringify(users));
        console.log("Demo data initialized");
    }
}

// Ensure there is exactly one admin (create if missing)
async function ensureSingleAdmin(adminInfo = null) {
    const users = JSON.parse(localStorage.getItem('alumniUsers')) || [];

    // If an admin already exists, do nothing
    if (users.some(u => u.role === 'admin')) return;

    // Allow optional runtime override via localStorage key 'initialAdmin' (JSON string)
    try {
        if (!adminInfo) {
            const initialAdminRaw = localStorage.getItem('initialAdmin');
            if (initialAdminRaw) {
                const parsed = JSON.parse(initialAdminRaw);
                if (parsed && typeof parsed === 'object') adminInfo = parsed;
            }
        }
    } catch (err) {
        console.warn('Invalid initialAdmin in localStorage, ignoring override.');
    }

    // Fallback defaults (dev/demo only)
    adminInfo = adminInfo || {
        name: 'Admin User',
        email: 'admin@alumni.edu',
        password: 'putnew',
        department: 'CSE',
        graduationYear: new Date().getFullYear()
    }; 

    const id = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const passwordHash = await hashPassword(String(adminInfo.password));

    const adminUser = {
        id,
        name: adminInfo.name,
        email: String(adminInfo.email).toLowerCase(),
        role: 'admin',
        department: adminInfo.department || 'CSE',
        graduationYear: adminInfo.graduationYear || new Date().getFullYear(),
        passwordHash,
        company: '',
        position: '',
        skills: '',
        linkedin: '',
        mentorship: false
    };

    users.push(adminUser);
    localStorage.setItem('alumniUsers', JSON.stringify(users));
    console.log('One-time admin account created (dev-only). Email:', adminUser.email);
}

// Initialize demo data and ensure single admin on page load
(async function initAuth() {
    await initializeDemoData();
    await ensureSingleAdmin();
})();

// Register form submission
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', async function(e) {
        // Remove any accidental admin override in registration flow
        // (registration cannot create admin accounts)
        // Note: we keep a hidden role field but enforce role='alumni' in code.        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;
        // Ensure new accounts are always alumni via registration
        const role = 'alumni'; // registration cannot create admin accounts
        const department = document.getElementById('department').value;
        const graduationYear = parseInt(document.getElementById('graduationYear').value);
        const terms = document.getElementById('terms').checked;
        
        // Basic validation
        if (!terms) {
            showError('email-error', 'You must agree to the Terms & Conditions');
            return;
        }
        
        if (password.length < 6) {
            showError('email-error', 'Password must be at least 6 characters');
            return;
        }
        
        // Check if email already exists
        const users = JSON.parse(localStorage.getItem('alumniUsers')) || [];
        const emailExists = users.some(user => user.email === email);
        
        if (emailExists) {
            showError('email-error', 'This email is already registered');
            return;
        }
        
        // Hash password and create new user object
        const passwordHash = await hashPassword(password);
        const newUser = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            name,
            email,
            passwordHash,
            role,
            department,
            graduationYear,
            company: '',
            position: '',
            skills: '',
            linkedin: '',
            mentorship: false
        };
        
        // Save to localStorage
        users.push(newUser);
        localStorage.setItem('alumniUsers', JSON.stringify(users));
        // Ensure only one admin exists (safety)
        normalizeAdmins(users);
        
        // Auto login and redirect
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        // Show success message and redirect
        alert('Registration successful! Redirecting to your dashboard...');
        
        if (role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'dashboard.html';
        }
    });
}

// Login form submission
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim().toLowerCase();
        const password = document.getElementById('loginPassword').value;
        
        // Validate credentials
        const users = JSON.parse(localStorage.getItem('alumniUsers')) || [];
        const hashedInput = await hashPassword(password);
        let user = users.find(u => u.email === email && u.passwordHash === hashedInput);
        
        // If user exists but has legacy plain password, upgrade to hashed password
        if (!user) {
            const legacyUser = users.find(u => u.email === email && u.password === password);
            if (legacyUser) {
                legacyUser.passwordHash = hashedInput;
                delete legacyUser.password;
                localStorage.setItem('alumniUsers', JSON.stringify(users));
                user = legacyUser;
            }
        }
        
        if (user) {
            // Save current user to localStorage
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Redirect based on role
            if (user.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        } else {
            showError('login-error', 'Invalid email or password');
        }
    });
    
    // Demo login functionality
    document.getElementById('demo-login')?.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('loginEmail').value = 'admin@alumni.edu';
        document.getElementById('loginPassword').value = 'putnew';
        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
    });
}

// Helper function to show error messages
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Clear error after 5 seconds
        setTimeout(() => {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }, 5000);
    }
}

// Check authentication on page load for protected pages
function checkAuth() {
    const protectedPages = ['dashboard.html', 'admin.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!currentUser) {
            window.location.href = 'login.html';
            return false;
        }
        
        // Role-based access control
        if (currentPage === 'admin.html' && currentUser.role !== 'admin') {
            window.location.href = 'dashboard.html';
            return false;
        }
        
        if (currentPage === 'dashboard.html' && currentUser.role === 'admin') {
            window.location.href = 'admin.html';
            return false;
        }
        
        return true;
    }
    
    return true;
}

// Call checkAuth on page load
document.addEventListener('DOMContentLoaded', checkAuth);