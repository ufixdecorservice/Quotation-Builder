/**
 * Configuration for UFIX Quotation System
 */
const CONFIG = {
    // URL ของ Google Apps Script ที่ Deploy เป็น Web App แล้ว
    API_URL: "https://script.google.com/macros/s/AKfycbx-7gvMrS4ky-qD1FVRREsxf_m41gNc4p31p1NvBa4DVJUmCLHOle0GPMhQ7zkGTWyQ/exec",
    
    // Token ที่ต้องตรงกับใน Apps Script
    API_TOKEN: "UFIX_SECURE_TOKEN_2026",
    
    // Google Client ID สำหรับ Login (ต้องไปสร้างใน Google Cloud Console)
    GOOGLE_CLIENT_ID: "37129815742-5sbk62prbq4h2bptg0gaumtam7rlos7v.apps.googleusercontent.com",
    
    // ข้อมูลบริษัทสำหรับใบเสนอราคา
    COMPANY: {
        NAME: "บริษัท ยูฟิกซ์ เดคคอร์ เซอร์วิส จำกัด",
        TAX_ID: "01055XXXXXXXX",
        ADDRESS: "123/45 ถนนหลัก แขวง/ตำบล เขต/อำเภอ กรุงเทพฯ 10XXX",
        PHONE: "02-XXX-XXXX",
        EMAIL: "contact@ufix.co.th",
        LOGO: "https://via.placeholder.com/150x50?text=UFIX+LOGO" // ใส่ URL โลโก้จริง
    }
};
