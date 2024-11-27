import { Game } from "..";
import { GameData, GameMode } from "../tennis";
import { PepeTennisScene } from "./pepeTennis";

export class MenuScene extends Phaser.Scene
{   
    private static readonly SELECTION_COLOR = 'rgba(33, 33, 33, 0.7)';
    private static readonly TEXT_AUTHOR = "https://dextercoding.itch.io/";
    private static readonly DEFAULT_MUSIC_VOL = 0.02;

    private _selectedGameMode: GameMode = 1;
    private _mainCam: Phaser.Cameras.Scene2D.Camera;
    private _textModeOneP: Phaser.GameObjects.Text;
    private _textModeTwoP: Phaser.GameObjects.Text;
    private _soundMenuToggle: Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound;
    private _soundGameStart: Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound;
    private _backgroundImage: Phaser.GameObjects.Image;
    
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
        this.load.image('background', 'assets/gfx/backgrounds/menu.png');
        this.load.audio("frogs-title", "assets/audio/music/frogs-title.mp3");
        this.load.audio("menu", "assets/audio/music/menu.mp3");
        this.load.audio("menuToggle", "assets/audio/sfx/menuToggle.ogg");
        this.load.audio("gameStart", "assets/audio/sfx/gameStart.ogg");
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
                const data: GameData = {
                    gameMode: this._selectedGameMode
                };

                this._soundGameStart.play();
                this.sound.stopByKey("menu");
                this.scene.start(PepeTennisScene.CONFIG.key, data);
            }
        });

        this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Add background image
        this._backgroundImage = this.add.image(0,0,"background").setOrigin(0,0);

        this.sound.add("menu", {
             volume: MenuScene.DEFAULT_MUSIC_VOL,
             loop: true
        }).play();
        this._soundMenuToggle = this.sound.add("menuToggle", {volume: 0.3});
        this._soundGameStart = this.sound.add("gameStart", {volume: 0.3});

        const padding: Phaser.Types.GameObjects.Text.TextPadding = {
            x: 20,
            y: 20
        }

        const textTitle = this.add.text(0, 0, Game.GAME_NAME, {
            fontSize: '128px',
            fontFamily: 'Arial',
            color: '#ffffff',
            testString: 'abc',
            padding,
        }).setStroke('#111111', 6);
        textTitle.setPosition(viewPortHalfWidth - textTitle.width / 2, 120);
        textTitle.setAngle(-5);
        textTitle.setScale(0.8);
        textTitle.postFX.addShadow(0.5, 0.5, 0.1, 0.8);
        this.tweens.add({
            targets: textTitle,
            scale: 1.02,
            ease: 'sine.inout',
            duration: 3000,
            repeat: -1,
            yoyo: true
        });


        this._textModeOneP = this.add.text(0, 0, 'One Player Mode', {
            fontSize: '52px',
            fontFamily: 'Arial',
            color: '#ffffff',
            testString: 'abc',
            backgroundColor: MenuScene.SELECTION_COLOR,
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

        const textAuthor = this.add.text(0,0,MenuScene.TEXT_AUTHOR, {
            fontSize: '26px',
            fontFamily: 'Arial',
            color: '#ffffff',
            testString: 'abc',
            padding,
            backgroundColor: MenuScene.SELECTION_COLOR
        });
        Phaser.Actions.AlignTo([textAuthor], Phaser.Display.Align.BOTTOM_LEFT);
        Phaser.Display.Align.In.BottomLeft(textAuthor, this._backgroundImage);
    }

    public update(delta: number)
    {
        if(this.keyUp.isDown && this._selectedGameMode == 2)
        {
            this._soundMenuToggle.play();
            this._selectedGameMode = 1;
            this._textModeOneP.setBackgroundColor(MenuScene.SELECTION_COLOR);
            this._textModeTwoP.setBackgroundColor("");
        }
        if(this.keyDown.isDown && this._selectedGameMode == 1)
        {
            this._soundMenuToggle.play();
            this._selectedGameMode = 2;
            this._textModeOneP.setBackgroundColor("");
            this._textModeTwoP.setBackgroundColor(MenuScene.SELECTION_COLOR);
        }
    }
}