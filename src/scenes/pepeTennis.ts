import { Ball } from "../gameObjects/ball";
import { Bat } from "../gameObjects/bat";
import { ScoreCounter } from "../score";
import { BallDirection, GameData } from "../tennis";
import { GameOverScene } from "./gameover";
import { GUI } from "dat.gui";
import { PauseScene } from "./pause";

export class PepeTennisScene extends Phaser.Scene
{    
    private static readonly WIN_COUNTER = 1;

    private _gameOver = false;
    private _ball: Ball;
    private _main: Phaser.Cameras.Scene2D.Camera;
    private _viewPortHalfWidth: number;
    private _viewPortHalfHeight: number;
    private _players: Array<Bat> = new Array<Bat>();
    private _p1Down: Phaser.Input.Keyboard.Key;
    private _p2Down: Phaser.Input.Keyboard.Key;
    private _p1Up: Phaser.Input.Keyboard.Key;
    private _p2Up: Phaser.Input.Keyboard.Key;
    private _debug: boolean = true;
    private _datGUI: GUI;
    private _ballFolder: GUI;
    private _playerFolder: GUI;
    private _playerOne: Bat;
    private _playerTwo: Bat;
    private _playerOneScore: ScoreCounter;
    private _playerTwoScore: ScoreCounter;
    private _soundBatCollision: Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.BaseSound;

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
    }

    public preload()
    {
        this.load.image('ball', 'assets/gfx/ball.png');
        this.load.image('p1', 'assets/gfx/avatars/hang-man-avatar.png');

        this.load.audio("quak1", "assets/audio/quak1.mp3");
    }

    public create(data: GameData)
    {
        // In every case create viewport dimensions first
        this._main = this.cameras.main;
        this._viewPortHalfHeight = this._main.height / 2;
        this._viewPortHalfWidth = this._main.width / 2;

        // Register event handlers
        this.input.keyboard.on('keydown-PAUSE', (_event: KeyboardEvent) =>
        {
            if(!this.game.isPaused && !_event.repeat)
            {
                this.scene.launch(PauseScene.CONFIG.key);
            }
        });

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
        
        //this.add.image(0,0,"background").setOrigin(0,0);
        this.addBall(1);

        this._p1Down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Y);
        this._p1Up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this._p2Down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this._p2Up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);

        if(data.gameMode == 1)
        {
            // 1 Human player and 1 AI player
            this._players.push(new Bat(this, 0, 0, "p1", new Phaser.Math.Vector2(this._main.width, this._main.height), this._p1Down, this._p1Up));
            this._players.push(new Bat(this, 0,0,"p1", new Phaser.Math.Vector2(this._main.width, this._main.height), null, null));
        } 
        else 
        {
            // 2 Human players
            this._players.push(new Bat(this, 0, 0, "p1", new Phaser.Math.Vector2(this._main.width, this._main.height), this._p1Down, this._p1Up));
            this._players.push(new Bat(this, 0,0,"p1", new Phaser.Math.Vector2(this._main.width, this._main.height), this._p2Down, this._p2Up));
        }

        this._players[0].y = this._viewPortHalfHeight;
        this._players[0].x = this._players[0].Width / 2;
        this._players[1].y = this._viewPortHalfHeight;
        this._players[1].x = this._main.width - this._players[1].Width / 2;
        this._playerOne = this._players[0];
        this._playerTwo = this._players[1];
        this._playerTwo.setFlipX(true)
        this._playerOne.setDataEnabled();
        this._playerTwo.setDataEnabled();
        
        this.createDebugUI();

        this._soundBatCollision = this.sound.add("quak1").setVolume(0.3);
    }

    public update(delta: number)
    {
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
        });
        
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
    }

    private checkWallCollision()
    {
        const topCollision = () => this._ball.y <= this._ball.Height / 2;
        const bottomCollision = () => this._ball.y >= (this._main.height - (this._ball.Height / 2));

        if(topCollision() || bottomCollision())
        {
            this._ball.MotionVector.y *= -1;
        }
        
    }

    private checkPlayerCollision(): boolean
    {
        const p1Collision = () => this._ball.x - this._ball.Width / 2 <= this._playerOne.x + this._playerOne.Width / 2 && (this._ball.y <= this._playerOne.y + this._playerOne.Height / 2) && (this._ball.y >= this._playerOne.y - this._playerOne.Height / 2) && this._ball.Direction == -1;
        const p2Collision = () => this._ball.x + this._ball.Width / 2 >= this._playerTwo.x - this._playerTwo.Width / 2 && (this._ball.y <= this._playerTwo.y + this._playerTwo.Height / 2) && (this._ball.y >= this._playerTwo.y - this._playerTwo.Height / 2) && this._ball.Direction == 1;
        let newMotionVector: Phaser.Math.Vector2;
        const CalculateNewMotionVector = (player: Bat) => {
            // Deflect slightly up or down depending on where ball hit bat
            const differenceY = (player.y - this._ball.y) * -1;
            
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

        if(p1Collision())
            newMotionVector = CalculateNewMotionVector(this._playerOne);
        if(p2Collision())
            newMotionVector = CalculateNewMotionVector(this._playerTwo);

        const hasCollidedPlayer = p1Collision() || p2Collision();
        if(hasCollidedPlayer)
            this._ball.MotionVector = newMotionVector;

        return hasCollidedPlayer;
    }

    private checkScoring()
    {
        let newDirection = 1 as BallDirection;
        let hasScored = false;
        
        if(this._ball.x >= this._playerTwo.x && (this._ball.y > this._playerTwo.y + this._playerTwo.Height / 2 || this._ball.y < this._playerTwo.y - this._playerTwo.Height / 2 ))
        {
            hasScored = true;
            this._playerOneScore.Score++;
            this._playerOneScore.activateSoreAnimation();
            newDirection = -1;
        }
        else if(this._ball.x <= this._playerOne.x && (this._ball.y > this._playerOne.y + this._playerOne.Height / 2 || this._ball.y < this._playerOne.y - this._playerOne.Height / 2))
        {
            hasScored = true;
            this._playerTwoScore.Score++;
            this._playerTwoScore.activateSoreAnimation();
            newDirection = 1;
        }

        if(hasScored)
        {
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

        this.createDebugUI();
    }

    private removeBall()
    {
        this._datGUI.removeFolder(this._ballFolder);
        this._ballFolder = null;

        if(this._ball)
        {
            this._ball.destroy();
            this._ball = null;
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