const fs = require("fs");
const path = require("path");
const axios = require("axios");
const yts = require("yt-search");

module.exports.config = {
    name: "video",
    version: "1.0.0",
    hasPermssion: 0,
    description: "Play and download YouTube video",
    usePrefix: true,
    hide: false,
    commandCategory: "Video",
    usages: "<video name>",
    cooldowns: 5,
    credits: "Jonell Magallanes"
};

module.exports.run = async ({ api, event, args }) => {
    try {
        const query = args.join(" ");
        if (!query) return api.sendMessage("❌ Please provide a video name to search.", event.threadID, event.messageID);

        const search = await yts(query);
        if (!search.videos.length) return api.sendMessage("❌ No results found.", event.threadID, event.messageID);

        const video = search.videos[0];
        const url = video.url;

        const msg = await api.sendMessage("⏳ Processing your request...", event.threadID);
        api.setMessageReaction("⏳", msg.messageID, () => {}, true);

        const apiUrl = `https://yt-manager-dl-cc.vercel.app/api/video?url=${encodeURIComponent(url)}`;
        const res = await axios.get(apiUrl, { headers: { "User-Agent": "Mozilla/5.1" } });
        if (!res.data.status) return api.sendMessage("❌ Failed to fetch video.", event.threadID, event.messageID);

        const { heading, link, duration } = res.data;
        const filePath = path.join(__dirname, "cache", `${Date.now()}.mp4`);
        const writer = fs.createWriteStream(filePath);
        const response = await axios.get(link, { responseType: "stream", headers: { "User-Agent": "Mozilla/5.1" } });
        response.data.pipe(writer);

        writer.on("finish", () => {
            api.sendMessage(
                {
                    body: `🎬 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗩𝗶𝗱𝗲𝗼\n━━━━━━━━━━━━━━━━━━\nTitle: ${heading}\nDuration: ${duration}\nYouTube URL: ${video.url}`,
                    attachment: fs.createReadStream(filePath)
                },
                event.threadID,
                () => {
                    api.setMessageReaction("✅", msg.messageID, () => {}, true);
                    fs.unlinkSync(filePath);
                }
            );
        });

        writer.on("error", () => {
            api.sendMessage("❌ Failed to process the video file.", event.threadID, event.messageID);
        });
    } catch (err) {
        api.sendMessage("❌ Error: Unable to fetch video.", event.threadID, event.messageID);
    }
};