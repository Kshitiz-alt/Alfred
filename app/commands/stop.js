import { followingPlayer, setFollow, setMode, titles } from "../utils/utils.js";

export function stopCMD(bot, username) {
  const title = titles[username] || username;
  if (username === followingPlayer || titles[username] === followingPlayer) {
    setMode("stop");
    setFollow(null);
    bot.pathfinder.setGoal(null);
    bot.chat(`Okay ${title}, I'll stop following.`);
  } else {
    bot.chat(`But I'm not following you, ${username}.`);
  }
}
