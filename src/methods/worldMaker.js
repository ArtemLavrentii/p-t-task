import World from 'data/World';

export default function worldMaker(id) {
  try {
    return new World(World.getOptionsFromID(id));
  } catch (e) {
    console.debug('Error while generating world', e);
    throw e;
  }
}