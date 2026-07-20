const API_BASE = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json';

const dateInput = document.getElementById('date-input');
const currencySelect = document.getElementById('currency-select');
const latestContainer = document.getElementById('latest-rate-container');

document.addEventListener('DOMContentLoaded', () => {
    setInitialDate();
    dateInput.addEventListener('change', handleQuery);
    currencySelect.addEventListener('change', handleQuery);
    handleQuery();
});

function setInitialDate() {
    const today = new Date().toISOString().split('T')[0];
    dateInput.max = today;
    dateInput.value = today;
}

function formatApiDate(dateStr) {
    return dateStr.replace(/-/g, '');
}

async function handleQuery() {
    const dateStr = dateInput.value;
    const currency = currencySelect.value;
    
    if (!dateStr || !currency) return;
    
    latestContainer.innerHTML = '<div class="placeholder">Отримання даних...</div>';
    
    try {
        const apiDate = formatApiDate(dateStr);
        const res = await fetch(`${API_BASE}&valcode=${currency}&date=${apiDate}`);
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        
        if (data.length > 0) {
            const rate = data[0].rate.toFixed(4);
            latestContainer.innerHTML = `
                <div class="rate-display">
                    <div class="rate-currency">${currency} / UAH</div>
                    <div class="rate-value">${rate} ₴</div>
                </div>
            `;
        } else {
            latestContainer.innerHTML = '<div class="placeholder">Немає курсу на цю дату</div>';
        }
    } catch (err) {
        latestContainer.innerHTML = '<div class="placeholder" style="color: red;">Помилка з\'єднання</div>';
    }
}