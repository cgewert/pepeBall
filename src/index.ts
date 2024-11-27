import * as PHASER from 'phaser';
import { MenuScene } from './scenes/menu';
import { PepeTennisScene } from './scenes/pepeTennis';
import { GameOverScene } from './scenes/gameover';
import { PauseScene } from './scenes/pause';

const scene = [
  MenuScene,
  PepeTennisScene,
  GameOverScene,
  PauseScene
];

export class Game extends PHASER.Game {
  public static readonly MAX_AI_SPEED = 6;
  public static readonly PLAYER_SPEED = 6;
  public static readonly WIN_SCORE = 10;
  public static readonly NUM_PLAYER_PARAM = "numPlayers";
  public static readonly MENU_MUSIC_PARAM = "menuMusic";
  public static readonly GAME_NAME = "PepeBall";

  private static GAME_CONFIG: Phaser.Types.Core.GameConfig = {
    title: 'BOING!',
    type: PHASER.AUTO,
    width: 1600,
    height: 900,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
      default: 'arcade',
      arcade: {
          gravity: { y: 0, x: 0 }
      }
    },
    backgroundColor: '#00ff00',
    scene,
    audio: {
      disableWebAudio: false,
      
    }
  }

  constructor(){
    super(Game.GAME_CONFIG);
  }
}

const game = new Game();