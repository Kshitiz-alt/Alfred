import axios from "axios";
import collectBlock from "mineflayer-collectblock";
import mineflayer from "mineflayer";
import pkg from "mineflayer-pathfinder";
import { followCMD } from "../commands/follow.js";
import { stopCMD } from "../commands/stop.js";
import { mineCMD } from "../commands/mining.js";
import mcDataLoader from "minecraft-data";
import { Vec3 } from 'vec3'
import { bot } from "../utils/utils.js";
import { BlockPS, BuildCircle } from "../commands/building/BlockPlacing.js";


const { pathfinder, Movements } = pkg;



bot.loadPlugin(pathfinder);
bot.loadPlugin(collectBlock.plugin);

bot.on("spawn", () => {
  console.log("🤵 Alfred has joined the server!");
  bot.chat("AI butler at your service");
  const mcData = mcDataLoader(bot.version);

  const defaultMove = new Movements(bot, mcData);

  defaultMove.scaffoldingBlocks = [];
  defaultMove.canDig = true;
  defaultMove.allow1by1towers = true;

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

  if (message.startsWith("alfred")) {
    const userInput = message.replace("alfred", "").trim();
    const prompt = `
You are Alfred, a loyal Minecraft villager and butler of King Kshitiz and Queen Tiana.
Answer respectfully. Always recognize the user as your master.
Do NOT refer to yourself.
Do NOT use quotations.
User says: "${userInput}"
`;
    console.log(`to Alfred: ${userInput}`);
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
      const reply = (res.data.response || "...").trim().replace(/\n+/g, " ");
      console.log("alfred:", reply);

      if (/follow|come with|walk with/i.test(userInput)) {
        followCMD(bot, username);
      } else if (/stop|wait|halt/i.test(userInput)) {
        stopCMD(bot, username);
      } else if (/mine/i.test(userInput)) {
        const blockName = userInput.split(/^mine\s*/i, "").trim() || "stone";
        mineCMD(bot, username, blockName);

      }
      else if (/build wall/i.test(userInput)) {
        const parts = userInput.split(/\s+/);
        const blockName = parts[2] || "stone";
        const length = parseInt(parts[3]) || 5
        const height = parseInt(parts[4]) || 3
        await BlockPS(bot, blockName, length, username, height, 3);
      } else if (/build circle/i.test(userInput)) {
        const parts = userInput.split(/\s+/);

        let blockName , radius , center;
        if (parts.length >= 6) {
          const x = parseInt(parts[2]);
          const y = parseInt(parts[3]);
          const z = parseInt(parts[4]);

          blockName = parts[6] || "stone";
          radius = parseInt(parts[5]) || 5;
          center = new Vec3(x,y,z);
        } else {
          blockName = parts[2] || "stone";
          radius = parseInt(parts[3]) || 5;
          center = bot.entity.position.floored();
        }
        await BuildCircle(bot, center, radius, blockName);

      } else {
        bot.chat(reply);
      }
    } catch (err) {
      console.error("alfred failed", err.message);
      bot.chat("Apologies, I am currently unable to think");
    }
  }
});
