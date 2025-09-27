const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "shoti",
  version: "1.0",
  hasPermssion: 0,
  credits: "Jonell Hutchin Magallanes",
  description: "Get random TikTok video",
  usePrefix: true,
  commandCategory: "fun",
  usages: "<prefix>shoti",
  cooldowns: 5,
};

module.exports.run = async function({ api, event }) {
  try {
    const res = await axios.get("http://shotiapi.joncll.serv00.net/shoti.php");
    const data = res.data;

    if (!data.download) {
      return api.sendMessage("❌ No video found from API.", event.threadID, event.messageID);
    }

    const videoPath = path.join(__dirname, "shoti.mp4");
    const response = await axios.get(data.download, { responseType: "arraybuffer" });
    fs.writeFileSync(videoPath, Buffer.from(response.data, "binary"));

    const message = 
`🎬 TikTok Video
👤 Username: ${data.username}
📝 Desc: ${data.desc}
🌍 Region: ${data.region}`;

    api.sendMessage(
      { body: message, attachment: fs.createReadStream(videoPath) },
      event.threadID,
      () => fs.unlinkSync(videoPath),
      event.messageID
    );
  } catch (e) {
    api.sendMessage("⚠️ Failed to fetch video.", event.threadID, event.messageID);
  }
};