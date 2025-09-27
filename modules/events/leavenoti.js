module.exports.config = {
  name: "leave",
  eventType: ["log:unsubscribe"],
  version: "1.0.0",
  credits: "Mirai Team & Mod by Yan Maglinte",
  description: "Notifies bots or people leaving the group"
};

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

let backgrounds = [
  "https://files.catbox.moe/eeo4h4.jpg",
  "https://files.catbox.moe/1lqzh6.jpg",
  "https://files.catbox.moe/imvrl6.jpg",
  "https://files.catbox.moe/kis6q8.jpeg",
  "https://files.catbox.moe/zgudyk.jpeg"
];

module.exports.run = async function({ api, event, Users, Threads }) {
  const leftParticipantFbId = event.logMessageData.leftParticipantFbId;
  const name = global.data.userName.get(leftParticipantFbId) || await Users.getNameUser(leftParticipantFbId);
  const isKicked = event.author !== leftParticipantFbId;
  
  const action = isKicked ? "has been kicked" : "decided to leave";
  const status = isKicked ? "Kicked : Leave" : "Left the group";

  let threadInfo = await api.getThreadInfo(event.threadID);
  let members = threadInfo.participantIDs.length;
  
  let randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];
  let avatarUrl = `https://graph.facebook.com/${leftParticipantFbId}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
  
  let apiUrl = `https://api.popcat.xyz/v2/goodbyecard?background=${encodeURIComponent(randomBackground)}&text1=${encodeURIComponent(name)}&text2=${encodeURIComponent(action)}&text3=${encodeURIComponent(`👥 Members: ${members}`)}&avatar=${encodeURIComponent(avatarUrl)}`;

  let pathImg = path.join(__dirname, 'cache/leave/leave.png');
  let imgData = (await axios.get(apiUrl, { responseType: "arraybuffer" })).data;
  fs.ensureDirSync(path.dirname(pathImg));
  fs.writeFileSync(pathImg, Buffer.from(imgData, "utf-8"));

  const formPush = {
    body: `🚪 ${name} ${status}\n👥 Remaining members: ${members}`,
    attachment: fs.createReadStream(pathImg)
  };

  return api.sendMessage(formPush, event.threadID);
};