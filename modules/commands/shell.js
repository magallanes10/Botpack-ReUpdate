const { exec } = require("child_process");
const axios = require("axios");

module.exports.config = {
  name: "shell",
  version: "1.3",
  hasPermssion: 2,
  credits: "Jonell Hutchin Magallanes",
  description: "Execute shell commands",
  usePrefix: true,
  commandCategory: "system",
  usages: "<prefix>shell <command>",
  cooldowns: 5,
};

module.exports.run = async function({ api, event, args }) {
  const command = args.join(" ");
  if (!command) return api.sendMessage("❌ Please provide a command to run.", event.threadID, event.messageID);

  exec(command, { timeout: 10000, maxBuffer: 1024 * 1024 }, async (error, stdout, stderr) => {
    if (error) return api.sendMessage(`⚠️ Error:\n${error.message}`, event.threadID, event.messageID);
    if (stderr) return api.sendMessage(`⚠️ Stderr:\n${stderr}`, event.threadID, event.messageID);
    if (stdout.length === 0) return api.sendMessage("✅ Command executed, but no output.", event.threadID, event.messageID);

    try {
      if (stdout.length > 1900) {
        const res = await axios.post(
          "http://paste.joncll.serv00.net/api.php",
          new URLSearchParams({ content: stdout }).toString(),
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );
        return api.sendMessage(
          `𝗦𝗵𝗲𝗹𝗹 𝗧𝗲𝗿𝗺𝗶𝗻𝗮𝗹 𝗘𝘅𝗲𝗰𝘂𝘁𝗶𝗼𝗻\n━━━━━━━━━━━━━━━━━━\n🔗 ${res.data.url}`,
          event.threadID,
          event.messageID
        );
      } else {
        return api.sendMessage(
          `𝗦𝗵𝗲𝗹𝗹 𝗧𝗲𝗿𝗺𝗶𝗻𝗮𝗹 𝗘𝘅𝗲𝗰𝘂𝘁𝗶𝗼𝗻 \n━━━━━━━━━━━━━━━━━━\n${stdout}`,
          event.threadID,
          event.messageID
        );
      }
    } catch (err) {
      return api.sendMessage(`⚠️ Upload failed: ${err.message}`, event.threadID, event.messageID);
    }
  });
};