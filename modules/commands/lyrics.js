const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "lyrics",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Jonell Hutchin Magallanes",
    description: "Get lyrics of a song",
    usePrefix: true,
    commandCategory: "media",
    usages: "lyrics [song name]",
    cooldowns: 5,
    dependencies: {
        "axios": "",
        "fs-extra": ""
    }
};

module.exports.run = async function ({ api, event, args }) {
    const song = args.join(" ");
    if (!song) return api.sendMessage("⚠️ Please provide a song name.", event.threadID, event.messageID);

    try {
        api.setMessageReaction("⏳", event.messageID, () => {}, true);

        const url = `https://api.popcat.xyz/v2/lyrics?song=${encodeURIComponent(song)}`;
        const res = await axios.get(url);

        if (res.data.error || !res.data.message) {
            api.setMessageReaction("❌", event.messageID, () => {}, true);
            return api.sendMessage("❌ Lyrics not found.", event.threadID, event.messageID);
        }

        const data = res.data.message;

        const imgPath = path.join(__dirname, "cache", `lyrics_${Date.now()}.jpg`);
        const imgResponse = await axios.get(data.image, { responseType: "arraybuffer" });
        await fs.writeFile(imgPath, Buffer.from(imgResponse.data, "binary"));

        const message = 
`𝗟𝘆𝗿𝗶𝗰𝘀 𝗙𝗼𝘂𝗻𝗱 🎶
━━━━━━━━━━━━━━━━━━

🎵 𝗧𝗶𝘁𝗹𝗲: ${data.title}
🎤 𝗔𝗿𝘁𝗶𝘀𝘁: ${data.artist}
🔗 𝗟𝗶𝗻𝗸: ${data.url}

📑 𝗟𝘆𝗿𝗶𝗰𝘀:
${data.lyrics}`;

        await api.sendMessage({
            body: message,
            attachment: fs.createReadStream(imgPath)
        }, event.threadID, () => {
            fs.unlinkSync(imgPath);
            api.setMessageReaction("✅", event.messageID, () => {}, true);
        }, event.messageID);

    } catch (err) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        api.sendMessage("⚠️ Error: " + err.message, event.threadID, event.messageID);
    }
};