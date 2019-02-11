import World from 'data/World';
import Joi from 'joi';
import Random from 'random-js';

import RouteErrorProcessor from 'routes/RouteErrorProcessor';

import { worldDataToJoinedRowMapper } from 'mappers/worldDataMapper';
import tileMapper, { emojiMapping } from 'mappers/tileMapper';

export const NewWorld = {
  method: 'POST',
  path: '/world/create',
  handler: RouteErrorProcessor(async function (req) {
        const { width, height, appleLimit } = req.payload;
        const options = {
          width, height,
          objectLimits: { apples: appleLimit, walls: 0 },
          seed: Random.engines.nativeMath(),
        };
        const worldID = World.getID(options);
        const world = World.awake(await req.server.methods.world.fromID(worldID));

        return {
          result: 'success',
          worldID: World.getID(world),
          worldState: worldDataToJoinedRowMapper(world, tileMapper(emojiMapping)),
        };
      }
  ),
  options: {
    validate: {
      payload: {
        width: Joi.number().min(World.MIN_SIZE).max(World.MAX_SIZE),
        height: Joi.number().min(World.MIN_SIZE).max(World.MAX_SIZE),
        appleLimit: Joi.number().min(0).max(Math.pow(World.MAX_SIZE - 2, 2) - 1),
      },
    },
  },
};