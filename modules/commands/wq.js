const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
    name: "wq",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Jonell Hutchin Magallanes",
    description: "Generate an aesthetic quote image",
    usePrefix: true,
    commandCategory: "media",
    usages: "wq [text | author | color]",
    cooldowns: 5,
    dependencies: {
        "axios": "",
        "fs-extra": ""
    }
};

module.exports.run = async function ({ api, event, args }) {
    const input = args.join(" ").split("|").map(i => i.trim());
    if (input.length < 2) {
        return api.sendMessage("Usage: wq [text | author | color (white/black)]", event.threadID, event.messageID);
    }

    const text = input[0];
    const author = input[1];
    const color = input[2] || "white";

    try {
        api.setMessageReaction("⏳", event.messageID, () => {}, true);

        const url = `https://ccprojectsapis.zetsu.xyz/api/aesthetic?text=${encodeURIComponent(text)}&author=${encodeURIComponent(author)}&color=${encodeURIComponent(color)}`;
        const res = await axios.get(url, { responseType: "arraybuffer" });

        const imgPath = path.join(__dirname, "cache", `quote_${Date.now()}.jpg`);
        await fs.writeFile(imgPath, Buffer.from(res.data, "binary"));

        api.setMessageReaction("✅", event.messageID, () => {}, true);

        await api.sendMessage({
            body: `𝗔𝗲𝘀𝘁𝗵𝗲𝘁𝗶𝗰 𝗤𝘂𝗼𝘁𝗲\n━━━━━━━━━━━━━━━━━━\n\n"${text}"\n- ${author}`,
            attachment: fs.createReadStream(imgPath)
        }, event.threadID, () => fs.unlinkSync(imgPath));

    } catch (err) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        api.sendMessage("⚠️ Error: " + err.message, event.threadID, event.messageID);
    }
};