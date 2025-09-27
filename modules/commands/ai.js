const axios = require('axios');

module.exports.config = {
    name: "ai",
    hasPermssion: 0,
    version: "1.0.0",
    credits: "Jonell Magallanes",
    description: "EDUCATIONAL",
    usePrefix: true,
    commandCategory: "AI Tools",
    usages: "[question]",
    cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
    const { messageID, threadID } = event;
    const id = event.senderID;

    if (!args[0]) return api.sendMessage("Please provide your question.\n\nExample: ai what is the solar system?", threadID, messageID);

    api.setMessageReaction("🔎", event.messageID, () => {}, true);

    try {
        if (event.type === "message_reply" && event.messageReply.attachments && event.messageReply.attachments[0]) {
            const attachment = event.messageReply.attachments[0];
            if (attachment.type === "photo") {
                const imageURL = attachment.url;
                const prompt = args.join(" ");
                const geminiUrl = `https://api.ccprojectsapis-jonell.gleeze.com/api/ai/geminilite?prompt=${encodeURIComponent(prompt)}&imgUrl=${encodeURIComponent(imageURL)}`;
                
                const response = await axios.get(geminiUrl);
                const { response: result } = response.data;

                api.setMessageReaction("✅", event.messageID, () => {}, true);
                return api.sendMessage(
                    `𝗚𝗘𝗠𝗜𝗡𝗜 𝗩𝗜𝗦𝗜𝗢𝗡 𝗟𝗜𝗧𝗘\n━━━━━━━━━━━━━━━━━━\n${result}\n━━━━━━━━━━━━━━━━━━`,
                    threadID, messageID
                );
            }
        }

        const ask = args.join(" ");
        const apiUrl = `https://rapido.zetsu.xyz/api/anthropic?q=${encodeURIComponent(ask)}&uid=${id}&model=claude-opus-4-1-20250805&image=&max_tokens=`;

        const response = await axios.get(apiUrl);
        const { response: result } = response.data;

        api.setMessageReaction("✅", event.messageID, () => {}, true);
        api.sendMessage(
            `𝗖𝗹𝗮𝘂𝗱𝗲 𝗔𝗻𝘁𝗵𝗿𝗼𝗽𝗶𝗰\n━━━━━━━━━━━━━━━━━━\n${result}\n━━━━━━━━━━━━━━━━━━`,
            threadID, messageID
        );

        global.client.handleReply.push({
            name: this.config.name,
            messageID: messageID,
            author: event.senderID
        });

    } catch (error) {
        console.error(error);
        api.sendMessage("An error occurred while processing your request.", threadID, messageID);
    }
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
    const { messageID, threadID } = event;
    const id = event.senderID;

    api.setMessageReaction("🔎", event.messageID, () => {}, true);

    try {
        const apiUrl = `https://rapido.zetsu.xyz/api/anthropic?q=${encodeURIComponent(event.body)}&uid=${id}&model=claude-opus-4-1-20250805&image=&max_tokens=`;
        const response = await axios.get(apiUrl);
        const { response: result } = response.data;

        api.setMessageReaction("✅", event.messageID, () => {}, true);
        api.sendMessage(
            `𝗖𝗹𝗮𝘂𝗱𝗲 𝗔𝗻𝘁𝗵𝗿𝗼𝗽𝗶𝗰\n━━━━━━━━━━━━━━━━━━\n${result}\n━━━━━━━━━━━━━━━━━━`,
            threadID, messageID
        );
    } catch (error) {
        console.error(error);
        api.sendMessage("An error occurred while processing your reply.", threadID, messageID);
    }
};