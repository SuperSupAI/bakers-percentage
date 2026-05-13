// ===== Sourdough Calculator =====
// Levain model: 1:1:1 ratio (flour : water : ripe starter), starter at 100% hydration

let sdFlours = [
    { id: 1, name: 'Strong white flour', pct: 100, locked: true }
];
let sdInclusions = [];
let sdNextId = 10;

let sdRsHydration      = 100;   // Ripe starter hydration %
let sdLevainHydration  = 100;   // Levain hydration %
let sdLevainInoculPct  = 100;   // Ripe starter as % of levain flour

// ── Inputs ─────────────────────────────────────────────────────────────────
function sdGetInputs() {
    return {
        doughWeight: parseFloat(document.getElementById('sdDoughWeight').value) || 0,
        levainPct:   parseFloat(document.getElementById('sdLevainPct').value)   || 0,
        scale:       Math.max(1, parseInt(document.getElementById('sdScale').value) || 1),
        waterPct:    parseFloat(document.getElementById('sdWaterPct').value)    || 0,
        saltPct:     parseFloat(document.getElementById('sdSaltPct').value)     || 0,
    };
}

// ── Core calculation ────────────────────────────────────────────────────────
function sdCalc() {
    const { doughWeight, levainPct, scale, waterPct, saltPct } = sdGetInputs();

    const totalDough = doughWeight * scale;
    const incPctSum  = sdInclusions.reduce((s, i) => s + (i.pct || 0), 0);
    const otherPct   = waterPct + saltPct + incPctSum;
    const totalFlour = totalDough > 0 ? totalDough / (1 + otherPct / 100) : 0;

    // Flour blend weights
    const flourSum  = sdFlours.reduce((s, f) => s + f.pct, 0);
    const flourData = sdFlours.map(f => ({
        ...f, weight: Math.round(totalFlour * f.pct / 100)
    }));

    const waterW  = Math.round(totalFlour * waterPct / 100);
    const saltW   = Math.round(totalFlour * saltPct  / 100);
    const incData = sdInclusions.map(i => ({
        ...i, weight: Math.round(totalFlour * i.pct / 100)
    }));

    // Levain with customisable ratios
    const levainTotal   = totalFlour * levainPct / 100;
    const levainDivisor = 1 + sdLevainHydration / 100 + sdLevainInoculPct / 100;
    const levainFlour   = levainDivisor > 0 ? levainTotal / levainDivisor : 0;
    const levainWater   = levainFlour * sdLevainHydration / 100;
    const ripeStarter   = levainFlour * sdLevainInoculPct  / 100;

    // Ripe starter with customisable hydration
    const rsDivisor = 1 + sdRsHydration / 100;
    const rsFlour   = rsDivisor > 0 ? ripeStarter / rsDivisor : 0;
    const rsWater   = ripeStarter - rsFlour;

    // Pre-fermented flour = levain flour + ripe starter flour
    const pff    = levainFlour + rsFlour;
    const pffPct = totalFlour > 0 ? (pff / totalFlour) * 100 : 0;

    // Update PFF display
    document.getElementById('sdPffG').textContent   = Math.round(pff) + ' g';
    document.getElementById('sdPffPct').textContent = pffPct.toFixed(1) + '% PFF';

    // Update flour sum indicator
    const fsEl = document.getElementById('sdFlourSum');
    if (fsEl) {
        fsEl.textContent = (flourSum % 1 === 0 ? flourSum : flourSum.toFixed(1)) + '%';
        fsEl.className   = 'sd-flour-sum' + (Math.abs(flourSum - 100) > 0.05 ? ' sd-flour-sum-err' : '');
    }

    renderSdTotal(flourData, waterW, saltW, incData, waterPct, saltPct);
    renderSdFerments(levainFlour, levainWater, ripeStarter, rsFlour, rsWater, flourData, flourSum);
    renderSdMainDough(flourData, waterW, saltW, incData,
                      levainFlour, levainWater, rsFlour, rsWater, levainTotal, flourSum);
}

// ── Output: Total ingredients ───────────────────────────────────────────────
function renderSdTotal(flourData, waterW, saltW, incData, waterPct, saltPct) {
    const fRows = flourData.map(f => `
        <tr class="sd-flour-row">
            <td>${esc(f.name)}</td>
            <td class="ta-r">${f.pct}%</td>
            <td class="ta-r">${f.weight.toLocaleString()} g</td>
        </tr>`).join('');

    const incRows = incData.map(i => `
        <tr>
            <td>${esc(i.name)}</td>
            <td class="ta-r">${i.pct}%</td>
            <td class="ta-r">${i.weight.toLocaleString()} g</td>
        </tr>`).join('');

    const total = flourData.reduce((s, f) => s + f.weight, 0)
                + waterW + saltW
                + incData.reduce((s, i) => s + i.weight, 0);

    document.getElementById('sdTotalTable').innerHTML = `
        <table class="sd-result-table">
            <thead><tr>
                <th></th><th class="ta-r">Baker's %</th><th class="ta-r">Weight (g)</th>
            </tr></thead>
            <tbody>
                ${fRows}
                <tr><td>Water</td><td class="ta-r">${waterPct}%</td><td class="ta-r">${waterW.toLocaleString()} g</td></tr>
                <tr><td>Salt</td><td class="ta-r">${saltPct}%</td><td class="ta-r">${saltW.toLocaleString()} g</td></tr>
                ${incRows}
            </tbody>
            <tfoot>
                <tr><td colspan="2">Total weight</td><td class="ta-r">${total.toLocaleString()} g</td></tr>
            </tfoot>
        </table>`;
}

// ── Output: Ferments ────────────────────────────────────────────────────────
function renderSdFerments(levainFlour, levainWater, ripeStarter, rsFlour, rsWater, flourData, flourSum) {
    const fname    = flourData.length === 1 ? esc(flourData[0].name) : 'Flour';
    const rsFlourW = Math.round(rsFlour);
    const rsWaterW = Math.round(rsWater);
    const rsTotalW = rsFlourW + rsWaterW;
    const lFlourW  = Math.round(levainFlour);
    const lWaterW  = Math.round(levainWater);
    const rsAmt    = Math.round(ripeStarter);
    const lTotalW  = lFlourW + lWaterW + rsAmt;

    const pctCell = (val, onChange) =>
        `<div class="sd-ferment-pct-wrap">
            <input type="number" class="sd-ferment-pct" value="${val}" min="1" step="1"
                   onchange="${onChange}">
            <span class="sd-ferment-pct-sym">%</span>
        </div>`;

    document.getElementById('sdFermentsTable').innerHTML = `
        <table class="sd-result-table">
            <thead><tr>
                <th>Ripe starter</th><th class="ta-r">Baker's %</th><th class="ta-r">Weight (g)</th>
            </tr></thead>
            <tbody>
                <tr class="sd-flour-row"><td>${fname}</td><td class="ta-r">100%</td><td class="ta-r">${rsFlourW} g</td></tr>
                <tr><td>Water</td>
                    <td class="ta-r">${pctCell(sdRsHydration, 'sdRsHydration=+this.value||100;sdCalc()')}</td>
                    <td class="ta-r">${rsWaterW} g</td></tr>
            </tbody>
            <tfoot>
                <tr><td colspan="2">Total weight</td><td class="ta-r">${rsTotalW} g</td></tr>
            </tfoot>
        </table>
        <div class="sd-ferment-gap"></div>
        <table class="sd-result-table">
            <thead><tr>
                <th>Levain</th><th class="ta-r">Baker's %</th><th class="ta-r">Weight (g)</th>
            </tr></thead>
            <tbody>
                <tr class="sd-flour-row"><td>${fname}</td><td class="ta-r">100%</td><td class="ta-r">${lFlourW} g</td></tr>
                <tr><td>Water</td>
                    <td class="ta-r">${pctCell(sdLevainHydration, 'sdLevainHydration=+this.value||100;sdCalc()')}</td>
                    <td class="ta-r">${lWaterW} g</td></tr>
                <tr><td>Ripe starter</td>
                    <td class="ta-r">${pctCell(sdLevainInoculPct, 'sdLevainInoculPct=+this.value||100;sdCalc()')}</td>
                    <td class="ta-r">${rsAmt} g</td></tr>
            </tbody>
            <tfoot>
                <tr><td colspan="2">Total weight</td><td class="ta-r">${lTotalW} g</td></tr>
            </tfoot>
        </table>`;
}

// ── Output: Main dough ──────────────────────────────────────────────────────
function renderSdMainDough(flourData, waterW, saltW, incData,
                            levainFlour, levainWater, rsFlour, rsWater,
                            levainTotal, flourSum) {
    const flDeduct = levainFlour + rsFlour;
    const wDeduct  = levainWater + rsWater;

    const mainFlourRows = flourData.map(f => {
        const prop  = flourSum > 0 ? f.pct / flourSum : 0;
        const mainW = f.weight - Math.round(flDeduct * prop);
        return `<tr class="sd-flour-row"><td>${esc(f.name)}</td><td class="ta-r">${mainW.toLocaleString()} g</td></tr>`;
    }).join('');

    const mainWater = waterW - Math.round(wDeduct);
    const lv        = Math.round(levainTotal);
    const incRows   = incData.map(i =>
        `<tr><td>${esc(i.name)}</td><td class="ta-r">${i.weight.toLocaleString()} g</td></tr>`
    ).join('');

    const mainFlourTotal = flourData.reduce((s, f) => {
        const prop = flourSum > 0 ? f.pct / flourSum : 0;
        return s + f.weight - Math.round(flDeduct * prop);
    }, 0);
    const grandTotal = mainFlourTotal + mainWater + saltW
                     + incData.reduce((s, i) => s + i.weight, 0) + lv;

    document.getElementById('sdMainDoughTable').innerHTML = `
        <table class="sd-result-table">
            <thead><tr><th></th><th class="ta-r">Weight (g)</th></tr></thead>
            <tbody>
                ${mainFlourRows}
                <tr><td>Water</td><td class="ta-r">${mainWater.toLocaleString()} g</td></tr>
                <tr><td>Salt</td><td class="ta-r">${saltW.toLocaleString()} g</td></tr>
                <tr><td>Levain</td><td class="ta-r">${lv.toLocaleString()} g</td></tr>
                ${incRows}
            </tbody>
            <tfoot>
                <tr><td>Total weight</td><td class="ta-r">${grandTotal.toLocaleString()} g</td></tr>
            </tfoot>
        </table>`;
}

// ── Recipe editor ───────────────────────────────────────────────────────────
function renderSdFlourRows() {
    document.getElementById('sdFlourRows').innerHTML = sdFlours.map(f => `
        <div class="sd-row">
            <input class="sd-name-input" type="text" value="${esc(f.name)}" list="sd-price-names"
                   onblur="sdUpdateFlour(${f.id}, 'name', this.value)">
            <div class="sd-pct-cell">
                <input class="sd-pct-input${f.locked ? '' : ' auto-filled'}" type="number"
                       id="sd-pct-${f.id}" value="${f.pct}" min="0" max="100" step="0.5"
                       oninput="sdUpdateFlour(${f.id}, 'pct', this.value)">
                <span class="sd-pct-sym">%</span>
            </div>
            ${sdFlours.length > 1
                ? `<button class="sd-del-btn" onclick="sdDeleteFlour(${f.id})">×</button>`
                : `<span class="sd-del-placeholder"></span>`}
        </div>`).join('');
}

function renderSdInclusionRows() {
    document.getElementById('sdInclusionRows').innerHTML = sdInclusions.map(inc => `
        <div class="sd-row">
            <input class="sd-name-input" type="text" value="${esc(inc.name)}" list="sd-price-names"
                   onblur="sdUpdateInclusion(${inc.id}, 'name', this.value)">
            <div class="sd-pct-cell">
                <input class="sd-pct-input" type="number" value="${inc.pct}" min="0" step="0.1"
                       oninput="sdUpdateInclusion(${inc.id}, 'pct', this.value)">
                <span class="sd-pct-sym">%</span>
            </div>
            <button class="sd-del-btn" onclick="sdDeleteInclusion(${inc.id})">×</button>
        </div>`).join('');
}

function sdRedistributeAutoFlours() {
    const locked   = sdFlours.filter(f => f.locked);
    const unlocked = sdFlours.filter(f => !f.locked);
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

function sdSyncAutoFlourInputs() {
    sdFlours.filter(f => !f.locked).forEach(f => {
        const el = document.getElementById(`sd-pct-${f.id}`);
        if (el) el.value = f.pct;
    });
}

function sdUpdateFlour(id, field, val) {
    const f = sdFlours.find(f => f.id === id);
    if (!f) return;
    if (field === 'name') f.name = val.trim() || f.name;
    if (field === 'pct') {
        f.pct    = parseFloat(val) || 0;
        f.locked = true;
        const el = document.getElementById(`sd-pct-${f.id}`);
        if (el) el.classList.remove('auto-filled');
        sdRedistributeAutoFlours();
        sdSyncAutoFlourInputs();
    }
    sdCalc();
}

function sdDeleteFlour(id) {
    if (sdFlours.length <= 1) return;
    sdFlours = sdFlours.filter(f => f.id !== id);
    sdRedistributeAutoFlours();
    renderSdFlourRows();
    sdCalc();
}

function sdAddFlour() {
    sdFlours.push({ id: sdNextId++, name: 'Flour ' + (sdFlours.length + 1), pct: 0, locked: false });
    sdRedistributeAutoFlours();
    renderSdFlourRows();
    const inputs = document.querySelectorAll('#sdFlourRows .sd-name-input');
    const last   = inputs[inputs.length - 1];
    if (last) { last.focus(); last.select(); }
}

function sdUpdateInclusion(id, field, val) {
    const inc = sdInclusions.find(i => i.id === id);
    if (!inc) return;
    if (field === 'name') inc.name = val.trim() || inc.name;
    if (field === 'pct')  inc.pct  = parseFloat(val) || 0;
    sdCalc();
}

function sdDeleteInclusion(id) {
    sdInclusions = sdInclusions.filter(i => i.id !== id);
    renderSdInclusionRows();
    sdCalc();
}

function sdAddInclusion() {
    sdInclusions.push({ id: sdNextId++, name: 'Inclusion', pct: 0 });
    renderSdInclusionRows();
    const inputs = document.querySelectorAll('#sdInclusionRows .sd-name-input');
    const last   = inputs[inputs.length - 1];
    if (last) { last.focus(); last.select(); }
}

function esc(s) {
    return String(s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function sdInitDatalist() {
    let dl = document.getElementById('sd-price-names');
    if (!dl) {
        dl = document.createElement('datalist');
        dl.id = 'sd-price-names';
        document.body.appendChild(dl);
    }
    try {
        dl.innerHTML = Object.keys(getPriceList()).map(n => `<option value="${n}">`).join('');
    } catch (e) {}
}

// ── Init ────────────────────────────────────────────────────────────────────
if (typeof initDefaultPrices === 'function') initDefaultPrices();
sdInitDatalist();
renderSdFlourRows();
renderSdInclusionRows();
sdCalc();
