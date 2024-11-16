export class Bat extends Phaser.GameObjects.Sprite
{
    public static readonly DATA_KEY_BALL_X = "ballX";
    public static readonly DATA_KEY_BALL_Y = "ballY";

    private _player_velocity = 21;
    private _isAiControlled = false;

    public get PlayerVelocity(){
        return this._player_velocity;
    }

    public set PlayerVelocity(value: number)
    {
        this._player_velocity = value;
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
                scene: Phaser.Scene, x: number, y: number, texture: string,
                private _canvasSize: Phaser.Math.Vector2, private downKey: Phaser.Input.Keyboard.Key, private upKey: Phaser.Input.Keyboard.Key)
    {
        super(scene, x, y, texture);
        this.addToDisplayList();
        this.active = true;
        this._isAiControlled = downKey == null || upKey == null;
        this.setDepth(1);
    }

    public update(_delta: number)
    {
        if(this._isAiControlled){
            this.updateAi();
            return;
        }
        this.updateHuman();
    }
    
    private updateAi()
    {
        const bx = this.getData(Bat.DATA_KEY_BALL_X);
        const by = this.getData(Bat.DATA_KEY_BALL_Y);
        const distanceToPlayer = Math.abs(this.x - bx);
        let target1 = this.CanvasHeight / 2;
        let target2 = by;

        const weight1 = Math.min(1, distanceToPlayer / this.CanvasWidth / 2);
        const weight2 = 1 - weight1
        const targetY = (weight1 * target1) + (weight2 * target2);
        
        this.y = targetY;
    }

    private updateHuman() 
    {
        if (this.downKey.isDown) {
            this.y += this.PlayerVelocity;
            this.y = Phaser.Math.Clamp(this.y, this.Height / 2, this._canvasSize.y - this.Height / 2);
        }
        else if (this.upKey.isDown) {
            this.y -= this.PlayerVelocity;
            this.y = Phaser.Math.Clamp(this.y, this.Height / 2, this._canvasSize.y - this.Height / 2);
        }
    }
}