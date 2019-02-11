import * as WorldRouter from './WorldRouter';
import * as GameRouter from './GameRouter';

export default [
    ...Object.values(WorldRouter),
    ...Object.values(GameRouter),
];