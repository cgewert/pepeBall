import { Ball } from "../gameObjects/ball";
import { Bat } from "../gameObjects/bat";
import { ScoreCounter } from "../score";
import { BallDirection, GameData, PhaserSound, PlayerAvatar } from "../tennis";
import { GameOverScene } from "./gameover";
import { GUI } from "dat.gui";
import { PauseScene } from "./pause";

export class PepeTennisScene extends Phaser.Scene
{    
    private static readonly WIN_COUNTER = 1;
    private static readonly SCORING_GLOW_FACTOR = 8;
    private static readonly DEFAULT_SFX_VOLUME = 0.3;

    private _gameOver = false;
    private _ball: Ball;
    private _main: Phaser.Cameras.Scene2D.Camera;
    private _viewPortHalfWidth: number;
    private _viewPortHalfHeight: number;
    private _viewPortWidth: number;
    private _viewPortHeight: number;
    private _players: Array<Bat> = new Array<Bat>();
    private _bounceSprites: Array<Phaser.GameObjects.Sprite> = new Array<Phaser.GameObjects.Sprite>();
    private _p1Down: Phaser.Input.Keyboard.Key;
    private _p2Down: Phaser.Input.Keyboard.Key;
    private _p1Up: Phaser.Input.Keyboard.Key;
    private _p2Up: Phaser.Input.Keyboard.Key;
    private _debug: boolean = false;
    private _datGUI: GUI;
    private _ballFolder: GUI;
    private _playerFolder: GUI;
    private _playerOne: Bat;
    private _playerOneAvatar: Phaser.GameObjects.Sprite;
    private _playerTwoAvatar: Phaser.GameObjects.Sprite;
    private _tongueOne: Phaser.GameObjects.Sprite;
    private _tongueTwo: Phaser.GameObjects.Sprite;
    private _playerTwo: Bat;
    private _playerOneScore: ScoreCounter;
    private _playerTwoScore: ScoreCounter;
    private _aiOldMoveDirection: boolean;
    private _soundBatCollision: PhaserSound;
    private _soundScoring: PhaserSound;
    private _light: Phaser.GameObjects.Light;
    private _ballEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private _playerOneAvatars: Array<PlayerAvatar> = [
        {name: "asteriks", flip: false, scale: 0.3, offsetX: -10, offsetY: 20},
        {name: "kajit", flip: false, scale: 0.35, offsetX: -15, offsetY: 25},
        {name: "ezio", flip: false, scale: 0.5, offsetX: -10, offsetY: 20},
    ];
    private _playerTwoAvatars: Array<PlayerAvatar> = [
        {name: "pepeman", flip: true, scale: 0.3, offsetX: 0, offsetY: 35},
        {name: "cat", flip: false, scale: 0.3, offsetX: 0, offsetY: 0},
        {name: "riddler", flip: false, scale: 0.35, offsetX: 15, offsetY: 0},
    ];
    private _p1ScoreFX: Phaser.FX.Glow;
    private _p2ScoreFX: Phaser.FX.Glow;
    private _p1ScoreTween: Phaser.Tweens.Tween;
    private _p2ScoreTween: Phaser.Tweens.Tween;

    public get GameOver()
    {
        return this._gameOver;
    }

    public set GameOver(value: boolean)
    {
        this._gameOver = value;
    }

    public static CONFIG: Phaser.Types.Scenes.SettingsConfig = {
        key: "PepeTennis"
    };

    public constructor(){
        super(PepeTennisScene.CONFIG);
    }

    public init(data: any)
    {
        // Restore initial class state
        this._players = new Array<Bat>();
        this._bounceSprites = new Array<Phaser.GameObjects.Sprite>();
    }

    public preload()
    {
        this.load.image('orb', 'assets/gfx/orb.png');
        this.load.image('ball', 'assets/gfx/ball.png');

        // Load player avatars
        this.load.image('pepeman', 'assets/gfx/avatars/pepe-man.png');
        this.load.image('cat', 'assets/gfx/avatars/catpepe.png');
        this.load.image('riddler', 'assets/gfx/avatars/riddler.png');

        this.load.image('asteriks', 'assets/gfx/avatars/asterix-pepe.png');
        this.load.image('kajit', 'assets/gfx/avatars/khajit-pepe.png');
        this.load.image('ezio', 'assets/gfx/avatars/ezio-pepe.png');

        this.load.image('grass', ['assets/gfx/grass.png', 'assets/gfx/grass_n.png']);
        this.load.image('p1', 'assets/gfx/avatars/bat2.png');

        this.load.spritesheet('tongue', 'assets/gfx/animations/tongue.png', { frameWidth: 356, frameHeight: 413 });
        this.load.spritesheet('bounce', 'assets/gfx/animations/bounce.png', { frameWidth: 64, frameHeight: 64 });

        this.load.audio("quak1", "assets/audio/sfx/quak1.mp3");
        this.load.audio("scoring", "assets/audio/sfx/scoring.ogg");
    }

    public create(data: GameData)
    {
        // Create sprite animations
        this.anims.create({
            key: 'lickdown',
            frames: this.anims.generateFrameNumbers('tongue', { start: 5, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'lickup',
            frames: this.anims.generateFrameNumbers('tongue', { start: 2, end: 0 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'ballBounce',
            frames: this.anims.generateFrameNumbers('bounce', { start: 0, end: 4 }),
            frameRate: 8,
            repeat: 0
        });

        // In every case create viewport dimensions first
        this._main = this.cameras.main;
        this._viewPortHalfHeight = this._main.height / 2;
        this._viewPortHalfWidth = this._main.width / 2;
        this._viewPortHeight = this._main.height;
        this._viewPortWidth = this._main.width;

        // Register event handlers
        this.input.keyboard.on('keydown-PAUSE', (_event: KeyboardEvent) =>
        {
            if(!this.game.isPaused && !_event.repeat)
            {
                this.scene.launch(PauseScene.CONFIG.key);
            }
        });

        this.lights.enable();
        this.lights.setAmbientColor(0xFFFFFF);

        // Create ingame HUD
        this._playerOneScore = new ScoreCounter(this, 0,0);
        this._playerTwoScore = new ScoreCounter(this, this._main.width - 100,0);
        Phaser.Actions.GridAlign([this._playerOneScore, this._playerTwoScore], {
            width: 2,
            height: 1,
            cellWidth: this._viewPortHalfWidth,
            cellHeight: this._viewPortHalfHeight,
            x: 0,
            y: 0,
            position: Phaser.Display.Align.CENTER
        });
        
        // Add a custom sized sprite gameobject using grass texture as canvas background
        this.add.tileSprite(0, 0, this._viewPortWidth, this._viewPortHeight, 'grass').setPipeline("Light2D").setOrigin(0,0);
        this._ballEmitter = this.add.particles(0, 0, 'orb', {
            speed: 40,
            lifespan: 300,
            frequency: 15,
            quantity: 3,
            scale: { start: 0.3, end: 0 },
            emitting: false
        });
        this.addBall(1);

        this._p1Down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Y);
        this._p1Up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this._p2Down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this._p2Up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);

        if(data.gameMode == 1)
        {
            // 1 Human player and 1 AI player
            this._players.push(new Bat(this, 0, 0, "p1", this._p1Down, this._p1Up));
            this._players.push(new Bat(this, 0,0,"p1", null, null));
        } 
        else 
        {
            // 2 Human players
            this._players.push(new Bat(this, 0, 0, "p1", this._p1Down, this._p1Up));
            this._players.push(new Bat(this, 0,0,"p1", this._p2Down, this._p2Up));
        }

        this._players[0].y = this._viewPortHalfHeight;
        this._players[0].x = 120 + this._players[0].Width / 2;
        this._players[1].y = this._viewPortHalfHeight;
        this._players[1].x = this._main.width - this._players[1].Width / 2 - 120;
        this._playerOne = this._players[0];
        this._playerTwo = this._players[1];
        this._playerTwo.setFlipX(true)
        this._playerOne.setDataEnabled();
        this._playerTwo.setDataEnabled();
        const p1Avatar = this._playerOneAvatars[Phaser.Math.Between(0,this._playerOneAvatars.length - 1)]; const p2Avatar = this._playerTwoAvatars[Phaser.Math.Between(0,this._playerTwoAvatars.length - 1)];
        this._playerOneAvatar = this.add.sprite(0, 0, p1Avatar.name).setScale(p1Avatar.scale).setFlipX(p1Avatar.flip);
        this._playerTwoAvatar = this.add.sprite(0, 0, p2Avatar.name).setFlipX(p2Avatar.flip).setScale(p2Avatar.scale);
        this._playerOneAvatar.setPosition(this._playerOneAvatar.displayWidth / 2, this._viewPortHalfHeight - this._playerOneAvatar.displayHeight / 2);
        this._playerTwoAvatar.setPosition(this._viewPortWidth - this._playerTwoAvatar.displayWidth / 2, this._viewPortHalfHeight - this._playerTwoAvatar.displayHeight / 2);
        this._playerOne.setPipeline("Light2D");
        this._playerTwo.setPipeline("Light2D");
        this._tongueOne = this.add.sprite(0, 0, 'tongue', 0);
        this._tongueTwo = this.add.sprite(0, 0, 'tongue', 0).setFlipX(true);
        this._tongueOne.play('lick');
        this._tongueOne.setScale(0.25);
        this._tongueTwo.play('lick');
        this._tongueTwo.setScale(0.25);
        this.setTonguePosition(this._tongueOne, this._playerOneAvatar, p1Avatar);
        this.setTonguePosition(this._tongueTwo, this._playerTwoAvatar, p2Avatar);

         // FX effects for both players
         this._p1ScoreFX = this._playerOneAvatar.postFX.addGlow(0x00ffff, 0, 0);
         this._p2ScoreFX = this._playerTwoAvatar.postFX.addGlow(0x00ff00, 0, 0);

         this._p1ScoreTween = this.tweens.add({
            targets: this._p1ScoreFX,
            outerStrength: PepeTennisScene.SCORING_GLOW_FACTOR,
            yoyo: true,
            duration: 200,
            paused: true,
            onComplete: () => {
                this._p1ScoreTween.restart();
                this._p1ScoreTween.pause();
            }
        });
        this._p2ScoreTween = this.tweens.add({
            targets: this._p2ScoreFX,
            outerStrength: PepeTennisScene.SCORING_GLOW_FACTOR,
            yoyo: true,
            duration: 200,
            paused: true,
            onComplete: () => {
                this._p2ScoreTween.restart();
                this._p2ScoreTween.pause();
            }
        });

        this.createDebugUI();

        this._soundBatCollision = this.sound.add("quak1").setVolume(PepeTennisScene.DEFAULT_SFX_VOLUME);
        this._soundScoring = this.sound.add("scoring").setVolume(PepeTennisScene.DEFAULT_SFX_VOLUME);
    }

    private setTonguePosition(tongue: Phaser.GameObjects.Sprite, avatar: Phaser.GameObjects.Sprite, avatarData: PlayerAvatar)
    {
        const tongueWidth = avatar.x < this._viewPortHalfWidth ? tongue.displayWidth : -tongue.displayWidth;

        tongue.setPosition(avatar.x + tongueWidth / 2 + avatarData.offsetX, avatar.y + avatarData.offsetY);
    }

    public update(delta: number)
    {
        this._bounceSprites.forEach((s: Phaser.GameObjects.Sprite) => {
            if(s.anims.getProgress() == 1.0)
            {
                s.destroy();
                s.setActive(false);
            }
        });
        
        this._bounceSprites = this._bounceSprites.filter((s: Phaser.GameObjects.Sprite) => 
            s.active == true
        );

        if(this.GameOver)
            this.scene.start(GameOverScene.CONFIG.key);

        this._ball?.update(delta);
        this._players.map(x => {
            // Inject x coord of ball into bats
            if(this._ball)
            {
                x.setData(Bat.DATA_KEY_BALL_X, this._ball.x);
                x.setData(Bat.DATA_KEY_BALL_Y, this._ball.y);
            }
            x.update(delta)
            if(x.IsAIControlled && x.AiYDirection != this._aiOldMoveDirection)
            {
                if(x.AiYDirection){
                    this._tongueTwo.play('lickdown');
                } else {
                    this._tongueTwo.play('lickup');
                }

                this._aiOldMoveDirection = x.AiYDirection;
            }
        });

        // Update tongue animations
        if(Phaser.Input.Keyboard.JustDown(this._p1Down)){
            this._tongueOne.play('lickdown');
        }
        else if(Phaser.Input.Keyboard.JustDown(this._p1Up)){
            this._tongueOne.play('lickup');
        }
        else if(this._p1Up.isUp && this._p1Down.isUp){
            this._tongueOne.stop();
        }

        // Dont play animation on player 2 input keys, when AI player is active
        if(!this._playerTwo.IsAIControlled){
            if(Phaser.Input.Keyboard.JustDown(this._p2Down)){
                this._tongueTwo.play('lickdown');
            }
            else if(Phaser.Input.Keyboard.JustDown(this._p2Up)){
                this._tongueTwo.play('lickup');
            }
            else if(this._p2Up.isUp && this._p2Down.isUp){
                this._tongueTwo.stop();
            }
        }
        
        // Move the ball
        for(let i=0; i < this._ball?.BallVelocity; i++)
        {
            this._ball.x += this._ball.Direction * this._ball.MotionVector.x;
            this._ball.y += this._ball.MotionVector.y;

            this.checkWallCollision();
            
            if(this.checkPlayerCollision())
            {
                this._ball.Direction = this._ball.Direction * -1 as BallDirection;
                this._ball.BallVelocity += this._ball.BallVelocityIncrease;
                this._soundBatCollision.play();
            }

            this.checkScoring();
            if(this._ball == null)
                break;
        }
        if(this._ball)
        {
            this._light.setPosition(this._ball.x, this._ball.y);
            this._ballEmitter.emitParticleAt(this._ball.x, this._ball.y);
            this._ball.rotation += this._ball.Direction / 10;
            if(this._ball.rotation >= 2 * Math.PI){
                this._ball.rotation = 0;
            }
            if(this._ball.rotation <= -2 * Math.PI){
                this._ball.rotation = 0;
            }

        }
            
    }

    private checkWallCollision()
    {
        const topCollision = () => this._ball.y <= this._ball.Height / 2;
        const bottomCollision = () => this._ball.y >= (this._main.height - (this._ball.Height / 2));

        if(topCollision() || bottomCollision())
        {
            this._ball.MotionVector.y *= -1;
            if(!this._soundBatCollision.isPlaying)
                this._soundBatCollision.play();
            // Create a bounce animation where the ball hit
            this._bounceSprites.push(this.add.sprite(this._ball.x, this._ball.y, "bounce", 0).play("ballBounce"));
        }
        
    }

    private checkPlayerCollision(): boolean
    {
        const p1Collision = () => 
            this._ball.x - this._ball.Width / 2 <= this._playerOne.x + this._playerOne.Width / 2
        &&  this._ball.x + this._ball.Width / 2 >= this._playerOne.x - this._playerOne.Width / 2 
        && (this._ball.y <= this._playerOne.y + this._playerOne.Height / 2) 
        && (this._ball.y >= this._playerOne.y - this._playerOne.Height / 2)
        && this._ball.Direction == -1;

        const p2Collision = () => 
            this._ball.x + this._ball.Width / 2 >= this._playerTwo.x - this._playerTwo.Width / 2 
        && this._ball.x - this._ball.Width / 2 <= this._playerTwo.x + this._playerTwo.Width / 2
        && (this._ball.y <= this._playerTwo.y + this._playerTwo.Height / 2) 
        && (this._ball.y >= this._playerTwo.y - this._playerTwo.Height / 2) 
        && this._ball.Direction == 1;

        let newMotionVector: Phaser.Math.Vector2;
        const CalculateNewMotionVector = (player: Bat) => {
            // Deflect slightly up or down depending on where ball hit bat
            const differenceY = this._ball.y - player.y;
            
            newMotionVector = this._ball.MotionVector;
            newMotionVector.y += differenceY / player.Height;
            
            // Limit the Y component of the vector so we don't get into a situation where the ball is bouncing
            // up and down too rapidly
            newMotionVector.y = Math.min(Math.max(newMotionVector.y, -1), 1);

            // Ensure our direction vector is a unit vector, i.e. represents a distance of the equivalent of
            // 1 pixel regardless of its angle
            const unitVec = newMotionVector.normalize();
            return unitVec;
        };

        let collidedPlayer: Bat = null;
        
        if(p1Collision())
        {
            collidedPlayer = this._playerOne;
        }

        if(p2Collision())
        {
            collidedPlayer = this._playerTwo;
        }

        if(collidedPlayer != null)
        {
            // Play bounce animation where the ball hit the player
            this._bounceSprites.push(this.add.sprite(this._ball.x, this._ball.y, "bounce").play("ballBounce"));
            newMotionVector = CalculateNewMotionVector(this._playerOne);
            this._ball.MotionVector = newMotionVector;
            this._soundBatCollision.play();
            return true;
        }

        // No player collision
        return false;
    }

    private checkScoring()
    {
        let newDirection = 1 as BallDirection;
        let hasScored = false;
        
        if(this._ball.x >= this._viewPortWidth - this._ball.displayWidth / 2)
        {
            hasScored = true;
            this._playerOneScore.Score++;
            if(!this._p1ScoreTween.isPlaying())
            {
                this._p1ScoreTween.restart();
                this._p1ScoreTween.play();
            }
            this._playerOneScore.activateScoreAnimation();
            newDirection = -1;
        }
        else if(this._ball.x <= this._ball.displayWidth / 2)
        {
            hasScored = true;
            this._playerTwoScore.Score++;
            if(!this._p2ScoreTween.isPlaying())
            {
                this._p2ScoreTween.restart();
                this._p2ScoreTween.play();
            }
            this._playerTwoScore.activateScoreAnimation();
            newDirection = 1;
        }

        if(hasScored)
        {
            if(!this._soundScoring.isPlaying)
                this._soundScoring.play();
            this.removeBall();

            if(this._playerOneScore.Score >= PepeTennisScene.WIN_COUNTER || this._playerTwoScore.Score >= PepeTennisScene.WIN_COUNTER)
            {
                this.scene.launch(GameOverScene.CONFIG.key);
            } 
            else
            {
                this.addBall(newDirection);
            }
        }
    }

    private addBall(direction: BallDirection)
    {
        const motionVector = new Phaser.Math.Vector2(1,0).normalize();
        this._ball = new Ball(this, 0, 0, "ball", new Phaser.Math.Vector2(this._main.width, this._main.height), motionVector);
        this._ball.x = this._viewPortHalfWidth - this._ball.Width / 2;
        this._ball.y = this._viewPortHalfHeight - this._ball.Height / 2;
        this._ball.Direction = direction;
        this._ballEmitter.setActive(true);
        this._ballEmitter.setVisible(true);
        this._light = this.lights.addLight(0, 0, 200).setIntensity(1.75);

        this.createDebugUI();
    }

    private removeBall()
    {
        if(this._debug)
            this._datGUI.removeFolder(this._ballFolder);
        this._ballFolder = null;

        if(this._ball)
        {
            this._ball.destroy();
            this._ball = null;
            // Also destroy ball lighting and stop particle emmiter
            this.lights.removeLight(this._light);
            this._light = null;
            this._ballEmitter.setActive(false);
            this._ballEmitter.setVisible(false);
        }
    }

    private createDebugUI()
    {
        if(this._debug)
        {
            if(this._datGUI)
            {
                if(this._ballFolder)
                    this._datGUI.removeFolder(this._ballFolder);
                if(this._playerFolder)
                    this._datGUI.removeFolder(this._playerFolder);
                this._datGUI.destroy();
            }

            this._datGUI = new GUI({name: "DebugGUI"});
            if(this._ball)
            {
                this._ballFolder = this._datGUI.addFolder("BALL");
                //this._ballFolder.open();
                this._ballFolder.add(this._ball, "scale", 0, 25, 0.00001);
                this._ballFolder.add(this._ball, "BallVelocity", -100, 100, 0.01);
                this._ballFolder.add(this._ball, "BallVelocityIncrease", -10, 10, 0.01);
                if(this._light)
                {
                    this._ballFolder.add(this._light, "intensity", 0, 50, 0.01);
                }
            }

            if(this._playerOne && this._playerTwo)
            {
                this._playerFolder = this._datGUI.addFolder("PLAYERS");
                this._playerFolder.add(this._playerOne, "x", 0, this._main.width).name("P1 X");
                this._playerFolder.add(this._playerOne, "PlayerVelocity", 0, 100).name("P1 Velocity");
                this._playerFolder.add(this._playerTwo, "x", 0, this._main.width).name("P2 X");
                this._playerFolder.add(this._playerOne, "PlayerVelocity", 0, 100).name("P2 Velocity");
                //this._playerFolder.open();
            }
            
            this._datGUI.show();
        }
    }
}