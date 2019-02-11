export const ObjectKinds = {
  Apple: Symbol(),
  Snake: Symbol(),
  Wall: Symbol(),
  Air: Symbol(),
};

const tileRegistry = {};

export default class TileObject {
  constructor(kind, name) {
    this.kind = kind;
    this.name = name;
    if (tileRegistry[name]) {
      throw new Error(`Duplicate tile created: ${name}`);
    }
    tileRegistry[name] = this;
  }
}

export const Apple = new TileObject(ObjectKinds.Apple, 'Apple');
export const Wall = new TileObject(ObjectKinds.Wall, 'Wall');
export const WorldWall = new TileObject(ObjectKinds.Wall, 'World wall');
export const SnakeHead = new TileObject(ObjectKinds.Snake, 'Snake head');
export const SnakeBody = new TileObject(ObjectKinds.Snake, 'Snake body');
export const SnakeTail = new TileObject(ObjectKinds.Snake, 'Snake tail');
export const Air = new TileObject(ObjectKinds.Air, 'Air');

export function getTileByName(name) {
  return tileRegistry[name];
}
