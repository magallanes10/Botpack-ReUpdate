const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "warns.json");

if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));

function loadDB() {
    return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}

function saveDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function toBold(str) {
    return str.replace(/[A-Za-z0-9]/g, c =>
        String.fromCodePoint(c.charCodeAt(0) + (c >= 'A' && c <= 'Z' ? 0x1D400 - 65 : c >= 'a' && c <= 'z' ? 0x1D41A - 97 : c >= '0' && c <= '9' ? 0x1D7CE - 48 : c.charCodeAt(0)))
    );
}

module.exports.config = {
    name: "warn",
    version: "1.2.0",
    hasPermssion: 1,
    description: "Warn system with limit and auto-kick",
    usePrefix: true,
    hide: false,
    commandCategory: "Moderation",
    usages: "/warn <uid|mention> <reason | cleared | clear all | lists>",
    cooldowns: 3,
    credits: "Jonell Magallanes"
};

module.exports.run = async ({ api, event, args }) => {
    let warns = loadDB();
    const threadID = event.threadID;

    if (!args[0]) return api.sendMessage("❌ Usage: /warn <uid|mention> <reason|cleared|clear all|lists>", threadID, event.messageID);

    if (args[0].toLowerCase() === "lists") {
        let msg = "⚠️ 𝗪𝗔𝗥𝗡𝗘𝗗 𝗨𝗦𝗘𝗥𝗦\n━━━━━━━━━━━━━━━━━━\n";
        for (const uid in warns) {
            msg += `👤 ${toBold(uid)}\n⚠️ Warnings: ${warns[uid].count}/3\n📋 Reasons: ${warns[uid].reasons.join("; ")}\n━━━━━━━━━━━━━━━━━━\n`;
        }
        if (Object.keys(warns).length === 0) msg = "✅ 𝗡𝗢 𝗨𝗦𝗘𝗥𝗦 𝗛𝗔𝗩𝗘 𝗪𝗔𝗥𝗡𝗜𝗡𝗚𝗦.";
        return api.sendMessage(msg, threadID, event.messageID);
    }

    if (args[0].toLowerCase() === "clear" && args[1] === "all") {
        warns = {};
        saveDB(warns);
        return api.sendMessage("✅ 𝗔𝗟𝗟 𝗪𝗔𝗥𝗡𝗜𝗡𝗚𝗦 𝗖𝗟𝗘𝗔𝗥𝗘𝗗.", threadID, event.messageID);
    }

    const mention = Object.keys(event.mentions)[0];
    const uid = mention || args[0];
    if (!uid) return api.sendMessage("❌ Please mention a user or provide UID.", threadID, event.messageID);

    if (!args[1]) return api.sendMessage("❌ Please provide a reason or use 'cleared'.", threadID, event.messageID);

    const reason = args.slice(1).join(" ");

    if (reason.toLowerCase() === "cleared") {
        if (warns[uid]) {
            delete warns[uid];
            saveDB(warns);
            return api.sendMessage(`✅ Warnings for ${toBold(uid)} cleared.`, threadID, event.messageID);
        } else {
            return api.sendMessage(`❌ ${toBold(uid)} has no warnings.`, threadID, event.messageID);
        }
    }

    if (!warns[uid]) warns[uid] = { count: 0, reasons: [] };

    warns[uid].count += 1;
    warns[uid].reasons.push(reason);
    saveDB(warns);

    if (warns[uid].count >= 3) {
        api.sendMessage(`⛔ User ${toBold(uid)} has reached 3 warnings and will be removed.`, threadID, event.messageID);
        api.removeUserFromGroup(uid, threadID);
        delete warns[uid];
        saveDB(warns);
        return;
    }

    api.sendMessage(
        `⚠️ Warned ${toBold(uid)}\nReason: ${reason}\nCurrent Warnings: ${warns[uid].count}/3\n━━━━━━━━━━━━━━━━━━`,
        threadID,
        event.messageID
    );
};