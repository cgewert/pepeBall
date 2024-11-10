export class ScoreCounter extends Phaser.GameObjects.Text
{
    private _score: number = 0;

    public get Score()
    {
        return this._score;
    }

    public set Score(value: number)
    {
        value = Math.max(value, 0);
        this._score = value;
        this.setText(`${this.Score}`);
    }

    public constructor(scene: Phaser.Scene, x: number, y: number)
    {
        const textStyles: Phaser.Types.GameObjects.Text.TextStyle = {
            color: "black",
            backgroundColor: "",
            fontSize: "36px"
        };
        super(scene, x, y, "00", textStyles);
        this.addToDisplayList();
    }

    public resetScore()
    {
        this.Score = 0;
    }
}