/**
 * Main Application Logic & Utils
 */

document.addEventListener("DOMContentLoaded", () => {
    checkSession();
    setupNavigation();
});

function setupNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const target = item.getAttribute("data-target");
            switchSection(target);
            
            navItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");
        });
    });
}

function switchSection(sectionId) {
    const sections = document.querySelectorAll(".content-section");
    sections.forEach(s => s.classList.remove("active"));
    document.getElementById(sectionId).classList.add("active");

    if (sectionId === "dashboard-section") loadDashboard();
    if (sectionId === "list-section") loadAllQuotations();
    if (sectionId === "create-section" && !editingId) resetForm();
}

/**
 * Common API Caller
 */
async function callAPI(action, payload) {
    const body = {
        token: CONFIG.API_TOKEN,
        action: action,
        payload: payload
    };

    const response = await fetch(CONFIG.API_URL, {
        method: "POST",
        mode: "no-cors", // Note: Apps Script might need 'no-cors' but results won't be readable, 
                         // Recommended: Deploy GAS with "Anyone" access and use regular fetch
        body: JSON.stringify(body)
    });

    // เนื่องจาก Google Apps Script Redirect บ่อย แนะนำให้ใช้ fetch แบบปกติ
    // หากติด CORS ให้ตรวจสอบการตั้งค่า Deploy ใน Apps Script
    const res = await fetch(CONFIG.API_URL, {
        method: "POST",
        body: JSON.stringify(body)
    });
    return await res.json();
}

/**
 * UI Helpers
 */
function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.innerText = msg;
    toast.style.display = "block";
    setTimeout(() => { toast.style.display = "none"; }, 3000);
}

function showLoading(show) {
    // Implement loading overlay if needed
}

function filterQuotations() {
    const input = document.getElementById("search-input").value.toLowerCase();
    const rows = document.querySelectorAll("#full-table-body tr");
    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(input) ? "" : "none";
    });
}

async function editQuotation(id) {
    showLoading(true);
    try {
        const res = await callAPI("list", {}); 
        const data = res.data.find(r => r.ID === id);
        if (data) {
            editingId = data.ID;
            document.getElementById("form-title").innerText = "แก้ไขใบเสนอราคา: " + data.QuotationNo;
            document.getElementById("qt-no").value = data.QuotationNo;
            document.getElementById("qt-date").value = data.Date;
            document.getElementById("cust-name").value = data.CustomerName;
            document.getElementById("cust-phone").value = data.Phone;
            document.getElementById("cust-email").value = data.Email;
            document.getElementById("cust-address").value = data.Address;
            
            currentItems = JSON.parse(data.ItemsJSON);
            renderItemRows();
            calculateTotals();
            
            switchSection("create-section");
        }
    } catch (err) {
        showToast("ไม่สามารถโหลดข้อมูลมาแก้ไขได้");
    } finally {
        showLoading(false);
    }
}
