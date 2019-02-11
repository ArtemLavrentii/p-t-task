import Random from 'random-js';
import { Apple, WorldWall, Air, ObjectKinds, getTileByName } from 'data/TileObject';
import Pos from 'data/Pos';

// TODO Change how world generation works
// Graph-based algorithm should be used instead. It will find all possible "bridges" and deny walls from spawning there
// Also it would be "realtime" meaning that each time we add a wall it would regenerate list of bridges.
// For now walls are only generated at the edge of map
// (Bridge is something that connects one otherwise-closed area to another.
// There should be at least 2 bridges from each of such areas

// TODO Change how limits are working
// Right now there are only 2 possible limits ( one of witch doesn't even change anything ).
// But when we add more tile kinds in future this might be too annoying to keep up with.

export default class World {
  static getID({ seed, width, height, objectLimits: { apples, walls }}) {
    const result = Buffer.alloc(this.IDBufferLength);
    result.writeInt32LE(seed, 0);
    result.writeInt16LE(width, 4);
    result.writeInt16LE(height, 6);
    result.writeInt32LE(apples, 8);
    result.writeInt32LE(walls, 12);
    return result.toString('base64');
  };

  static getOptionsFromID(id) {
    const buffer = Buffer.from(id, 'base64');
    if (buffer.length !== this.IDBufferLength) {
      throw new Error('Corrupted or wrong ID');
    }
    return {
      seed: buffer.readInt32LE(0),
      width: buffer.readInt16LE(4),
      height: buffer.readInt16LE(6),
      objectLimits: {
        apples: buffer.readInt16LE(8),
        walls: buffer.readInt16LE(12),
      },
    };
  }

  constructor(options) {
    const {
      seed,
      width,
      height,
      objectLimits,
    } = options;

    if (width < World.MIN_SIZE || width > World.MAX_SIZE) {
      throw new Error(`Width isn't in range ${World.MIN_SIZE}..${World.MAX_SIZE}`);
    }
    if (height < World.MIN_SIZE || height > World.MAX_SIZE) {
      throw new Error(`Height isn't in range ${World.MIN_SIZE}..${World.MAX_SIZE}`);
    }

    this.seed = seed;
    this.width = width;
    this.height = height;
    this.objectLimits = objectLimits;

    this.random = Random.engines.mt19937();
    this.random.seed(this.seed);
    this.xDist = Random.integer(0, width - 1);
    this.yDist = Random.integer(0, height - 1);

    if (options.worldData) {
      this.random.discard(options.random.getUseCount());
      // This creates deep-copy of arrays but not of tiles
      // We wouldn't want to copy tiles as they are singletons
      this.worldData = options.worldData.map(row => [...row]);
      return;
    }
    if (options.seed) {
      this.generateWorld();
      return;
    }
    console.error('Unknown option set passed to world', options);
    throw new Error('Unknown option set');
  }

  makeCopy() {
    return new World(this);
  }

  setTileTo(pos, tile) {
    this.checkIsValidPos(pos);

    const previous = this.worldData[pos.y][pos.x];
    if (previous === tile) {
      return previous;
    }

    this.worldData[pos.y][pos.x] = tile;
    if (previous === Apple) {
      this.generateApple();
    }
    return previous;
  }

  removeTileAt(pos, expectedTile, newTile = Air) {
    this.checkIsValidPos(pos);

    if (this.worldData[pos.y][pos.x] !== expectedTile) {
      throw new Error('Trying to remove wrong tile');
    }
    this.setTileTo(pos, newTile);
  }

  getTileAt(pos) {
    this.checkIsValidPos(pos);

    return this.worldData[pos.y][pos.x];
  }

  generateApple() {
    this.setTileTo(this.generateEmptyRandomPos(), Apple);
  }

  generateEmptyRandomPos() {
    let pos = this.generateRandomPos();
    while (this.getTileAt(pos).kind !== ObjectKinds.Air) {
      pos = this.generateRandomPos()
    }
    return pos;
  }

  generateRandomPos() {
    return new Pos(this.xDist(this.random), this.yDist(this.random));
  }

  checkIsValidPos(pos) {
    if (pos.x < 0 || pos.y < 0 || pos.x >= this.width || pos.y >= this.height) {
      throw new Error('Invalid position');
    }
  }

  generateWorld() {
    let freeSpace = (this.width - 2) * (this.height - 2);
    freeSpace -= this.objectLimits.apples;
    freeSpace -= this.objectLimits.walls;
    if (freeSpace <= 0) {
      throw new Error('Too many items in world');
    }

    this.worldData = Array(this.height).fill(0).map(() => Array(this.width).fill(Air));

    for (let x = this.width - 1; x >= 0; x--) {
      this.setTileTo(new Pos(x, 0              ), WorldWall);
      this.setTileTo(new Pos(x, this.height - 1), WorldWall);
    }
    for (let y = this.height - 1; y >= 0; y--) {
      this.setTileTo(new Pos(0             , y), WorldWall);
      this.setTileTo(new Pos(this.width - 1, y), WorldWall);
    }

    for (let applesLeft = this.objectLimits.apples; applesLeft > 0; applesLeft--) {
      this.generateApple();
    }
  }

  toJSON() {
    return {
      ...this,
      random: { getUseCount: this.random.getUseCount() }
    }
  }

  static awake(sleepingWorld) {
    const options = { ...sleepingWorld };
    options.worldData = options.worldData.map(row => row.map(tile => getTileByName(tile.name)));
    options.random.getUseCount = () => sleepingWorld.random.getUseCount;
    return new World(options);
  }
}

World.MIN_SIZE = 5;
World.MAX_SIZE = 100;

World.IDBufferLength = 4 + 2 + 2 + 4 + 4;
