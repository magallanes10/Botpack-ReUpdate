const fs = require("fs");
const path = require("path");
const axios = require("axios");
const yts = require("yt-search");

module.exports.config = {
    name: "music",
    version: "1.1.0",
    hasPermssion: 0,
    description: "Play and download YouTube music",
    usePrefix: true,
    hide: false,
    commandCategory: "Music",
    usages: "<song name>",
    cooldowns: 5,
    credits: "Jonell Magallanes"
};

module.exports.run = async ({ api, event, args }) => {
    try {
        const query = args.join(" ");
        if (!query) return api.sendMessage("❌ Please provide a song name to search.", event.threadID, event.messageID);

        const search = await yts(query);
        if (!search.videos.length) return api.sendMessage("❌ No results found.", event.threadID, event.messageID);

        const video = search.videos[0];
        const url = video.url;

        api.setMessageReaction("⏳", event.messageID, () => {}, true);

        const apiUrl = `https://ccproject.serv00.net/ytdl2.php?url=${encodeURIComponent(url)}`;
        const res = await axios.get(apiUrl);
        const { title, download } = res.data;

        const filePath = path.join(__dirname, "cache", `${Date.now()}.mp3`);
        const writer = fs.createWriteStream(filePath);
        const response = await axios.get(download, { responseType: "stream" });
        response.data.pipe(writer);

        writer.on("finish", () => {
            api.sendMessage(
                {
                    body: `🎶 𝗠𝘂𝘀𝗶𝗰 𝗣𝗹𝗮𝘆𝗲𝗿 𝗬𝗼𝘂𝗧𝘂𝗯𝗲\n━━━━━━━━━━━━━━━━━━\nTitle: ${video.title}\nAuthor: ${video.author.name}\nDuration: ${video.timestamp}\nYouTube URL: ${video.url}\nDownload Music: ${download}`,
                    attachment: fs.createReadStream(filePath)
                },
                event.threadID,
                () => {
                    api.setMessageReaction("✅", event.messageID, () => {}, true);
                    fs.unlinkSync(filePath);
                }
            );
        });

        writer.on("error", () => {
            api.sendMessage("❌ Failed to process the music file.", event.threadID, event.messageID);
        });
    } catch (err) {
        api.sendMessage("❌ Error: Unable to fetch music.", event.threadID, event.messageID);
    }
};