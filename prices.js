// ===== Master Price Database =====
// Format: { name: { qty (g), price (฿), pricePerGram } }
// Shared via localStorage key 'bakersIngPrices'

const DEFAULT_PRICES = [
    { name: 'Bread Flour',       qty: 1000, price: 37  },
    { name: 'Whole Wheat Flour', qty: 1000, price: 55  },
    { name: 'Yeast',             qty: 500,  price: 130 },
    { name: 'Salt',              qty: 1000, price: 10  },
    { name: 'Milk Powder',       qty: 1000, price: 142 },
    { name: 'Sugar',             qty: 1000, price: 27  },
    { name: 'Milk',              qty: 830, price: 48.75  },
    { name: 'Water',             qty: 1000, price: 0   },
    { name: 'Butter',            qty: 1000,  price: 400  },
    { name: 'White sesame',      qty: 100,  price: 30  },
    { name: 'Black sesame',      qty: 100,  price: 30  },
    { name: 'Chia seed',         qty: 100,  price: 37  },
    { name: 'Flaxseed',          qty: 100,  price: 31  },
    { name: 'Sunflower seed',    qty: 500,  price: 90  },
    { name: 'Pumpkin seed',      qty: 500,  price: 130  },
];

function getPriceList() {
    try {
        const raw = JSON.parse(localStorage.getItem('bakersIngPrices') || '{}');
        const result = {};
        Object.entries(raw).forEach(([name, val]) => {
            if (typeof val === 'number') {
                // Migrate old ฿/kg format → new format
                result[name] = { qty: 1000, price: val, pricePerGram: +(val / 1000).toFixed(6) };
            } else {
                result[name] = val;
            }
        });
        return result;
    } catch(e) { return {}; }
}

function savePriceList(list) {
    try { localStorage.setItem('bakersIngPrices', JSON.stringify(list)); }
    catch(e) {}
}

function initDefaultPrices() {
    if (localStorage.getItem('bakersIngPrices')) return;
    const data = {};
    DEFAULT_PRICES.forEach(item => {
        data[item.name] = {
            qty:          item.qty,
            price:        item.price,
            pricePerGram: item.qty > 0 && item.price > 0
                          ? +(item.price / item.qty).toFixed(6)
                          : 0
        };
    });
    savePriceList(data);
}
let priceEntries = [];

function loadPriceEntries() {
    const pl = getPriceList();
    priceEntries = Object.entries(pl).map(([name, data]) => ({
        name,
        qty:          data.qty   || 0,
        price:        data.price || 0,
        pricePerGram: data.pricePerGram || 0
    }));
}

function savePriceEntries() {
    const obj = {};
    priceEntries.forEach(e => {
        obj[e.name] = { qty: e.qty, price: e.price, pricePerGram: e.pricePerGram };
    });
    savePriceList(obj);
}

function computePPG(qty, price) {
    return (qty > 0 && price >= 0) ? +(price / qty).toFixed(6) : 0;
}

function renderPriceList() {
    const tbody = document.getElementById('priceListBody');
    if (!tbody) return;

    if (priceEntries.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="color:var(--color-text-light);font-size:11px;padding:10px 6px;">ยังไม่มีข้อมูล — กดเพิ่มวัตถุดิบ</td></tr>`;
        return;
    }

    tbody.innerHTML = priceEntries.map((e, i) => `
        <tr>
            <td><input class="pl-name-input" value="${e.name}" onblur="updateEntryName(${i}, this.value)"></td>
            <td><input class="pl-num-input ta-r" type="number" min="1" value="${e.qty || ''}" placeholder="g" oninput="updateEntryNumber(${i}, 'qty', this.value)"></td>
            <td><input class="pl-num-input ta-r" type="number" min="0" step="any" value="${e.price || ''}" placeholder="฿" oninput="updateEntryNumber(${i}, 'price', this.value)"></td>
            <td class="ppg-cell ta-r">${e.pricePerGram > 0 ? e.pricePerGram.toFixed(5) : '—'}</td>
            <td style="text-align:center"><button class="pl-del-btn" onclick="deleteEntry(${i})">×</button></td>
        </tr>
    `).join('');
}

function updateEntryNumber(idx, field, val) {
    const e = priceEntries[idx];
    if (!e) return;
    e[field] = parseFloat(val) || 0;
    e.pricePerGram = computePPG(e.qty, e.price);
    savePriceEntries();
    // Update only the ppg cell to avoid losing input focus
    const rows = document.querySelectorAll('#priceListBody tr');
    const cell = rows[idx]?.querySelector('.ppg-cell');
    if (cell) cell.textContent = e.pricePerGram > 0 ? e.pricePerGram.toFixed(5) : '—';
    renderCostBreakdown();
}

function updateEntryName(idx, val) {
    const e = priceEntries[idx];
    if (!e || !val.trim()) return;
    e.name = val.trim();
    savePriceEntries();
    renderCostBreakdown();
}

function deleteEntry(idx) {
    priceEntries.splice(idx, 1);
    savePriceEntries();
    renderPriceList();
    renderCostBreakdown();
}

function resetToDefaults() {
    if (!confirm('โหลดราคาเริ่มต้นจาก prices.js?\nราคาที่มีอยู่จะถูกแทนที่')) return;
    const data = {};
    DEFAULT_PRICES.forEach(item => {
        data[item.name] = {
            qty:          item.qty,
            price:        item.price,
            pricePerGram: item.qty > 0 && item.price > 0 ? +(item.price / item.qty).toFixed(6) : 0
        };
    });
    savePriceList(data);
    loadPriceEntries();
    renderPriceList();
    renderCostBreakdown();
}

function addEntry() {
    priceEntries.push({ name: 'วัตถุดิบใหม่', qty: 1000, price: 0, pricePerGram: 0 });
    savePriceEntries();
    renderPriceList();
    // Focus the new name input
    const inputs = document.querySelectorAll('#priceListBody .pl-name-input');
    const last = inputs[inputs.length - 1];
    if (last) { last.focus(); last.select(); }
}

// ---- Cost Breakdown ----
let calcData = null;

function loadCalcData() {
    try {
        const raw = localStorage.getItem('bakersCalcData');
        if (raw) calcData = JSON.parse(raw);
    } catch(e) {}
}

function renderCostBreakdown() {
    loadCalcData();
    if (!calcData) return;

    const { portions, flours, ingredients, inclusions: savedInclusions } = calcData;
    const portionsTotal  = portions.reduce((s, p) => s + p.qty * p.weight, 0);
    const totalPieces    = portions.reduce((s, p) => s + p.qty, 0);
    const otherSum       = ingredients.reduce((s, i) => s + i.pct, 0);
    const totalFlourBase = portionsTotal / ((100 + otherSum) / 100);

    // Build price lookup from current priceEntries (takes priority over calcData prices)
    const pl = {};
    priceEntries.forEach(e => { pl[e.name] = e.pricePerGram; });

    let totalCost = 0;
    const rows = [];

    [...flours, ...ingredients].forEach(item => {
        const rawW         = (totalFlourBase * item.pct) / 100;
        const w            = Math.round(rawW);
        const pricePerGram = pl[item.name] ?? (item.price || 0);
        const cost         = rawW * pricePerGram;
        const cpp          = totalPieces > 0 ? cost / totalPieces : 0;
        totalCost         += cost;
        rows.push({ item, w, pricePerGram, cost, cpp, isFlour: flours.includes(item), isInclusion: false });
    });

    const enabledInclusions = (savedInclusions || []).filter(i => i.enabled);
    enabledInclusions.forEach(item => {
        const rawW         = (totalFlourBase * item.pct) / 100;
        const w            = Math.round(rawW);
        const pricePerGram = pl[item.name] ?? (item.price || 0);
        const cost         = rawW * pricePerGram;
        const cpp          = totalPieces > 0 ? cost / totalPieces : 0;
        totalCost         += cost;
        rows.push({ item, w, pricePerGram, cost, cpp, isFlour: false, isInclusion: true });
    });

    const cpp_total = totalPieces > 0 ? totalCost / totalPieces : 0;

    const ceilFmt = v => (Math.ceil(v * 100) / 100).toFixed(2);
    document.getElementById('cardTotalCost').textContent    = '฿' + ceilFmt(totalCost);
    document.getElementById('cardDoughWeight').textContent  = portionsTotal.toLocaleString() + ' g';
    document.getElementById('cardCostPerPiece').textContent = '฿' + ceilFmt(cpp_total);
    document.getElementById('cardPieces').textContent       = totalPieces + ' ก้อน';

    window._totalCost   = totalCost;
    window._totalPieces = totalPieces;
    window._cpp         = cpp_total;
    calcProfit();

    let incHeaderInserted = false;
    const tbody = rows.map(r => {
        let cls = r.isFlour ? 'flour-item' : '';
        let prefix = '';
        if (r.isInclusion && !incHeaderInserted) {
            incHeaderInserted = true;
            prefix = `<tr><td colspan="6" style="padding-top:10px;font-size:11px;font-weight:700;color:var(--color-text-muted);letter-spacing:0.3px;">INCLUSIONS</td></tr>`;
        }
        const ppgStr  = r.pricePerGram > 0 ? r.pricePerGram.toFixed(2) : '—';
        const costStr = r.pricePerGram > 0 ? '฿' + ceilFmt(r.cost) : '—';
        const cppStr  = r.pricePerGram > 0 ? '฿' + ceilFmt(r.cpp)  : '—';
        return prefix + `<tr class="${cls}">
            <td>${r.item.name}</td>
            <td>${r.item.pct}%</td>
            <td>${r.w.toLocaleString()} g</td>
            <td>${ppgStr}</td>
            <td>${costStr}</td>
            <td>${cppStr}</td>
        </tr>`;
    }).join('');

    const totalCostStr = totalCost > 0 ? '฿' + ceilFmt(totalCost) : '—';
    const cppStr       = totalCost > 0 ? '฿' + ceilFmt(cpp_total)  : '—';

    document.getElementById('costTableContainer').innerHTML = `
        <table class="cost-table">
            <thead><tr>
                <th>วัตถุดิบ</th><th class="ta-r">%</th><th class="ta-r">น้ำหนัก</th>
                <th class="ta-r">฿/กรัม</th><th class="ta-r">ราคา (฿)</th><th class="ta-r">ต่อก้อน</th>
            </tr></thead>
            <tbody>${tbody}</tbody>
            <tfoot><tr>
                <td colspan="4">รวม</td>
                <td>${totalCostStr}</td>
                <td>${cppStr}</td>
            </tr></tfoot>
        </table>`;
}

function calcProfit() {
    const sellPrice   = parseFloat(document.getElementById('sellPrice').value) || 0;
    const cpp         = window._cpp         || 0;
    const totalPieces = window._totalPieces || 0;

    if (sellPrice <= 0) {
        document.getElementById('profitRow').style.display = 'none';
        return;
    }
    document.getElementById('profitRow').style.display = 'flex';

    const profitPP    = sellPrice - cpp;
    const profitTotal = profitPP * totalPieces;
    const foodCostPct = (cpp / sellPrice) * 100;

    const ppEl = document.getElementById('profitPerPiece');
    ppEl.textContent = (profitPP >= 0 ? '+' : '') + '฿' + profitPP.toFixed(2);
    ppEl.className   = 'profit-val ' + (profitPP >= 0 ? 'positive' : 'negative');

    const ptEl = document.getElementById('profitTotal');
    ptEl.textContent = (profitTotal >= 0 ? '+' : '') + '฿' + profitTotal.toFixed(2);
    ptEl.className   = 'profit-val ' + (profitTotal >= 0 ? 'positive' : 'negative');

    document.getElementById('foodCostPct').textContent = foodCostPct.toFixed(1) + '%';
}

// ---- Export / Import ----
function exportPrices() {
    const data = getPriceList();
    const exportObj = {
        _exported: new Date().toISOString(),
        _version: 1,
        prices: data
    };
    const json = JSON.stringify(exportObj, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    a.href     = url;
    a.download = `baker-prices-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importPrices(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const parsed = JSON.parse(e.target.result);
            const data   = parsed.prices || parsed;
            const isValid = Object.values(data).every(v =>
                typeof v === 'object' && ('qty' in v || 'price' in v || 'pricePerGram' in v)
            );
            if (!isValid) throw new Error('รูปแบบไฟล์ไม่ถูกต้อง');
            savePriceList(data);
            loadPriceEntries();
            renderPriceList();
            renderCostBreakdown();
            showImportMsg(`✓ นำเข้าสำเร็จ — ${Object.keys(data).length} รายการ`, 'success');
        } catch(err) {
            showImportMsg(`✗ ไฟล์ไม่ถูกต้อง: ${err.message}`, 'error');
        }
        event.target.value = '';
    };
    reader.readAsText(file);
}

function showImportMsg(text, type) {
    const el = document.getElementById('importMsg');
    if (!el) return;
    el.textContent = text;
    el.className   = `import-msg ${type}`;
    clearTimeout(el._timer);
    el._timer = setTimeout(() => { el.textContent = ''; el.className = 'import-msg'; }, 4000);
}

// ---- Init ----
initDefaultPrices();
loadPriceEntries();
renderPriceList();
renderCostBreakdown();