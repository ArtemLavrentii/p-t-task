import Pos from 'data/Pos';
import { Up, Down } from 'data/Directions';
import { SnakeBody, Air, ObjectKinds } from 'data/TileObject';

export default class Snake {
  constructor(world, startingPos) {
    this.energy = 15;
    this.isAlive = true;
    this.bodyParts = [];
    this.tilesToGrow = 2;
    this.headDirection = Up;
    this.world = world;
    this.addBodyPart(startingPos);
  }

  doMove(inDirection) {
    if (!this.isAlive) {
      throw new Error('Cannot move dead snake');
    }
    if (inDirection === Down) {
      throw new Error('Cannot move snake into itself');
    }

    const oldHeadPos = this.bodyParts[0];
    const newDirection = this.headDirection.rotateBy(inDirection);
    const newHeadPos = new Pos(oldHeadPos.x + newDirection.x, oldHeadPos.y + newDirection.y);

    // First add new tile, then remove old one.
    // Otherwise it would kill our poor snake each time we move with size === 3
    if (!this.addBodyPart(newHeadPos)) {
      return;
    }

    this.headDirection = newDirection;
    if (this.tilesToGrow <= 0) {
      this.doContract();
    } else {
      --this.tilesToGrow;
    }

    this.useEnergy(1);
  }

  /**
   * @param {Pos} pos new position to grow to
   * @return {boolean} true if body addition was allowed
   */
  addBodyPart(pos) {
    this.bodyParts.unshift(pos);
    const previous = this.world.setTileTo(pos, SnakeBody);

    if (previous !== Air) {
      let rollback = true;
      try {
        rollback = !this.onCollidedWith(previous);
      } catch (e) {
        rollback = e;
      }
      if (rollback) {
        this.bodyParts.shift();
        this.world.removeTileAt(pos, SnakeBody, previous);

        if (rollback !== true) {
          throw rollback;
        }

        return false;
      }
    }

    return true;
  }

  useEnergy(amount) {
    if (!this.isAlive) {
      throw new Error('Cannot use energy of dead snake');
    }

    this.energy -= amount;
    if (this.energy <= 0) {
      this.doContract();
      this.energy += 15;
    }
  }

  doContract() {
    if (!this.isAlive) {
      throw new Error('Cannot contract dead snake');
    }
    if (this.bodyParts.length === 0) {
      throw new Error('Snake doesn\'t have anything to contract');
    }

    this.world.removeTileAt(this.bodyParts.pop(), SnakeBody);
    if (this.bodyParts.length <= 2) {
      this.kill();
    }
  }

  kill() {
    this.isAlive = false;
  }

  /**
   * @param tile
   * @return {boolean} true if given tile can be replaced with snake
   */
  onCollidedWith(tile) {
    switch (tile.kind) {
      case ObjectKinds.Apple:
        this.onAppleEaten(tile);
        return true;
      case ObjectKinds.Snake:
      case ObjectKinds.Wall:
        this.kill();
        return false;
      default:
        throw new Error('Unknown tile kind');
    }
  }

  onAppleEaten() {
    this.energy = 15;
  }
}
