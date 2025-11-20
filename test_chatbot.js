
// Native fetch is available

// Node 18+ has native fetch, so we can just use it.
// If this fails, we'll know.

async function testChat() {
    const messages = [
        "quanto custa a mensalidade?",
        "tenho uma divida",
        "bom dia",
        "preciso de ajuda"
    ];

    console.log("--- Testando Chatbot ML ---");

    for (const msg of messages) {
        try {
            const res = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg })
            });

            if (res.ok) {
                const data = await res.json();
                console.log(`\nMsg: "${msg}"`);
                console.log(`Intent: ${data.intent} (Conf: ${data.confidence.toFixed(2)})`);
                console.log(`Response: ${data.response}`);
            } else {
                console.log(`Error ${res.status}:`, await res.text());
            }
        } catch (e) {
            console.error("Request failed:", e.message);
        }
    }
}

testChat();
