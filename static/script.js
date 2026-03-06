// ===== Janvi AI Companion - Chat Logic =====

const chatbox = document.getElementById("chatbox");
const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");

/**
 * Get current time formatted as HH:MM
 */
function getTime() {
    const now = new Date();
    return now.toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Append a chat message bubble to the chatbox.
 * @param {"user"|"bot"} sender
 * @param {string} text
 */
function addMessage(sender, text) {
    // Remove the welcome message on first interaction
    const welcome = chatbox.querySelector(".welcome-message");
    if (welcome) welcome.remove();

    const wrapper = document.createElement("div");
    wrapper.classList.add("message", sender);

    wrapper.innerHTML = `
        <div class="bubble">
            ${escapeHTML(text)}
            <div class="msg-time">${getTime()}</div>
        </div>
    `;

    chatbox.appendChild(wrapper);
    chatbox.scrollTop = chatbox.scrollHeight;
}

/**
 * Show typing indicator
 */
function showTyping() {
    const el = document.createElement("div");
    el.classList.add("message", "bot");
    el.id = "typing";

    el.innerHTML = `
        <div class="bubble typing-indicator">
            <span></span><span></span><span></span>
        </div>
    `;

    chatbox.appendChild(el);
    chatbox.scrollTop = chatbox.scrollHeight;
}

/**
 * Remove typing indicator
 */
function removeTyping() {
    const el = document.getElementById("typing");
    if (el) el.remove();
}

/**
 * Escape HTML to prevent injection
 */
function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Send user message and get Janvi's reply
 */
async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    // Add user message
    addMessage("user", text);
    messageInput.value = "";
    messageInput.focus();

    // Disable input while waiting
    messageInput.disabled = true;
    sendBtn.disabled = true;

    showTyping();

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text }),
        });

        const data = await response.json();
        removeTyping();
        addMessage("bot", data.reply);
    } catch (err) {
        removeTyping();
        addMessage("bot", "अरे, कुछ गड़बड़ हो गई। बाद में कोशिश करो। 😅");
    } finally {
        messageInput.disabled = false;
        sendBtn.disabled = false;
        messageInput.focus();
    }
}

/**
 * Clear all messages and show welcome again
 */
function clearChat() {
    chatbox.innerHTML = `
        <div class="welcome-message">
            <div class="welcome-avatar">
                <div class="welcome-avatar-inner">J</div>
            </div>
            <h2>नमस्ते! 🙏</h2>
            <p>मैं जानवी हूँ, तुम्हारी AI दोस्त। बताओ, आज कैसा दिन रहा? कुछ भी बात करो, मैं यहाँ हूँ! 😊</p>
        </div>
    `;
}
