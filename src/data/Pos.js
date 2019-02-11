
export default class Pos {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Returns new vector rotated into given direction
   *
   * @param {Pos} dir Direction to rotate, assuming this vector is up
   * @return {Pos} new vector
   */
  rotateBy(dir) {
    const dirLength = dir.length();
    if (dirLength === 0) {
      throw new Error('Rotation direction cannot be 0');
    }
    const normalizedX = dir.x / dirLength;
    const normalizedY = dir.y / dirLength;

    return new Pos(
        this.x * normalizedY + this.y * normalizedX,
        this.y * normalizedY + this.x * normalizedX,
    );
  }

  minus(other) {
    return new Pos(this.x - other.x, this.y - other.y);
  }

  areCloseEnough(to) {
    return to.minus(this).length() <= Pos.EPSILON;
  }

  length() {
    if (this.x === 0) {
      return Math.abs(this.y);
    }
    if (this.y === 0) {
      return Math.abs(this.x);
    }
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
}

Pos.EPSILON = 1E-6;
