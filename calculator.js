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
    { id: 1, name: 'Bread Flour', pct: 100, locked: true },
];

let ingredients = [
    { id: 3, name: 'Yeast', pct: 1.8 },
    { id: 4, name: 'Salt', pct: 1.5 },
    { id: 5, name: 'Milk Powder', pct: 4 },
    { id: 6, name: 'Sugar', pct: 10 },
    { id: 7, name: 'Milk', pct: 25 },
    { id: 8, name: 'Water', pct: 50 },
    { id: 9, name: 'Butter', pct: 9 }
];

function roundInteger(value) {
    return Math.round(value);
}

// Split remaining % (100 - locked sum) equally among unlocked flours.
// Last unlocked absorbs rounding remainder so total stays exactly 100.
function redistributeAutoFlours() {
    const locked = flours.filter(f => f.locked);
    const unlocked = flours.filter(f => !f.locked);
    if (unlocked.length === 0) return;

    const lockedSum = locked.reduce((s, f) => s + f.pct, 0);
    const remaining = 100 - lockedSum;
    const share = Math.round((remaining / unlocked.length) * 10) / 10;

    for (let i = 0; i < unlocked.length - 1; i++) {
        unlocked[i].pct = Math.max(0, share);
    }
    const distributed = unlocked.slice(0, -1).reduce((s, f) => s + f.pct, 0);
    unlocked[unlocked.length - 1].pct = Math.max(0, Math.round((remaining - distributed) * 10) / 10);
}

// Update only the DOM inputs of auto-filled (unlocked) flours — keeps focus on the typed field.
function syncAutoFlourInputs() {
    flours.filter(f => !f.locked).forEach(f => {
        const el = document.getElementById(`pct-${f.id}`);
        if (el) el.value = f.pct;
    });
}

function updateFlourPct(id, val) {
    const item = flours.find(x => x.id === id);
    if (!item) return;

    item.pct = parseFloat(val) || 0;
    item.locked = true;

    const el = document.getElementById(`pct-${id}`);
    if (el) el.classList.remove('auto-filled');

    redistributeAutoFlours();
    syncAutoFlourInputs();
    recalculateWeights();
}

function renderTables() {
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
        <td><input type="text" value="${displayName}" oninput="updateData('${type}', ${item.id}, 'name', this.value)"></td>
        <td class="num-cell">${pctInputHtml}</td>
        <td class="num-cell"><span id="weight-${item.id}" class="weight-display">0</span></td>
        <td style="text-align:center"><button class="del-btn" onclick="removeItem('${type}', ${item.id})">×</button></td>
    `;
    return tr;
}

function updateData(type, id, field, val) {
    const list = (type === 'flour') ? flours : ingredients;
    const item = list.find(x => x.id === id);
    if (item) {
        item[field] = (field === 'pct') ? (parseFloat(val) || 0) : val;
        recalculateWeights();
    }
}

function recalculateWeights() {
    const totalDoughGoal = portions.reduce((s, p) => s + p.qty * p.weight, 0);
    const totalEl = document.getElementById('totalDoughDisplay');
    if (totalEl) totalEl.textContent = totalDoughGoal.toLocaleString() + ' g';

    const flourSum = flours.reduce((s, f) => s + f.pct, 0);
    const otherSum = ingredients.reduce((s, i) => s + i.pct, 0);

    const sumEl = document.getElementById('currentFlourSum');
    const msgEl = document.getElementById('flourStatusMsg');
    const barEl = document.getElementById('flourStatusBar');

    if (sumEl) {
        sumEl.textContent = flourSum.toFixed(1) + '%';
        // Show red total when only 2 flours and they don't reach 100%
        const twoFlourMismatch = flours.length === 2 && Math.abs(flourSum - 100) >= 0.01;
        sumEl.style.color = twoFlourMismatch ? '#e24b4a' : '';
        sumEl.style.fontWeight = twoFlourMismatch ? 'bold' : '';
    }

    if (Math.abs(flourSum - 100) < 0.01) {
        msgEl.innerHTML = '<span style="color:#27500A; font-weight:bold;">ครบ 100% แล้ว</span>';
        barEl.style.borderLeftColor = '#97C459';
    } else if (flourSum < 100) {
        msgEl.innerHTML = `ยังขาดอีก <b>${(100 - flourSum).toFixed(1)}%</b>`;
        barEl.style.borderLeftColor = '#ccc';
    } else {
        msgEl.innerHTML = `<span class="over-limit">เกินไป ${(flourSum - 100).toFixed(1)}%</span>`;
        barEl.style.borderLeftColor = '#e24b4a';
    }

    const totalFlourBase = totalDoughGoal / ((100 + otherSum) / 100);

    flours.forEach(f => {
        const rawW = (totalFlourBase * f.pct) / 100;
        const el = document.getElementById(`weight-${f.id}`);
        if (el) el.textContent = roundInteger(rawW);
    });
    ingredients.forEach(i => {
        const rawW = (totalFlourBase * i.pct) / 100;
        const el = document.getElementById(`weight-${i.id}`);
        if (el) el.textContent = roundInteger(rawW);
    });
}

function addItem(type) {
    const newItem = {
        id: Date.now(),
        name: (type === 'flour' ? 'ระบุชื่อแป้ง' : 'ระบุชื่อส่วนผสม'),
        pct: 0,
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

renderTables();
renderPortions();

function showSummary() {
    const totalDough = portions.reduce((s, p) => s + p.qty * p.weight, 0);

    const otherSum = ingredients.reduce((s, i) => s + i.pct, 0);
    const totalFlourBase = totalDough / ((100 + otherSum) / 100);

    const t = (typeof translations !== 'undefined') ? translations[currentLang] : {};
    const getName = item => (t[item.name] || item.name);

    let flourRows = flours.map(f => {
        const w = Math.round((totalFlourBase * f.pct) / 100);
        return `<tr class="s-flour"><td>${getName(f)}</td><td>${f.pct}%</td><td>${w.toLocaleString()} g</td></tr>`;
    }).join('');

    let ingRows = ingredients.map(i => {
        const w = Math.round((totalFlourBase * i.pct) / 100);
        return `<tr><td>${getName(i)}</td><td>${i.pct}%</td><td>${w.toLocaleString()} g</td></tr>`;
    }).join('');

    const yieldLabel = t.yieldLabel || 'Yield';
    const totalLabel = t.totalLabel || 'Total';
    const thName = t.thName || 'Ingredient';
    const thPct = t.thPct || "Baker's %";
    const thWeight = t.thWeight || 'Weight (g)';

    const yieldParts = portions.map(p => `${p.qty} × ${p.weight} g`).join(' + ');
    document.getElementById('summaryContent').innerHTML = `
        <div class="summary-yield">${yieldLabel}: <strong>${yieldParts} = ${totalDough.toLocaleString()} g</strong></div>
        <table class="summary-table">
            <thead><tr><th>${thName}</th><th>${thPct}</th><th>${thWeight}</th></tr></thead>
            <tbody>${flourRows}${ingRows}</tbody>
            <tfoot><tr><td colspan="3" class="summary-total">${totalLabel}: ${totalDough.toLocaleString()} g</td></tr></tfoot>
        </table>`;

    document.getElementById('summaryModal').style.display = 'flex';
}

function closeSummary() {
    document.getElementById('summaryModal').style.display = 'none';
}

function handleOverlayClick(e) {
    if (e.target === document.getElementById('summaryModal')) closeSummary();
}
