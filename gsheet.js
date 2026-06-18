/**
 * UFIX Quotation Builder - Google Sheets API Gateway Communication
 */

const GSheetAPI = {
    // SINGLE GATEWAY URL (Requirement)
    URL: 'https://script.google.com/macros/s/AKfycbyNWV1OIHIgyRvzXPJUfPXq-Fgu1UWeEvvReoFb2fEKnzcZ4j-Zhz48MNg_8mVuqoL9ew/exec',

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

/**
 * Hook for app.js to save cloud
 */
async function saveToCloud(currentData) {
    if (!AuthSystem.isLoggedIn()) return;
    
    try {
        const res = await GSheetAPI.call('save_quotation', currentData);
        if (res.success) {
            console.log('Saved to cloud:', res.quotationNo);
            // Update the document number if it was auto-generated
            if (!currentData.documentNo || currentData.documentNo === '') {
                currentData.documentNo = res.quotationNo;
                if (typeof syncDataToForm === 'function') syncDataToForm();
            }
            return true;
        }
    } catch (e) {
        console.warn('Cloud save failed, but workflow continues.');
    }
    return false;
}
