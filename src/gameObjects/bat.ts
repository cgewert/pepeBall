export class Bat extends Phaser.GameObjects.Sprite
{
    public static readonly DATA_KEY_BALL_X = "ballX";
    public static readonly DATA_KEY_BALL_Y = "ballY";

    private _player_velocity = 18;
    private _ai_velocity = 8;
    private _isAiControlled = false;
    private _aiYDirection = false;

    public get AiYDirection(){
        return this._aiYDirection;
    }

    public get IsAIControlled(){
        return this._isAiControlled;
    }

    public get PlayerVelocity(){
        return this._player_velocity;
    }

    public set PlayerVelocity(value: number)
    {
        this._player_velocity = value;
    }

    public get CanvasWidth(){
        return this.scene.sys.canvas.width;
    }

    public get CanvasHeight(){
        return this.scene.sys.canvas.height;
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
                texture: string, private downKey: Phaser.Input.Keyboard.Key, private upKey: Phaser.Input.Keyboard.Key)
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

        // If ball distance if far, we move to screen middle on y axis
        // If ball distance if near, we move to balls y coordinate
        const weight1 = Math.min(1, distanceToPlayer / (this.CanvasWidth / 2));
        const weight2 = 1 - weight1
        const targetY = (weight1 * target1) + (weight2 * target2);
        const deltaY = Math.min(this._ai_velocity, Math.max(-this._ai_velocity, targetY - this.y));

        this._aiYDirection = deltaY < 0;
        let newY = this.y += deltaY;
        newY = Phaser.Math.Clamp(this.y, this.Height / 2, this.CanvasHeight - this.Height / 2);
        this.y = newY;
    }

    private updateHuman() 
    {
        if (this.downKey.isDown) {
            this.y += this.PlayerVelocity;
            this.y = Phaser.Math.Clamp(this.y, this.Height / 2, this.CanvasHeight - this.Height / 2);
        }
        else if (this.upKey.isDown) {
            this.y -= this.PlayerVelocity;
            this.y = Phaser.Math.Clamp(this.y, this.Height / 2, this.CanvasHeight - this.Height / 2);
        }
    }
}