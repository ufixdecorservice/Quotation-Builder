# UFIX Quotation System V2 (Enterprise)

ระบบสร้างและจัดการใบเสนอราคาสำหรับบริษัท UFIX เชื่อมต่อ Google Sheets 100%

## 🚀 ขั้นตอนการติดตั้ง (Setup Guide)

### 1. ส่วนของ Google Sheets & Apps Script (Backend)
1. สร้าง Google Sheet ใหม่ และตั้งชื่อไฟล์ตามต้องการ
2. ไปที่เมนู **Extensions > Apps Script**
3. ก๊อปปี้โค้ดจากไฟล์ `GoogleAppsScript.gs` ไปวางแทนที่โค้ดเดิม
4. กด **Save** และกดปุ่ม **Deploy > New Deployment**
5. เลือก Type เป็น **Web App**
6. ตั้งค่า:
   - **Execute as:** Me (ตัวคุณเอง)
   - **Who has access:** Anyone (เพื่อให้ Frontend เรียกใช้งานได้)
7. กด **Deploy** และก๊อปปี้ **Web App URL** ไว้

### 2. ส่วนของ Google Cloud (Login System)
1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้างโปรเจกต์ใหม่
3. ไปที่ **APIs & Services > OAuth consent screen** ตั้งค่า App Name และอีเมล
4. ไปที่ **Credentials > Create Credentials > OAuth client ID**
5. เลือก Application type: **Web application**
6. ในส่วน **Authorized JavaScript origins** ให้ใส่ URL ของ GitHub Pages (เช่น `https://yourname.github.io`)
7. ก๊อปปี้ **Client ID** ไว้

### 3. ส่วนของ Frontend (config.js)
เปิดไฟล์ `config.js` และแก้ไขค่าดังนี้:
- `API_URL`: ใส่ URL จากข้อ 1.7
- `GOOGLE_CLIENT_ID`: ใส่ Client ID จากข้อ 2.7
- `ALLOWED_EMAILS`: แก้ไขรายการอีเมลที่มีสิทธิ์เข้าใช้งานใน `GoogleAppsScript.gs`

### 4. การใช้งาน (Usage)
1. อัปโหลดไฟล์ทั้งหมดขึ้น GitHub Repository
2. เปิดใช้งาน **GitHub Pages** ในส่วน Settings
3. เข้าใช้งานผ่าน URL ของ GitHub Pages

---
**หมายเหตุ:** เพื่อความปลอดภัยสูงสุด ห้ามแชร์ไฟล์ `config.js` ที่มีข้อมูลจริงสู่สาธารณะโดยไม่จำเป็น
