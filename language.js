const translations = {
    th: {
        title: "Baker's Percentage Calculator",
        subtitle: "คำนวณน้ำหนักกรัมแบบปัดเศษจำนวนเต็ม (Standard Rounding)",
        step1: "ขั้นตอนที่ 1 — กำหนดจำนวนและขนาดก้อน",
        numPcs: "จำนวนก้อน",
        weightPcs: "น้ำหนักต่อก้อน (g)",
        totalGoal: "โดว์รวมที่ต้องการ",
        flourSum: "ยอดรวมแป้งปัจจุบัน",
        flourLabel: "รายการแป้ง (FLOURS)",
        ingLabel: "ส่วนผสมอื่นๆ (OTHER INGREDIENTS)",
        thName: "วัตถุดิบ",
        thPct: "Baker's %",
        thWeight: "น้ำหนัก (g)",
        addFlour: "เพิ่มแป้ง",
        addIng: "เพิ่มส่วนผสมอื่น",
        note: "<strong>Rounding:</strong> ระบบจะปัดเศษเป็นจำนวนเต็ม",
        btnSummary: "สรุปสูตร",
        btnPrint: "พิมพ์",
        yieldLabel: "ได้",
        totalLabel: "รวม",
        // ชื่อวัตถุดิบ
        'Bread Flour': 'แป้งขนมปัง',
        'Whole Wheat Flour': 'แป้งโฮลวีท',
        'Yeast': 'ยีสต์',
        'Salt': 'เกลือ',
        'Milk Powder': 'นมผง',
        'Sugar': 'น้ำตาล',
        'Milk': 'นม',
        'Water': 'น้ำ',
        'Butter': 'เนย'
    },
    en: {
        title: "Baker's Percentage Calculator",
        subtitle: "Grams calculation with standard rounding",
        step1: "Step 1 — Set Quantity & Size",
        numPcs: "Quantity",
        weightPcs: "Weight/Piece (g)",
        totalGoal: "Total Dough Goal",
        flourSum: "Current Flour Total",
        flourLabel: "FLOUR LIST",
        ingLabel: "OTHER INGREDIENTS",
        thName: "INGREDIENTS",
        thPct: "Baker's %",
        thWeight: "Weight (g)",
        addFlour: "Add Flour",
        addIng: "Add Ingredient",
        note: "<strong>Rounding:</strong> Rounded to nearest integer",
        btnSummary: "Recipe Summary",
        btnPrint: "Print",
        yieldLabel: "Yield",
        totalLabel: "Total",
        // ชื่อวัตถุดิบ
        'Bread Flour': 'Bread Flour',
        'Whole Wheat Flour': 'Whole Wheat Flour',
        'Yeast': 'Yeast',
        'Salt': 'Salt',
        'Milk Powder': 'Milk Powder',
        'Sugar': 'Sugar',
        'Milk': 'Milk',
        'Water': 'Water',
        'Butter': 'Butter'
    }
};

let currentLang = 'th';

function changeLang(lang) {
    currentLang = lang;
    
    // 1. เปลี่ยนข้อความทุกลาเบลตาม ID (สำหรับจุดที่มีจุดเดียว)
    const sets = [
        ['txt-title', 'title'], ['txt-subtitle', 'subtitle'], ['txt-step1', 'step1'],
        ['txt-num-pcs', 'numPcs'], ['txt-weight-pcs', 'weightPcs'], ['txt-total-goal', 'totalGoal'],
        ['txt-flour-sum', 'flourSum'], ['label-flour', 'flourLabel'], ['label-ing', 'ingLabel'],
        ['txt-th-pct', 'thPct'], ['txt-th-weight', 'thWeight'],
        ['txt-note', 'note']
    ];

    sets.forEach(s => {
        const el = document.getElementById(s[0]);
        if(el) el.innerHTML = translations[lang][s[1]];
    });
    const nameLabels = document.querySelectorAll('.txt-th-name');
    nameLabels.forEach(el => {
        el.innerHTML = translations[lang].thName;
    });

    // เปลี่ยนข้อความในปุ่ม
    document.getElementById('btn-add-flour').innerHTML = `<i class="ti ti-plus"></i> ${translations[lang].addFlour}`;
    document.getElementById('btn-add-ing').innerHTML = `<i class="ti ti-plus"></i> ${translations[lang].addIng}`;
    document.getElementById('btn-summary').innerHTML = `<i class="ti ti-clipboard-list"></i> ${translations[lang].btnSummary}`;
    const btnPrint = document.getElementById('txt-btn-print');
    if (btnPrint) btnPrint.textContent = translations[lang].btnPrint;

    renderTables(); // สั่งวาดตารางใหม่เพื่อเปลี่ยนชื่อวัตถุดิบ
    
    document.getElementById('btn-th').classList.toggle('active', lang === 'th');
    document.getElementById('btn-en').classList.toggle('active', lang === 'en');
}
changeLang('th');