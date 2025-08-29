export let mode = "idle";
export let followingPlayer = null;

export const masters = ["saiki", "Tiana"];

export const titles = {
  saiki: "milord",
  Tiana: "milady",
};

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

export function isPickaxeLow(bot){
    const pickaxe = bot.inventory.items().find(item => item.name.includes("pickaxe"));
    if(!pickaxe) return false;
    
    const durabilityUsed = pickaxe.durabilityUsed ?? 0;
    const maxDurability = pickaxe.maxDurability ?? 1;

    const remainingDurability = ((maxDurability - durabilityUsed ) / maxDurability) * 100;

    return remainingDurability <= 10;
}


