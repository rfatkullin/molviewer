export default class Vector {
    public x: number;
    public y: number;
    public z: number;

    public static From(newX: number, newY: number): Vector {
        return {
            x: newX,
            y: newY,
            z: 0
        };
    }

    public static Empty(): Vector {
        return {
            x: 0,
            y: 0,
            z: 0
        };
    }
}