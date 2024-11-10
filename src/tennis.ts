export interface TennisObject
{
    update(delta: number);
    destroy();
    get GameObject();
    get X();
    set X(value: number)
    get Y();
    set Y(value: number);
    get CanvasWidth();
    get CanvasHeight();
    get Width();
    get Height();
}

export type GameMode = 1 | 2;
export type BallDirection = 1 | -1;

// export const AddText = (text: string, x: number, y: number, bgc: string, fgc: string, padding: number) => {
//     const textPadding: Phaser.Types.GameObjects.Text.TextPadding = {
//         x: 20,
//         y: 20
//     }
// }