import { TennisObject } from "../tennis";

export class Bat implements TennisObject
{
    private _player_velocity = 21;
    private player_velocity_decrease = 2 / 2500;

    public get PlayerVelocity(){
        return this._player_velocity;
    }

    public set PlayerVelocity(value: number)
    {
        this._player_velocity = value;
    }

    public get X(){
        return this._gameObject.x;
    }

    public set X(value: number)
    {
        this._gameObject.x = value;
    }

    public get Y(){
        return this._gameObject.y;
    }

    public set Y(value: number)
    {
        this._gameObject.y = value;
    }

    public get CanvasWidth(){
        return this._canvasSize.x;
    }

    public get CanvasHeight(){
        return this._canvasSize.y;
    }

    public get Height()
    {
        return this._gameObject.height;
    }

    public get Width()
    {
        return this._gameObject.width;
    }

    public constructor(
        private _gameObject: Phaser.GameObjects.Sprite, private _canvasSize: Phaser.Math.Vector2, private downKey: Phaser.Input.Keyboard.Key, 
        private upKey: Phaser.Input.Keyboard.Key
    )
    {
    }

    public get GameObject(){
        return this._gameObject;
    }

    destroy() 
    {
        this._gameObject.destroy(true);
        this._gameObject = null;
    }


    public update(delta: number)
    {
        let newPosition = 0;

        if(this.downKey.isDown)
        {
            newPosition = this.Y += this.PlayerVelocity;
            this.Y = Phaser.Math.Clamp(newPosition, this.Height / 2, this._canvasSize.y - this.Height / 2)
        }
        else if(this.upKey.isDown)
        {
            newPosition = this.Y -= this.PlayerVelocity;
            this.Y = Phaser.Math.Clamp(newPosition, this.Height / 2, this._canvasSize.y - this.Height / 2)
        }
    }
}