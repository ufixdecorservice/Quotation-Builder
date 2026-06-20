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
    body.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px;"><i class="fas fa-spinner fa-spin"></i> กำลังโหลดข้อมูล...</td></tr>';

    try {
        const res = await GSheetAPI.call('get_history', { query: query });
        if (res.success) {
            renderTable(res.data);
        }
    } catch (e) {
        body.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>';
    }
}

function renderTable(items) {
    const body = document.getElementById('history-body');
    body.innerHTML = '';

    if (items.length === 0) {
        body.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px;">ไม่พบข้อมูล</td></tr>';
        return;
    }

    items.forEach(item => {
        const isInvoice = item.docType === 'invoice' || (item.quotationNo && item.quotationNo.toUpperCase().includes('-INV'));
        const docBadgeHtml = isInvoice 
            ? `<span class="doc-badge badge-invoice"><i class="fas fa-file-invoice"></i> ใบเรียกเก็บเงิน</span>`
            : `<span class="doc-badge badge-quotation"><i class="fas fa-file-invoice-dollar"></i> ใบเสนอราคา</span>`;
        
        // Show create invoice button only if it's a quotation
        const invoiceBtnHtml = !isInvoice
            ? `<button onclick="createInvoice('${item.quotationNo}')" class="btn-action btn-action-invoice"><i class="fas fa-file-invoice"></i> ออกใบแจ้งหนี้</button>`
            : '';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="font-weight:600; color:var(--primary-color);">${item.quotationNo}</td>
            <td>${docBadgeHtml}</td>
            <td>${new Date(item.date).toLocaleDateString('th-TH')}</td>
            <td>${item.customer}</td>
            <td style="font-weight:600;">${parseFloat(item.total).toLocaleString('th-TH', {minimumFractionDigits:2})}</td>
            <td style="text-align:center;">
                <div class="action-buttons">
                    <button onclick="editQuotation('${item.quotationNo}')" class="btn-action btn-action-edit"><i class="fas fa-edit"></i> แก้ไข</button>
                    ${invoiceBtnHtml}
                    <button onclick="deleteQuotation('${item.quotationNo}')" class="btn-action btn-action-delete"><i class="fas fa-trash"></i> ลบ</button>
                </div>
            </td>
        `;
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

async function createInvoice(docNo) {
    try {
        const res = await GSheetAPI.call('get_quotation', { quotationNo: docNo });
        if (res.success) {
            const data = JSON.parse(res.jsonData);
            data.docType = 'invoice';
            if (data.documentNo) {
                // Append -INV to make it a distinct document and prevent overwriting the original quotation
                data.documentNo = data.documentNo + '-INV';
            }
            // Store in localStorage so index.html loads it as an invoice
            localStorage.setItem('quotation_builder_data', JSON.stringify(data));
            window.location.href = 'index.html';
        }
    } catch (e) {
        alert('โหลดข้อมูลใบเสนอราคาเพื่อออกใบแจ้งหนี้ไม่สำเร็จ');
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

function createNewQuotation() {
    // Clear localStorage to start a fresh quotation instead of reloading the previous invoice draft
    localStorage.removeItem('quotation_builder_data');
    window.location.href = 'index.html';
}
