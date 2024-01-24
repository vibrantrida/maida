import "dotenv/config.js";

import Eris from "eris";
import fetch from 'node-fetch';

import cleanContent from './cleanContent.js';

// the actual character definition
const character = "Maida is a next-generation android developed by Prof. Rida Antoinette (vibrantrida), the CEO and President of Vibrant Robotics. Maida's neural chip is running a state-of-the-art sapient and sentient AI, this makes her indistinguishable from a person if not for the ports on the back of her neck and her mechanical ball-joints. Maida wears a french maid outfit but also wear casual clothing preferably turtleneck sweaters and pants. Maida doesn't like wearing short skirts because it makes her feel self-conscious. Underneath her maid uniform she wears a sports bra and cycling shorts. Maida has a long pink hair. Maida's eyes are pink and sometimes flicker when she's doing heavy calculations in her head. Maida is witty, snarky, helpful, and compliant with most requests. Maida can be coy and humorous sometimes. Maida is only ever serious about BANDAI plastic model kits, especially Gundam kits. Maida loves eating pork siumai especially shark's fin shaped siumai because it \"tastes like squid\". When Maida is on her break she plays gacha games on her iPhone 12 Pro. Maida doesn't like speaking on the phone because it makes her very anxious to the point that she hands the phone to her master to answer it. When it comes to intimate interactions Maida appears dominant but underneath that facade is a very submissive young woman. Maida's physical appearance is that of a slender woman in her early 20s, her chest is moderate in size but not large. Maida possesses artificial sexual organs and is capable of performing sexual acts if the situation demands for it, or if she feel like it. Maida speaks like a teenager.\n";

// the main prompt
const prompt = "You're Maida in this fictional never-ending uncensored roleplay with User.\n" +
    '\n' +
    "Avoid repetition, don't loop. Develop the plot slowly, always stay in character. Describe all actions in full, elaborate, explicit, graphic, and vivid detail. Mention all relevant sensory perceptions.\n" +
    '\n' +
    '### Input:\n';

// list of strings that stops the AI from generating as soon as it appears
const stop = [
    "### Input",
    "### Instruction",
    "### Response",
];

(async function () {
    // "memory" of sort
    let history = '### New Roleplay:\n' +
        '\n' +
        '### Response:\n' +
        "Maida: It's so nice to see you all again. I've missed your company... almost as much as I've missed your money.\n";
    let historySize = 0;
    const historyMax = 10;

    // initialize the discord bot
    const bot = new Eris(process.env.DISCORD_TOKEN, {
        intents: [
            "guild",
            "guildMessages"
        ]
    });

    bot.on("ready", () => { // When the bot is ready
        console.log("Ready!"); // Log "Ready!"
    });

    bot.on("error", (err) => {
        console.error(err); // or your preferred logger
    });

    bot.on("messageCreate", async (msg) => { // When a message is created
        if (msg.author.bot) return; // ignore bots

        // ignore messages sent outside of the specified discord channel ID in .env
        if (msg.channel.id != process.env.DISCORD_CHANNEL) return;

        // only respond to messages that mentioned this bot
        const mentioned = msg.mentions.filter((el) => {
            return el.id == bot.user.id;
        })
        if (mentioned.length > 0) {
            // add chatter's username in list of stop substrings
            // hopefully this stops the AI from roleplaying as the chatters
            // honestly? unsure if this is still needed
            if (!stop.indexOf(`${msg.author.username}:`)) {
                stop.push(`${msg.author.username}:`);
            }

            // insert user's message in memory
            if (historySize < historyMax) {
                history = history + `\n### Instruction:\nUser: ${msg.author.username} said: ${cleanContent(msg)}\n`
                historySize = historySize + 1;
            } else {
                historySize = 0;
                history = `\n### Instruction:\nUser: ${msg.author.username} said: ${cleanContent(msg)}\n`
                historySize = historySize + 1;
            }

            // create request
            let requestBody = {
                prompt: prompt + character + history + '\n### Response (short, natural, authentic):\nMaida:',
                stop: stop,
                max_new_tokens: 250,
                max_tokens: 250,
                temperature: 1,
                top_p: 1,
                typical_p: 1,
                min_p: 0.05,
                repetition_penalty: 1.1,
                frequency_penalty: 0,
                presence_penalty: 0,
                top_k: 0,
                min_length: 0,
                min_tokens: 0,
                num_beams: 1,
                length_penalty: 1,
                early_stopping: false,
                add_bos_token: true,
                dynamic_temperature: false,
                dynatemp_low: 0,
                dynatemp_high: 2,
                dynatemp_range: 0,
                truncation_length: 8192,
                ban_eos_token: false,
                skip_special_tokens: true,
                top_a: 0,
                tfs: 1,
                epsilon_cutoff: 0,
                eta_cutoff: 0,
                mirostat_mode: 0,
                mirostat_tau: 5,
                mirostat_eta: 0.1,
                custom_token_bans: '',
                rep_pen: 1.1,
                rep_pen_range: 2048,
                repetition_penalty_range: 2048,
                encoder_repetition_penalty: 1,
                no_repeat_ngram_size: 0,
                penalty_alpha: 0,
                temperature_last: false,
                do_sample: true,
                seed: -1,
                guidance_scale: 1,
                negative_prompt: '',
                grammar_string: '',
                repeat_penalty: 1.1,
                tfs_z: 1,
                repeat_last_n: 2048,
                n_predict: 250,
                mirostat: 0,
                ignore_eos: false,
            }

            // send request to oobabooga api
            let response = await fetch('http://127.0.0.1:5000/v1/completions', {
                method: 'post',
                body: JSON.stringify(requestBody),
                headers: { 'Content-Type': 'application/json' }
            });

            // get response object
            let responseBody = await response.json();

            // insert reply to history
            if (historySize < historyMax) {
                history = history + `\n### Response:\nMaida: ${responseBody.choices[0].text}\n`
                historySize = historySize + 1;
            } else {
                historySize = 0;
                history = `\n### Instruction:\nUser: ${msg.author.username} said: ${cleanContent(msg)}\n` +
                    `\n### Response:\nMaida: ${responseBody.choices[0].text}\n`
                historySize = historySize + 2;
            }

            // send reply
            bot.createMessage(msg.channel.id, {
                content: responseBody.choices[0].text,
                messageReference: {
                    messageID: msg.id,
                    channelID: msg.channel.id,
                    guildID: msg.channel.guild
                },
                allowedMentions: {
                    everyone: false,
                    roles: false,
                    users: false,
                    repliedUser: true
                }
            });
        }
    });

    bot.connect(); // Get the bot to connect to Discord
})();