import { followingPlayer, getTitle, setFollow, setMode, titles } from "../utils/utils.js";

export function stopCMD(bot, username) {
  if (username === followingPlayer) {
    setMode("stop");
    setFollow(null);
    bot.pathfinder.setGoal(null);
    bot.chat(`Okay ${getTitle(username)}, I'll stop following.`);
  } else {
    bot.chat(`But I'm not following you, ${getTitle(username)}.`);
  }
}
