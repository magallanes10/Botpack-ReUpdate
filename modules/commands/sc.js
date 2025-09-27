const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "sc",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Jonell Hutchin Magallanes",
    description: "Search and download from SoundCloud",
    usePrefix: true,
    commandCategory: "media",
    usages: "sc [search query]",
    cooldowns: 5,
    dependencies: {
        "axios": "",
        "fs-extra": ""
    }
};

module.exports.run = async function ({ api, event, args }) {
    const query = args.join(" ");
    if (!query) return api.sendMessage("Usage: sc [search query]", event.threadID, event.messageID);

    try {
        api.setMessageReaction("⏳", event.messageID, () => {}, true);

        const searchUrl = `https://betadash-api-swordslush-production.up.railway.app/SoundCloud?search=${encodeURIComponent(query)}`;
        const searchRes = await axios.get(searchUrl);
        const results = searchRes.data.results;

        if (!results || results.length === 0) {
            api.setMessageReaction("❌", event.messageID, () => {}, true);
            return api.sendMessage("❌ No results found.", event.threadID, event.messageID);
        }

        const first = results[0];
        const dlUrl = `https://betadash-api-swordslush-production.up.railway.app/scdl?url=${encodeURIComponent(first.url)}`;
        const dlRes = await axios.get(dlUrl);
        const dlData = dlRes.data;

        const filePath = path.join(__dirname, "cache", `sc_${Date.now()}.mp3`);
        const audio = await axios.get(dlData.download, { responseType: "arraybuffer" });
        await fs.writeFile(filePath, Buffer.from(audio.data, "binary"));

        api.setMessageReaction("✅", event.messageID, () => {}, true);

        await api.sendMessage({
            body: `𝗦𝗼𝘂𝗻𝗱𝗖𝗹𝗼𝘂𝗱 𝗣𝗹𝗮𝘆\n━━━━━━━━━━━━━━━━━━\n\n` +
                  `🎵 𝗧𝗶𝘁𝗹𝗲: ${dlData.title}\n` +
                  `⏱️ 𝗗𝘂𝗿𝗮𝘁𝗶𝗼𝗻: ${dlData.duration}`,
            attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath));

    } catch (err) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        api.sendMessage("⚠️ Error: " + err.message, event.threadID, event.messageID);
    }
};