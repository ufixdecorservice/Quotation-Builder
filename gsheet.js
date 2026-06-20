/**
 * UFIX Quotation Builder - Google Sheets API Gateway Communication
 */

const GSheetAPI = {
    // SINGLE GATEWAY URL (Requirement) - Updated 18/06/2569
    URL: 'https://script.google.com/macros/s/AKfycbzOOs17j-E6pnPVJj6OTXMepfnlQhpeVCSMEAsKrCPY_XbWzu0hF564HWIdlzRF2dsg0w/exec',

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
