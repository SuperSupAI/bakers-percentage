let portions = [
    { id: 1, qty: 24, weight: 50 },
];

function renderPortions() {
    const container = document.getElementById('portionRows');
    if (!container) return;
    container.innerHTML = '';
    const t = (typeof translations !== 'undefined' && typeof currentLang !== 'undefined')
        ? translations[currentLang] : {};

    portions.forEach((p, index) => {
        const isFirst = index === 0;
        const hideDel = portions.length === 1 ? 'style="visibility:hidden"' : '';
        const subtotal = p.qty * p.weight;
        const row = document.createElement('div');
        row.className = 'piece-row';
        if (index > 0) row.style.marginTop = '6px';

        if (isFirst) {
            row.innerHTML = `
                <div class="piece-field">
                    <label id="txt-num-pcs">${t.numPcs || 'จำนวนก้อน'}</label>
                    <input type="number" value="${p.qty}" min="1" oninput="updatePortion(${p.id}, 'qty', this.value)">
                </div>
                <div class="piece-op">×</div>
                <div class="piece-field">
                    <label id="txt-weight-pcs">${t.weightPcs || 'น้ำหนักต่อก้อน (g)'}</label>
                    <input type="number" value="${p.weight}" min="1" oninput="updatePortion(${p.id}, 'weight', this.value)">
                </div>
                <div class="piece-op">=</div>
                <div class="piece-result">
                    <label>&nbsp;</label>
                    <div class="piece-sub-val" id="sub-${p.id}">${subtotal.toLocaleString()} g</div>
                </div>
                <button class="del-btn" style="align-self:flex-end;margin-bottom:5px" onclick="removePortion(${p.id})" ${hideDel}>×</button>
                <div class="portion-cost-display" id="portion-cost-${p.id}" style="align-self:flex-end;margin-bottom:6px"></div>
            `;
        } else {
            row.innerHTML = `
                <div class="piece-field">
                    <input type="number" value="${p.qty}" min="1" oninput="updatePortion(${p.id}, 'qty', this.value)">
                </div>
                <div class="piece-op" style="padding-top:0">×</div>
                <div class="piece-field">
                    <input type="number" value="${p.weight}" min="1" oninput="updatePortion(${p.id}, 'weight', this.value)">
                </div>
                <div class="piece-op" style="padding-top:0">=</div>
                <div class="piece-result" style="align-self:center">
                    <div class="piece-sub-val" id="sub-${p.id}">${subtotal.toLocaleString()} g</div>
                </div>
                <button class="del-btn" onclick="removePortion(${p.id})" ${hideDel}>×</button>
                <div class="portion-cost-display" id="portion-cost-${p.id}" style="align-self:center"></div>
            `;
        }
        container.appendChild(row);
    });
    recalculateWeights();
}

function addPortion() {
    portions.push({ id: Date.now(), qty: 2, weight: 450 });
    renderPortions();
}

function removePortion(id) {
    if (portions.length > 1) {
        portions = portions.filter(p => p.id !== id);
        renderPortions();
    }
}

function updatePortion(id, field, val) {
    const p = portions.find(x => x.id === id);
    if (!p) return;
    p[field] = parseFloat(val) || 0;
    const subEl = document.getElementById(`sub-${p.id}`);
    if (subEl) subEl.textContent = (p.qty * p.weight).toLocaleString() + ' g';
    recalculateWeights();
}

let flours = [
    { id: 1, name: 'Bread Flour', pct: 100, locked: true, price: 0 },
];

let ingredients = [
    { id: 3, name: 'Yeast',       pct: 1.8,  price: 0 },
    { id: 4, name: 'Salt',        pct: 1.5,  price: 0 },
    { id: 5, name: 'Milk Powder', pct: 4,    price: 0 },
    { id: 6, name: 'Sugar',       pct: 10,   price: 0 },
    { id: 7, name: 'Milk',        pct: 25,   price: 0 },
    { id: 8, name: 'Water',       pct: 50,   price: 0 },
    { id: 9, name: 'Butter',      pct: 9,    price: 0 }
];

function refreshPriceDatalist() {
    let dl = document.getElementById('price-names');
    if (!dl) {
        dl = document.createElement('datalist');
        dl.id = 'price-names';
        document.body.appendChild(dl);
    }
    dl.innerHTML = Object.keys(getPriceList()).map(n => `<option value="${n}">`).join('');
}

// item.price stores ฿ per gram (pricePerGram)
function autoFillPrices() {
    const priceList = getPriceList();
    [...flours, ...ingredients].forEach(item => {
        const entry = priceList[item.name];
        if (!item.price && entry?.pricePerGram > 0) {
            item.price = entry.pricePerGram;
        }
    });
}

function roundInteger(value) {
    return Math.round(value);
}

function redistributeAutoFlours() {
    const locked   = flours.filter(f => f.locked);
    const unlocked = flours.filter(f => !f.locked);
    if (unlocked.length === 0) return;

    const lockedSum = locked.reduce((s, f) => s + f.pct, 0);
    const remaining = 100 - lockedSum;
    const share     = Math.round((remaining / unlocked.length) * 10) / 10;

    for (let i = 0; i < unlocked.length - 1; i++) {
        unlocked[i].pct = Math.max(0, share);
    }
    const distributed = unlocked.slice(0, -1).reduce((s, f) => s + f.pct, 0);
    unlocked[unlocked.length - 1].pct = Math.max(0, Math.round((remaining - distributed) * 10) / 10);
}

function syncAutoFlourInputs() {
    flours.filter(f => !f.locked).forEach(f => {
        const el = document.getElementById(`pct-${f.id}`);
        if (el) el.value = f.pct;
    });
}

function updateFlourPct(id, val) {
    const item = flours.find(x => x.id === id);
    if (!item) return;
    item.pct    = parseFloat(val) || 0;
    item.locked = true;
    const el = document.getElementById(`pct-${id}`);
    if (el) el.classList.remove('auto-filled');
    redistributeAutoFlours();
    syncAutoFlourInputs();
    recalculateWeights();
}

function renderTables() {
    refreshPriceDatalist();
    autoFillPrices();

    const fBody = document.getElementById('flourBody');
    if (fBody) fBody.innerHTML = '';
    flours.forEach(f => fBody.appendChild(createRow(f, 'flour')));

    const iBody = document.getElementById('ingBody');
    if (iBody) iBody.innerHTML = '';
    ingredients.forEach(i => iBody.appendChild(createRow(i, 'ing')));

    recalculateWeights();
}

function createRow(item, type) {
    const tr = document.createElement('tr');
    if (type === 'flour') tr.className = 'flour-row';

    const displayName = (typeof translations !== 'undefined' && translations[currentLang][item.name])
        ? translations[currentLang][item.name]
        : item.name;

    let pctInputHtml;
    if (type === 'flour') {
        const autoClass = item.locked ? '' : 'auto-filled';
        pctInputHtml = `<input type="number" step="any" id="pct-${item.id}" value="${item.pct}"
            class="${autoClass}" oninput="updateFlourPct(${item.id}, this.value)">`;
    } else {
        pctInputHtml = `<input type="number" step="any" value="${item.pct}"
            oninput="updateData('ing', ${item.id}, 'pct', this.value)">`;
    }

    tr.innerHTML = `
        <td><input type="text" value="${displayName}" list="price-names" oninput="updateData('${type}', ${item.id}, 'name', this.value)"></td>
        <td class="num-cell">${pctInputHtml}</td>
        <td class="num-cell"><span id="weight-${item.id}" class="weight-display">0</span></td>
        <td class="num-cell"><span id="price-${item.id}" class="price-display">${item.price ? item.price.toFixed(3) : '—'}</span></td>
        <td class="num-cell"><span id="cost-${item.id}" class="cost-display">—</span></td>
        <td style="text-align:center"><button class="del-btn" onclick="removeItem('${type}', ${item.id})">×</button></td>
    `;
    return tr;
}

function updateData(type, id, field, val) {
    const list = (type === 'flour') ? flours : ingredients;
    const item = list.find(x => x.id === id);
    if (!item) return;

    item[field] = field === 'pct' ? (parseFloat(val) || 0) : val;

    // เมื่อแก้ชื่อ → ดึงราคาจาก price list อัตโนมัติ
    if (field === 'name') {
        const entry = getPriceList()[val];
        item.price = entry?.pricePerGram || 0;
        const priceEl = document.getElementById(`price-${id}`);
        if (priceEl) priceEl.textContent = item.price ? item.price.toFixed(3) : '—';
    }

    recalculateWeights();
}

function recalculateWeights() {
    const portionsTotal  = portions.reduce((s, p) => s + p.qty * p.weight, 0);
    const offset         = parseFloat(document.getElementById('doughOffset')?.value) || 0;
    const totalDoughGoal = portionsTotal + offset;
    const totalPieces    = portions.reduce((s, p) => s + p.qty, 0);

    const totalEl = document.getElementById('totalDoughDisplay');
    if (totalEl) totalEl.textContent = portionsTotal.toLocaleString() + ' g';
    const finalEl = document.getElementById('totalDoughFinal');
    if (finalEl) finalEl.textContent = totalDoughGoal.toLocaleString() + ' g';

    const flourSum = flours.reduce((s, f) => s + f.pct, 0);
    const otherSum = ingredients.reduce((s, i) => s + i.pct, 0);

    const sumEl = document.getElementById('currentFlourSum');
    const msgEl = document.getElementById('flourStatusMsg');
    const barEl = document.getElementById('flourStatusBar');

    if (sumEl) {
        sumEl.textContent = flourSum.toFixed(1) + '%';
        const mismatch = flours.length === 2 && Math.abs(flourSum - 100) >= 0.01;
        sumEl.style.color      = mismatch ? '#e24b4a' : '';
        sumEl.style.fontWeight = mismatch ? 'bold'    : '';
    }

    if (Math.abs(flourSum - 100) < 0.01) {
        msgEl.innerHTML = '<span style="color:#3D2409; font-weight:bold;">ครบ 100% แล้ว</span>';
        barEl.style.borderLeftColor = '#C4956A';
    } else if (flourSum < 100) {
        msgEl.innerHTML = `ยังขาดอีก <b>${(100 - flourSum).toFixed(1)}%</b>`;
        barEl.style.borderLeftColor = '#ccc';
    } else {
        msgEl.innerHTML = `<span class="over-limit">เกินไป ${(flourSum - 100).toFixed(1)}%</span>`;
        barEl.style.borderLeftColor = '#e24b4a';
    }

    const totalFlourBase = totalDoughGoal / ((100 + otherSum) / 100);
    let totalCost = 0;

    function updateRowCost(item) {
        const rawW     = (totalFlourBase * item.pct) / 100;
        const weightEl = document.getElementById(`weight-${item.id}`);
        if (weightEl) weightEl.textContent = roundInteger(rawW);

        // item.price is ฿/gram
        const cost  = rawW * (item.price || 0);
        totalCost  += cost;

        const costEl = document.getElementById(`cost-${item.id}`);
        if (!costEl) return;
        if ((item.price || 0) > 0) {
            const cpp = totalPieces > 0 ? cost / totalPieces : 0;
            costEl.innerHTML =
                `<span class="cost-total-val">฿${cost.toFixed(2)}</span>` +
                `<small class="cost-per-piece">฿${cpp.toFixed(2)}/ก้อน</small>`;
        } else {
            costEl.textContent = '—';
        }
    }

    flours.forEach(updateRowCost);
    ingredients.forEach(updateRowCost);

    const totalCostEl = document.getElementById('totalCostDisplay');
    if (totalCostEl) totalCostEl.textContent = '฿' + totalCost.toFixed(2);

    const roundedTotal = parseFloat(totalCost.toFixed(2));
    let allocated = 0;
    portions.forEach((p, idx) => {
        const el = document.getElementById(`portion-cost-${p.id}`);
        if (!el) return;
        if (totalCost > 0 && portionsTotal > 0) {
            let pCost;
            if (idx === portions.length - 1) {
                pCost = parseFloat((roundedTotal - allocated).toFixed(2));
            } else {
                pCost = parseFloat((totalCost * (p.qty * p.weight) / portionsTotal).toFixed(2));
                allocated += pCost;
            }
            const pCpp = p.qty > 0 ? pCost / p.qty : 0;
            el.innerHTML = `<span class="pc-total">฿${pCost.toFixed(2)}</span><span class="pc-cpp">฿${pCpp.toFixed(2)}/ก้อน</span>`;
        } else {
            el.innerHTML = '';
        }
    });

    saveData();
}

function addItem(type) {
    const newItem = {
        id:     Date.now(),
        name:   (type === 'flour' ? 'ระบุชื่อแป้ง' : 'ระบุชื่อส่วนผสม'),
        pct:    0,
        price:  0,
        locked: false
    };
    if (type === 'flour') {
        flours.push(newItem);
        redistributeAutoFlours();
    } else {
        ingredients.push(newItem);
    }
    renderTables();
}

function removeItem(type, id) {
    if (type === 'flour' && flours.length > 1) {
        flours = flours.filter(f => f.id !== id);
        redistributeAutoFlours();
    } else if (type === 'ing') {
        ingredients = ingredients.filter(i => i.id !== id);
    }
    renderTables();
}

function saveData() {
    try {
        localStorage.setItem('bakersCalcData', JSON.stringify({
            portions, flours, ingredients, timestamp: Date.now()
        }));
    } catch(e) {}
}

initDefaultPrices();
renderTables();
renderPortions();

function showSummary() {
    const portionsTotal  = portions.reduce((s, p) => s + p.qty * p.weight, 0);
    const offset         = parseFloat(document.getElementById('doughOffset')?.value) || 0;
    const totalDough     = portionsTotal + offset;
    const totalPieces    = portions.reduce((s, p) => s + p.qty, 0);

    const otherSum       = ingredients.reduce((s, i) => s + i.pct, 0);
    const totalFlourBase = totalDough / ((100 + otherSum) / 100);

    const t       = (typeof translations !== 'undefined') ? translations[currentLang] : {};
    const getName = item => (t[item.name] || item.name);

    let totalCost = 0;

    const makeRow = (item, cls) => {
        const w    = Math.round((totalFlourBase * item.pct) / 100);
        const cost = w * (item.price || 0); // ฿/g
        totalCost += cost;
        const cpp     = totalPieces > 0 ? cost / totalPieces : 0;
        const costStr = (item.price || 0) > 0
            ? `฿${cost.toFixed(2)}<br><small style="color:var(--color-text-light)">฿${cpp.toFixed(2)}/ก้อน</small>`
            : '—';
        return `<tr class="${cls}"><td>${getName(item)}</td><td>${item.pct}%</td><td>${w.toLocaleString()} g</td><td>${costStr}</td></tr>`;
    };

    const flourRows = flours.map(f => makeRow(f, 's-flour')).join('');
    const ingRows   = ingredients.map(i => makeRow(i, '')).join('');

    const thCost     = t.thCost    || 'ราคา (฿)';
    const yieldParts = portions.map(p => `${p.qty} × ${p.weight} g`).join(' + ');
    const cpp_total  = totalPieces > 0 ? totalCost / totalPieces : 0;

    const costSummary = totalCost > 0 ? `
        <div class="summary-cost-row">
            <span>ต้นทุนรวม: <strong>฿${totalCost.toFixed(2)}</strong></span>
            <span>เฉลี่ย/ก้อน: <strong>฿${cpp_total.toFixed(2)}</strong></span>
        </div>` : '';

    document.getElementById('summaryContent').innerHTML = `
        <div class="summary-yield">
            ${t.yieldLabel || 'Yield'}: <strong>${yieldParts} = ${totalDough.toLocaleString()} g</strong>
        </div>
        ${costSummary}
        <table class="summary-table">
            <thead><tr>
                <th>${t.thName || 'Ingredient'}</th>
                <th>${t.thPct || "Baker's %"}</th>
                <th>${t.thWeight || 'Weight (g)'}</th>
                <th>${thCost}</th>
            </tr></thead>
            <tbody>${flourRows}${ingRows}</tbody>
            <tfoot><tr>
                <td colspan="3" class="summary-total">${t.totalLabel || 'Total'}: ${totalDough.toLocaleString()} g</td>
                <td class="summary-total">${totalCost > 0 ? '฿' + totalCost.toFixed(2) : '—'}</td>
            </tr></tfoot>
        </table>`;

    document.getElementById('summaryModal').style.display = 'flex';
}

function closeSummary() {
    document.getElementById('summaryModal').style.display = 'none';
}

function handleOverlayClick(e) {
    if (e.target === document.getElementById('summaryModal')) closeSummary();
}
