import World from 'data/World';
import Game from 'data/Game';
import Joi from 'joi';

import * as Directions from 'data/Directions';
import RouteErrorProcessor from 'routes/RouteErrorProcessor';

import { worldDataToJoinedRowMapper } from 'mappers/worldDataMapper';
import tileMapper, { emojiMapping } from 'mappers/tileMapper';
import snakeMapper from 'mappers/snakeMapper';
import gameMapper from 'mappers/gameMapper';

const gameStorage = {};
const gameIDCounter = (() => {
  let counter = 0;
  return () => ++counter;
})();

export const NewGame = {
  method: 'POST',
  path: '/game/create',
  handler: RouteErrorProcessor(async function (req) {
    const worldID = req.payload.worldID;
    const world = World.awake(await req.server.methods.world.fromID(worldID));

    const game = new Game(world);
    const snake = game.createSnake();
    const gameID = gameIDCounter();

    gameStorage[gameID] = game;
    game.on('gameOver', () => delete gameStorage[gameID]);

    game.startGame();

    return {
      result: 'success',
      gameID: gameID,
      worldState: worldDataToJoinedRowMapper(game.world, tileMapper(emojiMapping)),
      snake: snakeMapper(snake),
      game: gameMapper(game),
    };
  }),
  options: {
    validate: {
      payload: {
        worldID: Joi.string(),
      },
    },
  },
};

export const GameMove = {
  method: 'POST',
  path: '/game/move',
  handler: RouteErrorProcessor(function (req) {
    const game = gameStorage[req.payload.gameID];
    if (!game) {
      throw new Error('Unknown game ID');
    }
    const direction = Directions[req.payload.direction];
    game.doMove(direction);

    return {
      result: 'success',
      worldState: worldDataToJoinedRowMapper(game.world, tileMapper(emojiMapping)),
      snake: snakeMapper(game.snake),
      game: gameMapper(game),
    };
  }),
  options: {
    validate: {
      payload: {
        gameID: Joi.number(),
        direction: Joi.string().valid('Up', 'Right', 'Left'),
      },
    },
  },
};
