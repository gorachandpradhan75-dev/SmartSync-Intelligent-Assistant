// 🔐 Check login
let user = localStorage.getItem("user");

if (!user) {
    window.location.href = "login.html";
}

// 📤 Send message
async function send() {
    let inputBox = document.getElementById("input");
    let input = inputBox.value.trim();

    if (input === "") return;

    let chat = document.getElementById("chat");

    // User message
    let userMsg = document.createElement("div");
    userMsg.className = "user";
    userMsg.innerText = input;
    chat.appendChild(userMsg);

    // Typing indicator
    let typing = document.createElement("div");
    typing.className = "bot";
    typing.innerText = "Typing...";
    chat.appendChild(typing);

    chat.scrollTop = chat.scrollHeight;

    try {
        let res = await fetch('/command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: input, username: user })
        });

        let data = await res.json();

        typing.remove();

        // Bot reply
        let botMsg = document.createElement("div");
        botMsg.className = "bot";
        botMsg.innerText = data.reply;
        chat.appendChild(botMsg);

    } catch {
        typing.innerText = "Server error";
    }

    inputBox.value = "";
    chat.scrollTop = chat.scrollHeight;
}

// 🎤 Voice Input
function startVoice() {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Voice not supported in this browser");
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = function(event) {
        document.getElementById("input").value =
            event.results[0][0].transcript;
    };
}

// 🌙 Dark Mode Toggle
function toggleDark() {
    document.body.classList.toggle("dark");
}

// ⌨️ Enter key support
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("input").addEventListener("keypress", function(e) {
        if (e.key === "Enter") send();
    });
});