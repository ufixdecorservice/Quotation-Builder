/**
 * Dashboard Logic
 */

async function loadDashboard() {
    try {
        const stats = await callAPI("getStats", {});
        
        if (stats.status === "success") {
            document.getElementById("stat-total-count").innerText = stats.totalCount;
            document.getElementById("stat-total-value").innerText = stats.totalValue.toLocaleString(undefined, {minimumFractionDigits: 2});
            document.getElementById("stat-total-customers").innerText = stats.totalCustomers;
            
            renderRecentTable(stats.recent);
        }
    } catch (err) {
        console.error("Dashboard Error:", err);
    }
}

function renderRecentTable(data) {
    const tbody = document.getElementById("recent-table-body");
    tbody.innerHTML = "";
    
    data.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><b>${row[1]}</b></td>
            <td>${new Date(row[2]).toLocaleDateString('th-TH')}</td>
            <td>${row[3]}</td>
            <td>${Number(row[10]).toLocaleString()}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editQuotation('${row[0]}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-primary" onclick="printQuotation('${row[0]}')"><i class="fas fa-print"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}
