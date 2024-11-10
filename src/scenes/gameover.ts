import { MenuScene } from "./menu";

export class GameOverScene extends Phaser.Scene
{    
    private keySpace: Phaser.Input.Keyboard.Key;

    public static CONFIG: Phaser.Types.Scenes.SettingsConfig = {
        key: "GameOver"
    };
    
    public constructor(){
        super(GameOverScene.CONFIG);
    }

    public init(data: any)
    {
        // Restore initial class state
    }

    public preload()
    {
        this.load.image('background', 'assets/gfx/backgrounds/homer.jpg');
    }

    public create(data: any)
    {
        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.add.image(0,0,"background").setOrigin(0,0);
    }

    public update(delta: number)
    {
        if(this.keySpace.isDown)
        {
            this.scene.start(MenuScene.CONFIG.key);
        }
    }
}