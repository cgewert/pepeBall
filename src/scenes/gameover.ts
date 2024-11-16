import { MenuScene } from "./menu";
import { PepeTennisScene } from "./pepeTennis";

export class GameOverScene extends Phaser.Scene
{    
    private keySpace: Phaser.Input.Keyboard.Key;

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
        this.load.image('background', 'assets/gfx/backgrounds/homer.jpg');
    }

    public create(_data: any)
    {
        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.add.image(0,0,"background").setOrigin(0,0);
        this.scene.sendToBack();
        this.scene.pause(PepeTennisScene.CONFIG.key);
    }

    public update(_delta: number)
    {
        if(this.keySpace.isDown)
        {
            this.scene.stop(PepeTennisScene.CONFIG.key);
            this.scene.start(MenuScene.CONFIG.key);
        }
    }
}