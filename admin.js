// js/admin.js
// Admin dashboard functionality

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"'`=\/]/g, function(s) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        }[s];
    });
}

// Fixed department list for consistency
const DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'Mechanical', 'Civil', 'MBA', 'Diploma'];

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication and admin role
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = 'login.html';
        return;
    }

    // Set current year in footer safely
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Load basic admin data and attach listeners (works across admin pages)
    loadAdminData();
    setupAdminEventListeners();

    // Run page-specific initializers only on the main admin dashboard
    const page = window.location.pathname.split('/').pop();
    if (page === 'admin.html' || page === '' || page === undefined) {
        loadAlumniTable();
        updateAdminStats();
        loadAnalytics();
    }
});

// Load admin data
function loadAdminData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    document.getElementById('admin-name').textContent = currentUser.name;
}

// Load alumni data into table
function loadAlumniTable(filteredUsers = null) {
    const users = filteredUsers || JSON.parse(localStorage.getItem('alumniUsers')) || [];
    const alumni = users.filter(user => user.role === 'alumni');
    const tableBody = document.getElementById('alumni-table-body');
    
    if (alumni.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-table">No alumni records found.</td>
            </tr>
        `;
        updatePaginationInfo(0, 0, 1);
        return;
    }
    
    // Sort alumni by name
    alumni.sort((a, b) => a.name.localeCompare(b.name));
    
    // Pagination variables
    const itemsPerPage = 10;
    const totalPages = Math.ceil(alumni.length / itemsPerPage);
    let currentPage = 1;
    
    // Function to render table for a specific page
    function renderTable(page) {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, alumni.length);
        const pageAlumni = alumni.slice(startIndex, endIndex);
        
        tableBody.innerHTML = pageAlumni.map(user => `
            <tr>
                <td>${escapeHtml(user.name)}</td>
                <td>${escapeHtml(user.email)}</td>
                <td>${escapeHtml(user.department)}</td>
                <td>${escapeHtml(String(user.graduationYear))}</td>
                <td>${escapeHtml(user.company) || 'Not specified'}</td>
                <td>${escapeHtml(user.position) || 'Not specified'}</td>
                <td>
                    <button type="button" class="btn btn-outline btn-sm view-alumni" data-id="${user.id}">View</button>
                    <button type="button" class="btn btn-danger btn-sm delete-alumni" data-id="${user.id}">Delete</button>
                </td>
            </tr>
        `).join('');
        
        updatePaginationInfo(startIndex + 1, endIndex, alumni.length, page, totalPages);
        
        // Add event listeners to view and delete buttons
        document.querySelectorAll('.view-alumni').forEach(btn => {
            btn.addEventListener('click', function() {
                const userId = parseInt(this.getAttribute('data-id'));
                viewAlumniDetails(userId);
            });
        });
        
        document.querySelectorAll('.delete-alumni').forEach(btn => {
            btn.addEventListener('click', function() {
                const userId = parseInt(this.getAttribute('data-id'));
                deleteAlumni(userId);
            });
        });
    }
    
    // Initial render
    renderTable(currentPage);
    
    // Pagination event listeners
    document.getElementById('prev-page').addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            renderTable(currentPage);
        }
    });
    
    document.getElementById('next-page').addEventListener('click', function() {
        if (currentPage < totalPages) {
            currentPage++;
            renderTable(currentPage);
        }
    });
}

// Update pagination information
function updatePaginationInfo(start, end, total, currentPage = 1, totalPages = 1) {
    document.getElementById('showing-count').textContent = `${start}-${end}`;
    document.getElementById('total-count').textContent = total;
    document.getElementById('current-page').textContent = currentPage;
    document.getElementById('total-pages').textContent = totalPages;
    
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

// View alumni details
function viewAlumniDetails(userId) {
    const users = JSON.parse(localStorage.getItem('alumniUsers')) || [];
    const user = users.find(u => u.id === userId);
    
    if (user) {
        alert(`
            Alumni Details:
            Name: ${escapeHtml(user.name)}
            Email: ${escapeHtml(user.email)}
            Department: ${escapeHtml(user.department)}
            Graduation Year: ${escapeHtml(String(user.graduationYear))}
            Company: ${escapeHtml(user.company) || 'Not specified'}
            Position: ${escapeHtml(user.position) || 'Not specified'}
            Skills: ${escapeHtml(user.skills) || 'Not specified'}
            LinkedIn: ${escapeHtml(user.linkedin) || 'Not specified'}
            Mentorship Interest: ${user.mentorship ? 'Yes' : 'No'}
        `);
    }
}

// Delete alumni
function deleteAlumni(userId) {
    if (confirm('Are you sure you want to delete this alumni record? This action cannot be undone.')) {
        let users = JSON.parse(localStorage.getItem('alumniUsers')) || [];
        users = users.filter(user => user.id !== userId);
        localStorage.setItem('alumniUsers', JSON.stringify(users));
        
        // Reload table
        loadAlumniTable();
        updateAdminStats();
        loadAnalytics();
        
        alert('Alumni record deleted successfully.');
    }
}

// Update admin statistics
function updateAdminStats() {
    const users = JSON.parse(localStorage.getItem('alumniUsers')) || [];
    const alumni = users.filter(user => user.role === 'alumni');
    
    // Calculate department count
    const departments = [...new Set(alumni.map(user => user.department))];
    
    // Calculate mentorship count
    const mentors = alumni.filter(user => user.mentorship).length;
    
    document.getElementById('admin-total-alumni').textContent = alumni.length;
    document.getElementById('admin-total-depts').textContent = departments.length;
    document.getElementById('admin-total-mentors').textContent = mentors;
    
    // Update department list using fixed DEPARTMENTS order
    const deptList = document.getElementById('dept-list');
    const deptCounts = {};

    // Start with zeros for fixed departments
    DEPARTMENTS.forEach(d => deptCounts[d] = 0);

    // Count alumni into departments (others go into 'Other')
    alumni.forEach(user => {
        const dept = user.department || 'Other';
        if (DEPARTMENTS.includes(dept)) {
            deptCounts[dept] = (deptCounts[dept] || 0) + 1;
        } else {
            deptCounts['Other'] = (deptCounts['Other'] || 0) + 1;
        }
    });

    deptList.innerHTML = Object.entries(deptCounts)
        .map(([dept, count]) => `
            <div class="dept-item">
                <span class="dept-name">${escapeHtml(dept)}</span>
                <span class="dept-count">${count}</span>
            </div>
        `).join('');
    
    // Update year chart
    const yearChart = document.getElementById('year-chart');
    const yearCounts = {};
    
    alumni.forEach(user => {
        yearCounts[user.graduationYear] = (yearCounts[user.graduationYear] || 0) + 1;
    });
    
    // Sort years descending
    const sortedYears = Object.keys(yearCounts).sort((a, b) => b - a).slice(0, 10);
    
    yearChart.innerHTML = sortedYears
        .map(year => `
            <div class="year-item">
                <span class="year-value">${escapeHtml(String(year))}</span>
                <span class="year-count">${yearCounts[year]}</span>
            </div>
        `).join('');
    
    // Update department filter with fixed DEPARTMENTS
    const deptFilter = document.getElementById('dept-filter');
    deptFilter.innerHTML = '<option value="">All Departments</option>' +
        DEPARTMENTS.map(dept => `<option value="${escapeHtml(dept)}">${escapeHtml(dept)}</option>`).join('');
    
    // Update year filter
    const yearFilter = document.getElementById('year-filter');
    const years = [...new Set(alumni.map(user => user.graduationYear))].sort((a, b) => b - a);
    yearFilter.innerHTML = '<option value="">All Years</option>' +
        years.map(year => `<option value="${escapeHtml(String(year))}">${escapeHtml(String(year))}</option>`).join('');
}

// Load analytics data
function loadAnalytics() {
    const users = JSON.parse(localStorage.getItem('alumniUsers')) || [];
    const alumni = users.filter(user => user.role === 'alumni');
    
    // Prepare data for charts
    const deptData = getDepartmentData(alumni);
    const yearData = getYearTrendData(alumni);
    const companyData = getTopCompanies(alumni);
    const skillsData = getSkillsData(alumni);
    
    // Render department chart
    renderDepartmentChart(deptData);
    
    // Render year trend chart
    renderYearTrendChart(yearData);
    
    // Render top companies
    renderTopCompanies(companyData);
    
    // Render skills cloud
    renderSkillsCloud(skillsData);
}

// Get department data for chart
function getDepartmentData(alumni) {
    const deptCounts = {};

    // Initialize fixed departments with zero
    DEPARTMENTS.forEach(d => deptCounts[d] = 0);

    alumni.forEach(user => {
        const dept = user.department || 'Other';
        if (DEPARTMENTS.includes(dept)) {
            deptCounts[dept] = (deptCounts[dept] || 0) + 1;
        } else {
            deptCounts['Other'] = (deptCounts['Other'] || 0) + 1;
        }
    });

    const labels = Object.keys(deptCounts);
    const data = labels.map(l => deptCounts[l]);
    return { labels, data };
} 

// Get year trend data
function getYearTrendData(alumni) {
    const yearCounts = {};
    
    alumni.forEach(user => {
        yearCounts[user.graduationYear] = (yearCounts[user.graduationYear] || 0) + 1;
    });
    
    // Sort years
    const sortedYears = Object.keys(yearCounts).sort((a, b) => a - b);
    
    return {
        labels: sortedYears,
        data: sortedYears.map(year => yearCounts[year])
    };
} 

// Get top companies
function getTopCompanies(alumni) {
    const companyCounts = {};
    
    alumni.forEach(user => {
        if (user.company && user.company.trim() !== '') {
            companyCounts[user.company] = (companyCounts[user.company] || 0) + 1;
        }
    });
    
    // Sort by count and get top 10
    return Object.entries(companyCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
}

// Get skills data
function getSkillsData(alumni) {
    const skillsCount = {};
    
    alumni.forEach(user => {
        if (user.skills && user.skills.trim() !== '') {
            user.skills.split(',').forEach(skill => {
                const trimmedSkill = skill.trim();
                if (trimmedSkill) {
                    skillsCount[trimmedSkill] = (skillsCount[trimmedSkill] || 0) + 1;
                }
            });
        }
    });
    
    // Sort by count and get top 15
    return Object.entries(skillsCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);
}

// Render department chart
function renderDepartmentChart(deptData) {
    const ctx = document.getElementById('dept-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.deptChart) {
        window.deptChart.destroy();
    }
    
    const colors = [
        '#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6',
        '#1abc9c', '#d35400', '#c0392b', '#16a085', '#8e44ad'
    ];
    
    window.deptChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: deptData.labels,
            datasets: [{
                data: deptData.data,
                backgroundColor: colors.slice(0, deptData.labels.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

// Render year trend chart
function renderYearTrendChart(yearData) {
    const ctx = document.getElementById('year-trend-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.yearChart) {
        window.yearChart.destroy();
    }
    
    window.yearChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: yearData.labels,
            datasets: [{
                label: 'Alumni Count',
                data: yearData.data,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Render top companies
function renderTopCompanies(companyData) {
    const topCompanies = document.getElementById('top-companies');
    
    if (companyData.length === 0) {
        topCompanies.innerHTML = '<p class="empty-state">No company data available</p>';
        return;
    }
    
    topCompanies.innerHTML = companyData.map(([company, count]) => `
        <div class="company-item">
            <span class="company-name">${escapeHtml(company)}</span>
            <span class="company-count">${count}</span>
        </div>
    `).join('');
}

// Render skills cloud
function renderSkillsCloud(skillsData) {
    const skillsCloud = document.getElementById('skills-cloud');
    
    if (skillsData.length === 0) {
        skillsCloud.innerHTML = '<p class="empty-state">No skills data available</p>';
        return;
    }
    
    // Find max count for scaling
    const maxCount = Math.max(...skillsData.map(([_, count]) => count));
    
    skillsCloud.innerHTML = skillsData.map(([skill, count]) => {
        // Calculate font size based on count (min 1rem, max 2rem)
        const fontSize = 1 + (count / maxCount);
        
        return `
            <div class="skill-item">
                <span class="skill-name" style="font-size: ${fontSize}rem">${escapeHtml(skill)}</span>
                <span class="skill-count">${count}</span>
            </div>
        `;
    }).join('');
}

// Setup admin event listeners
function setupAdminEventListeners() {
    // Navigation
    const navItems = document.querySelectorAll('.nav-item a');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const href = this.getAttribute('href') || '';
            // If the link is an internal fragment (starts with '#'), handle it via SPA behaviour.
            // Otherwise (e.g., links to 'admin-settings.html'), allow normal navigation.
            if (!href.startsWith('#')) {
                return; // let the browser follow the link
            }
            e.preventDefault();
            
            // Get target section from href
            const targetId = href.substring(1);
            const targetSection = document.getElementById(`${targetId}-section`);
            
            if (targetSection) {
                // Update active nav item
                navItems.forEach(nav => nav.parentElement.classList.remove('active'));
                this.parentElement.classList.add('active');
                
                // Show target section
                document.querySelectorAll('.dashboard-section').forEach(section => {
                    section.classList.remove('active');
                });
                targetSection.classList.add('active');
                
                // If analytics section is shown, refresh charts
                if (targetId === 'analytics') {
                    setTimeout(() => {
                        loadAnalytics();
                    }, 100);
                }
            }
        });
    });
    
    // Search functionality
    document.getElementById('admin-search')?.addEventListener('input', function() {
        filterAlumniTable();
    });
    
    // Filter functionality
    document.getElementById('dept-filter')?.addEventListener('change', filterAlumniTable);
    document.getElementById('year-filter')?.addEventListener('change', filterAlumniTable);
    
    // Refresh data button
    document.getElementById('refresh-data-btn')?.addEventListener('click', function() {
        loadAlumniTable();
        updateAdminStats();
        loadAnalytics();
        alert('Data refreshed successfully!');
    });
    
    // Export all data
    document.getElementById('export-all-btn')?.addEventListener('click', function() {
        const users = JSON.parse(localStorage.getItem('alumniUsers')) || [];
        const dataStr = JSON.stringify(users, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `alumni-system-backup-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        alert('All data has been exported successfully!');
    });
    
    // Backup data
    document.getElementById('backup-btn')?.addEventListener('click', function() {
        const users = JSON.parse(localStorage.getItem('alumniUsers')) || [];
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupKey = `alumniBackup_${timestamp}`;
        
        localStorage.setItem(backupKey, JSON.stringify(users));
        alert(`Backup created successfully! Backup key: ${backupKey}`);
    });
    
    // Add alumni button -> open modal
    const addAlumniBtn = document.getElementById('add-alumni-btn');
    const addModal = document.getElementById('addAlumniModal');
    const addForm = document.getElementById('addAlumniForm');
    const addError = document.getElementById('addAlumniError');
    const addSuccess = document.getElementById('addAlumniSuccess');
    const addCancel = document.getElementById('addAlumniCancel');
    const addClose = document.getElementById('addAlumniClose');

    function openAddModal() {
        addError.style.display = 'none';
        addError.textContent = '';
        addSuccess.style.display = 'none';
        addForm.reset();
        addModal.classList.add('open');
        addModal.setAttribute('aria-hidden', 'false');
        document.getElementById('addName').focus();
    }

    function closeAddModal() {
        addModal.classList.remove('open');
        addModal.setAttribute('aria-hidden', 'true');
    }

    addAlumniBtn?.addEventListener('click', function() {
        openAddModal();
    });

    addCancel?.addEventListener('click', function() {
        closeAddModal();
    });

    addClose?.addEventListener('click', function() {
        closeAddModal();
    });

    // Close modal when clicking overlay
    addModal?.addEventListener('click', function(e) {
        if (e.target === addModal) closeAddModal();
    });

    // Handle form submit to create alumni
    addForm?.addEventListener('submit', async function(e) {
        e.preventDefault();
        addError.style.display = 'none';
        addSuccess.style.display = 'none';

        const name = document.getElementById('addName').value.trim();
        const email = document.getElementById('addEmail').value.trim().toLowerCase();
        const department = document.getElementById('addDept').value;
        const graduationYear = parseInt(document.getElementById('addYear').value);
        const company = document.getElementById('addCompany').value.trim();
        const position = document.getElementById('addPosition').value.trim();
        const skills = document.getElementById('addSkills').value.trim();
        const linkedin = document.getElementById('addLinkedIn').value.trim();
        const mentorship = document.getElementById('addMentorship').checked;

        if (!name || !email || !department || !graduationYear) {
            addError.textContent = 'Please fill required fields: name, email, department, and graduation year.';
            addError.style.display = 'block';
            return;
        }

        const users = JSON.parse(localStorage.getItem('alumniUsers')) || [];
        if (users.some(u => u.email === email)) {
            addError.textContent = 'This email is already registered.';
            addError.style.display = 'block';
            return;
        }

        const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        const passwordHash = await hashPassword('temp123');

        const newAlumni = {
            id: newId,
            name,
            email,
            passwordHash,
            role: 'alumni',
            department,
            graduationYear: graduationYear,
            company,
            position,
            skills,
            linkedin,
            mentorship
        };

        users.push(newAlumni);
        localStorage.setItem('alumniUsers', JSON.stringify(users));

        // Refresh data
        loadAlumniTable();
        updateAdminStats();
        loadAnalytics();

        addSuccess.textContent = 'Alumni added successfully! Default password: temp123';
        addSuccess.style.display = 'block';

        // Auto-close after a short delay
        setTimeout(() => {
            closeAddModal();
        }, 1000);
    });
    
    // Send notification button
    document.getElementById('send-notification-btn')?.addEventListener('click', function() {
        const message = prompt("Enter notification message to send to all alumni:");
        if (message) {
            alert(`Notification sent to all alumni: "${message}"\n\n(Note: In a real system, this would send emails to all alumni)`);
        }
    });
    
    // Clear all data button
    document.getElementById('clear-data-btn')?.addEventListener('click', function() {
        if (confirm('WARNING: This will delete ALL alumni data (except admin accounts). Are you sure?')) {
            const users = JSON.parse(localStorage.getItem('alumniUsers')) || [];
            const adminUsers = users.filter(user => user.role === 'admin');
            
            localStorage.setItem('alumniUsers', JSON.stringify(adminUsers));
            
            // Refresh data
            loadAlumniTable();
            updateAdminStats();
            loadAnalytics();
            
            alert('All alumni data has been cleared!');
        }
    });
    
    // Reset system button
    document.getElementById('reset-system-btn')?.addEventListener('click', function() {
        if (confirm('WARNING: This will reset the entire system to factory settings, deleting ALL data including admin accounts. Are you sure?')) {
            localStorage.clear();
            alert('System has been reset. Redirecting to homepage...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    });
    
    // Logout button
    document.getElementById('admin-logout-btn')?.addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
}

// Filter alumni table based on search and filters
function filterAlumniTable() {
    const searchTerm = document.getElementById('admin-search').value.toLowerCase();
    const deptFilter = document.getElementById('dept-filter').value;
    const yearFilter = document.getElementById('year-filter').value;
    
    const users = JSON.parse(localStorage.getItem('alumniUsers')) || [];
    let filteredAlumni = users.filter(user => user.role === 'alumni');
    
    // Apply department filter
    if (deptFilter) {
        filteredAlumni = filteredAlumni.filter(user => user.department === deptFilter);
    }
    
    // Apply year filter
    if (yearFilter) {
        filteredAlumni = filteredAlumni.filter(user => user.graduationYear === parseInt(yearFilter));
    }
    
    // Apply search filter
    if (searchTerm) {
        filteredAlumni = filteredAlumni.filter(user => 
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            (user.company && user.company.toLowerCase().includes(searchTerm)) ||
            (user.position && user.position.toLowerCase().includes(searchTerm)) ||
            (user.skills && user.skills.toLowerCase().includes(searchTerm))
        );
    }
    
    // Reload table with filtered data
    loadAlumniTable(filteredAlumni);
}


// -------------------------
// Admin settings page logic
// -------------------------

// Simple hash helper for admin page (mirror of auth.js)
async function hashPassword(password) {
    const enc = new TextEncoder();
    const data = enc.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Handle admin-settings.html form if present
(function initAdminSettings() {
    const page = window.location.pathname.split('/').pop();
    if (page !== 'admin-settings.html') return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('alumniUsers')) || [];
    const adminIndex = users.findIndex(u => u.role === 'admin');
    if (adminIndex === -1) {
        window.location.href = 'admin.html';
        return;
    }

    const admin = users[adminIndex];

    // Populate form with admin data
    document.getElementById('adminName').value = admin.name || '';
    document.getElementById('adminEmail').textContent = admin.email || '';

    const messageEl = document.getElementById('admin-settings-message');
    const errorEl = document.getElementById('admin-settings-error');

    document.getElementById('admin-settings-form')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        messageEl.style.display = 'none';
        errorEl.style.display = 'none';

        const currentPwd = document.getElementById('currentPassword').value || '';
        const newPwd = document.getElementById('newPassword').value || '';
        const confirmPwd = document.getElementById('confirmPassword').value || '';
        const newName = document.getElementById('adminName').value.trim();

        // If changing password, verify current password
        if (newPwd || confirmPwd) {
            if (newPwd.length < 6) {
                errorEl.textContent = 'New password must be at least 6 characters.';
                errorEl.style.display = 'block';
                return;
            }
            if (newPwd !== confirmPwd) {
                errorEl.textContent = 'New password and confirmation do not match.';
                errorEl.style.display = 'block';
                return;
            }

            // Verify current password
            const hashedCurrent = await hashPassword(currentPwd);
            if (admin.passwordHash) {
                if (hashedCurrent !== admin.passwordHash) {
                    errorEl.textContent = 'Current password is incorrect.';
                    errorEl.style.display = 'block';
                    return;
                }
            } else if (admin.password) {
                // legacy plain password
                if (currentPwd !== admin.password) {
                    errorEl.textContent = 'Current password is incorrect.';
                    errorEl.style.display = 'block';
                    return;
                }
            } else {
                errorEl.textContent = 'No password set for admin account.';
                errorEl.style.display = 'block';
                return;
            }

            // All good: set new password hash
            const newHash = await hashPassword(newPwd);
            users[adminIndex].passwordHash = newHash;
            delete users[adminIndex].password;
        }

        // Update name
        if (newName) {
            users[adminIndex].name = newName;
        }

        // Save
        localStorage.setItem('alumniUsers', JSON.stringify(users));
        // Update currentUser in storage too
        if (currentUser && currentUser.role === 'admin') {
            const updatedAdmin = users[adminIndex];
            localStorage.setItem('currentUser', JSON.stringify(updatedAdmin));
        }

        messageEl.textContent = 'Admin profile updated successfully.';
        messageEl.style.display = 'block';

        // Clear password fields
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';

        // Refresh displayed name in header
        document.getElementById('admin-name').textContent = users[adminIndex].name;
    });
})();