import { MenuScene } from "./menu";
import { PepeTennisScene } from "./pepeTennis";

export class GameOverScene extends Phaser.Scene
{    
    private _keySpace: Phaser.Input.Keyboard.Key;
    private _canvasHalfWidth: number;
    private _canvasHalfHeight: number;

    static readonly CREDITS_WIDTH = 800;
    static readonly CREDITS_HEIGHT = 600;

    public static CONFIG: Phaser.Types.Scenes.SettingsConfig = {
        key: "GameOver"
    };
    
    public constructor(){
        super(GameOverScene.CONFIG);
    }

    public init(_data: any)
    {
        // Restore initial class state
        this._canvasHalfHeight = this.sys.canvas.height / 2;
        this._canvasHalfWidth = this.sys.canvas.width / 2;
    }

    public create(_data: any)
    {
        this._keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.scene.pause(PepeTennisScene.CONFIG.key);
        const bubble = this.add.graphics({ x: this._canvasHalfWidth - GameOverScene.CREDITS_WIDTH / 2, y: this._canvasHalfHeight - GameOverScene.CREDITS_HEIGHT / 2 });
        bubble.fillStyle(0x222222, 0.5);
        bubble.fillRoundedRect(7, 7, GameOverScene.CREDITS_WIDTH, GameOverScene.CREDITS_HEIGHT);
        bubble.fillStyle(0xffffff, 0.8);
        bubble.lineStyle(2, 0x000000);
        bubble.fillRoundedRect(0, 0, GameOverScene.CREDITS_WIDTH, GameOverScene.CREDITS_HEIGHT);

        const credits = [
            this.add.text(0, 0, "GAME OVER", {
                fontSize: "28px",
                color: 'black'
            }),
            this.add.text(0, 0, "", {
                fontSize: "28px",
                color: 'black'
            }),
            this.add.text(0, 0, "--------", {
                fontSize: "28px",
                color: 'black'
            }),
            this.add.text(0, 0, "", {
                fontSize: "28px",
                color: 'black'
            }),
            this.add.text(0, 0, "Title music AI generated", {
                fontSize: "28px",
                color: 'black'
            }),
            this.add.text(0, 0, "by suno.com", {
                fontSize: "28px",
                color: 'black'
            }),
            this.add.text(0, 0, "Tongue animation by piepssoft.de", {
                fontSize: "28px",
                color: 'black'
            }),
            this.add.text(0, 0, "Pepe avatars by", {
                fontSize: "28px",
                color: 'black'
            }),
            this.add.text(0, 0, "www.deviantart.com/markosboss", {
                fontSize: "28px",
                color: 'black'
            }),
            this.add.text(0, 0, "www.deviantart.com/cerberus814", {
                fontSize: "28px",
                color: 'black'
            }),
        ];
        credits[0].setPosition(this._canvasHalfWidth - credits[0].width / 2, bubble.y + credits[0].height + 10);
        Phaser.Actions.AlignTo([...credits], Phaser.Display.Align.BOTTOM_CENTER);
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