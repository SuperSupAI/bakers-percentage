let flours = [
    { id: 1, name: 'Bread Flour', pct: 100 },
    { id: 2, name: 'Whole Wheat Flour', pct: 0 }
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

function renderTables() {
    const fBody = document.getElementById('flourBody');
    if(fBody) fBody.innerHTML = '';
    flours.forEach(f => fBody.appendChild(createRow(f, 'flour')));

    const iBody = document.getElementById('ingBody');
    if(iBody) iBody.innerHTML = '';
    ingredients.forEach(i => iBody.appendChild(createRow(i, 'ing')));
    
    recalculateWeights();
}

function createRow(item, type) {
    const tr = document.createElement('tr');
    if(type === 'flour') tr.className = 'flour-row';
    
    // ค้นหาชื่อแปลจาก translations โดยใช้ currentLang
    // ถ้าหาไม่เจอ (เช่น แป้งที่เพิ่มใหม่) ให้ใช้ชื่อเดิมของมัน
    const displayName = (typeof translations !== 'undefined' && translations[currentLang][item.name]) 
                        ? translations[currentLang][item.name] 
                        : item.name;

    tr.innerHTML = `
        <td><input type="text" value="${displayName}" oninput="updateData('${type}', ${item.id}, 'name', this.value)"></td>
        <td class="num-cell">
            <input type="number" step="any" value="${item.pct}" oninput="updateData('${type}', ${item.id}, 'pct', this.value)">
        </td>
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
    const num = parseFloat(document.getElementById('numPieces').value) || 0;
    const weight = parseFloat(document.getElementById('weightPerPiece').value) || 0;
    const totalDoughGoal = num * weight;
    document.getElementById('totalDoughDisplay').textContent = totalDoughGoal.toLocaleString() + ' g';

    const flourSum = flours.reduce((s, f) => s + f.pct, 0);
    const otherSum = ingredients.reduce((s, i) => s + i.pct, 0);

    const sumEl = document.getElementById('currentFlourSum');
    const msgEl = document.getElementById('flourStatusMsg');
    const barEl = document.getElementById('flourStatusBar');
    
    if(sumEl) sumEl.textContent = flourSum.toFixed(1) + '%';

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
        if(el) el.textContent = roundInteger(rawW);
    });
    ingredients.forEach(i => {
        const rawW = (totalFlourBase * i.pct) / 100;
        const el = document.getElementById(`weight-${i.id}`);
        if(el) el.textContent = roundInteger(rawW);
    });
}

function addItem(type) {
    const newItem = { 
        id: Date.now(), 
        name: (type === 'flour' ? 'ระบุชื่อแป้ง' : 'ระบุชื่อส่วนผสม'), 
        pct: 0 
    };
    if (type === 'flour') flours.push(newItem);
    else ingredients.push(newItem);
    renderTables();
}

function removeItem(type, id) {
    if (type === 'flour' && flours.length > 1) flours = flours.filter(f => f.id !== id);
    else if (type === 'ing') ingredients = ingredients.filter(i => i.id !== id);
    renderTables();
}

// เริ่มต้นวาดตาราง
renderTables();