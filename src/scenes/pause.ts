import { BaseScene } from "../base";

export class PauseScene extends BaseScene
{
    public static CONFIG: Phaser.Types.Scenes.SettingsConfig = {
        key: "PauseScene"
    };

    private _pausedText: Phaser.GameObjects.Text;
    
    public constructor()
    {
        super(PauseScene.CONFIG);
    }

    public init(data: any)
    {
        // Restore initial class state
    }

    public preload()
    {
    }

    public create(data: any)
    {
        this._main = this.cameras.main;
        this._viewPortHalfHeight = this._main.height / 2;
        this._viewPortHalfWidth = this._main.width / 2;
        this._viewPortHeight = this._main.height;
        this._viewPortWidth = this._main.width;

        this._pausedText = this.add.text(this._viewPortHalfWidth, 100, "PAUSED", {
            fontSize: "36px",
            color: 'black'
        });
        // Center pause text on x-Axis
        this._pausedText.x = this._viewPortHalfWidth - this._pausedText.displayWidth / 2;

        // Register evend handlers
        this.input.keyboard.on('keydown-PAUSE', (_event: KeyboardEvent) =>
        {
            if(this.game.isPaused && !_event.repeat)
            {
                this.game.resume();
                this.scene.stop();
            }
        });

        this.game.pause();
    }
}