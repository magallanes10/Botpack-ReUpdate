const os = require("os");
const si = require("systeminformation");

module.exports.config = {
    name: "upt",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Jonell Hutchin Magallanes",
    description: "Show system uptime and info",
    usePrefix: true,
    commandCategory: "system",
    usages: "uptime",
    cooldowns: 5,
    dependencies: {
        "systeminformation": ""
    }
};

module.exports.run = async function ({ api, event }) {
    try {
        const uptimeSeconds = os.uptime();
        const days = Math.floor(uptimeSeconds / (3600 * 24));
        const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const seconds = uptimeSeconds % 60;

        const mem = await si.mem();
        const disk = await si.fsSize();

        const totalMem = (mem.total / 1024 / 1024 / 1024).toFixed(2);
        const usedMem = (mem.active / 1024 / 1024 / 1024).toFixed(2);
        const freeMem = (mem.available / 1024 / 1024 / 1024).toFixed(2);

        const totalDisk = (disk[0].size / 1024 / 1024 / 1024).toFixed(2);
        const usedDisk = (disk[0].used / 1024 / 1024 / 1024).toFixed(2);
        const freeDisk = (disk[0].available / 1024 / 1024 / 1024).toFixed(2);

        const message =
`𝗦𝘆𝘀𝘁𝗲𝗺 𝗜𝗻𝗳𝗼
━━━━━━━━━━━━━━━━━━

💻 OS: ${os.type()} ${os.release()}
🖥️ Architecture: ${os.arch()}
🏷️ Hostname: ${os.hostname()}

⏱️ Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s

📊 RAM:
• Total: ${totalMem} GB
• Used: ${usedMem} GB
• Free: ${freeMem} GB

💾 Storage:
• Total: ${totalDisk} GB
• Used: ${usedDisk} GB
• Free: ${freeDisk} GB`;

        api.sendMessage(message, event.threadID, event.messageID);
    } catch (err) {
        api.sendMessage("⚠️ Error: " + err.message, event.threadID, event.messageID);
    }
};