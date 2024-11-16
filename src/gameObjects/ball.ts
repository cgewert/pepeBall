import { BallDirection } from "../tennis";

export class Ball extends Phaser.GameObjects.Sprite
{
    private static readonly DEFAULT_DEPTH = 999;
    private static readonly DEFAULT_SCALE = 0.07;

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

    public get CanvasWidth(){
        return this._canvasSize.x;
    }

    public get CanvasHeight(){
        return this._canvasSize.y;
    }

    public get Height()
    {
        return this.displayHeight;
    }

    public get Width()
    {
        return this.displayWidth;
    }

    public constructor(
        scene: Phaser.Scene, x: number, y: number,
        texture: string,
        private _canvasSize: Phaser.Math.Vector2, motionVector: Phaser.Math.Vector2)
    {
        super(scene, x, y, texture);
        this.MotionVector = motionVector;
        this.addToDisplayList();
        this.active = true;
        this.setScale(Ball.DEFAULT_SCALE);
        this.setDepth(Ball.DEFAULT_DEPTH);
    }
}