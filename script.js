/**
 * Main Application Logic & Utils (Optimized V2.1)
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
 * Common API Caller (Unified & Secure)
 */
async function callAPI(action, payload) {
    const body = {
        token: CONFIG.API_TOKEN,
        action: action,
        payload: payload
    };

    try {
        // ใช้ fetch แบบมาตรฐาน (Google Apps Script รองรับ CORS เมื่อ Deploy แบบ Anyone)
        const response = await fetch(CONFIG.API_URL, {
            method: "POST",
            mode: "cors", 
            headers: {
                "Content-Type": "text/plain;charset=utf-8",
            },
            body: JSON.stringify(body)
        });
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        return await response.json();
    } catch (error) {
        console.error("API Call Error:", error);
        throw error;
    }
}

/**
 * UI Helpers
 */
function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.innerText = msg;
    toast.style.display = "block";
    toast.style.backgroundColor = msg.includes("ผิดพลาด") ? "#D50000" : "#333";
    setTimeout(() => { toast.style.display = "none"; }, 3000);
}

function showLoading(show) {
    const btn = document.querySelector(".btn-primary");
    if (show) {
        if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังดำเนินการ...';
        document.body.style.cursor = "wait";
    } else {
        if (btn) btn.innerHTML = btn.id === "save-btn" ? '<i class="fas fa-save"></i> บันทึกข้อมูล' : btn.innerHTML;
        document.body.style.cursor = "default";
    }
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
