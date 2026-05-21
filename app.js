// Load data from localStorage
function loadFromLocalStorage() {
    const stored = localStorage.getItem('upsRegistry');
    if (stored) {
        return JSON.parse(stored);
    }
    return upsData;
}

function saveToLocalStorage(data) {
    localStorage.setItem('upsRegistry', JSON.stringify(data));
}

let allData = loadFromLocalStorage();
let currentUser = null;
let users = JSON.parse(localStorage.getItem('upsUsers')) || [];

// Event Listeners
document.getElementById('loginForm').addEventListener('submit', handleLogin);
document.getElementById('registerForm').addEventListener('submit', handleRegister);
document.getElementById('addUpsForm').addEventListener('submit', handleAddUps);
document.getElementById('logoutBtn').addEventListener('click', handleLogout);

function switchTab(tab) {
    document.querySelectorAll('.form-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    if (tab === 'login') {
        document.getElementById('loginForm').classList.add('active');
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
    } else {
        document.getElementById('registerForm').classList.add('active');
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
    }
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        showMainPage();
        loadDashboard();
    } else {
        alert('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirm').value;
    
    if (password !== confirm) {
        alert('รหัสผ่านไม่ตรงกัน');
        return;
    }
    
    if (password.length < 6) {
        alert('รหัสผ่านต้องมีอย่างน้อย 6 ตัว');
        return;
    }
    
    if (users.find(u => u.email === email)) {
        alert('อีเมลนี้ลงทะเบียนแล้ว');
        return;
    }
    
    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('upsUsers', JSON.stringify(users));
    
    alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
    switchTab('login');
    document.getElementById('loginForm').reset();
}

function showMainPage() {
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('mainPage').classList.add('active');
    document.getElementById('userName').textContent = currentUser.name;
}

function handleLogout() {
    if (confirm('ต้องการออกจากระบบหรือไม่?')) {
        currentUser = null;
        document.getElementById('loginPage').classList.add('active');
        document.getElementById('mainPage').classList.remove('active');
        document.getElementById('loginForm').reset();
        document.getElementById('registerForm').reset();
        switchTab('login');
    }
}

function switchPage(page) {
    document.querySelectorAll('.page-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    
    switch(page) {
        case 'dashboard':
            document.getElementById('dashboardPage').classList.add('active');
            document.querySelectorAll('.nav-btn')[0].classList.add('active');
            loadDashboard();
            break;
        case 'addups':
            document.getElementById('addupsPage').classList.add('active');
            document.querySelectorAll('.nav-btn')[1].classList.add('active');
            break;
        case 'table':
            document.getElementById('tablePage').classList.add('active');
            document.querySelectorAll('.nav-btn')[2].classList.add('active');
            loadTable();
            break;
    }
}

function loadDashboard() {
    const today = new Date('2026-05-21');
    
    const totalUPS = allData.length;
    let needsBattery = 0;
    let broken = 0;
    let working = 0;
    const alerts = [];
    
    allData.forEach(ups => {
        const nextBatteryDate = parseDate(ups.nextBattery);
        
        if (ups.computer.includes('เสีย')) {
            broken++;
        } else if (nextBatteryDate && nextBatteryDate <= today) {
            needsBattery++;
            alerts.push(ups);
        } else {
            working++;
        }
    });
    
    document.getElementById('totalUPS').textContent = totalUPS;
    document.getElementById('needsBattery').textContent = needsBattery;
    document.getElementById('broken').textContent = broken;
    document.getElementById('working').textContent = working;
    
    const alertsList = document.getElementById('alertsList');
    alertsList.innerHTML = '';
    
    if (alerts.length === 0) {
        alertsList.innerHTML = '<div class="no-alerts">✅ ไม่มีเครื่องที่ต้องเปลี่ยนแบตในขณะนี้</div>';
    } else {
        alerts.forEach(ups => {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert-item';
            alertDiv.innerHTML = `
                <strong>${ups.number}</strong> - ${ups.model}<br>
                ติดตั้งที่: ${ups.location}<br>
                ต้องเปลี่ยนแบตเมื่อ: ${ups.nextBattery}
            `;
            alertsList.appendChild(alertDiv);
        });
    }
}

function handleAddUps(e) {
    e.preventDefault();
    
    const newUps = {
        number: document.getElementById('addNumber').value,
        model: document.getElementById('addModel').value,
        warranty: `${document.getElementById('addWarranty').value} ปี`,
        location: document.getElementById('addLocation').value,
        computer: document.getElementById('addComputer').value,
        installDate: document.getElementById('addInstallDate').value,
        surge: document.getElementById('addSurge').value || 'ไม่มี',
        surgeWarranty: document.getElementById('addSurgeWarranty').value || 'ไม่มี',
        nextBattery: calculateNextBattery(document.getElementById('addInstallDate').value, document.getElementById('addWarranty').value),
        action: document.getElementById('addAction').value,
        actionDate: ''
    };
    
    allData.push(newUps);
    saveToLocalStorage(allData);
    
    alert('บันทึกข้อมูลเครื่องสำรองไฟเรียบร้อย!');
    document.getElementById('addUpsForm').reset();
    switchPage('table');
}

function calculateNextBattery(installDate, warranty) {
    const date = new Date(installDate);
    const years = parseInt(warranty);
    date.setFullYear(date.getFullYear() + years);
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/');
}

function parseDate(dateString) {
    const [day, month, year] = dateString.split('/');
    return new Date(year, month - 1, day);
}

function loadTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    allData.forEach((ups, index) => {
        let statusClass = 'status-good';
        let status = 'ใช้งานได้';
        
        if (ups.computer.includes('เสีย')) {
            statusClass = 'status-danger';
            status = 'เสีย';
        } else {
            const today = new Date('2026-05-21');
            const nextBatteryDate = parseDate(ups.nextBattery);
            if (nextBatteryDate && nextBatteryDate <= today) {
                statusClass = 'status-warning';
                status = 'ต้องเปลี่ยนแบต';
            }
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${ups.number}</td>
            <td>${ups.model}</td>
            <td>${ups.location}</td>
            <td>${ups.computer}</td>
            <td>${ups.installDate}</td>
            <td>${ups.warranty}</td>
            <td>${ups.nextBattery}</td>
            <td><span class="${statusClass}">${status}</span></td>
            <td>${ups.action}</td>
            <td><button class="btn-delete" onclick="deleteUps(${index})">ลบ</button></td>
        `;
        tbody.appendChild(row);
    });
}

function deleteUps(index) {
    if (confirm('ต้องการลบข้อมูลนี้หรือไม่?')) {
        allData.splice(index, 1);
        saveToLocalStorage(allData);
        loadTable();
    }
}

function filterTable() {
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    const statusValue = document.getElementById('statusFilter').value;
    const rows = document.querySelectorAll('#tableBody tr');
    
    rows.forEach(row => {
        let show = true;
        const text = row.textContent.toLowerCase();
        
        if (!text.includes(searchValue)) {
            show = false;
        }
        
        if (statusValue && !row.textContent.includes(statusValue)) {
            show = false;
        }
        
        row.style.display = show ? '' : 'none';
    });
}

// Initialize
window.addEventListener('load', () => {
    loadDashboard();
});