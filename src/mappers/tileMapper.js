import { ObjectKinds } from 'data/TileObject';

export default function tileMapper(mapping) {
  return (tile) => mapping[tile.kind];
}

export const emojiMapping = {
  [ObjectKinds.Air]: ' ',
  [ObjectKinds.Apple]: '🍏',
  [ObjectKinds.Wall]: '🧱',
  [ObjectKinds.Snake]: '🐍',
};
