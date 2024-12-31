export class ScoreCounter extends Phaser.GameObjects.Text
{
    private static readonly DEFAULT_DEPTH = 998;
    private static readonly DEFAULT_BACKGROUND_COLOR = "white";
    private static readonly DEFAULT_STROKE_COLOR = "black";
    private static readonly SCORE_ANIMATION_DURATION = 500;
    private _defaultScoringColor = 0x800000;

    private _score: number = 0;

    public get Score()
    {
        return this._score;
    }

    public set Score(value: number)
    {
        value = Math.max(value, 0);
        this._score = value;
        let scoreString = this.Score < 10 ? "0" + this.Score : this.Score.toString();
        this.setText(scoreString);
    }

    public get DefaultScoringColor()
    {
        return this._defaultScoringColor;
    }
    public set DefaultScoringColor(value: number)
    {
        this._defaultScoringColor = value;
    }

    public constructor(scene: Phaser.Scene, x: number, y: number)
    {
        const textStyles: Phaser.Types.GameObjects.Text.TextStyle = {
            color: ScoreCounter.DEFAULT_BACKGROUND_COLOR,
            backgroundColor: "",
            fontSize: "72px",
            stroke: ScoreCounter.DEFAULT_STROKE_COLOR,
            strokeThickness: 6
        };
        super(scene, x, y, "00", textStyles);
        this.setDepth(ScoreCounter.DEFAULT_DEPTH);
        this.addToDisplayList();
    }

    public activateScoreAnimation()
    {
        this.setTintFill(this._defaultScoringColor);
        this.scene.time.delayedCall(ScoreCounter.SCORE_ANIMATION_DURATION, () => this.clearTint());
    }

    public resetScore()
    {
        this.Score = 0;
    }
}