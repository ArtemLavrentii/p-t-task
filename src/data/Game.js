import Snake from 'data/Snake';
import EventEmitter from 'events';

export default class Game extends EventEmitter {
  constructor(world) {
    super();
    this.timerID = -1;
    this.gameEnded = false;
    this.world = world.makeCopy();
    this.onTimer = () => this.endGame();
  }

  createSnake() {
    if (this.snake) {
      throw new Error('Snake was already created');
    }
    this.snake = new Snake(this.world, this.world.generateEmptyRandomPos());
    return this.snake;
  }

  startGame() {
    if (!this.snake) {
      throw new Error('Snake is required to start a game');
    }
    if (this.gameEnded || this.timerID !== -1) {
      throw new Error('Game is already in progress');
    }
    this.updateTimer();
  }

  doMove(inDirection) {
    if (this.gameEnded) {
      throw new Error('Cannot move in finished game');
    }
    this.snake.doMove(inDirection);

    if (!this.snake.isAlive) {
      this.endGame();
      return;
    }

    this.updateTimer();
  }

  updateTimer() {
    if (this.timerID !== -1) {
      clearTimeout(this.timerID);
    }
    // Snake should die after 3 minutes of no response from client
    this.timerID = setTimeout(this.onTimer, 3 * 60 * 1000);
  }

  endGame() {
    this.snake.kill();
    this.gameEnded = true;
    clearTimeout(this.timerID);
    this.emit('gameOver');
  }

}
