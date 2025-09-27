const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: "brat",
    version: "1.0.0",
    hasPermssion: 0,
    description: "Generate brat image from text",
    usePrefix: true,
    hide: false,
    commandCategory: "Canvas",
    usages: "/brat <text>",
    cooldowns: 3,
    credits: "Jonell Magallanes"
};

module.exports.run = async function ({ api, event, args, actions }) {
    if (!args[0]) {
        return actions.reply(
            `❓ 𝗨𝗦𝗔𝗚𝗘\n━━━━━━━━━━━━━━━━━━\n📍 Please provide text after /brat\n━━━━━━━━━━━━━━━━━━`
        );
    }

    try {
        const text = encodeURIComponent(args.join(" "));
        const apiUrl = `https://ccprojectsapis.zetsu.xyz/api/brat?text=${text}&type=stream`;

        const { data } = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!data?.brat) {
            return actions.reply(
                `❌ 𝗘𝗥𝗥𝗢𝗥\n━━━━━━━━━━━━━━━━━━\nInvalid API response.\n━━━━━━━━━━━━━━━━━━`
            );
        }

        const imageStreamResponse = await axios.get(data.brat, { responseType: 'stream' });
        const imagePath = path.join(__dirname, `../cmds/database/brat_${event.senderID}_${Date.now()}.jpg`);
        const writer = fs.createWriteStream(imagePath);
        imageStreamResponse.data.pipe(writer);

        writer.on('finish', () => {
            api.sendMessage(
                { body: "🖼️ 𝗕𝗥𝗔𝗧 𝗜𝗠𝗔𝗚𝗘\n━━━━━━━━━━━━━━━━━━", attachment: fs.createReadStream(imagePath) },
                event.threadID,
                () => fs.unlinkSync(imagePath)
            );
        });

        writer.on('error', () => {
            actions.reply(
                `❌ 𝗘𝗥𝗥𝗢𝗥\n━━━━━━━━━━━━━━━━━━\nFailed to download image.\n━━━━━━━━━━━━━━━━━━`
            );
        });

    } catch (err) {
        console.error(err);
        actions.reply(
            `❌ 𝗘𝗥𝗥𝗢𝗥\n━━━━━━━━━━━━━━━━━━\nSomething went wrong while generating the image.\n━━━━━━━━━━━━━━━━━━`
        );
    }
};