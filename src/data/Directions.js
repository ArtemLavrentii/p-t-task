import Pos from 'data/Pos';

const directionName = Symbol();

export const Up = new Pos(0, 1);
export const Down = new Pos(0, -1);
export const Right = new Pos(1, 0);
export const Left = new Pos(-1, 0);

const directionNames = { Up, Down, Right, Left };

/**
 * Returns name of direction that is close to given one
 * @param {Pos} direction Normalized direction vector
 * @return {undefined|String} name of direction or undefined when provided argument isn't a direction
 */
export function directionToName(direction) {
  const result =
      Object
          .entries(directionNames)
          .find(e => e[1].areCloseEnough(direction));
  if (result === undefined) {
    return undefined;
  }
  return result[0];
}
