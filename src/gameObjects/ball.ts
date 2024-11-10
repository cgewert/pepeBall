import { BallDirection, TennisObject } from "../tennis";

export class Ball implements TennisObject
{
    private _ball_velocity = 5;
    private _direction: BallDirection = 1;
    private _motionVector: Phaser.Math.Vector2;

    public get MotionVector()
    {
        return this._motionVector;
    }

    public set MotionVector(value: Phaser.Math.Vector2)
    {
        this._motionVector = value;
    }

    public get Direction()
    {
        return this._direction;
    }

    public set Direction(value: BallDirection)
    {
        this._direction = value;
    }

    public get BallVelocity(){
        return this._ball_velocity;
    }

    public set BallVelocity(value: number){
        this._ball_velocity = value;
    }

    private _ball_velocity_increase = 1;

    public get BallVelocityIncrease(){
        return this._ball_velocity_increase;
    }

    public set BallVelocityIncrease(value: number){
        this._ball_velocity_increase = value;
    }

    public get X(){
        return this._gameObject.x;
    }

    public set X(value: number){
        this._gameObject.x = value;
    }

    public get Y(){
        return this._gameObject.y;
    }

    public set Y(value: number){
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
        return this._gameObject.displayHeight;
    }

    public get Width()
    {
        return this._gameObject.displayWidth;
    }

    public constructor(
        private _gameObject: Phaser.GameObjects.Sprite, private _canvasSize: Phaser.Math.Vector2, motionVector: Phaser.Math.Vector2)
    {
        this.MotionVector = motionVector;
    }

    public get GameObject(){
        return this._gameObject;
    }

    destroy() 
    {
        this._gameObject.destroy(true);
        this._gameObject = null;
    }


    public update(timeDelta: number)
    {
    }
}