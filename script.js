// ==========================================
// 1. ИНИЦИАЛИЗАЦИЯ YANDEX SDK
// ==========================================
let ysdk = null;
YaGames.init().then(_ysdk => { ysdk = _ysdk; }).catch(err => console.error(err));

// ==========================================
// 2. ДЕРЕВО ЭВОЛЮЦИИ И ДАННЫЕ (УСЛОЖНЕННАЯ ЭКОНОМИКА)
// ==========================================
let state = { 
    balance: 0, clickPower: 1, moneyPerSecond: 0, jobIndex: 0, totalClicks: 0, prestigeMultiplier: 1,
    settings: { musicVol: 0.5, sfxVol: 0.5, isMobileView: false }
};

// Переменные рекламных бустов
let adBoostMult = 1; 
let adAutoClickerTimer = null;
let isComboActive = false; 
let comboValue = 0; 

function formatNum(num) { return Math.floor(num).toLocaleString('ru-RU'); }

function getShopIcon(emoji, bgColor) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="${bgColor}" /><text x="50" y="50" font-size="45" text-anchor="middle" dy=".35em" font-family="sans-serif">${emoji}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Эволюции
const evolutions = [
    { title: "Бомж-Бекон", cost: 0, sprite: "bacon_0.png" },
    { title: "Обычный Бекон", cost: 250, sprite: "bacon_1.png" },
    { title: "Новичок Обби", cost: 1500, sprite: "bacon_2.png" }, 
    { title: "Про в Прятках", cost: 15000, sprite: "bacon_3.png" },
    { title: "Фармер Тайкунов", cost: 100000, sprite: "bacon_4.png" },
    { title: "Игрок Adopt Me", cost: 500000, sprite: "bacon_5.png" },
    { title: "Мамкин Трейдер", cost: 2500000, sprite: "bacon_6.png" },
    { title: "Донатер", cost: 15000000, sprite: "bacon_7.png" },
    { title: "Миллионер", cost: 100000000, sprite: "bacon_8.png" },
    { title: "Ютубер Роблокс", cost: 500000000, sprite: "bacon_9.png" },
    { title: "Владелец Сервера", cost: 2500000000, sprite: "bacon_10.png" },
    { title: "Создатель Игры", cost: 15000000000, sprite: "bacon_11.png" },
    { title: "Роблокс-Админ", cost: 100000000000, sprite: "bacon_14.png" },
    { title: "Властелин Роблокса", cost: 500000000000, sprite: "bacon_12.png" },
    { title: "Роблокс-Бог", cost: 5000000000000, sprite: "bacon_13.png" }
];

// Магазин
const defaultUpgrades = [
    { id: 'u1', name: "Свинка-копилка", desc: "Хранит мелочь.", type: "click", value: 1, cost: 50, count: 0, reqStage: 0, sprite: getShopIcon("🐷", "#ff9a9e") },
    { id: 'u2', name: "Блокси Кола", desc: "Ускоряет твои клики.", type: "click", value: 5, cost: 500, count: 0, reqStage: 1, sprite: getShopIcon("🥤", "#74b9ff") },
    { id: 'u3', name: "Дешёвый Пит", desc: "Питомец кликает за тебя.", type: "idle", value: 15, cost: 2500, count: 0, reqStage: 2, sprite: getShopIcon("🐶", "#55efc4") },
    { id: 'u4', name: "Геймпасс x2", desc: "Удваивает пассив из Тайкуна.", type: "idle", value: 100, cost: 15000, count: 0, reqStage: 4, sprite: getShopIcon("🎫", "#ffeaa7") },
    { id: 'u5', name: "VIP Статус", desc: "Больше робаксов в секунду.", type: "idle", value: 500, cost: 100000, count: 0, reqStage: 5, sprite: getShopIcon("⭐", "#0984e3") },
    { id: 'u6', name: "Неоновый Пет", desc: "Крутой пет из Adopt Me.", type: "idle", value: 5000, cost: 1000000, count: 0, reqStage: 7, sprite: getShopIcon("🦄", "#6c5ce7") },
    { id: 'u7', name: "Личный Сервер", desc: "Игроки донатят тебе.", type: "idle", value: 50000, cost: 15000000, count: 0, reqStage: 9, sprite: getShopIcon("🖥️", "#2d3436") },
    { id: 'u8', name: "Доминус", desc: "Невероятная мощь тапа.", type: "click", value: 100000, cost: 50000000, count: 0, reqStage: 10, sprite: getShopIcon("🎩", "#a29bfe") },
    { id: 'u9', name: "Реклама у Ютубера", desc: "Огромный приток денег.", type: "idle", value: 2500000, cost: 1000000000, count: 0, reqStage: 12, sprite: getShopIcon("📺", "#ff7675") },
    { id: 'u10', name: "Фабрика Робаксов", desc: "Бесконечные деньги.", type: "idle", value: 50000000, cost: 25000000000, count: 0, reqStage: 13, sprite: getShopIcon("🏭", "#f1c40f") }
];
let upgrades = JSON.parse(JSON.stringify(defaultUpgrades));

// Ачивки
const defaultAchievements = [
    { id: 'e1', name: 'Начало пути', desc: 'Стать Обычным Беконом', type: 'evolution', threshold: 1, reward: 500, unlocked: false, icon: '🌟' },
    { id: 'e2', name: 'Прыгун', desc: 'Стать Новичком Обби', type: 'evolution', threshold: 2, reward: 2500, unlocked: false, icon: '🏃' },
    { id: 'e3', name: 'Скрытный', desc: 'Стать Про в Прятках', type: 'evolution', threshold: 3, reward: 15000, unlocked: false, icon: '👀' },
    { id: 'e4', name: 'Строитель', desc: 'Стать Фармером Тайкунов', type: 'evolution', threshold: 4, reward: 50000, unlocked: false, icon: '🏗️' },
    { id: 'e5', name: 'Любитель питомцев', desc: 'Игрок Adopt Me', type: 'evolution', threshold: 5, reward: 250000, unlocked: false, icon: '🐶' },
    { id: 'e6', name: 'Бизнесмен', desc: 'Стать Мамкиным Трейдером', type: 'evolution', threshold: 6, reward: 1000000, unlocked: false, icon: '📈' },
    { id: 'e7', name: 'Первый донат', desc: 'Стать Донатером', type: 'evolution', threshold: 7, reward: 5000000, unlocked: false, icon: '💳' },
    { id: 'e8', name: 'Элита', desc: 'Стать Миллионером', type: 'evolution', threshold: 8, reward: 25000000, unlocked: false, icon: '💰' },
    { id: 'e9', name: 'Звезда интернета', desc: 'Стать Ютубером', type: 'evolution', threshold: 9, reward: 100000000, unlocked: false, icon: '▶️' },
    { id: 'e10', name: 'Хозяин онлайна', desc: 'Владелец Сервера', type: 'evolution', threshold: 10, reward: 500000000, unlocked: false, icon: '🖥️' },
    { id: 'e11', name: 'Творец миров', desc: 'Создатель Игры', type: 'evolution', threshold: 11, reward: 2500000000, unlocked: false, icon: '🎮' },
    { id: 'e12', name: 'Модератор', desc: 'Стать Роблокс-Админом', type: 'evolution', threshold: 12, reward: 10000000000, unlocked: false, icon: '🛡️' },
    { id: 'e13', name: 'Повелитель', desc: 'Властелин Роблокса', type: 'evolution', threshold: 13, reward: 50000000000, unlocked: false, icon: '👑' },
    { id: 'e14', name: 'Абсолют', desc: 'Стать Роблокс-Богом', type: 'evolution', threshold: 14, reward: 500000000000, unlocked: false, icon: '🌌' },
    
    // Остальные ачивки
    { id: 'a5', name: 'Быстрые пальцы', desc: 'Сделать 1,000 кликов', type: 'clicks', threshold: 1000, reward: 50000, unlocked: false, icon: '⚡' },
    { id: 'a6', name: 'Автокликер', desc: 'Сделать 10,000 кликов', type: 'clicks', threshold: 10000, reward: 5000000, unlocked: false, icon: '🤖' }
];
let achievements = JSON.parse(JSON.stringify(defaultAchievements));

// ==========================================
// 3. АУДИОДВИЖОК
// ==========================================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let isAudioInitialized = false; let musicInterval = null; let seqStep = 0;
const masterMusicGain = audioCtx.createGain(); const masterSfxGain = audioCtx.createGain();
masterMusicGain.connect(audioCtx.destination); masterSfxGain.connect(audioCtx.destination);

function applyVolumeSettings() {
    masterMusicGain.gain.value = state.settings.musicVol; masterSfxGain.gain.value = state.settings.sfxVol;
    document.getElementById('slider-music').value = state.settings.musicVol; document.getElementById('slider-sfx').value = state.settings.sfxVol;
}

function startMusicSequence() {
    if (musicInterval) clearInterval(musicInterval);
    musicInterval = setInterval(() => {
        if (state.settings.musicVol === 0 || audioCtx.state !== 'running') return;
        let sequence = [261.63, 329.63, 392.00, 523.25]; 
        if (state.jobIndex > 5) sequence = [261.63, 329.63, 392.00, 440.0, 523.25, 392.00]; 
        if (state.jobIndex > 10) sequence = [261.63, 293.66, 329.63, 392.00, 440.0, 523.25, 587.33, 659.25];
        const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
        osc.type = 'square'; osc.frequency.value = sequence[seqStep % sequence.length];
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.005, audioCtx.currentTime + 0.2);
        osc.connect(gain); gain.connect(masterMusicGain); osc.start(); osc.stop(audioCtx.currentTime + 0.2);
        seqStep++;
    }, 250); 
}

function playPopSound() {
    if (!isAudioInitialized || state.settings.sfxVol === 0 || audioCtx.state !== 'running') return;
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(400 + Math.random() * 200, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.6, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.02, audioCtx.currentTime + 0.1);
    osc.connect(gain); gain.connect(masterSfxGain); osc.start(); osc.stop(audioCtx.currentTime + 0.1);
}

function playEvolutionSound() {
    if (!isAudioInitialized || state.settings.sfxVol === 0 || audioCtx.state !== 'running') return;
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.type = 'triangle'; osc.frequency.setValueAtTime(200, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.6, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    osc.connect(gain); gain.connect(masterSfxGain); osc.start(); osc.stop(audioCtx.currentTime + 0.5);
}

function playAchievementSound() {
    if (!isAudioInitialized || state.settings.sfxVol === 0 || audioCtx.state !== 'running') return;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, index) => {
        setTimeout(() => {
            if(audioCtx.state !== 'running') return;
            const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
            osc.type = 'triangle'; osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.5, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
            osc.connect(gain); gain.connect(masterSfxGain); osc.start(); osc.stop(audioCtx.currentTime + 0.15);
        }, index * 100);
    });
}

document.getElementById('slider-music').addEventListener('input', (e) => { state.settings.musicVol = parseFloat(e.target.value); applyVolumeSettings(); saveGame(); });
document.getElementById('slider-sfx').addEventListener('input', (e) => { state.settings.sfxVol = parseFloat(e.target.value); applyVolumeSettings(); playPopSound(); saveGame(); });
document.addEventListener("visibilitychange", () => { if (document.hidden && audioCtx.state === 'running') audioCtx.suspend(); else if (!document.hidden && isAudioInitialized && audioCtx.state === 'suspended') audioCtx.resume(); });


// ==========================================
// 4. ГЛАВНАЯ ЛОГИКА (РЕБЁРТЫ, КОМБО, РЕКЛАМА)
// ==========================================
function getEffectiveCPS() {
    let mult = state.prestigeMultiplier || 1;
    mult *= adBoostMult; 
    if (isComboActive) mult *= 3;
    return state.moneyPerSecond * mult;
}
function getEffectiveClick() {
    let mult = state.prestigeMultiplier || 1;
    mult *= adBoostMult; 
    if (isComboActive) mult *= 3;
    return state.clickPower * mult;
}

function loadGame() {
    const savedState = localStorage.getItem('tycoonKidsState'); const savedUpgrades = localStorage.getItem('tycoonKidsUpgrades'); const savedAchievements = localStorage.getItem('tycoonKidsAchievements'); 
    if (savedState && savedUpgrades) { 
        let parsedState = JSON.parse(savedState);
        if (!parsedState.settings) parsedState.settings = { musicVol: 0.5, sfxVol: 0.5, isMobileView: false };
        if (parsedState.totalClicks === undefined) parsedState.totalClicks = 0;
        if (parsedState.prestigeMultiplier === undefined) parsedState.prestigeMultiplier = 1;
        state = parsedState; upgrades = JSON.parse(savedUpgrades); 
    }
    if (savedAchievements) achievements = JSON.parse(savedAchievements);
    applyVolumeSettings(); applyViewMode(); renderShop(); updateUI(); scheduleRandomEvent();
}

function saveGame() {
    localStorage.setItem('tycoonKidsState', JSON.stringify(state)); localStorage.setItem('tycoonKidsUpgrades', JSON.stringify(upgrades)); localStorage.setItem('tycoonKidsAchievements', JSON.stringify(achievements));
}

function resetGame() {
    if (confirm("Точно удалить весь прогресс?")) {
        localStorage.clear();
        state = { balance: 0, clickPower: 1, moneyPerSecond: 0, jobIndex: 0, totalClicks: 0, prestigeMultiplier: 1, settings: { musicVol: 0.5, sfxVol: 0.5, isMobileView: false } };
        upgrades = JSON.parse(JSON.stringify(defaultUpgrades)); achievements = JSON.parse(JSON.stringify(defaultAchievements));
        applyVolumeSettings(); applyViewMode(); renderShop(); updateUI(); document.getElementById('settings-modal').classList.add('hidden');
    }
}

// КНОПКА ЧИТА (С ПАРОЛЕМ)
document.getElementById('btn-cheat').addEventListener('click', () => {
    const code = prompt("🔒 Введите кодовое слово разработчика:");
    if (code === "D1MT1M" || code === "nindziago123") {
        state.balance += 100000000000; // Выдает 100 Миллиардов
        playAchievementSound();
        showToast({name: "Чит активирован!", desc: "+100 Миллиардов R$", reward: 0, icon: "💰"});
        updateUI();
        saveGame();
    } else if (code !== null && code.trim() !== "") {
        alert("❌ Неверный код!");
    }
});

const btnViewToggle = document.getElementById('btn-view-toggle'); const gameContainer = document.getElementById('game-container');
function applyViewMode() {
    if (state.settings.isMobileView) { gameContainer.classList.add('mobile-view'); btnViewToggle.innerText = '💻 ПК вид'; } 
    else { gameContainer.classList.remove('mobile-view'); btnViewToggle.innerText = '📱 Мобильный вид'; }
}
btnViewToggle.addEventListener('click', () => { state.settings.isMobileView = !state.settings.isMobileView; applyViewMode(); saveGame(); });

// Модалки
const achModal = document.getElementById('achievements-modal');
document.getElementById('btn-achievements').addEventListener('click', () => {
    const list = document.getElementById('achievements-list'); list.innerHTML = '';
    achievements.forEach(ach => {
        const card = document.createElement('div'); card.className = `ach-card ${ach.unlocked ? '' : 'ach-locked'}`;
        card.innerHTML = `<div class="ach-icon">${ach.icon}</div><div class="ach-info"><h4>${ach.name}</h4><p>${ach.desc}</p><div class="ach-reward">Награда: +${formatNum(ach.reward)} R$</div></div>`;
        list.appendChild(card);
    });
    achModal.classList.remove('hidden');
});
document.getElementById('btn-close-achievements').addEventListener('click', () => achModal.classList.add('hidden'));

const settingsModal = document.getElementById('settings-modal');
document.getElementById('btn-settings').addEventListener('click', () => settingsModal.classList.remove('hidden'));
document.getElementById('btn-close-settings').addEventListener('click', () => settingsModal.classList.add('hidden'));

[achModal, settingsModal].forEach(modal => { modal.addEventListener('click', (e) => { if(e.target === modal) modal.classList.add('hidden'); }); });

function showToast(achievement) {
    const container = document.getElementById('toast-container'); const toast = document.createElement('div'); toast.className = 'toast';
    toast.innerHTML = `<div class="toast-icon">${achievement.icon}</div><div class="toast-content"><h4>${achievement.name}</h4><p>${achievement.desc} <br><span style="color:#2ecc71;">Награда: +${formatNum(achievement.reward)} R$</span></p></div>`;
    container.appendChild(toast); playAchievementSound();
    setTimeout(() => { toast.style.animation = 'slideOut 0.5s ease forwards'; setTimeout(() => toast.remove(), 500); }, 4000);
}

function checkAchievements() {
    let newUnlocked = false;
    achievements.forEach(ach => {
        if (ach.unlocked) return;
        let isMet = false;
        if (ach.type === 'balance' && state.balance >= ach.threshold) isMet = true;
        else if (ach.type === 'upgrade') { const upg = upgrades.find(u => u.id === ach.upgradeId); if (upg && upg.count >= ach.threshold) isMet = true; }
        else if (ach.type === 'evolution' && state.jobIndex >= ach.threshold) isMet = true;
        else if (ach.type === 'clicks' && state.totalClicks >= ach.threshold) isMet = true;

        if (isMet) { ach.unlocked = true; state.balance += ach.reward; showToast(ach); newUnlocked = true; }
    });
    if (newUnlocked) { updateUI(); saveGame(); if (!achModal.classList.contains('hidden')) document.getElementById('btn-achievements').click(); }
}

// --- РЕБЁРТ ---
const btnPrestige = document.getElementById('btn-prestige');
const prestigeInfo = document.getElementById('prestige-info');

function calculateNextPrestige() {
    const currentMult = state.prestigeMultiplier || 1;
    const bonus = Math.floor(Math.sqrt(state.balance / 100000000)) * 0.5; 
    return currentMult + (bonus > 1 ? bonus : 1.0); 
}

btnPrestige.addEventListener('click', () => {
    const nextMult = calculateNextPrestige();
    if (confirm(`Ты уверен? Твои деньги и улучшения сгорят, но ты получишь Ребёрт! Следующий заработок будет умножаться на x${nextMult.toFixed(1)}!`)) {
        state.prestigeMultiplier = nextMult;
        state.balance = 0; state.clickPower = 1; state.moneyPerSecond = 0; state.jobIndex = 0;
        upgrades = JSON.parse(JSON.stringify(defaultUpgrades));
        playEvolutionSound(); renderShop(); updateUI(); saveGame();
        showToast({name: "Ребёрт пройден!", desc: "Ты переродился", reward: 0, icon: "🔄"});
    }
});

const btnEvolve = document.getElementById('btn-evolve');
btnEvolve.addEventListener('click', () => {
    const nextEvo = evolutions[state.jobIndex + 1];
    if (nextEvo && state.balance >= nextEvo.cost) {
        state.balance -= nextEvo.cost; state.jobIndex++;
        playEvolutionSound(); checkAchievements(); renderShop(); updateUI(); saveGame();
    }
});

function updateUI() {
    document.getElementById('balance').innerText = formatNum(state.balance);
    document.getElementById('cps').innerText = formatNum(getEffectiveCPS());
    
    const currentEvo = evolutions[state.jobIndex];
    document.getElementById('job-title').innerText = currentEvo.title;
    document.getElementById('main-avatar').src = currentEvo.sprite;
    
    const nextEvo = evolutions[state.jobIndex + 1];
    if (nextEvo) { btnEvolve.innerText = `⭐ Эволюция: ${nextEvo.title} (R$ ${formatNum(nextEvo.cost)})`; btnEvolve.disabled = state.balance < nextEvo.cost; } 
    else { btnEvolve.innerText = "🌟 МАКСИМАЛЬНЫЙ УРОВЕНЬ 🌟"; btnEvolve.disabled = true; }
    
    document.getElementById('prestige-mult').innerText = (state.prestigeMultiplier || 1).toFixed(1);
    if (state.jobIndex >= 12 || state.prestigeMultiplier > 1) { 
        btnPrestige.classList.remove('hidden'); prestigeInfo.classList.remove('hidden');
        btnPrestige.innerText = `🔄 Сделать Ребёрт (x${calculateNextPrestige().toFixed(1)})`;
        btnPrestige.disabled = state.jobIndex < 12;
    } else { btnPrestige.classList.add('hidden'); prestigeInfo.classList.add('hidden'); }

    upgrades.forEach(up => {
        const btn = document.getElementById(`btn-${up.id}`);
        if (btn) { const isLevelLocked = state.jobIndex < up.reqStage; btn.disabled = isLevelLocked || state.balance < up.cost; }
    });
}

function renderShop() {
    const container = document.getElementById('upgrades-container'); container.innerHTML = '';
    upgrades.forEach(up => {
        const isLocked = state.jobIndex < up.reqStage;
        const lockedMsg = isLocked ? `<p class="req-text">🔒 Ранг: ${evolutions[up.reqStage].title}</p>` : '';
        const card = document.createElement('div'); card.className = `upgrade-card ${isLocked ? 'locked' : ''}`;
        card.innerHTML = `
            <div class="upgrade-info"><img src="${up.sprite}" alt="icon"><div class="info-text-block"><h4>${up.name}</h4>${lockedMsg}<p class="upgrade-desc">${up.desc}</p><p>Дает: +${formatNum(up.value)} | Куплено: ${up.count}</p></div></div>
            <button class="bouncy-btn btn-buy" id="btn-${up.id}">R$ ${formatNum(up.cost)}</button>
        `;
        container.appendChild(card);
        document.getElementById(`btn-${up.id}`).addEventListener('click', () => {
            if (state.balance >= up.cost && !isLocked) {
                state.balance -= up.cost;
                if (up.type === 'click') state.clickPower += up.value;
                if (up.type === 'idle') state.moneyPerSecond += up.value;
                up.count++; up.cost = Math.floor(up.cost * 1.5);
                checkAchievements(); renderShop(); updateUI(); saveGame();
            }
        });
    });
}

// ==========================================
// 5. РЕКЛАМНЫЕ БУСТЫ (С ОТСЧЕТОМ)
// ==========================================
function startAdSequence(boostType) {
    const modal = document.getElementById('ad-warning-modal');
    const countdown = document.getElementById('ad-countdown');
    modal.classList.remove('hidden');
    let timeLeft = 3;
    countdown.innerText = timeLeft;

    const timer = setInterval(() => {
        timeLeft--;
        if(timeLeft > 0) {
            countdown.innerText = timeLeft;
        } else {
            clearInterval(timer);
            modal.classList.add('hidden');
            showYandexAd(boostType);
        }
    }, 1000);
}

window.startAdSequence = startAdSequence;

function showYandexAd(boostType) {
    if (ysdk && ysdk.adv) {
        ysdk.adv.showRewardedVideo({
            callbacks: { 
                onOpen: () => { if (audioCtx.state === 'running') audioCtx.suspend(); }, 
                onRewarded: () => { applyBoost(boostType); }, 
                onClose: () => { audioCtx.resume(); }, 
                onError: () => { audioCtx.resume(); applyBoost(boostType); /* fallback для тестов */ } 
            }
        });
    } else {
        applyBoost(boostType);
    }
}

function applyBoost(type) {
    if (type === 'x2') {
        adBoostMult = 2; updateUI(); showToast({name: 'Буст Активирован!', desc: 'Доход x2 на 60 сек', reward: 0, icon: '💸'});
        setTimeout(() => { adBoostMult = 1; updateUI(); }, 60000);
    } 
    else if (type === 'x5') {
        adBoostMult = 5; updateUI(); showToast({name: 'Супер-Буст!', desc: 'Доход x5 на 15 сек', reward: 0, icon: '🔥'});
        setTimeout(() => { adBoostMult = 1; updateUI(); }, 15000);
    } 
    else if (type === 'auto') {
        if(adAutoClickerTimer) clearInterval(adAutoClickerTimer);
        showToast({name: 'Робот Запущен!', desc: 'Автоклик на 20 сек', reward: 0, icon: '🤖'});
        adAutoClickerTimer = setInterval(() => { document.getElementById('main-click-btn').click(); }, 150);
        setTimeout(() => { clearInterval(adAutoClickerTimer); }, 20000);
    }
}

// ==========================================
// 6. КОМБО И ИВЕНТЫ
// ==========================================
// Ускоренное выпадение сундуков с Робаксами (каждые 30-90 сек)
function scheduleRandomEvent() { setTimeout(spawnRandomEvent, 30000 + Math.random() * 60000); }

function spawnRandomEvent() {
    if (document.hidden) { scheduleRandomEvent(); return; }
    const evt = document.createElement('div'); evt.innerText = '💵'; evt.className = 'random-event';
    evt.style.left = `${Math.random() * (window.innerWidth - 80)}px`; evt.style.top = `${Math.random() * (window.innerHeight - 80)}px`;
    document.body.appendChild(evt);
    const timeout = setTimeout(() => { if(evt.parentElement) evt.remove(); scheduleRandomEvent(); }, 6000); 
    evt.addEventListener('click', () => {
        clearTimeout(timeout); evt.remove();
        const reward = Math.max((getEffectiveCPS() * 120) + (getEffectiveClick() * 100), 500); 
        state.balance += reward;
        showToast({ name: 'Сундук с Робаксами!', desc: 'Ты поймал удачу!', reward: reward, icon: '🎉' });
        updateUI(); scheduleRandomEvent();
    });
}

setInterval(() => {
    if (!isComboActive) {
        if (comboValue > 0) comboValue -= 2; 
        if (comboValue < 0) comboValue = 0;
        document.getElementById('combo-bar').style.width = `${comboValue}%`;
    } else {
        comboValue -= 1; 
        document.getElementById('combo-bar').style.width = `${comboValue}%`;
    }
}, 100);

function createClickParticle(e, valueText) {
    const particle = document.createElement('div'); particle.innerText = `+${formatNum(valueText)}`; particle.style.position = 'absolute';
    particle.style.left = `${e.clientX - 20 + Math.random() * 40}px`; particle.style.top = `${e.clientY - 20}px`;
    particle.style.color = isComboActive ? '#d63031' : '#2ecc71'; 
    particle.style.fontWeight = 'bold'; particle.style.fontSize = isComboActive ? '35px' : '26px';
    particle.style.pointerEvents = 'none'; particle.style.textShadow = '2px 2px 0px #fff'; particle.style.zIndex = '100';
    particle.style.transition = 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
    document.body.appendChild(particle);
    requestAnimationFrame(() => { particle.style.transform = `translateY(-80px) scale(1.2)`; particle.style.opacity = '0'; });
    setTimeout(() => particle.remove(), 600);
}

document.getElementById('main-click-btn').addEventListener('click', async (e) => {
    if (!isAudioInitialized) { isAudioInitialized = true; await audioCtx.resume(); startMusicSequence(); }
    playPopSound(); 
    const clickVal = getEffectiveClick();
    if(e.isTrusted) { createClickParticle(e, clickVal); } // Частицы только от реального клика
    state.balance += clickVal;
    state.totalClicks = (state.totalClicks || 0) + 1;
    
    if (!isComboActive) {
        comboValue += 7; 
        if (comboValue >= 100) {
            comboValue = 100; isComboActive = true;
            document.getElementById('combo-container').classList.add('combo-active');
            document.getElementById('combo-text').innerText = "🔥 СУПЕР-ТАП x3! 🔥";
            playEvolutionSound();
            setTimeout(() => {
                isComboActive = false; comboValue = 0;
                document.getElementById('combo-container').classList.remove('combo-active');
                document.getElementById('combo-text').innerText = "Кликай быстрее!";
                updateUI(); 
            }, 10000);
        }
    }
    checkAchievements(); updateUI();
});

const btnFullscreen = document.getElementById('btn-fullscreen');
function toggleFullscreen() {
    const doc = window.document; const docEl = doc.documentElement;
    const reqFS = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
    const exitFS = doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen || doc.msExitFullscreen;
    const isFS = doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement;
    if (!isFS) { if (reqFS) reqFS.call(docEl).catch(err => console.log(err)); } else { if (exitFS) exitFS.call(doc); }
}
function updateFullscreenUI() {
    const isFS = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
    btnFullscreen.innerText = isFS ? '🪟 В окно' : '📺 На весь экран';
}
btnFullscreen.addEventListener('click', toggleFullscreen);
['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(evt => document.addEventListener(evt, updateFullscreenUI));
document.getElementById('btn-reset').addEventListener('click', resetGame);

setInterval(() => { state.balance += getEffectiveCPS(); checkAchievements(); updateUI(); }, 1000);
setInterval(saveGame, 5000);
loadGame();
