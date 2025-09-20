import { Vec3 } from 'vec3';
import { bot, getTitle, PlaceAt } from "../../utils/utils.js";
import pkg from "mineflayer-pathfinder";
import mcDataLoader from 'minecraft-data'
import { getLines, setupMovements, walkTo } from '../../utils/Movements.js';

const { goals, pathfinder, Movements } = pkg;

const { GoalNear } = goals;




export async function BlockPS(bot, username, blockName = "stone", pillarHeight = 3, wallLength = 5, wallHeight = 3) {

    const item = bot.inventory.items().find(item => item.name === blockName)
    if (!item) {
        bot.chat(`I dont have this ${blockName},${getTitle(username)}`);
        return;
    }
    await bot.equip(item, "hand");

    for (let i = 0; i < pillarHeight; i++) {
        try {
            let refBlock;
            do {
                refBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0));
                bot.setControlState("jump", true)
                await bot.waitForTicks(2)
            } while (!refBlock);

            const targetPos = refBlock.position.offset(0, 1, 0);
            await PlaceAt(bot, targetPos, blockName)


            bot.setControlState("jump", true);
            await bot.waitForTicks(6);
            bot.setControlState("jump", false);
            await bot.waitForTicks(8);


            console.log("finished")
        } catch (err) {
            console.log(`Cant place ${blockName}`)
        }

    }

    bot.setControlState("forward", true);
    await bot.waitForTicks(20);
    bot.setControlState("forward", false);

    const base = bot.entity.position.floored();
    for (let y = 0; y < wallHeight; y++) {
        for (let x = 0; x < wallLength; x++) {
            try {
                const pos = new Vec3(base.x + x, base.y + y, base.z)
                await PlaceAt(bot, pos, blockName);
                await bot.waitForTicks(4);
            } catch (err) {
                console.error(`couldn't make wall ${err.message}`)

            }
        }
    }


    bot.chat(`Finished making wall, ${getTitle(username)}.`);
}


export async function BuildCircle(bot, center, radius = 5, blockName = "stone") {
    setupMovements(bot);

    const blocks = [];
    const y = center.y;

    for (let angle = 0; angle < 2 * Math.PI; angle += Math.PI / (radius * 6)) {
        const x = Math.round(center.x + radius * Math.cos(angle));
        const z = Math.round(center.z + radius * Math.sin(angle));
        blocks.push(new Vec3(x, y, z));
    }

    blocks.push(blocks[0]);

    for (let i = 1; i < blocks.length; i++) {
        const line = getLines(blocks[i - 1], blocks[i]);
        for (const pos of line) {
            try {
                let supportPos = pos.offset(0, -1, 0);
                const stack = [];
                while (!bot.blockAt(supportPos) || bot.blockAt(supportPos).name === "air") {
                    await PlaceAt(bot, supportPos, blockName);
                    supportPos = supportPos.offset(0, -1, 0);
                }

                const existing = bot.blockAt(pos);
                if (!existing || existing.name !== blockName) {

                    await PlaceAt(bot, pos, blockName);
                }

                if (bot.entity.position.distanceTo(pos) > 2) {
                    await walkTo(bot, pos);
                }
            } catch (err) {
                console.error(err.message);
            }
        }
    }

    bot.chat(`Circle complete (radius ${radius}, block ${blockName}).`);
}
