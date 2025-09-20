import { Vec3 } from 'vec3';
import mcDataLoader from "minecraft-data";
import pkg from "mineflayer-pathfinder";

const { goals, pathfinder, Movements } = pkg;
const { GoalNear } = goals;

export function setupMovements(bot) {
    if (!bot.pathfinder.movements) {
        const mcData = mcDataLoader(bot.version);
        const defaultMove = new Movements(bot, mcData);

        defaultMove.scaffoldingBlocks = [];
        defaultMove.canDig = true;
        defaultMove.allow1by1Towers = true;

        // Avoid dangerous blocks
        const avoidBlocks = [
            "water",
            "lava",
            "cactus",
            "fire",
            "magma_block",
            "sweet_berry_bush",
        ];

        avoidBlocks.forEach(name => {
            if (mcData.blocksByName[name]) {
                defaultMove.blocksToAvoid.add(mcData.blocksByName[name].id);
            }
        });

        bot.pathfinder.setMovements(defaultMove);
    }
}

export function getLines(start, end) {
    const points = [];
    let x1 = start.x, z1 = start.z;
    let x2 = end.x, z2 = end.z;

    const dx = Math.abs(x2 - x1);
    const dz = Math.abs(z2 - z1);

    const sx = x1 < x2 ? 1 : -1;
    const sz = z1 < z2 ? 1 : -1;

    let err = dx - dz;

    while (true) {
        points.push(new Vec3(x1, start.y, z1));
        if (x1 === x2 && z1 === z2) break;
        const e2 = 2 * err;
        if (e2 > -dz) { err -= dz; x1 += sx; }
        if (e2 < dx) { err += dx; z1 += sz; }
    }

    return points;

}

export function walkTo(bot, target) {
  return new Promise((resolve, reject) => {
    const goal = new goals.GoalNear(target.x, target.y, target.z, 1);
    bot.pathfinder.setGoal(goal);   
    const onGoal = () => {
      cleanup();
      resolve();
    };

    const onAborted = (reason) => {
      cleanup();
      reject(new Error(`Path aborted: ${reason}`));
    };

    function cleanup() {
      bot.removeListener("goal_reached", onGoal);
      bot.removeListener("path_reset", onAborted);
    }

    bot.once("goal_reached", onGoal);
    bot.once("path_reset", onAborted);
  });
}
