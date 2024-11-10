import { Ball } from "../gameObjects/ball";
import { Bat } from "../gameObjects/bat";
import { ScoreCounter } from "../score";
import { BallDirection } from "../tennis";
import { GameOverScene } from "./gameover";
import { GUI } from "dat.gui";

export class PepeTennisScene extends Phaser.Scene
{    
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
    private _debug: boolean = false;
    private _datGUI: GUI;
    private _ballFolder: GUI;
    private _playerFolder: GUI;
    private _playerOne: Bat;
    private _playerTwo: Bat;
    private _playerOneScore: ScoreCounter;
    private _playerTwoScore: ScoreCounter;


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
        
    }

    public preload()
    {
        this.load.image('ball', 'assets/gfx/ball.png');
        this.load.image('p1', 'assets/gfx/avatars/hang-man-avatar.png');
    }

    public create(data: any)
    {
        this._main = this.cameras.main;

        this._playerOneScore = new ScoreCounter(this, 0,0);
        this._playerTwoScore = new ScoreCounter(this, this._main.width - 100,0);
        
        this._viewPortHalfHeight = this._main.height / 2;
        this._viewPortHalfWidth = this._main.width / 2;
        //this.add.image(0,0,"background").setOrigin(0,0);
        this.addBall(1);

        // Create input Keys
        this._p1Down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Y);
        this._p1Up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this._p2Down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this._p2Up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        
        // Create the players
        // TODO: detect one player / two player mode
        this._players.push(new Bat(this.add.sprite(0,0,"p1"), new Phaser.Math.Vector2(this._main.width, this._main.height), this._p1Down, this._p1Up));
        this._players.push(new Bat(this.add.sprite(0,0,"p1").setFlipX(true), new Phaser.Math.Vector2(this._main.width, this._main.height), this._p2Down, this._p2Up));
        this._players[0].Y = this._viewPortHalfHeight;
        this._players[0].X = this._players[0].Width / 2;
        this._players[1].Y = this._viewPortHalfHeight;
        this._players[1].X = this._main.width - this._players[1].Width / 2;
        this._playerOne = this._players[0];
        this._playerTwo = this._players[1];
        
        this.createDebugUI();
    }

    public update(delta: number)
    {
        if(this.GameOver)
        {
            this.scene.start(GameOverScene.CONFIG.key);
        }

        this._players.map( x => x.update(delta));
        this._ball.update(delta);

        // Move the ball
        for(let i=0; i < this._ball.BallVelocity; i++)
        {
            this._ball.X += this._ball.Direction * this._ball.MotionVector.x;
            this._ball.Y += this._ball.MotionVector.y;

            this.checkWallCollision();
            
            if(this.checkPlayerCollision())
            {
                this._ball.Direction = this._ball.Direction * -1 as BallDirection;
                this._ball.BallVelocity += this._ball.BallVelocityIncrease;
            }

            this.checkScoring();
        }
    }

    private checkWallCollision()
    {
        const topCollision = () => this._ball.Y <= this._ball.Height / 2;
        const bottomCollision = () => this._ball.Y >= (this._main.height - (this._ball.Height / 2));

        if(topCollision() || bottomCollision())
        {
            this._ball.MotionVector.y *= -1;
        }
        
    }

    private checkPlayerCollision(): boolean
    {
        const p1Collision = () => this._ball.X - this._ball.Width / 2 <= this._playerOne.X + this._playerOne.Width / 2 && (this._ball.Y <= this._playerOne.Y + this._playerOne.Height / 2) && (this._ball.Y >= this._playerOne.Y - this._playerOne.Height / 2) && this._ball.Direction == -1;
        const p2Collision = () => this._ball.X + this._ball.Width / 2 >= this._playerTwo.X - this._playerTwo.Width / 2 && (this._ball.Y <= this._playerTwo.Y + this._playerTwo.Height / 2) && (this._ball.Y >= this._playerTwo.Y - this._playerTwo.Height / 2) && this._ball.Direction == 1;

        return p1Collision() || p2Collision();
    }
y
    private checkScoring()
    {
        let newDirection = 1 as BallDirection;
        let hasScored = false;

        if(this._ball.X >= this._playerTwo.X && (this._ball.Y > this._playerTwo.Y + this._playerTwo.Height / 2 || this._ball.Y < this._playerTwo.Y - this._playerTwo.Height / 2 ))
        {
            hasScored = true;
            this._playerOneScore.Score++;
            newDirection = -1;
        }
        else if(this._ball.X <= this._playerOne.X && (this._ball.Y > this._playerOne.Y + this._playerOne.Height / 2 || this._ball.Y < this._playerOne.Y - this._playerOne.Height / 2))
        {
            hasScored = true;
            this._playerTwoScore.Score++;
            newDirection = 1;
        }

        if(hasScored)
        {
            this.removeBall();
            this.addBall(newDirection);
            if(this._playerOneScore.Score >= 10 || this._playerTwoScore.Score >= 10)
            {
                this.scene.start(GameOverScene.CONFIG.key);
            }
        }
    }

    private addBall(direction: BallDirection)
    {
        const motionVector = new Phaser.Math.Vector2(2,3).normalize();
        this._ball = new Ball(this.add.sprite(0,0,"ball").setScale(0.05, 0.05).setOrigin(0.5,0.5), 
        new Phaser.Math.Vector2(this._main.width, this._main.height), motionVector);
        this._ball.X = this._viewPortHalfWidth - this._ball.Width / 2;
        this._ball.Y = this._viewPortHalfHeight - this._ball.Height / 2;
        this._ball.Direction = direction;

        this.createDebugUI();
    }

    private removeBall()
    {
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
                this._ballFolder.open();
                this._ballFolder.add(this._ball.GameObject, "scale", 0, 25, 0.00001);
                this._ballFolder.add(this._ball, "BallVelocity", -100, 100, 0.01);
                this._ballFolder.add(this._ball, "BallVelocityIncrease", -10, 10, 0.01);
            }
            
            if(this._playerOne && this._playerTwo)
            {
                this._playerFolder = this._datGUI.addFolder("PLAYERS");
                this._playerFolder.add(this._playerOne, "X", 0, this._main.width).name("P1 X");
                this._playerFolder.add(this._playerOne, "PlayerVelocity", 0, 100).name("P1 Velocity");
                this._playerFolder.add(this._playerTwo, "X", 0, this._main.width).name("P2 X");
                this._playerFolder.add(this._playerOne, "PlayerVelocity", 0, 100).name("P2 Velocity");
                this._playerFolder.open();
            }
            
            this._datGUI.show();
        }
    }
}