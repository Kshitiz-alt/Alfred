import { isMaster, setFollow, setMode, titles } from "../utils/utils.js";
import pkg from "mineflayer-pathfinder";

const { goals } = pkg;
const { GoalFollow } = goals;

export function followCMD(bot, username) {
  const player = bot.players[username]?.entity;
  if (!isMaster(username)) {
    bot.chat(`I only follow my master, ${username}`);
    return;
  }
  const title = titles[username] || username;

  if (!player) {
    bot.chat(`I cant see you,${username}. are you nearby?`);
    return;
  }

  setMode("follow");
  setFollow(username);

  bot.pathfinder.setGoal(new GoalFollow(player, 2), true);
  bot.chat(`your orders my command, ${title}`);
}
