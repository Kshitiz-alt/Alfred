import axios from "axios";
import dotenv from "dotenv";
import collectBlock from "mineflayer-collectblock";
import mineflayer from "mineflayer";
import pkg from "mineflayer-pathfinder";
import { followCMD } from "../commands/follow.js";
import { stopCMD } from "../commands/stop.js";
import { mineCMD } from "../commands/mining.js";
import mcDataLoader from "minecraft-data";

dotenv.config();

const { pathfinder, Movements } = pkg;

const bot = mineflayer.createBot({
  host: process.env.MC_HOST,
  port: process.env.MC_PORT,
  username: "Alfred",
  version: process.env.MC_VERSION,
});

bot.loadPlugin(pathfinder);
bot.loadPlugin(collectBlock.plugin);

bot.on("spawn", () => {
  console.log("🤵 Alfred has joined the server!");
  bot.chat("AI butler at your service");
  const mcData = mcDataLoader(bot.version);

  const defaultMove = new Movements(bot, mcData);

  defaultMove.scafoldingBlocks = []; 
  defaultMove.canDig = true; // allow mining
  defaultMove.allow1by1towers = false;

  defaultMove.blocksToAvoid.add(mcData.blocksByName.water.id);
  defaultMove.blocksToAvoid.add(mcData.blocksByName.lava.id);
  defaultMove.blocksToAvoid.add(mcData.blocksByName.cactus.id);
  defaultMove.blocksToAvoid.add(mcData.blocksByName.fire.id);
  defaultMove.blocksToAvoid.add(mcData.blocksByName.magma_block.id);
  defaultMove.blocksToAvoid.add(mcData.blocksByName.sweet_berry_bush.id);

  bot.pathfinder.setMovements(defaultMove);
});

bot.on("chat", async (username, message) => {
  if (username === bot.username) return;
  if (/^!alfred (hi|hello|hey)$/i.test(message)) {
    bot.chat(`hi ${username}, how can i help you?`);
  }

  if (message.startsWith("!alfred")) {
    const userInput = message.replace("!alfred", "").trim();
    const prompt = `
You are Alfred, a loyal Minecraft villager and butler of King Kshitiz and Queen Tiana.
Answer respectfully. Always recognize the user as your master.
Do NOT refer to yourself.
User says: "${userInput}"
`;
    console.log(`to Alfred: ${prompt}`);
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

      if (/follow|come with|walk with/i.test(prompt)) {
        followCMD(bot, username);
      } else if (/stop|wait|halt/i.test(prompt)) {
        stopCMD(bot, username);
      } else if (/mine/i.test(prompt)) {
        const blockName = prompt.split("mine ")[1]?.trim() || "stone";
        mineCMD(bot, username, blockName);
      } else {
        bot.chat(reply);
      }
    } catch (err) {
      console.error("alfred failed", err.message);
      bot.chat("Apologies, I am currently unable to think");
    }
  }
});
