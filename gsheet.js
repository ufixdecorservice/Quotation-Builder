/**
 * UFIX Quotation Builder - Google Sheets API Gateway Communication
 */

const GSheetAPI = {
    // SINGLE GATEWAY URL (Requirement) - Updated 18/06/2569
    URL: 'https://script.google.com/macros/s/AKfycbylyaZHU4ANWqsWoqEGgZ8Qv1cmqlch00DDpBOLTMgk2h4xSZzf19ZNenG6ZvoRpHi1Bw/exec',

    async call(action, data = {}) {
        const payload = {
            action: action,
            data: data,
            username: AuthSystem.getUser(),
            token: AuthSystem.getToken()
        };

        try {
            const response = await fetch(this.URL, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            return await response.json();
        } catch (err) {
            console.error('API Call failed:', err);
            throw err;
        }
    }
};

// Helper function to show Overwrite Confirmation Modal and return decision (Promise)
function showOverwriteModal(docNo, origData) {
    return new Promise((resolve) => {
        const modal = document.getElementById('overwrite-modal');
        const docNoEl = document.getElementById('overwrite-doc-no');
        const custNameEl = document.getElementById('overwrite-cust-name');
        const dateEl = document.getElementById('overwrite-date');
        const amountEl = document.getElementById('overwrite-amount');
        
        docNoEl.innerText = docNo;
        custNameEl.innerText = origData.customerName || '-';
        dateEl.innerText = origData.dateCreated || '-';
        
        // Format grandTotal if available
        let origTotal = origData.paymentAmount || origData.grandTotal || 0;
        amountEl.innerText = parseFloat(origTotal).toLocaleString('th-TH', { minimumFractionDigits: 2 }) + ' บาท';
        
        modal.style.display = 'flex';
        
        // Confirm Overwrite
        const btnConfirm = document.getElementById('btn-overwrite-confirm');
        btnConfirm.onclick = () => {
            modal.style.display = 'none';
            resolve('overwrite');
        };
        
        // Save as New (Clear docNo to force Auto-Gen)
        const btnNew = document.getElementById('btn-overwrite-new');
        btnNew.onclick = () => {
            modal.style.display = 'none';
            resolve('save_new');
        };
        
        // Cancel save
        const btnCancel = document.getElementById('btn-overwrite-cancel');
        btnCancel.onclick = () => {
            modal.style.display = 'none';
            resolve('cancel');
        };
    });
}

/**
 * Hook for app.js to save cloud
 */
async function saveToCloud(currentData) {
    if (!AuthSystem.isLoggedIn()) return;
    
    // Check if document exists on cloud to prevent overwriting
    if (currentData.documentNo && currentData.documentNo.trim() !== '') {
        try {
            const checkRes = await GSheetAPI.call('get_quotation', { quotationNo: currentData.documentNo });
            if (checkRes.success && checkRes.jsonData) {
                const origData = JSON.parse(checkRes.jsonData);
                
                // Show warning modal and await user decision
                const decision = await showOverwriteModal(currentData.documentNo, origData);
                
                if (decision === 'cancel') {
                    console.log('Save cancelled by user to prevent overwriting.');
                    return false;
                } else if (decision === 'save_new') {
                    // Clear document number to force auto-generation
                    currentData.documentNo = '';
                    if (typeof syncDataToForm === 'function') syncDataToForm();
                }
                // If 'overwrite', proceed to save using the existing documentNo
            }
        } catch (err) {
            console.error('Error during overwrite check:', err);
        }
    }
    
    try {
        const res = await GSheetAPI.call('save_quotation', currentData);
        if (res.success) {
            console.log('Saved to cloud:', res.quotationNo);
            // Update the document number if it was auto-generated
            currentData.documentNo = res.quotationNo;
            if (typeof syncDataToForm === 'function') syncDataToForm();
            return true;
        }
    } catch (e) {
        console.warn('Cloud save failed, but workflow continues.');
    }
    return false;
}
