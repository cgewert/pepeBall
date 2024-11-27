export type GameMode = 1 | 2;
export type BallDirection = 1 | -1;

export interface GameData {
    gameMode: GameMode
};

export interface PlayerAvatar{name: string, flip: boolean, scale: number, offsetX: number, offsetY: number};