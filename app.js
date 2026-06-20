/* ==========================================================================
   Quotation Builder - Custom JavaScript Application Logic
   ========================================================================== */

// Default dummy data based on the PEAK Account example provided by the user
const defaultData = {
    theme: 'purple',
    docType: 'quotation', // quotation = Quotation, invoice = Work Completion & Invoice
    docCopyMode: 'both', // both = Set of 2, original = Original Only, copy = Copy Only
    documentNo: 'UF-00000000001',
    dateCreated: '2026-03-05',
    dateExpired: '2026-03-12',
    dateAccepted: '-',
    
    // Seller Info (UFIX)
    sellerName: 'บริษัท ยู ฟิกซ์เดคอร์ เซอร์วิส จำกัด',
    sellerTaxId: '0105568172403',
    sellerAddress: 'เลขที่ 873/10 หมู่บ้าน รีเจ้นท์โฮม บางซ่อน เฟส 27 ถนน ถนนกรุงเทพ-นนทบุรี แขวงบางซื่อ เขตบางซื่อ กรุงเทพมหานคร 10800',
    sellerPhone: '093-982-2684',
    sellerEmail: 'ufixdecor.service21@gmail.com',
    
    // Customer Info
    customerName: '-',
    customerTaxId: '-',
    customerAddress: '-',
    customerPhone: '-',
    customerEmail: '-',
    
    // Contact Person (For seller response)
    contactPerson: '-',
    contactPhone: '-',
    contactEmail: '-',
    
    // Bank Payment Info
    bankName: 'ธ.กสิกรไทย',
    bankAccNo: '218-1-93378-2',
    bankAccName: 'ยู ฟิกซ์เดคอร์ เซอร์วิส',
    bankBranch: 'ออมทรัพย์',
    
    // Calculation settings
    includeVat: true,
    whtRate: 0, // 0 = None, 1 = 1%, 3 = 3%
    
    // Document Items List
    items: [
        { seq: '1', desc: 'ใส่งานที่นี่', qty: 1, unit: 'งาน', price: 60000, isHeader: false },
        { seq: '2', desc: 'ใส่งานที่นี์', qty: 1, unit: 'งาน', price: 5000, isHeader: false },
    ],
    
    remark: 'เงื่อนไขการรับประกันงาน: รับประกันความพึงพอใจและโครงสร้างการแก้ไข 1 ปีเต็ม',
    paymentTerms: '30% เมื่อทำสัญญา\n40% ระหว่างดำเนินการแล้ว\n30% ตอนส่งมอบ',
    warranty: 'รับประกันงาน 5 ปี รวมวัสดุ',
    
    // Names for signatures
    sigCreatorName: 'มุรณี อูมา',
    sigCreatorDate: '15/06/2026',
    sigApproverName: 'มุรณี อูมา',
    sigApproverDate: '15/06/2026',
    sigCustomerName: 'นรินทร์ น้ำดอกไม้',
    sigCustomerDate: '15/06/2026'
};

// Sidebar Toggle Logic
function toggleSidebar() {
    const sidebar = document.getElementById('control-sidebar');
    const workspace = document.querySelector('.preview-workspace');
    
    if (sidebar) {
        // Toggle active class to track state
        sidebar.classList.toggle('active');
        
        // Directly manipulate left position for visibility
        if (sidebar.classList.contains('active')) {
            sidebar.style.left = '-420px'; // Hide
            if (workspace) workspace.style.marginLeft = '0';
        } else {
            sidebar.style.left = '0'; // Show
            if (workspace) workspace.style.marginLeft = 'var(--sidebar-width)';
        }
    }
}

// Global state
let currentData = {};

document.addEventListener('DOMContentLoaded', () => {
    try {
        initApp();
    } catch (e) {
        console.error('Error during initApp:', e);
    }
});

// Initialize the application with error isolation
function initApp() {
    // 1. Load Data
    try {
        loadData();
    } catch (e) {
        console.error('loadData failed, fallback used:', e);
        currentData = { ...defaultData };
    }
    
    // 2. Render Theme
    try {
        renderTheme(currentData.theme || 'purple');
    } catch (e) {
        console.error('renderTheme failed:', e);
    }

    // 3. Init Form Bindings
    try {
        initFormBindings();
    } catch (e) {
        console.error('initFormBindings failed:', e);
    }

    // 4. Calculate & Update View
    try {
        calculateTotals();
    } catch (e) {
        console.error('calculateTotals failed:', e);
    }

    // 5. Update Page Visibility
    try {
        updatePageVisibility();
    } catch (e) {
        console.error('updatePageVisibility failed:', e);
    }
    
    // 6. Bind Actions Listeners with checks to prevent crash if buttons are missing
    const bindBtn = (id, callback) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', callback);
        } else {
            console.warn(`Button with ID '${id}' was not found in DOM.`);
        }
    };

    bindBtn('btn-add-item-sidebar', () => addItem());
    // btn-add-item-preview is dynamic, binding is handled in generatePageHtml via onclick
    bindBtn('btn-download-pdf', downloadPDF);
    bindBtn('btn-print', async () => {
        const btn = document.getElementById('btn-print');
        const originalText = btn ? btn.innerHTML : '';
        if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังบันทึกข้อมูล...';
        await saveToCloud(currentData);
        if (btn) btn.innerHTML = originalText;
        window.print();
    });
    bindBtn('btn-save-draft', saveDraft);
    bindBtn('btn-load-sample', loadSampleData);
    bindBtn('btn-reset', resetForm);
    
    // Theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const theme = e.currentTarget.dataset.theme;
            setTheme(theme);
        });
    });
}

// Theme Management
function setTheme(theme) {
    currentData.theme = theme;
    renderTheme(theme);
    // Save state
    localStorage.setItem('quotation_builder_data', JSON.stringify(currentData));
}

function renderTheme(theme) {
    const colors = {
        purple: { primary: '#6c6df2', hover: '#5859d6', light: 'rgba(108, 109, 242, 0.08)' },
        orange: { primary: '#ed8936', hover: '#dd6b20', light: 'rgba(237, 137, 54, 0.08)' },
        blue: { primary: '#3182ce', hover: '#2b6cb0', light: 'rgba(49, 130, 206, 0.08)' },
        green: { primary: '#38a169', hover: '#2f855a', light: 'rgba(56, 161, 105, 0.08)' }
    };
    
    const themeColors = colors[theme] || colors.purple;
    const root = document.documentElement;
    
    root.style.setProperty('--primary-color', themeColors.primary);
    root.style.setProperty('--primary-color-hover', themeColors.hover);
    root.style.setProperty('--primary-color-light', themeColors.light);
    
    // Update active state of buttons in UI
    document.querySelectorAll('.theme-btn').forEach(btn => {
        if (btn.dataset.theme === theme) {
            btn.style.boxShadow = '0 0 0 3px var(--primary-color-light), 0 0 0 5px white';
            btn.style.transform = 'scale(1.15)';
        } else {
            btn.style.boxShadow = '0 0 0 1px var(--border-color)';
            btn.style.transform = 'scale(1)';
        }
    });
}

// Load data with safe merge to prevent undefined errors from stale data
function loadData() {
    const saved = localStorage.getItem('quotation_builder_data');
    currentData = { ...defaultData };
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            currentData = Object.assign(currentData, parsed);
        } catch (e) {
            console.error('JSON Parse error on loaded data:', e);
        }
    }
}

// Save current state as draft
async function saveDraft() {
    localStorage.setItem('quotation_builder_data', JSON.stringify(currentData));
    
    // Sync to Cloud (Enterprise v2.0)
    const btn = document.getElementById('btn-save-draft');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังบันทึก...';

    const success = await saveToCloud(currentData);
    
    btn.disabled = false;
    btn.innerHTML = originalText;

    if (success) {
        alert('บันทึกข้อมูลลงระบบ Cloud สำเร็จแล้ว!');
    } else {
        alert('บันทึกแบบร่างลงเครื่องสำเร็จ (แต่ยังไม่ได้ส่งขึ้น Cloud)');
    }
}

// Load default template data
function loadSampleData() {
    if (confirm('คุณต้องการโหลดข้อมูลตัวอย่างเริ่มต้นใช่หรือไม่? (ข้อมูลปัจจุบันจะถูกเขียนทับ)')) {
        currentData = JSON.parse(JSON.stringify(defaultData));
        calculateTotals();
        syncDataToForm();
        renderTheme(currentData.theme);
        updatePageVisibility();
        alert('โหลดข้อมูลตัวอย่างสำเร็จแล้ว!');
    }
}

// Reset Form to blank state
function resetForm() {
    if (confirm('คุณต้องการเริ่มสร้างใหม่ทั้งหมดใช่หรือไม่?')) {
        currentData = {
            theme: 'purple',
            docType: 'quotation',
            docCopyMode: 'both',
            documentNo: 'QO-' + new Date().getFullYear() + String(new Date().getMonth() + 1).padStart(2, '0') + '00001',
            dateCreated: new Date().toISOString().split('T')[0],
            dateExpired: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            dateAccepted: '-',
            sellerName: '', sellerTaxId: '', sellerAddress: '', sellerPhone: '', sellerEmail: '',
            customerName: '', customerTaxId: '', customerAddress: '', customerPhone: '', customerEmail: '',
            contactPerson: '', contactPhone: '', contactEmail: '',
            bankName: 'ธ.กสิกรไทย', bankAccNo: '', bankAccName: '', bankBranch: 'ออมทรัพย์',
            includeVat: true,
            whtRate: 0,
            items: [{ seq: '1', desc: '', qty: 1, unit: 'งาน', price: 0, isHeader: false }],
            remark: '',
            paymentTerms: '',
            warranty: '',
            sigCreatorName: '', sigCreatorDate: '',
            sigApproverName: '', sigApproverDate: '',
            sigCustomerName: '', sigCustomerDate: ''
        };
        calculateTotals();
        syncDataToForm();
        updatePageVisibility();
    }
}

// Initialize form value bindings (three-way binding: sidebar, all original pages, all copy pages)
function initFormBindings() {
    const bindField = (inputId, previewClass, dataKey) => {
        const input = document.getElementById(inputId);
        
        if (input) {
            // Set initial values
            input.value = currentData[dataKey] || '';
            document.querySelectorAll('.' + previewClass).forEach(el => {
                el.innerText = currentData[dataKey] || '';
            });
            
            // Input updates state and all previews
            input.addEventListener('input', (e) => {
                currentData[dataKey] = e.target.value;
                document.querySelectorAll('.' + previewClass).forEach(el => {
                    el.innerText = e.target.value;
                });
            });
            
            // Preview edits (delegated to document for dynamic elements)
            document.addEventListener('blur', (e) => {
                if (e.target.classList.contains(previewClass)) {
                    currentData[dataKey] = e.target.innerText;
                    input.value = e.target.innerText;
                    // Sync other previews of the same class
                    document.querySelectorAll('.' + previewClass).forEach(el => {
                        if (el !== e.target) el.innerText = e.target.innerText;
                    });
                }
            }, true);
        }
    };

    // Document Details
    bindField('inp-doc-no', 'prev-doc-no', 'documentNo');
    bindField('inp-date-created', 'prev-date-created', 'dateCreated');
    bindField('inp-date-expired', 'prev-date-expired', 'dateExpired');
    bindField('inp-date-accepted', 'prev-date-accepted', 'dateAccepted');

    // Seller Info
    bindField('inp-seller-name', 'prev-seller-name', 'sellerName');
    bindField('inp-seller-tax', 'prev-seller-tax', 'sellerTaxId');
    bindField('inp-seller-address', 'prev-seller-address', 'sellerAddress');
    bindField('inp-seller-phone', 'prev-seller-phone', 'sellerPhone');
    bindField('inp-seller-email', 'prev-seller-email', 'sellerEmail');
    
    // Customer Info
    bindField('inp-customer-name', 'prev-customer-name', 'customerName');
    bindField('inp-customer-tax', 'prev-customer-tax', 'customerTaxId');
    bindField('inp-customer-address', 'prev-customer-address', 'customerAddress');
    bindField('inp-customer-phone', 'prev-customer-phone', 'customerPhone');
    bindField('inp-customer-email', 'prev-customer-email', 'customerEmail');
    
    // Contact Person
    bindField('inp-contact-person', 'prev-contact-person', 'contactPerson');
    bindField('inp-contact-phone', 'prev-contact-phone', 'contactPhone');
    bindField('inp-contact-email', 'prev-contact-email', 'contactEmail');

    // Bank Info
    bindField('inp-bank-name', 'prev-bank-name', 'bankName');
    bindField('inp-bank-acc-no', 'prev-bank-acc-no', 'bankAccNo');
    bindField('inp-bank-acc-name', 'prev-bank-acc-name', 'bankAccName');
    bindField('inp-bank-branch', 'prev-bank-branch', 'bankBranch');
    
    // Remark & Extra Info
    bindField('inp-remark', 'prev-remark', 'remark');
    bindField('inp-payment-terms', 'prev-payment-terms', 'paymentTerms');
    bindField('inp-warranty', 'prev-warranty', 'warranty');
    
    // Signature Names
    bindField('inp-sig-creator-name', 'prev-sig-creator-name', 'sigCreatorName');
    bindField('inp-sig-creator-date', 'prev-sig-creator-date', 'sigCreatorDate');
    bindField('inp-sig-approver-name', 'prev-sig-approver-name', 'sigApproverName');
    bindField('inp-sig-approver-date', 'prev-sig-approver-date', 'sigApproverDate');
    bindField('inp-sig-customer-name', 'prev-sig-customer-name', 'sigCustomerName');
    bindField('inp-sig-customer-date', 'prev-sig-customer-date', 'sigCustomerDate');
    
    // Checkbox & Select bindings
    const inpIncludeVat = document.getElementById('inp-include-vat');
    if (inpIncludeVat) {
        inpIncludeVat.checked = currentData.includeVat;
        inpIncludeVat.addEventListener('change', (e) => {
            currentData.includeVat = e.target.checked;
            calculateTotals();
        });
    }
    
    const inpWhtRate = document.getElementById('inp-wht-rate');
    if (inpWhtRate) {
        inpWhtRate.value = currentData.whtRate;
        inpWhtRate.addEventListener('change', (e) => {
            currentData.whtRate = parseInt(e.target.value);
            calculateTotals();
        });
    }

    const inpDocType = document.getElementById('inp-doc-type');
    if (inpDocType) {
        inpDocType.value = currentData.docType || 'quotation';
        inpDocType.addEventListener('change', (e) => {
            currentData.docType = e.target.value;
            const mobilePreviewSpan = document.querySelector('#btn-mobile-preview span');
            if (mobilePreviewSpan) {
                mobilePreviewSpan.innerText = e.target.value === 'invoice' ? 'ดูใบส่งมอบงาน' : 'ดูใบเสนอราคา';
            }
            renderPreview();
        });
    }

    const inpDocCopyMode = document.getElementById('inp-doc-copy-mode');
    if (inpDocCopyMode) {
        inpDocCopyMode.value = currentData.docCopyMode;
        inpDocCopyMode.addEventListener('change', (e) => {
            currentData.docCopyMode = e.target.value;
            renderItems();
        });
    }

    renderItems();
}

// Sync currentData back to form inputs (used after loading draft/sample)
function syncDataToForm() {
    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val || '';
    };
    const setAllHtml = (cls, val) => {
        document.querySelectorAll('.' + cls).forEach(el => {
            el.innerText = val || '';
        });
    };

    setVal('inp-doc-no', currentData.documentNo);
    setAllHtml('prev-doc-no', currentData.documentNo);

    setVal('inp-date-created', currentData.dateCreated);
    setAllHtml('prev-date-created', currentData.dateCreated);

    setVal('inp-date-expired', currentData.dateExpired);
    setAllHtml('prev-date-expired', currentData.dateExpired);

    setVal('inp-date-accepted', currentData.dateAccepted);
    setAllHtml('prev-date-accepted', currentData.dateAccepted);

    // Parties Info
    setVal('inp-seller-name', currentData.sellerName);
    setAllHtml('prev-seller-name', currentData.sellerName);

    setVal('inp-seller-tax', currentData.sellerTaxId);
    setAllHtml('prev-seller-tax', currentData.sellerTaxId);

    setVal('inp-seller-address', currentData.sellerAddress);
    setAllHtml('prev-seller-address', currentData.sellerAddress);

    setVal('inp-seller-phone', currentData.sellerPhone);
    setAllHtml('prev-seller-phone', currentData.sellerPhone);

    setVal('inp-seller-email', currentData.sellerEmail);
    setAllHtml('prev-seller-email', currentData.sellerEmail);

    setVal('inp-customer-name', currentData.customerName);
    setAllHtml('prev-customer-name', currentData.customerName);

    setVal('inp-customer-tax', currentData.customerTaxId);
    setAllHtml('prev-customer-tax', currentData.customerTaxId);

    setVal('inp-customer-address', currentData.customerAddress);
    setAllHtml('prev-customer-address', currentData.customerAddress);

    setVal('inp-customer-phone', currentData.customerPhone);
    setAllHtml('prev-customer-phone', currentData.customerPhone);

    setVal('inp-customer-email', currentData.customerEmail);
    setAllHtml('prev-customer-email', currentData.customerEmail);

    // Contact Person
    setVal('inp-contact-person', currentData.contactPerson);
    setAllHtml('prev-contact-person', currentData.contactPerson);

    setVal('inp-contact-phone', currentData.contactPhone);
    setAllHtml('prev-contact-phone', currentData.contactPhone);

    setVal('inp-contact-email', currentData.contactEmail);
    setAllHtml('prev-contact-email', currentData.contactEmail);

    // Bank
    setVal('inp-bank-name', currentData.bankName);
    setAllHtml('prev-bank-name', currentData.bankName);

    setVal('inp-bank-acc-no', currentData.bankAccNo);
    setAllHtml('prev-bank-acc-no', currentData.bankAccNo);

    setVal('inp-bank-acc-name', currentData.bankAccName);
    setAllHtml('prev-bank-acc-name', currentData.bankAccName);

    setVal('inp-bank-branch', currentData.bankBranch);
    setAllHtml('prev-bank-branch', currentData.bankBranch);

    // Remark & Settings
    setVal('inp-remark', currentData.remark);
    setAllHtml('prev-remark', currentData.remark);
    
    setVal('inp-payment-terms', currentData.paymentTerms);
    setAllHtml('prev-payment-terms', currentData.paymentTerms);
    
    setVal('inp-warranty', currentData.warranty);
    setAllHtml('prev-warranty', currentData.warranty);
    
    // Signatures
    setVal('inp-sig-creator-name', currentData.sigCreatorName);
    setAllHtml('prev-sig-creator-name', currentData.sigCreatorName);

    setVal('inp-sig-creator-date', currentData.sigCreatorDate);
    setAllHtml('prev-sig-creator-date', currentData.sigCreatorDate);
    
    setVal('inp-sig-approver-name', currentData.sigApproverName);
    setAllHtml('prev-sig-approver-name', currentData.sigApproverName);

    setVal('inp-sig-approver-date', currentData.sigApproverDate);
    setAllHtml('prev-sig-approver-date', currentData.sigApproverDate);
    
    setVal('inp-sig-customer-name', currentData.sigCustomerName);
    setAllHtml('prev-sig-customer-name', currentData.sigCustomerName);

    setVal('inp-sig-customer-date', currentData.sigCustomerDate);
    setAllHtml('prev-sig-customer-date', currentData.sigCustomerDate);

    const checkEl = (id, check) => {
        const el = document.getElementById(id);
        if (el) el.checked = check;
    };
    const setValEl = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
    };

    checkEl('inp-include-vat', currentData.includeVat);
    setValEl('inp-wht-rate', currentData.whtRate);
    setValEl('inp-doc-type', currentData.docType || 'quotation');
    
    const mobilePreviewSpan = document.querySelector('#btn-mobile-preview span');
    if (mobilePreviewSpan) {
        mobilePreviewSpan.innerText = currentData.docType === 'invoice' ? 'ดูใบส่งมอบงาน' : 'ดูใบเสนอราคา';
    }

    setValEl('inp-doc-copy-mode', currentData.docCopyMode);

    // Update QR Codes dynamically
    const prevQrImgs = document.querySelectorAll('.prev-qr-code');
    const qrContainers = document.querySelectorAll('.qr-code-box');
    
    if (currentData.documentNo && currentData.documentNo.trim() !== '') {
        const viewUrl = GSheetAPI.URL + '?action=view&id=' + encodeURIComponent(currentData.documentNo);
        const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + encodeURIComponent(viewUrl);
        prevQrImgs.forEach(img => {
            img.src = qrUrl;
        });
        qrContainers.forEach(container => {
            container.style.display = 'flex';
        });
    } else {
        qrContainers.forEach(container => {
            container.style.display = 'none';
        });
    }
}

// Control Pages Display & Page Numbers dynamically
function updatePageVisibility() {
    // This is now handled by renderItems
    renderItems();
}

// Item Table Management
function renderItems() {
    renderSidebar();
    renderPreview();
}

function renderSidebar() {
    const listContainer = document.getElementById('sidebar-items-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    currentData.items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'sidebar-section';
        div.style.marginBottom = '10px';
        div.style.padding = '10px';
        div.style.backgroundColor = item.isHeader ? '#f3f0ff' : '#ffffff';
        div.style.borderLeft = item.isHeader ? '4px solid var(--primary-color)' : 'none';
        
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span style="font-weight:600; font-size:0.8rem; color:${item.isHeader ? 'var(--primary-color)' : 'inherit'}">รายการที่ ${index + 1} ${item.isHeader ? '(หัวข้อหลัก)' : ''}</span>
                <div style="display:flex; gap:10px; align-items:center;">
                    <label style="margin:0; font-size:0.75rem; display:flex; align-items:center; gap:4px; cursor:pointer;">
                        <input type="checkbox" ${item.isHeader ? 'checked' : ''} onchange="updateItemField(${index}, 'isHeader', this.checked)"> หัวข้อหลัก
                    </label>
                    <button class="row-actions-btn" style="opacity:1; color:var(--danger-color); padding:0; background:none; border:none; cursor:pointer;" onclick="deleteItem(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div style="display:grid; grid-template-columns: 80px 1fr; gap:10px; margin-bottom:12px;">
                <div class="form-group" style="margin-bottom:0;">
                    <label>ลำดับ</label>
                    <input type="text" class="form-control" value="${item.seq !== undefined && item.seq !== null ? item.seq : index + 1}" oninput="updateItemField(${index}, 'seq', this.value)">
                </div>
                <div class="form-group" style="margin-bottom:0;">
                    <label>รายละเอียด</label>
                    <input type="text" class="form-control" placeholder="${item.isHeader ? 'ระบุรายละเอียดหัวข้อหลัก (เช่น ขอบเขตงาน หรือพาร์ทงาน)' : 'รายละเอียดรายการงาน'}" value="${item.desc}" oninput="updateItemField(${index}, 'desc', this.value)">
                </div>
            </div>
            <div class="row-2" style="${item.isHeader ? 'display:none;' : ''}">
                <div class="form-group">
                    <label>จำนวน</label>
                    <input type="number" step="any" class="form-control" value="${item.qty}" oninput="updateItemField(${index}, 'qty', this.value)">
                </div>
                <div class="form-group">
                    <label>หน่วย</label>
                    <input type="text" class="form-control" value="${item.unit}" oninput="updateItemField(${index}, 'unit', this.value)">
                </div>
            </div>
            <div class="form-group" style="margin-bottom:0; ${item.isHeader ? 'display:none;' : ''}">
                <label>ราคาต่อหน่วย (บาท)</label>
                <input type="number" step="any" class="form-control" value="${item.price}" oninput="updateItemField(${index}, 'price', this.value)">
            </div>
        `;
        listContainer.appendChild(div);
    });
}

// Helper to calculate estimated lines for an item description
const getItemLines = (item) => {
    const desc = item.desc || '';
    const lines = desc.split('\n');
    let count = 0;
    const charsPerLine = 45; // Estimated character length before auto-wrapping in CSS
    
    lines.forEach(line => {
        const lineLength = line.length;
        count += Math.max(1, Math.ceil(lineLength / charsPerLine));
    });
    
    return count;
};

// Helper to split items based on line count (Max 16 lines per page)
const splitItems = (items) => {
    const pages = [];
    if (items.length === 0) return [[]];
    
    let currentPage = [];
    let currentLines = 0;
    const maxLinesPerPage = 16;
    
    items.forEach((item, index) => {
        const itemLines = getItemLines(item);
        
        // If page is not empty and adding this item exceeds the line limit, push to new page
        if (currentPage.length > 0 && currentLines + itemLines > maxLinesPerPage) {
            pages.push(currentPage);
            currentPage = [];
            currentLines = 0;
        }
        
        currentPage.push({ item, index });
        currentLines += itemLines;
    });
    
    if (currentPage.length > 0) {
        pages.push(currentPage);
    }
    
    return pages;
};

function renderPreview() {
    const printArea = document.getElementById('print-area');
    if (!printArea) return;
    
    printArea.innerHTML = '';
    
    const itemPages = splitItems(currentData.items);
    const totalPages = itemPages.length;

    // Generate Original Pages
    if (currentData.docCopyMode === 'both' || currentData.docCopyMode === 'original') {
        itemPages.forEach((items, idx) => {
            const pageHtml = generatePageHtml('original', idx + 1, totalPages, items, idx === totalPages - 1);
            printArea.insertAdjacentHTML('beforeend', pageHtml);
        });
    }

    // Generate Copy Pages
    if (currentData.docCopyMode === 'both' || currentData.docCopyMode === 'copy') {
        itemPages.forEach((items, idx) => {
            const pageHtml = generatePageHtml('copy', idx + 1, totalPages, items, idx === totalPages - 1);
            printArea.insertAdjacentHTML('beforeend', pageHtml);
        });
    }

    // Sync all data to the newly created elements
    syncDataToForm();
    calculateTotals();
}

function generatePageHtml(type, pageNum, totalPages, items, isLastPage) {
    const isCopy = type === 'copy';
    const typeLabel = isCopy ? '(สำเนา)' : '(ต้นฉบับ)';
    const suffix = isCopy ? '-copy' : '';
    const pageId = isCopy ? `page-copy-${pageNum}` : `page-orig-${pageNum}`;
    const badgeStyle = (currentData.docCopyMode === 'both') ? '' : 'display:none;';
    
    const isInvoice = currentData.docType === 'invoice';
    const docTitleHtml = isInvoice 
        ? `ใบส่งมอบงานและใบเรียกเก็บเงิน<br><span style="font-size: 10px; font-weight: 600; color: var(--text-muted); display: block; margin-top: 2px;">Work Completion & Invoice</span>`
        : `ใบเสนอราคา`;
    
    // Build table rows
    let rowsHtml = '';
    
    items.forEach((itemWrapper) => {
        const item = itemWrapper.item;
        const globalIndex = itemWrapper.index;
        const seqValue = item.seq !== undefined && item.seq !== null ? item.seq : (globalIndex + 1);
        
        if (item.isHeader) {
            rowsHtml += `
                <tr class="item-row item-row-header">
                    <td class="center" contenteditable="true" onblur="updateItemField(${globalIndex}, 'seq', this.innerText)">${seqValue}</td>
                    <td><div class="item-desc" contenteditable="true" onblur="updateItemField(${globalIndex}, 'desc', this.innerText)">${item.desc}</div></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            `;
        } else {
            const amount = item.qty * item.price;
            rowsHtml += `
                <tr class="item-row">
                    <td class="center" contenteditable="true" onblur="updateItemField(${globalIndex}, 'seq', this.innerText)">${seqValue}</td>
                    <td><div class="item-desc" contenteditable="true" onblur="updateItemField(${globalIndex}, 'desc', this.innerText)">${item.desc}</div></td>
                    <td class="right" contenteditable="true" onblur="updateItemField(${globalIndex}, 'qty', this.innerText)">${formatNumber(item.qty)}</td>
                    <td class="center" contenteditable="true" onblur="updateItemField(${globalIndex}, 'unit', this.innerText)">${item.unit}</td>
                    <td class="right" contenteditable="true" onblur="updateItemField(${globalIndex}, 'price', this.innerText)">${formatNumber(item.price)}</td>
                    <td class="right">${formatNumber(amount)}</td>
                </tr>
            `;
        }
    });

    // Header HTML
    const headerHtml = `
        <div class="doc-header">
            <div>
                <img src="./assets/logo.png" alt="UFIX Logo" class="doc-logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="doc-logo-placeholder" style="display:none;">
                    <i class="fas fa-image"></i>
                </div>
            </div>
            <div class="doc-meta-right">
                <div style="display: flex; align-items: center; justify-content: flex-end; gap: 5px;">
                    <span class="doc-set-badge" style="${badgeStyle}">เอกสารออกเป็นชุด</span>
                    <span class="doc-page-num">หน้า ${pageNum}/${totalPages}</span>
                </div>
                <span class="doc-title-badge">${typeLabel}</span>
                <h2 class="doc-title" style="${isInvoice ? 'font-size: 17px; line-height: 1.2; margin-top: 8px;' : ''}">${docTitleHtml}</h2>
            </div>
        </div>
    `;

    // Parties & Info (same on all pages)
    const partiesHtml = `
        <div class="parties-info">
            <div class="seller-box">
                <div class="party-title">ผู้ขาย :</div>
                <div class="party-name prev-seller-name" contenteditable="true"></div>
                <div class="party-details">
                    <p><i class="fas fa-map-marker-alt"></i> <span class="prev-seller-address" contenteditable="true"></span></p>
                    <p><i class="fas fa-phone-alt"></i> <span class="prev-seller-phone" contenteditable="true"></span></p>
                    <p><i class="fas fa-envelope"></i> <span class="prev-seller-email" contenteditable="true"></span></p>
                    <p><i class="fas fa-file-invoice"></i> เลขที่ภาษี: <span class="prev-seller-tax" contenteditable="true"></span></p>
                </div>
            </div>
            <div class="customer-box">
                <div class="party-title">ลูกค้า :</div>
                <div class="party-name prev-customer-name" contenteditable="true"></div>
                <div class="party-details">
                    <p><i class="fas fa-map-marker-alt"></i> <span class="prev-customer-address" contenteditable="true"></span></p>
                    <p><i class="fas fa-phone-alt"></i> <span class="prev-customer-phone" contenteditable="true"></span></p>
                    <p><i class="fas fa-envelope"></i> <span class="prev-customer-email" contenteditable="true"></span></p>
                    <p><i class="fas fa-file-invoice"></i> เลขที่ภาษี: <span class="prev-customer-tax" contenteditable="true"></span></p>
                </div>
            </div>
        </div>
        <div class="doc-info-grid">
            <div class="info-item"><div class="label">เลขที่เอกสาร</div><div class="value prev-doc-no" contenteditable="true"></div></div>
            <div class="info-item"><div class="label">วันที่ออก</div><div class="value prev-date-created" contenteditable="true"></div></div>
            <div class="info-item"><div class="label">วันที่ตอบรับ</div><div class="value prev-date-accepted" contenteditable="true"></div></div>
            <div class="info-item"><div class="label">ใช้ได้ถึง</div><div class="value prev-date-expired" contenteditable="true"></div></div>
        </div>
        <div style="font-size: 9.5px; border-bottom: 1.5px solid var(--border-color); padding-bottom: 6px; margin-bottom: 15px; display: flex; gap: 20px;">
            <span style="font-weight: 700; color: var(--text-muted);">ติดต่อกลับที่ :</span>
            <span><i class="fas fa-user"></i> <span class="prev-contact-person" contenteditable="true"></span></span>
            <span><i class="fas fa-phone-alt"></i> <span class="prev-contact-phone" contenteditable="true"></span></span>
            <span><i class="fas fa-envelope"></i> <span class="prev-contact-email" contenteditable="true"></span></span>
        </div>
    `;

    // Footer HTML (only on last page)
    let footerHtml = '';
    if (isLastPage) {
        footerHtml = `
            <div class="doc-footer-container">
                <div class="doc-footer-summary">
                    <div class="summary-left" style="display: flex; flex-direction: column; gap: 4px;">
                        <div>
                            <div class="grand-total-thai-box" style="margin-bottom: 6px;">
                                <i class="fas fa-comment-dollar"></i>
                                <span class="grand-total-thai-text prev-grand-total-thai"></span>
                            </div>
                            <div class="payment-box" style="display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 6px 10px; margin-bottom: 6px;">
                                <div style="display: flex; align-items: center;">
                                    <img src="./assets/kbank.png" alt="Bank Logo" class="bank-logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                    <div class="bank-logo-placeholder" style="display:none; width:30px; height:30px; background:#f0f2f5; align-items:center; justify-content:center; border-radius:4px; margin-right:8px;">
                                        <i class="fas fa-university" style="color:#cbd5e0; font-size: 14px;"></i>
                                    </div>
                                    <div class="bank-details" style="font-size: 8px; line-height: 1.2;">
                                        <span class="bank-name prev-bank-name" contenteditable="true"></span>
                                        <span class="acc-no prev-bank-acc-no" contenteditable="true"></span>
                                        <div class="acc-name prev-bank-acc-name" contenteditable="true"></div>
                                        <div style="font-size: 7px;" class="prev-bank-branch" contenteditable="true"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="footer-extra-info" style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 7.5px; line-height: 1.25;">
                            <div class="payment-terms-box" style="border: 1px solid var(--border-color); border-radius: 6px; padding: 4px 6px; background: #fafafa;">
                                <div style="font-weight: 700; color: var(--text-main); margin-bottom: 1px;">เงื่อนไขการชำระเงิน</div>
                                <div class="prev-payment-terms" contenteditable="true" style="height: 5em; overflow: hidden; white-space: pre-line; color: var(--text-muted);"></div>
                            </div>
                            <div class="warranty-box" style="border: 1px solid var(--border-color); border-radius: 6px; padding: 4px 6px; background: #fafafa;">
                                <div style="font-weight: 700; color: var(--text-main); margin-bottom: 1px;">การรับประกันงาน</div>
                                <div class="prev-warranty" contenteditable="true" style="height: 2.5em; overflow: hidden; white-space: pre-line; color: var(--text-muted);"></div>
                            </div>
                        </div>
                    </div>
                    <div class="summary-right">
                        <table class="calc-table">
                            <tr><td>${isInvoice ? 'มูลค่าตามใบแจ้งหนี้:' : 'มูลค่าตามใบเสนอราคา:'}</td><td class="prev-subtotal"></td></tr>
                            <tr class="prev-vat-row"><td>ภาษีมูลค่าเพิ่ม (VAT 7%):</td><td class="prev-vat"></td></tr>
                            <tr class="total-row"><td>จำนวนเงินทั้งสิ้น:</td><td class="prev-grand-total"></td></tr>
                            <tr class="prev-wht-row" style="display:none;"><td class="prev-wht-label"></td><td class="prev-wht-amount"></td></tr>
                            <tr><td style="font-weight: 700;">จำนวนเงินสุทธิที่ต้องชำระ:</td><td class="prev-payment-amount" style="font-weight: 700;"></td></tr>
                        </table>
                    </div>
                </div>
                <div class="doc-remark" style="margin-top: 4px;">
                    <div class="title"><i class="fas fa-sticky-note"></i> หมายเหตุ :</div>
                    <div class="prev-remark" contenteditable="true" style="height: 2.6em; overflow: hidden; line-height: 1.3; white-space: pre-line;"></div>
                </div>
                <div class="signatures-grid">
                    <div class="sig-box">
                        <div class="sig-title">ผู้ออกเอกสาร (ผู้ขาย)</div>
                        <div class="sig-area" style="height: 35px; border-bottom: 1.5px dashed var(--border-color); margin-bottom: 4px;"></div>
                        <div class="sig-name prev-sig-creator-name" contenteditable="true"></div>
                        <div class="sig-date prev-sig-creator-date" contenteditable="true"></div>
                    </div>
                    <div class="sig-box">
                        <div class="sig-title">ผู้อนุมัติเอกสาร (ผู้ขาย)</div>
                        <div class="sig-area" style="height: 35px; border-bottom: 1.5px dashed var(--border-color); margin-bottom: 4px;"></div>
                        <div class="sig-name prev-sig-approver-name" contenteditable="true"></div>
                        <div class="sig-date prev-sig-approver-date" contenteditable="true"></div>
                    </div>
                    <div class="sig-box">
                        <div class="sig-title">${isInvoice ? 'ผู้รับมอบงาน / ผู้ตรวจรับ' : 'ผู้รับเอกสาร (ลูกค้า)'}</div>
                        <div style="position: relative;">
                            <div class="sig-area" style="height: 35px; border-bottom: 1.5px dashed var(--border-color); margin-bottom: 4px;"></div>
                            <div class="sig-stamp-placeholder" style="position: absolute; top: -5px; right: 0; width: 45px; height: 45px; border: 1.5px dotted #ccc; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #ccc; pointer-events: none; transform: rotate(15deg);">ตราประทับ</div>
                        </div>
                        <div class="sig-name prev-sig-customer-name" contenteditable="true"></div>
                        <div class="sig-date prev-sig-customer-date" contenteditable="true"></div>
                    </div>
                </div>
            </div>
        `;
    }

    // Continued on next page message
    const continuedHtml = !isLastPage ? `
        <div class="continued-message">
            <i class="fas fa-arrow-down"></i> --- มีต่อหน้าถัดไป / Continued on next page ---
        </div>
    ` : '';

    return `
        <div id="${pageId}" class="a4-page">
            <div class="page-content-wrapper" style="padding: 10mm; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    ${headerHtml}
                    ${partiesHtml}
                    <div class="items-table-container">
                        <table class="items-table">
                            <thead>
                                <tr><th>ลำดับ</th><th>รายละเอียดรายการงาน</th><th style="text-align: right;">จำนวน</th><th style="text-align: center;">หน่วย</th><th style="text-align: right;">ราคาต่อหน่วย</th><th style="text-align: right;">จำนวนเงิน (บาท)</th></tr>
                            </thead>
                            <tbody>${rowsHtml}</tbody>
                        </table>
                        ${isLastPage ? `<div class="add-row-container"><button class="btn-add-item-preview" onclick="addItem()"><i class="fas fa-plus-circle"></i> เพิ่มแถวรายการใหม่</button></div>` : continuedHtml}
                    </div>
                </div>
                ${footerHtml}
            </div>
        </div>
    `;
}

function updateItemField(index, field, value) {
    if (field === 'qty' || field === 'price') {
        const val = parseFloat(value.replace(/,/g, ''));
        currentData.items[index][field] = isNaN(val) ? 0 : val;
    } else if (field === 'isHeader') {
        currentData.items[index][field] = !!value;
    } else if (field === 'seq') {
        currentData.items[index][field] = value;
    } else {
        currentData.items[index][field] = value;
    }
    
    // Calculate totals to update all pages
    calculateTotals();
    
    // Update preview A4 only
    renderPreview();
    
    // If toggling header mode, recreate sidebar fields to hide price inputs
    if (field === 'isHeader') {
        renderSidebar();
    }
}

function addItem() {
    const nextSeq = currentData.items.length + 1;
    currentData.items.push({ seq: String(nextSeq), desc: '', qty: 1, unit: 'งาน', price: 0, isHeader: false });
    renderItems();
}

function deleteItem(index) {
    if (currentData.items.length <= 1) {
        alert('จำเป็นต้องมีอย่างน้อย 1 รายการครับ');
        return;
    }
    currentData.items.splice(index, 1);
    renderItems();
}

// Financial Calculations (Calculates and syncs all Pages)
function calculateTotals() {
    let subtotal = 0;
    currentData.items.forEach(item => {
        if (!item.isHeader) {
            subtotal += (item.qty || 0) * (item.price || 0);
        }
    });
    
    let vat = 0;
    if (currentData.includeVat) {
        vat = subtotal * 0.07;
    }
    
    const grandTotal = subtotal + vat;
    
    let whtAmount = 0;
    if (currentData.whtRate > 0) {
        whtAmount = subtotal * (currentData.whtRate / 100);
    }
    
    const paymentAmount = grandTotal - whtAmount;
    const bahtThaiString = bahtText(grandTotal);
    
    // Store calculated totals in currentData for cloud persistence
    currentData.subtotal = subtotal;
    currentData.vat = vat;
    currentData.grandTotal = grandTotal;
    currentData.whtAmount = whtAmount;
    currentData.paymentAmount = paymentAmount;
    currentData.grandTotalThai = bahtThaiString;
    
    // Update all occurrences in preview
    const updateAll = (cls, val) => {
        document.querySelectorAll('.' + cls).forEach(el => { el.innerText = val; });
    };

    updateAll('prev-subtotal', formatNumber(subtotal) + ' บาท');
    
    document.querySelectorAll('.prev-vat-row').forEach(row => {
        row.style.display = currentData.includeVat ? 'table-row' : 'none';
    });
    updateAll('prev-vat', formatNumber(vat) + ' บาท');
    updateAll('prev-grand-total', formatNumber(grandTotal) + ' บาท');
    updateAll('prev-grand-total-thai', bahtThaiString);
    
    document.querySelectorAll('.prev-wht-row').forEach(row => {
        row.style.display = currentData.whtRate > 0 ? 'table-row' : 'none';
    });
    updateAll('prev-wht-label', `จำนวนเงินที่ถูกหัก ณ ที่จ่าย (${currentData.whtRate}%)`);
    updateAll('prev-wht-amount', formatNumber(whtAmount) + ' บาท');
    updateAll('prev-payment-amount', formatNumber(paymentAmount) + ' บาท');
}


// Number Formatting Helpers
function formatNumber(num) {
    return parseFloat(num).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Thai Baht Text Conversion
function bahtText(num) {
    if (num === null || num === undefined || isNaN(num)) return "ศูนย์บาทถ้วน";
    num = parseFloat(num).toFixed(2);
    let [integerPart, decimalPart] = num.split(".");
    
    let result = "";
    
    if (parseInt(integerPart) === 0 && parseInt(decimalPart) === 0) {
        return "ศูนย์บาทถ้วน";
    }
    
    if (parseInt(integerPart) > 0) {
        result += convertSection(integerPart) + "บาท";
    }
    
    if (parseInt(decimalPart) === 0) {
        result += "ถ้วน";
    } else {
        result += convertSection(decimalPart) + "สตางค์";
    }
    
    return result;
}

function convertSection(numberStr) {
    const ThaiNumbers = ["", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
    const ThaiUnits = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];
    
    let text = "";
    let len = numberStr.length;
    
    for (let i = 0; i < len; i++) {
        let digit = parseInt(numberStr.charAt(i));
        let position = len - i - 1;
        
        if (digit !== 0) {
            let numText = ThaiNumbers[digit];
            let unitText = ThaiUnits[position % 6];
            
            if (position % 6 === 1 && digit === 1) {
                numText = "";
            } else if (position % 6 === 1 && digit === 2) {
                numText = "ยี่";
            } else if (position % 6 === 0 && digit === 1 && len > 1 && i === len - 1) {
                // Check previous digit (safe parsing, fallback to 0 if bounds out)
                const prevIndex = i - 1;
                const prevDigit = prevIndex >= 0 ? parseInt(numberStr.charAt(prevIndex)) : 0;
                if (prevDigit !== 0) {
                    numText = "เอ็ด";
                }
            }
            
            text += numText + unitText;
        }
        
        if (position > 0 && position % 6 === 0) {
            text += "ล้าน";
        }
    }
    return text;
}

// PDF Generation using Native Browser Print (100% Correct Thai Shaping)
async function downloadPDF() {
    // Save current active element state to avoid focus loss bugs
    if (document.activeElement) document.activeElement.blur();
    
    // Save to Cloud before printing (Enterprise v2.0)
    const btn = document.getElementById('btn-download-pdf');
    const originalText = btn ? btn.innerHTML : '';
    if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังบันทึกข้อมูล...';
    
    await saveToCloud(currentData);
    
    if (btn) btn.innerHTML = originalText;

    // Alert instructions for saving as PDF with perfect Thai fonts and correct size
    alert(
        "💡 คำแนะนำสำหรับการบันทึกเอกสาร A4 เต็มแผ่น (ไม่ให้ย่อยอดตัวเล็ก):\n\n" +
        "1. เลือกเครื่องพิมพ์ (Printer) -> 'บันทึกเป็น PDF' (Save as PDF)\n" +
        "2. กดที่ปุ่ม 'ตั้งค่าเพิ่มเติม' (More settings) แล้วตั้งค่าดังนี้:\n" +
        "   - ขนาดกระดาษ (Paper size): เลือกเป็น 'A4'\n" +
        "   - ระยะขอบ (Margins): เลือกเป็น 'ไม่มี' (None)   <-- ⚠️ สำคัญมากเพื่อป้องกันรูปเล่มหดตัว\n" +
        "   - สเกล (Scale): เลือกเป็น 'ค่าเริ่มต้น' (Default) หรือ 100%\n" +
        "   - กราฟิกพื้นหลัง (Background graphics): ติ๊กเครื่องหมายถูก  เพื่อให้สีและรูปโลโก้แสดงผล\n" +
        "3. กดปุ่ม 'บันทึก' (Save) ได้เลยครับ"
    );

    // Trigger standard system print
    window.print();
}
