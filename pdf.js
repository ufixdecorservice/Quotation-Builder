/**
 * PDF Export & Printing Logic
 */

async function printQuotation(id) {
    showLoading(true);
    try {
        const res = await callAPI("list", {}); // Re-fetch to get specific item data
        const data = res.data.find(r => r.ID === id);
        if (!data) return showToast("ไม่พบข้อมูลเอกสาร");

        const items = JSON.parse(data.ItemsJSON);
        
        const html = `
            <div class="pdf-container" style="padding: 40px; font-family: 'Sarabun', sans-serif;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px;">
                    <div>
                        <img src="${CONFIG.COMPANY.LOGO}" style="height: 60px; margin-bottom: 10px;">
                        <h2 style="color: #7C4DFF;">${CONFIG.COMPANY.NAME}</h2>
                        <p style="font-size: 12px; color: #666;">
                            เลขประจำตัวผู้เสียภาษี: ${CONFIG.COMPANY.TAX_ID}<br>
                            ${CONFIG.COMPANY.ADDRESS}<br>
                            โทร: ${CONFIG.COMPANY.PHONE} | อีเมล: ${CONFIG.COMPANY.EMAIL}
                        </p>
                    </div>
                    <div style="text-align: right;">
                        <h1 style="margin: 0; color: #7C4DFF;">ใบเสนอราคา</h1>
                        <p style="font-size: 18px; margin: 5px 0;">QUOTATION</p>
                        <div style="background: #F5F7FB; padding: 10px; border-radius: 8px; margin-top: 10px;">
                            <b>เลขที่:</b> ${data.QuotationNo}<br>
                            <b>วันที่:</b> ${new Date(data.Date).toLocaleDateString('th-TH')}
                        </div>
                    </div>
                </div>

                <div style="border: 1px solid #EEE; padding: 15px; border-radius: 8px; margin-bottom: 30px;">
                    <b style="color: #7C4DFF;">ข้อมูลลูกค้า</b><br>
                    <b>คุณ / บริษัท:</b> ${data.CustomerName}<br>
                    <b>ที่อยู่:</b> ${data.Address || '-'}<br>
                    <b>ติดต่อ:</b> ${data.Phone || '-'} | ${data.Email || '-'}
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                    <thead>
                        <tr style="background: #7C4DFF; color: white;">
                            <th style="padding: 10px; border: 1px solid #7C4DFF;">#</th>
                            <th style="padding: 10px; border: 1px solid #7C4DFF; text-align: left;">รายละเอียด</th>
                            <th style="padding: 10px; border: 1px solid #7C4DFF;">จำนวน</th>
                            <th style="padding: 10px; border: 1px solid #7C4DFF;">หน่วย</th>
                            <th style="padding: 10px; border: 1px solid #7C4DFF;">ราคา/หน่วย</th>
                            <th style="padding: 10px; border: 1px solid #7C4DFF;">รวม</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map((it, idx) => `
                            <tr>
                                <td style="padding: 10px; border: 1px solid #EEE; text-align: center;">${idx+1}</td>
                                <td style="padding: 10px; border: 1px solid #EEE;">${it.description}</td>
                                <td style="padding: 10px; border: 1px solid #EEE; text-align: center;">${it.qty}</td>
                                <td style="padding: 10px; border: 1px solid #EEE; text-align: center;">${it.unit}</td>
                                <td style="padding: 10px; border: 1px solid #EEE; text-align: right;">${Number(it.price).toLocaleString()}</td>
                                <td style="padding: 10px; border: 1px solid #EEE; text-align: right;">${(it.qty * it.price).toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div style="display: flex; justify-content: flex-end;">
                    <div style="width: 300px;">
                        <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                            <span>รวมเงิน (Subtotal)</span>
                            <span>${Number(data.Subtotal).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                            <span>ภาษีมูลค่าเพิ่ม 7% (VAT)</span>
                            <span>${Number(data.Vat).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 10px 0; border-top: 2px solid #7C4DFF; font-weight: bold; color: #7C4DFF; font-size: 18px;">
                            <span>ยอดรวมสุทธิ</span>
                            <span>${Number(data.GrandTotal).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 50px; display: flex; justify-content: space-around; text-align: center;">
                    <div style="width: 200px;">
                        <div style="height: 60px;"></div>
                        <div style="border-top: 1px solid #333; padding-top: 5px;">ผู้อนุมัติ</div>
                    </div>
                    <div style="width: 200px;">
                        <div style="height: 60px;"></div>
                        <div style="border-top: 1px solid #333; padding-top: 5px;">ลูกค้าตกลงว่าจ้าง</div>
                    </div>
                </div>
            </div>
        `;

        const opt = {
            margin: 0,
            filename: `${data.QuotationNo}_UFIX.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().from(html).save();
    } catch (err) {
        showToast("เกิดข้อผิดพลาดในการสร้าง PDF");
    } finally {
        showLoading(false);
    }
}
