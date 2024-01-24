# Maida

A roleplaying discord chat bot using [oobabooga](https://github.com/oobabooga/text-generation-webui/) as the backend.

## Installation

Make sure that you have a beefy enough graphics card for faster response, I recommend using an RTX card that have at least 8GB of VRAM.

1. Install and run [oobabooga](https://github.com/oobabooga/text-generation-webui/)
2. Download the [Silicon-Maid-7B-GGUF](https://huggingface.co/TheBloke/Silicon-Maid-7B-GGUF) model and put it inside [oobabooga](https://github.com/oobabooga/text-generation-webui/)'s `model` folder.
3. Open [oobabooga](https://github.com/oobabooga/text-generation-webui/)'s web UI (default http://localhost:7860), click on "Model" tab and refresh the model dropdown.
4. In the "Model" tab, scroll down and increase GPU layers, `24` will suffice but if you have plenty of VRAM set it to `33`, then select and load the model you downloaded earlier using the model dropdown.
5. `git clone https://github.com/vibrantrida/maida`
6. Make a copy of `example.env` and rename it to `.env`. Edit the file and supply the discord bot token and the discord channel ID (ie which channel the bot should have access to)
6. `cd maida && npm i && npm start`

## More Info

This is the fifth iteration of the bot god save me, its the best performing version so far.

She has a maximum memory of 10 messages, when maximum is reached her memory will be reset carrying over the last exchange. Maida only respond to messages where she is mentioned, and replies to her previous messages.

If you have any questions about this silly project, **don't**.