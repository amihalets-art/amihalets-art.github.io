const API_BASE = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json';
const TARGET_CURRENCIES = ['USD', 'EUR', 'PLN']; 

const grid = document.getElementById('currency-grid');
const dateInput = document.getElementById('date-input');
const uahInput = document.getElementById('uah-input');
const themeToggle = document.getElementById('theme-toggle');

let currentRates = [];

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setInitialDate();
    setupEventListeners();
    fetchAndRenderData(dateInput.value);
});

function setupEventListeners() {
    themeToggle.addEventListener('click', toggleTheme);
    dateInput.addEventListener('change', (e) => fetchAndRenderData(e.target.value));
    uahInput.addEventListener('input', renderCards);
}

function setInitialDate() {
    const today = new Date().toISOString().split('T')[0];
    dateInput.max = today;
    dateInput.value = today;
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
}

function formatApiDate(dateString) {
    return dateString.replace(/-/g, '');
}

function getPreviousDate(dateString) {
    const date = new Date(dateString);
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
}

async function fetchAndRenderData(selectedDate) {
    renderSkeletons();
    
    const prevDate = getPreviousDate(selectedDate);
    const apiDateCurrent = formatApiDate(selectedDate);
    const apiDatePrev = formatApiDate(prevDate);

    try {
        const [resCurrent, resPrev] = await Promise.all([
            fetch(`${API_BASE}&date=${apiDateCurrent}`),
            fetch(`${API_BASE}&date=${apiDatePrev}`)
        ]);

        if (!resCurrent.ok || !resPrev.ok) throw new Error('Помилка завантаження даних');

        const dataCurrent = await resCurrent.json();
        const dataPrev = await resPrev.json();

        processData(dataCurrent, dataPrev);
    } catch (error) {
        console.error(error);
        grid.innerHTML = `<p style="color: red; grid-column: 1/-1;">Сталася помилка при завантаженні даних з НБУ.</p>`;
    }
}

function processData(currentData, prevData) {
    currentRates = currentData
        .filter(item => TARGET_CURRENCIES.includes(item.cc))
        .map(current => {
            const prev = prevData.find(p => p.cc === current.cc);
            const trendValue = prev ? (current.rate - prev.rate) : 0;
            
            let trendIcon = '➖';
            let trendClass = 'trend-flat';
            if (trendValue > 0) { trendIcon = '↑'; trendClass = 'trend-up'; }
            if (trendValue < 0) { trendIcon = '↓'; trendClass = 'trend-down'; }

            return {
                cc: current.cc,
                txt: current.txt,
                rate: current.rate,
                trendIcon,
                trendClass
            };
        });

    renderCards();
}

function renderCards() {
    grid.innerHTML = '';
    const uahAmount = parseFloat(uahInput.value);

    currentRates.forEach(currency => {
        const card = document.createElement('div');
        card.className = 'card';

        let calcHTML = '';
        if (!isNaN(uahAmount) && uahAmount > 0) {
            const result = (uahAmount / currency.rate).toFixed(2);
            calcHTML = `<div class="calc-result">≈ ${result} ${currency.cc}</div>`;
        }

        card.innerHTML = `
            <div class="card-header">
                <span>${currency.cc}</span>
                <span class="${currency.trendClass}" title="Тренд порівняно з попереднім днем">
                    ${currency.trendIcon}
                </span>
            </div>
            <div class="rate" title="${currency.txt}">${currency.rate.toFixed(4)} ₴</div>
            ${calcHTML}
        `;
        grid.appendChild(card);
    });
}

function renderSkeletons() {
    grid.innerHTML = '';
    for (let i = 0; i < TARGET_CURRENCIES.length; i++) {
        grid.innerHTML += `
            <div class="card">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text" style="height: 30px; width: 80%;"></div>
                <div class="skeleton skeleton-text" style="width: 40%; margin-top: 10px;"></div>
            </div>
        `;
    }
}