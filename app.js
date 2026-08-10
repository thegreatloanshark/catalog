// ===== SAMPLE DATA =====
const CATALOG_DATA = [
  {
    name: "Bank Of Baroda",
    dsaCode: "CDSA01031",
    payoutType: "Gross",
    payoutPct: ["0.80%", "BT 0.90%"],
    payoutTimeline: ["Sanction", "Disbursal"],
    payoutConditions: ["Min ₹10L", "20% disb"],
    city: "PAN India"
  },
  {
    name: "Canara Bank",
    dsaCode: "CDSA00000035",
    payoutType: "Gross",
    payoutPct: ["0.80%", "0.90%"],
    payoutTimeline: ["MIS Based"],
    payoutConditions: ["Min ₹50L"],
    city: "Tier-1"
  }
];

// ===== ROLE =====
let currentRole = "viewer";

// ===== RENDER =====
function renderCatalog() {
  const el = document.getElementById("catalog");

  el.innerHTML = CATALOG_DATA.map(d => `
    <div class="card">
      <h3>${d.name}</h3>
      <p>DSA: ${d.dsaCode}</p>
      ${currentRole === 'vertical-head' ? `<p>Payout: ${d.payoutPct.join(" | ")}</p>` : ""}
      <p>City: ${d.city}</p>
    </div>
  `).join("");
}

renderCatalog();

// ===== PRINT =====
document.getElementById("printBtn").addEventListener("click", () => {
  window.print();
});

// ===== PDF EXPORT =====
document.getElementById("downloadBtn").addEventListener("click", generatePDF);

function generatePDF() {

  const wrapper = document.createElement("div");

  wrapper.innerHTML = `
    ${getWatermark()}
    ${getCoverPage()}
    ${getCatalogPages()}
    ${getCTAPage()}
  `;

  html2pdf().from(wrapper).save("NB-Loans-Catalog.pdf");
}

// ===== COMPONENTS =====

function getWatermark(){
  return `<div class="watermark">NoBroker Loans – Official</div>`;
}

function getCoverPage(){
  return `
  <div class="pdf-page">
    <h1>NoBroker Loans</h1>
    <h2>DSA Catalog</h2>

    <div class="qr-block">
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://loan-partner.nobroker.in/signup">
      <p>Scan to Register</p>
    </div>
  </div>`;
}

function getCatalogPages(){
  return `
  <div class="pdf-page">
    ${CATALOG_DATA.map(d => `
      <div class="card">
        <h3>${d.name}</h3>
        <p>DSA: ${d.dsaCode}</p>
        <p>${d.payoutTimeline.join(", ")}</p>
      </div>
    `).join("")}
  </div>`;
}

function getCTAPage(){
  return `
  <div class="pdf-page">
    <h2>Join NoBroker Loans</h2>

    <div class="qr-block">
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=https://loan-partner.nobroker.in/signup">
    </div>
  </div>`;
}
