export type GameMode = 1 | 2;
export type BallDirection = 1 | -1;
export type PhaserSound = Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.BaseSound;

export interface GameData {
    gameMode: GameMode
};

export interface PlayerAvatar{name: string, flip: boolean, scale: number, offsetX: number, offsetY: number};