export class BaseScene extends Phaser.Scene
{
    protected _main: Phaser.Cameras.Scene2D.Camera;
    protected _viewPortWidth: number;
    protected _viewPortHeight: number;
    protected _viewPortHalfWidth: number;
    protected _viewPortHalfHeight: number;

    public constructor(cfg: Phaser.Types.Scenes.SettingsConfig)
    {
        super(cfg);
    }
}