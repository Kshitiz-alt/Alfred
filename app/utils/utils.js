import mineflayer from 'mineflayer';
import dotenv from 'dotenv';
import { Vec3 } from 'vec3';

dotenv.config();

export const bot = mineflayer.createBot({
  host: process.env.MC_HOST,
  port: process.env.MC_PORT,
  username: "Alfred",
  version: process.env.MC_VERSION,
});


export let mode = "idle";
export let followingPlayer = null;

export const masters = ["saiki", "Tiana"];

export const titles = {
  saiki: "milord",
  TIANA: "milady",
};

export const getTitle = (username) => {
  return titles[username] || username;
}

export function isMaster(username) {
  return Object.prototype.hasOwnProperty.call(titles, username);
}

export function setMode(newMode) {
  mode = newMode;
}

export function setFollow(player) {
  followingPlayer = player;
}

export function isExposed(bot, pos) {
  const neighbors = [
    pos.offset(1, 0, 0),
    pos.offset(-1, 0, 0),
    // pos.offset(0, 1, 0),
    // pos.offset(0, -1, 0),
    pos.offset(0, 0, 1),
    pos.offset(0, 0, -1),
  ];
  return neighbors.some((n) => bot.blockAt(n)?.name === "air");
}

export function isPickaxeLow(bot) {
  const pickaxe = bot.inventory.items().find(item => item.name.includes("pickaxe"));
  if (!pickaxe) return false;

  const durabilityUsed = pickaxe.durabilityUsed ?? 0;
  const maxDurability = pickaxe.maxDurability ?? 1;

  const remainingDurability = ((maxDurability - durabilityUsed) / maxDurability) * 100;

  return remainingDurability <= 10;
}


export function selectAnyPlaceableBlock(bot) {
  const placeable = bot.inventory.items().find(item =>
    item.name.includes("stone") ||
    item.name.includes("planks") ||
    item.name.includes("dirt")
  );

  if (placeable) {
    bot.equip(placeable, "hand").catch(err => {
      console.log("equip failed", err.message);
    });
    return true;
  }

  console.log("No placeable blocks found in inventory!");
  return false;
}

export async function PlaceAt(bot,pos,blockName) {

  const item = bot.inventory.items().find(item => item.name === blockName);
  await bot.equip(item, "hand");

  const refBlock = bot.blockAt(pos.offset(0, -1, 0))
  if (!refBlock) return false

  const lookPos = new Vec3(0.5, 0.5, 0.5);
  await bot.lookAt(lookPos, true);

  try {
    await bot.placeBlock(refBlock, new Vec3(0, 1, 0))
    await bot.waitForTicks(2)
    return true
  } catch (err) {
    console.error(`Couldn’t place ${blockName} at ${pos}: ${err.message}`)
    return false
  }
}