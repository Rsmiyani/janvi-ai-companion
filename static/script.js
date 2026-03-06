// ===== Settings Management =====
const DEFAULTS = {
    name: 'Janvi',
    character: 'girl',
    language: 'hindi',
};

function loadSettings() {
    return {
        name: localStorage.getItem('charName') || DEFAULTS.name,
        character: localStorage.getItem('charType') || DEFAULTS.character,
        language: localStorage.getItem('charLang') || DEFAULTS.language,
    };
}

function saveSettings(key, value) {
    localStorage.setItem(key, value);
}

// ===== UI Updates =====
function applySettings() {
    const s = loadSettings();
    const avatarSrc = `/static/images/${s.character}.png`;

    // Update avatars
    document.getElementById('headerAvatar').src = avatarSrc;
    document.getElementById('welcomeAvatar').src = avatarSrc;

    // Update header name
    document.getElementById('headerName').textContent = s.name;

    // Update subtitle
    const subtitles = {
        hindi: { girl: `तुम्हारी AI girlfriend 💜`, boy: `तुम्हारा AI boyfriend 💜` },
        english: { girl: `Your AI girlfriend 💜`, boy: `Your AI boyfriend 💜` },
    };
    document.getElementById('headerSubtitle').textContent = subtitles[s.language][s.character];

    // Update welcome message
    const welcomes = {
        hindi: {
            title: 'नमस्ते! 🙏',
            text: `मैं ${s.name} हूँ, तुम्हारी AI दोस्त। बताओ, आज कैसा दिन रहा? कुछ भी बात करो, मैं यहाँ हूँ! 😊`,
        },
        english: {
            title: 'Hey there! 👋',
            text: `I'm ${s.name}, your AI companion. Tell me, how was your day? You can talk about anything, I'm here for you! 😊`,
        },
    };
    document.getElementById('welcomeTitle').textContent = welcomes[s.language].title;
    document.getElementById('welcomeText').textContent = welcomes[s.language].text;

    // Update input placeholder
    const placeholders = { hindi: 'अपनी बात यहाँ लिखो…', english: 'Type your message here…' };
    document.getElementById('message').placeholder = placeholders[s.language];

    // Update name input
    document.getElementById('nameInput').value = s.name;

    // Update toggle buttons
    document.getElementById('girlBtn').classList.toggle('active', s.character === 'girl');
    document.getElementById('boyBtn').classList.toggle('active', s.character === 'boy');
    document.getElementById('hindiBtn').classList.toggle('active', s.language === 'hindi');
    document.getElementById('englishBtn').classList.toggle('active', s.language === 'english');
}

function updateName(name) {
    if (name.trim()) {
        saveSettings('charName', name.trim());
        applySettings();
    }
}

function setCharacter(type) {
    saveSettings('charType', type);
    // Set default name if user hasn't customized it
    const currentName = localStorage.getItem('charName');
    if (!currentName || currentName === 'Janvi' || currentName === 'Arjun') {
        saveSettings('charName', type === 'girl' ? 'Janvi' : 'Arjun');
    }
    applySettings();
}

function setLanguage(lang) {
    saveSettings('charLang', lang);
    applySettings();
}

function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    panel.classList.toggle('open');
}

// ===== Chat Functions =====
const chatbox = document.getElementById('chatbox');
const input = document.getElementById('message');

function getTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `message ${sender}`;
    msg.innerHTML = `
        <div class="bubble">
            ${text}
            <div class="msg-time">${getTime()}</div>
        </div>`;
    chatbox.appendChild(msg);
    chatbox.scrollTop = chatbox.scrollHeight;
}

function showTyping() {
    const el = document.createElement('div');
    el.id = 'typing';
    el.className = 'typing-indicator';
    el.innerHTML = '<span></span><span></span><span></span>';
    chatbox.appendChild(el);
    chatbox.scrollTop = chatbox.scrollHeight;
}

function hideTyping() {
    const el = document.getElementById('typing');
    if (el) el.remove();
}

async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    // Hide welcome message
    const welcome = document.getElementById('welcomeMsg');
    if (welcome) welcome.style.display = 'none';

    addMessage(text, 'user');
    input.value = '';
    showTyping();

    const s = loadSettings();

    try {
        const res = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: text,
                language: s.language,
                character: s.character,
                name: s.name,
            }),
        });
        const data = await res.json();
        hideTyping();
        addMessage(data.reply, 'bot');
    } catch {
        hideTyping();
        const errMsgs = {
            hindi: 'अरे, कुछ गड़बड़ हो गई। थोड़ी देर बाद फिर से कोशिश करो। 😅',
            english: 'Oops, something went wrong. Please try again later. 😅',
        };
        addMessage(errMsgs[s.language], 'bot');
    }
}

function clearChat() {
    chatbox.innerHTML = '';
    // Re-add welcome message
    const s = loadSettings();
    const welcomes = {
        hindi: {
            title: 'नमस्ते! 🙏',
            text: `मैं ${s.name} हूँ, तुम्हारी AI दोस्त। बताओ, आज कैसा दिन रहा? कुछ भी बात करो, मैं यहाँ हूँ! 😊`,
        },
        english: {
            title: 'Hey there! 👋',
            text: `I'm ${s.name}, your AI companion. Tell me, how was your day? You can talk about anything, I'm here for you! 😊`,
        },
    };
    chatbox.innerHTML = `
        <div class="welcome-message" id="welcomeMsg">
            <div class="welcome-avatar">
                <img class="welcome-avatar-img" id="welcomeAvatar" src="/static/images/${s.character}.png" alt="Avatar">
            </div>
            <h2 id="welcomeTitle">${welcomes[s.language].title}</h2>
            <p id="welcomeText">${welcomes[s.language].text}</p>
        </div>`;
}

// Close settings when clicking outside
document.addEventListener('click', (e) => {
    const panel = document.getElementById('settingsPanel');
    const btn = document.getElementById('settingsBtn');
    if (panel.classList.contains('open') && !panel.contains(e.target) && !btn.contains(e.target)) {
        panel.classList.remove('open');
    }
});

// Initialize on load
applySettings();
