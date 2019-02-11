import { directionToName } from 'data/Directions';

export default function snakeMapper({ headDirection, isAlive, energy, bodyParts }) {
  return {
    headDirection: directionToName(headDirection),
    isAlive,
    energy,
    bodyParts,
  };
}