import { Game } from "..";
import { GameMode } from "../tennis";
import { PepeTennisScene } from "./pepeTennis";

export class MenuScene extends Phaser.Scene
{   
    private _selectedGameMode: GameMode = 1;
    private _mainCam: Phaser.Cameras.Scene2D.Camera;
    private _textModeOneP: Phaser.GameObjects.Text;
    private _textModeTwoP: Phaser.GameObjects.Text;
    
    public static CONFIG: Phaser.Types.Scenes.SettingsConfig = {
        key: "Menu"
    };

    keyUp: Phaser.Input.Keyboard.Key;
    keyDown: Phaser.Input.Keyboard.Key;
    keySpace: Phaser.Input.Keyboard.Key;

    public constructor(){
        super(MenuScene.CONFIG);
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
        this._mainCam = this.cameras.main;
        const viewPortHalfWidth = this._mainCam.width / 2;
        const viewPortHalfHeight = this._mainCam.height / 2;

        // Register scene event handlers
        this.input.keyboard.on('keydown-SPACE', (event: KeyboardEvent) =>
        {
            if(!event.repeat)
            {
                const data = {
                    gameMode: this._selectedGameMode
                };
                this.scene.start(PepeTennisScene.CONFIG.key, data);
            }
        });

        //this.add.image(0,0,"background").setOrigin(0,0);
        
        this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        const padding: Phaser.Types.GameObjects.Text.TextPadding = {
            x: 20,
            y: 20
        }

        const textTitle = this.add.text(0, 0, Game.GAME_NAME, {
            fontSize: '96px',
            fontFamily: 'Arial',
            color: '#ffffff',
            testString: 'abc',
            padding,
        }).setStroke('#111111', 6);
        textTitle.setPosition(viewPortHalfWidth - textTitle.width / 2, 30);

        this._textModeOneP = this.add.text(0, 0, 'One Player Mode', {
            fontSize: '52px',
            fontFamily: 'Arial',
            color: '#ffffff',
            testString: 'abc',
            backgroundColor: 'cornflowerblue',
            padding,
        }).setStroke('#111111', 6);
        this._textModeOneP.setPosition(viewPortHalfWidth - this._textModeOneP.width / 2, viewPortHalfHeight - this._textModeOneP.height / 2);

        this._textModeTwoP = this.add.text(100, 150, 'Two Player Mode', {
            fontSize: '52px',
            fontFamily: 'Arial',
            color: '#ffffff',
            testString: 'abc',
            padding
        }).setStroke('#111111', 6);
        this._textModeTwoP.setPosition(viewPortHalfWidth - this._textModeTwoP.width / 2, viewPortHalfHeight - this._textModeTwoP.height / 2 + 80);
    }

    public update(delta: number)
    {
        if(this.keyUp.isDown && this._selectedGameMode == 2)
        {
            // TODO Play toggle sound
            this._selectedGameMode = 1;
            this._textModeOneP.setBackgroundColor("cornflowerblue");
            this._textModeTwoP.setBackgroundColor("");
        }
        if(this.keyDown.isDown && this._selectedGameMode == 1)
        {
            // TODO Play toggle sound
            this._selectedGameMode = 2;
            this._textModeOneP.setBackgroundColor("");
            this._textModeTwoP.setBackgroundColor("cornflowerblue");
        }
    }
}