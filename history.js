/**
 * UFIX Quotation Builder - History Page Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inject History Button into Sidebar Footer if on main page
    const footer = document.querySelector('.sidebar-footer');
    if (footer && !window.location.pathname.includes('history.html')) {
        const historyBtn = document.createElement('button');
        historyBtn.className = 'btn btn-secondary';
        historyBtn.style.marginTop = '8px';
        historyBtn.innerHTML = '<i class="fas fa-history"></i> เปิดหน้าประวัติ Cloud';
        historyBtn.onclick = () => window.location.href = 'history.html';
        footer.appendChild(historyBtn);
    }

    if (AuthSystem.isLoggedIn() && window.location.pathname.includes('history.html')) {
        loadHistory();
    }
});

async function loadHistory() {
    const query = document.getElementById('history-search').value;
    const body = document.getElementById('history-body');
    body.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:40px;"><i class="fas fa-spinner fa-spin"></i> กำลังโหลดข้อมูล...</td></tr>';

    try {
        const res = await GSheetAPI.call('get_history', { query: query });
        if (res.success) {
            renderTable(res.data);
        }
    } catch (e) {
        body.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>';
    }
}

function renderTable(items) {
    const body = document.getElementById('history-body');
    body.innerHTML = '';

    if (items.length === 0) {
        body.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:40px;">ไม่พบข้อมูล</td></tr>';
        return;
    }

    items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="font-weight:600; color:var(--primary-color);">${item.quotationNo}</td>
            <td>${new Date(item.date).toLocaleDateString('th-TH')}</td>
            <td>${item.customer}</td>
            <td style="font-weight:600;">${parseFloat(item.total).toLocaleString('th-TH', {minimumFractionDigits:2})}</td>
            <td style="text-align:center;">
                <button onclick="editQuotation('${item.quotationNo}')" class="btn btn-primary btn-sm"><i class="fas fa-edit"></i> แก้ไข</button>
                <button onclick="deleteQuotation('${item.quotationNo}')" class="btn btn-danger btn-sm"><i class="fas fa-trash"></i> ลบ</button>
            </td>
        `;
        row.onclick = () => editQuotation(item.quotationNo);
        body.appendChild(row);
    });
}

async function editQuotation(docNo) {
    try {
        const res = await GSheetAPI.call('get_quotation', { quotationNo: docNo });
        if (res.success) {
            // Store the data in localStorage so index.html can load it
            localStorage.setItem('quotation_builder_data', res.jsonData);
            window.location.href = 'index.html';
        }
    } catch (e) {
        alert('โหลดข้อมูลไม่สำเร็จ');
    }
}

async function deleteQuotation(docNo) {
    if (confirm(`คุณต้องการลบใบเสนอราคา ${docNo} ใช่หรือไม่? (ข้อมูลจะไม่ถูกลบจริงแต่จะหายไปจากประวัติ)`)) {
        try {
            const res = await GSheetAPI.call('delete_quotation', { quotationNo: docNo });
            if (res.success) {
                alert('ลบข้อมูลสำเร็จ');
                loadHistory();
            }
        } catch (e) {
            alert('ลบข้อมูลไม่สำเร็จ');
        }
    }
}
