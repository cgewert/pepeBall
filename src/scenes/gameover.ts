import { MenuScene } from "./menu";
import { PepeTennisScene } from "./pepeTennis";

export class GameOverScene extends Phaser.Scene
{    
    private _keySpace: Phaser.Input.Keyboard.Key;
    private _textGameOver: Phaser.GameObjects.Text;

    public static CONFIG: Phaser.Types.Scenes.SettingsConfig = {
        key: "GameOver"
    };
    
    public constructor(){
        super(GameOverScene.CONFIG);
    }

    public init(_data: any)
    {
        // Restore initial class state
    }

    public preload()
    {
    }

    public create(_data: any)
    {
        this._keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.scene.pause(PepeTennisScene.CONFIG.key);
        const bubble = this.add.graphics({ x: this.sys.canvas.width / 2, y: this.sys.canvas.height / 2 - 50 });
        bubble.fillStyle(0x222222, 0.5);
        bubble.fillRoundedRect(7, 7, 200, 100);
        bubble.fillStyle(0xffffff, 0.8);
        bubble.lineStyle(2, 0x000000);
        bubble.fillRoundedRect(0, 0, 200, 100);

        this._textGameOver = this.add.text(this.sys.canvas.width / 2, 100, "GAME OVER", {
            fontSize: "36px",
            color: 'black'
        });

        this._textGameOver.x = bubble.x + 100 - this._textGameOver.displayWidth / 2;
        this._textGameOver.y = bubble.y + 50 - this._textGameOver.displayHeight / 2;
    }

    public update(_delta: number)
    {
        if(this._keySpace.isDown)
        {
            this.scene.stop(PepeTennisScene.CONFIG.key);
            this.scene.start(MenuScene.CONFIG.key);
        }
    }
}