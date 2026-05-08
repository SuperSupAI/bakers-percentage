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
