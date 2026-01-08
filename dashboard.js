// js/dashboard.js
// Dashboard functionality for alumni users

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

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() { 
    // Check authentication
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role === 'admin') {
        window.location.href = 'login.html';
        return;
    }
    
    // Load user data
    loadUserData();
    loadAlumniNetwork();
    setupEventListeners();
    updateStats();
    
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
});

// Load current user data into the dashboard
function loadUserData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('alumniUsers')) || [];
    
    // Find the most recent user data
    const updatedUser = users.find(u => u.id === currentUser.id) || currentUser;
    
    // Update displayed user info
    document.getElementById('user-name').textContent = updatedUser.name;
    document.getElementById('profile-name').textContent = updatedUser.name;
    document.getElementById('profile-email').textContent = updatedUser.email;
    document.getElementById('profile-role').textContent = updatedUser.role === 'admin' ? 'Administrator' : 'Alumni';
    document.getElementById('profile-dept').textContent = `${updatedUser.department}, ${updatedUser.graduationYear}`;
    document.getElementById('profile-company').textContent = updatedUser.company || 'Not specified';
    document.getElementById('profile-position').textContent = updatedUser.position || 'Not specified';
    document.getElementById('profile-skills').textContent = updatedUser.skills || 'Not specified';
    document.getElementById('profile-linkedin').textContent = updatedUser.linkedin || 'Not specified';
    document.getElementById('profile-mentorship').textContent = updatedUser.mentorship ? 'Yes' : 'No';
    
    // Update form fields
    document.getElementById('update-company').value = updatedUser.company || '';
    document.getElementById('update-position').value = updatedUser.position || '';
    document.getElementById('update-skills').value = updatedUser.skills || '';
    document.getElementById('update-linkedin').value = updatedUser.linkedin || '';
    document.getElementById('update-mentorship').checked = updatedUser.mentorship || false;
    
    // Update currentUser in localStorage with latest data
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
}

// Load alumni network for the dashboard
function loadAlumniNetwork() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('alumniUsers')) || [];
    
    // Filter out current user and admins, only show alumni
    const alumni = users.filter(user => 
        user.role === 'alumni' && user.id !== currentUser.id
    );
    
    const alumniGrid = document.getElementById('alumni-grid');
    
    if (alumni.length === 0) {
        alumniGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-friends"></i>
                <p>No alumni found in the network.</p>
            </div>
        `;
        return;
    }
    
    // Sort alumni by graduation year (most recent first)
    alumni.sort((a, b) => b.graduationYear - a.graduationYear);
    
    // Display first 12 alumni
    const displayAlumni = alumni.slice(0, 12);
    
    alumniGrid.innerHTML = displayAlumni.map(user => {
        const name = escapeHtml(user.name);
        const dept = escapeHtml(user.department);
        const year = escapeHtml(String(user.graduationYear));
        const company = user.company ? `<div class="alumni-card-detail"><i class="fas fa-building"></i><span>${escapeHtml(user.company)}</span></div>` : '';
        const position = user.position ? `<div class="alumni-card-detail"><i class="fas fa-briefcase"></i><span>${escapeHtml(user.position)}</span></div>` : '';
        const linkedin = user.linkedin ? `<div class="alumni-card-detail"><i class="fab fa-linkedin"></i><span>LinkedIn Profile</span></div>` : '';
        const skillsHtml = user.skills ? `<div class="alumni-skills">${user.skills.split(',').slice(0,3).map(skill => `<span class="skill-tag">${escapeHtml(skill.trim())}</span>`).join('')}</div>` : '';
        return `
        <div class="alumni-card">
            <div class="alumni-card-header">
                <div class="alumni-avatar">
                    <i class="fas fa-user-graduate"></i>
                </div>
                <div class="alumni-card-info">
                    <h4>${name}</h4>
                    <p>${dept}, ${year}</p>
                </div>
            </div>
            <div class="alumni-card-details">
                ${company}
                ${position}
                ${linkedin}
            </div>
            ${skillsHtml}
            <div class="alumni-card-actions">
                <button type="button" class="btn btn-outline message-btn" data-email="${escapeHtml(user.email)}" data-name="${name}">Message</button>
            </div>
        </div>
    `;
    }).join('');
}

// Update statistics on the dashboard
function updateStats() {
    const users = JSON.parse(localStorage.getItem('alumniUsers')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Filter only alumni users
    const alumni = users.filter(user => user.role === 'alumni');
    const deptAlumni = alumni.filter(user => user.department === currentUser.department);
    
    document.getElementById('total-alumni').textContent = alumni.length;
    document.getElementById('dept-alumni').textContent = deptAlumni.length;
}

// Setup event listeners for the dashboard
function setupEventListeners() {
    // Navigation
    const navItems = document.querySelectorAll('.nav-item a');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();

            // Open inbox modal when Messages link is clicked
            if (this.id === 'open-messages') {
                openInboxModal();
                return;
            }
            
            // Get target section from href
            const targetId = this.getAttribute('href').substring(1);
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
            }
        });
    });
    
    // Edit profile button
    document.getElementById('edit-profile-btn')?.addEventListener('click', function() {
        // Switch to update section
        navItems.forEach(nav => nav.parentElement.classList.remove('active'));
        document.querySelector('.nav-item a[href="#update"]').parentElement.classList.add('active');
        
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById('update-section').classList.add('active');
    });
    
    // Update profile form
    document.getElementById('updateProfileForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const users = JSON.parse(localStorage.getItem('alumniUsers')) || [];
        
        // Find user index
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        
        if (userIndex !== -1) {
            // Update user data
            users[userIndex].company = document.getElementById('update-company').value.trim();
            users[userIndex].position = document.getElementById('update-position').value.trim();
            users[userIndex].skills = document.getElementById('update-skills').value.trim();
            users[userIndex].linkedin = document.getElementById('update-linkedin').value.trim();
            users[userIndex].mentorship = document.getElementById('update-mentorship').checked;
            
            // Save to localStorage
            localStorage.setItem('alumniUsers', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
            
            // Show success message
            const successElement = document.getElementById('update-success');
            successElement.textContent = 'Profile updated successfully!';
            successElement.style.display = 'block';
            
            // Reload user data
            loadUserData();
            updateStats();
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                successElement.textContent = '';
                successElement.style.display = 'none';
            }, 3000);
        }
    });
    
    // Alumni search
    document.getElementById('alumni-search')?.addEventListener('input', function(e) {
        const searchTerm = this.value.toLowerCase();
        const alumniCards = document.querySelectorAll('.alumni-card');
        
        alumniCards.forEach(card => {
            const cardText = card.textContent.toLowerCase();
            if (cardText.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
    
    // Dark mode toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        // Check if dark mode is enabled
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-mode');
            darkModeToggle.checked = true;
        }
        
        darkModeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'enabled');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'disabled');
            }
        });
    }
    
    // Export data button
    document.getElementById('export-data-btn')?.addEventListener('click', function() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const dataStr = JSON.stringify(currentUser, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `alumni-data-${currentUser.name.replace(/\s+/g, '-').toLowerCase()}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        alert('Your data has been exported successfully!');
    });
    
    // Delete account button
    document.getElementById('delete-account-btn')?.addEventListener('click', function() {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            let users = JSON.parse(localStorage.getItem('alumniUsers')) || [];
            
            // Remove user from users array
            users = users.filter(user => user.id !== currentUser.id);
            localStorage.setItem('alumniUsers', JSON.stringify(users));
            
            // Clear current user and redirect to login
            localStorage.removeItem('currentUser');
            alert('Your account has been deleted successfully.');
            window.location.href = 'index.html';
        }
    });
    
    // Message helpers
    function getMessages() {
        return JSON.parse(localStorage.getItem('messages') || '[]');
    }

    function saveMessages(msgs) {
        localStorage.setItem('messages', JSON.stringify(msgs));
    }

    // Track last known unread count to detect new messages
    let lastUnreadCount = 0;

    function showToast(message, messageId) {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const el = document.createElement('div');
        el.className = 'toast';
        el.setAttribute('data-msg-id', messageId || '');
        el.innerHTML = `<div class="toast-body">${escapeHtml(message)}</div>`;
        container.prepend(el);
        // Open inbox when toast clicked (focus the message if id provided)
        el.addEventListener('click', function() { openInboxModal(messageId); });
        // Animate
        requestAnimationFrame(() => el.classList.add('show'));
        // Auto remove
        setTimeout(() => {
            el.classList.remove('show');
            setTimeout(() => el.remove(), 250);
        }, 5000);
    }

    // Inbox modal helpers
    function openInboxModal(messageId) {
        const modal = document.getElementById('inboxModal');
        if (!modal) return;
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
        renderInbox();
        updateMessageBadge();

        // If a message id was provided, focus and highlight it
        if (messageId) {
            // Delay to ensure DOM is updated after render
            setTimeout(() => {
                const el = document.querySelector(`#inbox-modal-list .message-item[data-id="${messageId}"]`);
                if (el) {
                    el.classList.add('highlight');
                    el.setAttribute('tabindex', '-1');
                    el.focus();
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Remove highlight after a short delay
                    setTimeout(() => el.classList.remove('highlight'), 2500);
                }
            }, 80);
        }
    }

    function closeInboxModal() {
        const modal = document.getElementById('inboxModal');
        if (!modal) return;
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    }

    document.getElementById('closeInboxModal')?.addEventListener('click', closeInboxModal);

    function updateMessageBadge() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        const msgs = getMessages();
        const unread = msgs.filter(m => m.to === String(currentUser.email).toLowerCase() && !m.read).length;
        const badge = document.getElementById('messages-badge');
        if (!badge) return;
        if (unread > 0) {
            badge.textContent = String(unread);
            badge.classList.remove('hidden');
        } else {
            badge.textContent = '0';
            badge.classList.add('hidden');
        }

        // If unread increased, show a toast for the newest message (include message id)
        if (unread > lastUnreadCount) {
            const msgsForCurrent = msgs.filter(m => m.to === String(currentUser.email).toLowerCase() && !m.read);
            if (msgsForCurrent.length > 0) {
                const newest = msgsForCurrent.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
                showToast(`New message from ${escapeHtml(newest.fromName || newest.from)}: ${escapeHtml(newest.text).substring(0,120)}`, newest.id);
            }
        }
        lastUnreadCount = unread;
    }



    function openMessageModal(email, name) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
        document.getElementById('message-recipient-name').textContent = name || email;
        document.getElementById('message-recipient-email').textContent = email || '';
        document.getElementById('message-text').value = '';
        document.getElementById('message-send-status').textContent = '';

        // Reset and enable/disable "send to all" checkbox depending on admin role
        const sendAllCheckbox = document.getElementById('message-send-all');
        if (sendAllCheckbox) {
            sendAllCheckbox.checked = false;
            if (currentUser.role === 'admin') {
                sendAllCheckbox.disabled = false;
                sendAllCheckbox.parentElement.style.opacity = '1';
            } else {
                sendAllCheckbox.disabled = true;
                sendAllCheckbox.parentElement.style.opacity = '0.6';
            }
        }

        const modal = document.getElementById('messageModal');
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
        document.getElementById('message-text').focus();
    }

    function closeMessageModal() {
        const modal = document.getElementById('messageModal');
        if (modal) {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        }
    }

    document.getElementById('closeMessageModal')?.addEventListener('click', closeMessageModal);
    document.getElementById('cancelMessageBtn')?.addEventListener('click', closeMessageModal);

    document.getElementById('sendMessageBtn')?.addEventListener('click', function() {
        const toEmail = document.getElementById('message-recipient-email').textContent;
        const toName = document.getElementById('message-recipient-name').textContent;
        const text = document.getElementById('message-text').value.trim();
        const sendAll = document.getElementById('message-send-all')?.checked;
        if (!text) {
            document.getElementById('message-send-status').textContent = 'Please enter a message before sending.';
            return;
        }
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        let messages = getMessages();

        if (sendAll && currentUser && currentUser.role === 'admin') {
            // Broadcast to all alumni
            const users = JSON.parse(localStorage.getItem('alumniUsers')) || [];
            const alumniUsers = users.filter(u => u.role === 'alumni');
            const now = new Date().toISOString();
            for (const u of alumniUsers) {
                messages.push({ id: Date.now() + Math.floor(Math.random()*1000), from: String(currentUser.email).toLowerCase(), fromName: currentUser.name, to: String(u.email).toLowerCase(), text, timestamp: now, read: false });
            }
            saveMessages(messages);
            document.getElementById('message-send-status').textContent = `Broadcast sent to ${alumniUsers.length} alumni.`;
            showToast(`Broadcast sent to ${alumniUsers.length} alumni.`);
        } else {
            // Single recipient
            messages.push({ id: Date.now(), from: String(currentUser.email).toLowerCase(), fromName: currentUser.name, to: String(toEmail).toLowerCase(), text, timestamp: new Date().toISOString(), read: false });
            saveMessages(messages);
            document.getElementById('message-send-status').textContent = 'Message sent.';
        }

        updateMessageBadge();
        // Also re-render inbox in this tab in case the recipient is the current user
        renderInbox();
        setTimeout(closeMessageModal, 800);
    });

    // Delegate clicks from alumni grid to message buttons
    document.getElementById('alumni-grid')?.addEventListener('click', function(e) {
        const btn = e.target.closest('.message-btn');
        if (btn) {
            const email = btn.getAttribute('data-email');
            const name = btn.getAttribute('data-name');
            openMessageModal(email, name);
        }
    });

    function renderInbox() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        const msgs = getMessages().filter(m => m.to === String(currentUser.email).toLowerCase()).sort((a,b)=> new Date(b.timestamp)-new Date(a.timestamp));
        const container = document.getElementById('inbox-modal-list') || document.getElementById('inbox-list');
        if (!container) return;
        if (msgs.length === 0) {
            container.innerHTML = '<p class="empty-state"><i class="fas fa-envelope-open-text"></i> No messages yet.</p>';
            return;
        }
        container.innerHTML = msgs.map(m => `
            <div class="message-item ${m.read ? 'read' : 'unread'}" data-id="${m.id}">
                <div class="message-meta">
                    <strong>${escapeHtml(m.fromName || m.from)}</strong>
                    <span class="message-time">${new Date(m.timestamp).toLocaleString()}</span>
                </div>
                <div class="message-body">${escapeHtml(m.text)}</div>
                <div class="message-actions">
                    ${m.read ? '' : `<button type="button" class="btn btn-primary mark-read" data-id="${m.id}">Mark Read</button>`}
                    <button type="button" class="btn btn-outline delete-msg" data-id="${m.id}">Delete</button>
                </div>
            </div>
        `).join('');
    }

    // Inbox action delegation (handles both inline list and modal list)
    document.addEventListener('click', function(e){
        const markBtn = e.target.closest('.mark-read');
        const delBtn = e.target.closest('.delete-msg');
        // Only handle clicks that came from inside one of the inbox containers
        if (markBtn && (e.target.closest('#inbox-modal-list') || e.target.closest('#inbox-list'))) {
            const id = Number(markBtn.getAttribute('data-id'));
            const messages = getMessages();
            const idx = messages.findIndex(m => m.id === id);
            if (idx !== -1) {
                messages[idx].read = true;
                saveMessages(messages);
                renderInbox();
                updateMessageBadge();
            }
            return;
        }
        if (delBtn && (e.target.closest('#inbox-modal-list') || e.target.closest('#inbox-list'))) {
            const id = Number(delBtn.getAttribute('data-id'));
            let messages = getMessages();
            messages = messages.filter(m => m.id !== id);
            saveMessages(messages);
            renderInbox();
            updateMessageBadge();
            return;
        }
    });

    // Initialize message UI
    renderInbox();
    updateMessageBadge();

    // Listen for storage changes (other tabs/windows) to update inbox and badges in real-time
    window.addEventListener('storage', function(e) {
        if (!e.key) return;
        if (e.key === 'messages') {
            renderInbox();
            updateMessageBadge();
        } else if (e.key === 'currentUser') {
            loadUserData();
            renderInbox();
            updateMessageBadge();
        } else if (e.key === 'alumniUsers') {
            loadAlumniNetwork();
            updateStats();
        }
    });

    // Keyboard shortcut: press 'M' (not when typing) to open Inbox
    document.addEventListener('keydown', function(e) {
        if (e.key && e.key.toLowerCase() === 'm') {
            const active = document.activeElement;
            const tag = active && active.tagName ? active.tagName.toLowerCase() : '';
            // ignore if typing in input/textarea/select
            if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
            openInboxModal();
        }
    });

    // Logout button
    document.getElementById('logout-btn')?.addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
}