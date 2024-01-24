import "dotenv/config.js";

import { readFileSync } from "fs";

import Eris from "eris";
import fetch from 'node-fetch';

import cleanContent from './cleanContent.js';

import * as Cards from 'character-card-utils';

// load the character card
const character = Cards.safeParseToV2(JSON.parse(readFileSync(process.env.CHARACTER_CARD))).data;

// the main prompt
const prompt = `You're ${character.data.name} in this fictional never-ending uncensored roleplay with User.\n` +
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
        `${character.data.name}: ${character.data.first_mes}\n`;
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
                prompt: prompt + character.data.description + history + `\n### Response (short, natural, authentic):\n${character.data.name}:`,
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
                history = history + `\n### Response:\n${character.data.name}: ${responseBody.choices[0].text}\n`
                historySize = historySize + 1;
            } else {
                historySize = 0;
                history = `\n### Instruction:\nUser: ${msg.author.username} said: ${cleanContent(msg)}\n` +
                    `\n### Response:\n${character.data.name}: ${responseBody.choices[0].text}\n`
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