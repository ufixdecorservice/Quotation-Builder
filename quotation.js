/**
 * Quotation Form & CRUD Logic
 */

let currentItems = [];
let editingId = null;

function resetForm() {
    editingId = null;
    document.getElementById("form-title").innerText = "สร้างใบเสนอราคาใหม่";
    document.getElementById("qt-no").value = "";
    document.getElementById("qt-date").value = new Date().toISOString().split('T')[0];
    document.getElementById("cust-name").value = "";
    document.getElementById("cust-phone").value = "";
    document.getElementById("cust-email").value = "";
    document.getElementById("cust-address").value = "";
    
    currentItems = [];
    renderItemRows();
    addItemRow(); // Start with 1 empty row
    calculateTotals();
}

function addItemRow() {
    currentItems.push({ description: "", qty: 1, unit: "งาน", price: 0 });
    renderItemRows();
}

function removeItemRow(index) {
    currentItems.splice(index, 1);
    renderItemRows();
    calculateTotals();
}

function renderItemRows() {
    const tbody = document.getElementById("item-list-body");
    tbody.innerHTML = "";
    
    currentItems.forEach((item, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td><input type="text" value="${item.description}" onchange="updateItem(${index}, 'description', this.value)"></td>
            <td><input type="number" value="${item.qty}" onchange="updateItem(${index}, 'qty', this.value)"></td>
            <td><input type="text" value="${item.unit}" onchange="updateItem(${index}, 'unit', this.value)"></td>
            <td><input type="number" value="${item.price}" onchange="updateItem(${index}, 'price', this.value)"></td>
            <td>${(item.qty * item.price).toLocaleString()}</td>
            <td><button class="btn-sm btn-secondary" onclick="removeItemRow(${index})">×</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function updateItem(index, field, value) {
    if (field === 'qty' || field === 'price') value = Number(value);
    currentItems[index][field] = value;
    renderItemRows();
    calculateTotals();
}

function calculateTotals() {
    const subtotal = currentItems.reduce((sum, item) => sum + (item.qty * item.price), 0);
    const vat = subtotal * 0.07;
    const grandTotal = subtotal + vat;
    
    document.getElementById("sum-subtotal").innerText = subtotal.toLocaleString(undefined, {minimumFractionDigits: 2});
    document.getElementById("sum-vat").innerText = vat.toLocaleString(undefined, {minimumFractionDigits: 2});
    document.getElementById("sum-grandtotal").innerText = grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2});
}

async function saveQuotation() {
    const name = document.getElementById("cust-name").value;
    if (!name) return showToast("กรุณากรอกชื่อลูกค้า");
    
    const date = document.getElementById("qt-date").value;
    const year = new Date(date).getFullYear() + 543; // Thai Year
    
    // Auto Running No Logic (Simplified for client side, better if handled in GAS)
    let qtNo = document.getElementById("qt-no").value;
    if (!qtNo) {
        // ในระบบจริง ควรดึง Max ID จาก Sheet มาบวก 1
        qtNo = `QT-${year}-${Math.floor(Math.random() * 9000) + 1000}`; 
    }

    const payload = {
        id: editingId,
        quotationNo: qtNo,
        date: date,
        customerName: name,
        phone: document.getElementById("cust-phone").value,
        email: document.getElementById("cust-email").value,
        address: document.getElementById("cust-address").value,
        items: currentItems,
        subtotal: Number(document.getElementById("sum-subtotal").innerText.replace(/,/g, '')),
        vat: Number(document.getElementById("sum-vat").innerText.replace(/,/g, '')),
        grandTotal: Number(document.getElementById("sum-grandtotal").innerText.replace(/,/g, ''))
    };

    showLoading(true);
    try {
        const res = await callAPI("save", payload);
        if (res.status === "success") {
            showToast("บันทึกข้อมูลเรียบร้อยแล้ว: " + res.quotationNo);
            loadDashboard();
            switchSection("list-section");
        }
    } catch (err) {
        showToast("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
        showLoading(false);
    }
}

async function loadAllQuotations() {
    const res = await callAPI("list", {});
    const tbody = document.getElementById("full-table-body");
    tbody.innerHTML = "";
    
    res.data.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><b>${row.QuotationNo}</b></td>
            <td>${new Date(row.Date).toLocaleDateString('th-TH')}</td>
            <td>${row.CustomerName}</td>
            <td>${Number(row.GrandTotal).toLocaleString()}</td>
            <td>${new Date(row.CreatedAt).toLocaleString('th-TH')}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editQuotation('${row.ID}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-primary" onclick="printQuotation('${row.ID}')"><i class="fas fa-print"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}
