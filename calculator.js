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
    { id: 4, name: 'Salt',        pct: 1.2,  price: 0 },
    { id: 5, name: 'Milk Powder', pct: 4,    price: 0 },
    { id: 6, name: 'Sugar',       pct: 10,   price: 0 },
    { id: 7, name: 'Milk',        pct: 25,   price: 0 },
    { id: 8, name: 'Water',       pct: 49,   price: 0 },
    { id: 9, name: 'Butter',      pct: 9,    price: 0 }
];

let inclusions = [
    { id: 201, name: 'White sesame',   pct: 2, enabled: true, price: 0 },
    { id: 202, name: 'Black sesame',   pct: 2, enabled: true, price: 0 },
    { id: 203, name: 'Chia seed',      pct: 2, enabled: true, price: 0 },
    { id: 204, name: 'Flaxseed',       pct: 2, enabled: true, price: 0 },
    { id: 205, name: 'Sunflower seed', pct: 6, enabled: true, price: 0 },
    { id: 206, name: 'Pumpkin seed',   pct: 6, enabled: true, price: 0 },
];

function renderInclusions() {
    const container = document.getElementById('inclusionRows');
    if (!container) return;
    container.innerHTML = '';
    inclusions.forEach(item => {
        const row = document.createElement('div');
        row.className = 'inclusion-row' + (item.enabled ? '' : ' inclusion-disabled');
        const priceLabel = item.price ? item.price.toFixed(3) : '—';
        const displayName = (typeof translations !== 'undefined' && translations[currentLang]?.[item.name])
            ? translations[currentLang][item.name] : item.name;
        row.innerHTML = `
            <input type="checkbox" class="inclusion-check" ${item.enabled ? 'checked' : ''} onchange="toggleInclusion(${item.id}, this.checked)">
            <input type="text" class="inclusion-name" value="${displayName}" list="price-names" oninput="updateInclusion(${item.id}, 'name', this.value)">
            <div class="inclusion-pct-wrap">
                <input type="number" class="inclusion-pct-input" value="${item.pct}" step="0.1" min="0" oninput="updateInclusion(${item.id}, 'pct', this.value)" ${item.enabled ? '' : 'disabled'}>
                <span class="inclusion-pct-sym">%</span>
            </div>
            <span class="inclusion-weight" id="incw-${item.id}">— g</span>
            <span class="inclusion-price" id="incp-${item.id}">${priceLabel}</span>
            <span class="inclusion-cost cost-display" id="incc-${item.id}">—</span>
            <button class="inclusion-del" onclick="removeInclusion(${item.id})">×</button>
        `;
        container.appendChild(row);
    });
    recalculateWeights();
}

function toggleInclusion(id, checked) {
    const item = inclusions.find(x => x.id === id);
    if (!item) return;
    item.enabled = checked;
    renderInclusions();
}

function updateInclusion(id, field, val) {
    const item = inclusions.find(x => x.id === id);
    if (!item) return;
    item[field] = field === 'pct' ? (parseFloat(val) || 0) : val;
    if (field === 'name') {
        const entry = getPriceList()[val];
        item.price = entry?.pricePerGram || 0;
    }
    recalculateWeights();
}

function showInclusionSection() {
    const section = document.getElementById('inclusionSection');
    const btn     = document.getElementById('btn-add-inclusion');
    if (section) section.style.display = '';
    if (btn)     btn.style.display     = 'none';
    recalculateWeights();
}

function hideInclusionSection() {
    const section = document.getElementById('inclusionSection');
    const btn     = document.getElementById('btn-add-inclusion');
    if (section) section.style.display = 'none';
    if (btn)     btn.style.display     = '';
    recalculateWeights();
}

function addInclusion() {
    inclusions.push({ id: Date.now(), name: 'ระบุชื่อเมล็ด', pct: 0, enabled: true, price: 0 });
    renderInclusions();
}

function removeInclusion(id) {
    inclusions = inclusions.filter(x => x.id !== id);
    renderInclusions();
}

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
    [...flours, ...ingredients, ...inclusions].forEach(item => {
        const entry = priceList[item.name];
        if (!item.price && entry?.pricePerGram > 0) {
            item.price = entry.pricePerGram;
        }
    });
}

function roundInteger(value) {
    return Math.round(value);
}

function ceilFmt(value) {
    return (Math.ceil(value * 100) / 100).toFixed(2);
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
        <td class="num-cell"><span id="price-${item.id}" class="price-display">${item.price ? item.price.toFixed(2) : '—'}</span></td>
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
        if (priceEl) priceEl.textContent = item.price ? item.price.toFixed(2) : '—';
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
                `<span class="cost-total-val">฿${ceilFmt(cost)}</span>` +
                `<small class="cost-per-piece">฿${ceilFmt(cpp)}/ก้อน</small>`;
        } else {
            costEl.textContent = '—';
        }
    }

    flours.forEach(updateRowCost);
    ingredients.forEach(updateRowCost);

    const doughCost = totalCost;
    const doughCpp  = totalPieces > 0 ? doughCost / totalPieces : 0;
    const doughCostEl = document.getElementById('doughCostDisplay');
    const doughCppEl  = document.getElementById('doughCppDisplay');
    if (doughCostEl) doughCostEl.textContent = '฿' + ceilFmt(doughCost);
    if (doughCppEl)  doughCppEl.textContent  = totalPieces > 0 ? '฿' + ceilFmt(doughCpp) + '/ก้อน' : '';

    let inclusionTotalPct = 0;
    let inclusionTotalWeight = 0;
    let inclusionTotalCost = 0;
    const inclusionVisible = document.getElementById('inclusionSection')?.style.display !== 'none';
    inclusions.forEach(item => {
        const rawW = (totalFlourBase * item.pct) / 100;
        const weightEl = document.getElementById(`incw-${item.id}`);
        if (weightEl) weightEl.textContent = item.enabled ? roundInteger(rawW) + ' g' : '—';

        const priceEl = document.getElementById(`incp-${item.id}`);
        if (priceEl) priceEl.textContent = item.price ? item.price.toFixed(2) : '—';

        const cost = rawW * (item.price || 0);
        const costEl = document.getElementById(`incc-${item.id}`);
        if (costEl) {
            if (item.enabled && (item.price || 0) > 0) {
                const cpp = totalPieces > 0 ? cost / totalPieces : 0;
                costEl.innerHTML =
                    `<span class="cost-total-val">฿${ceilFmt(cost)}</span>` +
                    `<small class="cost-per-piece">฿${ceilFmt(cpp)}/ก้อน</small>`;
            } else {
                costEl.textContent = '—';
            }
        }

        if (item.enabled && inclusionVisible) {
            inclusionTotalPct += item.pct;
            inclusionTotalWeight += rawW;
            inclusionTotalCost += cost;
            totalCost += cost;
        }
    });
    const incPctEl  = document.getElementById('inclusionTotalPct');
    const incWgtEl  = document.getElementById('inclusionTotalWeight');
    const incCostEl = document.getElementById('inclusionTotalCost');
    if (incPctEl)  incPctEl.textContent  = inclusionTotalPct.toFixed(1);
    if (incWgtEl)  incWgtEl.textContent  = roundInteger(inclusionTotalWeight);
    if (incCostEl) incCostEl.textContent = inclusionTotalCost > 0 ? '฿' + ceilFmt(inclusionTotalCost) : '';

    const totalCostEl = document.getElementById('totalCostDisplay');
    const totalCppEl  = document.getElementById('totalCppDisplay');
    if (totalCostEl) totalCostEl.textContent = '฿' + ceilFmt(totalCost);
    if (totalCppEl)  totalCppEl.textContent  = totalPieces > 0 ? '฿' + ceilFmt(totalCost / totalPieces) + '/ก้อน' : '';

    let allocated = 0;
    portions.forEach((p, idx) => {
        const el = document.getElementById(`portion-cost-${p.id}`);
        if (!el) return;
        if (totalCost > 0 && portionsTotal > 0) {
            const pCostRaw = totalCost * (p.qty * p.weight) / portionsTotal;
            const pCost    = Math.ceil(pCostRaw * 100) / 100;
            const pCpp     = p.qty > 0 ? Math.ceil((pCost / p.qty) * 100) / 100 : 0;
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
            portions, flours, ingredients, inclusions, timestamp: Date.now()
        }));
    } catch(e) {}
}

initDefaultPrices();
renderTables();
renderPortions();
renderInclusions();

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
            ? `฿${ceilFmt(cost)}<br><small style="color:var(--color-text-light)">฿${ceilFmt(cpp)}/ก้อน</small>`
            : '—';
        return `<tr class="${cls}"><td>${getName(item)}</td><td>${item.pct}%</td><td>${w.toLocaleString()} g</td><td>${costStr}</td></tr>`;
    };

    const flourRows = flours.map(f => makeRow(f, 's-flour')).join('');
    const ingRows   = ingredients.map(i => makeRow(i, '')).join('');

    const enabledInclusions = inclusions.filter(i => i.enabled);
    const incTotalPct = enabledInclusions.reduce((s, i) => s + i.pct, 0);
    const incRows = enabledInclusions.length > 0
        ? `<tr class="s-inclusion-header"><td colspan="4" style="padding-top:10px;font-size:12px;color:var(--color-text-muted);font-weight:700;letter-spacing:0.3px;">INCLUSIONS (${incTotalPct.toFixed(1)}% of flour)</td></tr>`
          + enabledInclusions.map(i => makeRow(i, 's-inclusion')).join('')
        : '';

    const thCost     = t.thCost    || 'ราคา (฿)';
    const yieldParts = portions.map(p => `${p.qty} × ${p.weight} g`).join(' + ');
    const cpp_total  = totalPieces > 0 ? totalCost / totalPieces : 0;

    const costSummary = totalCost > 0 ? `
        <div class="summary-cost-row">
            <span>ต้นทุนรวม: <strong>฿${ceilFmt(totalCost)}</strong></span>
            <span>เฉลี่ย/ก้อน: <strong>฿${ceilFmt(cpp_total)}</strong></span>
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
            <tbody>${flourRows}${ingRows}${incRows}</tbody>
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
