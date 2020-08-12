const { Client } = require('discord.js');
const phin = require('phin');
const chalk = require("chalk");
const fs = require('fs');
const config = require("./config.json");

let tokens = fs.readFileSync("./tokens.txt", "utf8").replace(/\r/g, "").split('\n');
let title = ' Fweak | Nitro Auto Claimer (og: Giggl3z/Nitrate)';
let count = 0;
let codesList = () => fs.readFileSync("./Storage/codes.txt", "utf8").replace(/\r/g, "").split("\n");

function start() {
    process.title = title;

    for (token of tokens) {
        const bot = new Client();
        bot.rest.userAgentManager.userAgent = "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.130 Safari/537.36"

        bot.on("ready", () => console.log(`Logged in as: ${chalk.yellow(bot.user.tag)}\nEmail: ${chalk.bold(bot.user.email)}\nID: ${chalk.bold(bot.user.id)}\n\n`));

        bot.on("message", async (message) => {
            let codes = message.content.match(/(discord.gift|discordapp.com\/gifts)\/\w{16,24}/);

            if (codes === null || !codes[0] || typeof codes[0] == "null") return;

            let startTimer = new Date();

            let code = codes[0].includes("/gifts/") ? codes[0].replace("/gifts/", "") : codes[0].split("/")[1];

            if (codesList().includes(code.trim()) === true) return;

            count += 1;
            process.title = title + ` | ${count.toString()} gift(s)`;
            await redeem(code, message, startTimer);
            fs.appendFileSync("./Storage/codes.txt", code.trim() + "\n", { encoding: "utf8" });
        });

        bot.login(token)
            .catch(err => {
                if (err && err.message === "Incorrect login details were provided.") {
                    tokens = tokens.filter(s => s !== token);
                    return start()
                } else {
                    console.log(err.message)
                }
            });
    }
}

start()

async function redeem(code, message, start) {
    const request = await phin({
        url: `https://discordapp.com/api/v6/entitlements/gift-codes/${code}/redeem`,
        method: "POST",
        data: {
            channel_id: message.channel,
            payment_source_id: null
        },
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 8.0.0;) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.136 Mobile Safari/537.36",
            "Content-Type": "application/json",
            'Authorization': config.token
        }
    }).catch(() => { });


    if (!request || typeof request === "undefined" || request.statusCode >= 400) return console.log(chalk.redBright("INVALID") + ` ${code} - Invalid Code : .${(new Date() - start)}ms`);

    console.log(chalk.green("CLAIMED") + ` ${code} = ${message.channel.name} : .${(new Date() - start)}ms`);
}
