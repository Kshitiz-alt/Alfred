import { getTitle, isMaster, setFollow, setMode, titles } from "../utils/utils.js";
import pkg from "mineflayer-pathfinder";
import mcDataLoader from 'minecraft-data';

const { goals, Movements } = pkg;
const { GoalFollow } = goals;

export function followCMD(bot, username) {
  const player = bot.players[username]?.entity;
  if (!isMaster(username)) {
    bot.chat(`I only follow my master, ${username}`);
    return;
  }
  const title = titles[username] || username;
  const mcData = mcDataLoader(bot.version);
  const movements = new Movements(bot, mcData);

  if (!player) {
    bot.chat(`I cant see you,${getTitle(username)}. are you nearby?`);
    return;
  }

  movements.canSwim = true
  setMode("follow");
  setFollow(username);
  bot.pathfinder.setMovements(movements);

  bot.pathfinder.setGoal(new GoalFollow(player, 2), true);
  bot.chat(`your orders my command, ${title}`);
}
