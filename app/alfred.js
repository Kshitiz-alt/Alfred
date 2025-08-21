import axios from "axios";
import fs from "fs";
import dotenv from "dotenv";
import mineflayer from "mineflayer";
import { keyboard, Key, sleep } from "@nut-tree-fork/nut-js";
import pkg from "mineflayer-pathfinder";

dotenv.config();

const { goals, pathfinder } = pkg;

const { GoalFollow } = goals;

const bot = mineflayer.createBot({
  host: process.env.HOST,
  port: process.env.PORT,
  username: process.env.USERNAME,
  version: process.env.VERSION,
});
bot.loadPlugin(pathfinder);

let followingPlayer = null;

const titles = {
  saiki: "milord",
  Tiana: "milady",
};

bot.on("spawn", () => {
  console.log("🤵 Alfred has joined the server!");
  bot.chat("how may i help you, sir");
});

bot.on("chat", async (username, message) => {
  if (username === bot.username) return;
  if (/^!alfred (hi|hello|hey)$/i.test(message)) {
    bot.chat(`hi ${username}, how can i help you?`);
  }

  if (message.startsWith("!alfred")) {
    const prompt = message.replace("!alfred", "").trim();
    console.log(`question to Alfred: ${prompt}`);
    try {
      const res = await axios.post(
        "http://localhost:11434/api/generate",
        {
          model: "alfred",
          prompt: prompt,
          stream: false,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const reply = res.data.response || "...";
      console.log("alfred:", reply);

      // bot.chat(reply);

      const title = titles[username] || username;
      const player = bot.players[username]?.entity;

      if (/follow|come with|walk with/i.test(prompt)) {
        followingPlayer = username
        bot.pathfinder.setGoal(new GoalFollow(player, 2), true);
        if(!player){
          bot.chat(`I cant see you ,${username}. are you nearby?`);
          return;
        }
        bot.chat(`your orders my command, ${title}`);
      } else if (/stop|wait|halt/i.test(prompt)) {
        if (username === followingPlayer || titles[username] === followingPlayer) {
          followingPlayer = null;
          bot.pathfinder.setGoal(null);
          bot.chat(`Okay ${title}, I'll stop following.`);
        } else {
          bot.chat(`But I'm not following you, ${username}.`);
        }
      } else {
        bot.chat(reply);
      }
    } catch (err) {
      console.error("alfred failed", err.message);
    }
  }
});
