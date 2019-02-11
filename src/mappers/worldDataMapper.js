export default function worldDataMapper(world, tileMapper) {
  return world.worldData.map(row => row.map(tile => tileMapper(tile)));
}

export function worldDataToJoinedRowMapper(world, tileMapper) {
  return worldDataMapper(world, tileMapper).map(row => row.join(''));
}