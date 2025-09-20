import { Vec3 } from "vec3";
import {
  followingPlayer,
  isExposed,
  isPickaxeLow,
  mode,
  setMode,
  titles,
} from "../utils/utils.js";
import mcDataLoader from "minecraft-data";

export async function mineCMD(bot, username, blockName = "stone") {
  const data = mcDataLoader(bot.version);
  const title = titles[username] || username;

  if (mode === "follow") {
    const callTitle = titles[followingPlayer] || followingPlayer;
    bot.chat(`I'm following ${callTitle}, stop me so I can mine`);
    return;
  }
  
  const blockType = data.blocksByName[blockName.toLowerCase()];
  if (!blockType) {
    bot.chat(`I don't recognize the block "${blockName}", ${title}.`);
    return;
  }

  const block = bot.findBlocks({
    matching: blockType.id,
    maxDistance: 32,
    count: 0,
  });

  const blockExposed = block
    .map((pos) => bot.blockAt(pos))
    .filter((b) => b && isExposed(bot, b.position));

  if (!blockExposed.length){
    bot.chat(`I can't find any ${blockName} nearby, ${title}.`);
    setMode("idle");
    return;
  }

  const needsPickaxe = [
    "stone",
    "iron_ore",
    "diamond_ore",
    "coal_ore",
  ].includes(blockName.toLowerCase());
  if (needsPickaxe) {
    const hasPickaxe = bot.inventory
      .items()
      .some((item) => item.name.includes("pickaxe"));
    if (!hasPickaxe) {
      bot.chat(`I don't have the correct tool for ${blockName}, ${title}`);
      return;
    }
  }

  if (isPickaxeLow(bot)) {
    bot.chat(`My pickaxe is about to break, will stop mining`);
    setMode("idle");
    return;
  }

  bot.chat(`Mining ${blockName}, ${title}....`);
  setMode("mine");

  try {
    await bot.collectBlock.collect(blockExposed);
    if (mode !== "idle") bot.chat(`Done Mining ${blockName}, ${title}`);
  } catch (err) {
    if (!err.message?.includes("stopped")) {
      bot.chat(`I couldn't mine ${blockName}, ${title}.`);
      console.error("failed to mine blocks", err);
    }
  } finally {
    if (mode !== "idle") {
      bot.chat(`I will sit idle, ${title}`);
      setMode("idle");
    }
  }
}
