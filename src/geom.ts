import Vector from "./vector";
import Configs from "./config";

export default class Geom {

    public static vecLength(vec: Vector): number {
        return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
    }

    public static normalizeVec(vec: Vector): Vector {
        const length: number = this.vecLength(vec);

        return Vector.From(vec.x / length, vec.y / length);
    }

    public static pseudoscalarMult(a: Vector, b: Vector): number {
        return a.x * b.y - a.y * b.x;
    }

    public static sortByPerpendicularDist(point: Vector, aLine: any, bLine: any): any {
        const aDist: number = this.perpendicularDist(point, aLine);
        const bDist: number = this.perpendicularDist(point, bLine);

        if (aDist + Configs.Epsilon < bDist) {
            return [aLine, bLine];
        }

        return [bLine, aLine];
    }

    public static perpendicularDist(point: Vector, line: any): number {
        var AB = { x: line.end.x - line.start.x, y: line.end.y - line.start.y, z: 0 },
            CD = this.normalizeVec({ x: AB.y, y: -AB.x, z: 0 }),
            AC = { x: point.x - line.start.x, y: point.y - line.start.y, z: 0 },
            ACxAB = this.pseudoscalarMult(AC, AB),
            CDxAB = this.pseudoscalarMult(CD, AB),
            alpha = -ACxAB / CDxAB;

        return Math.abs(alpha);
    }

    public static inMiddle(point: Vector, aLine: any, bLine: any): boolean {
        var a = { x: aLine.end.x - aLine.start.x, y: aLine.end.y - aLine.start.y, z: 0 },
            b = { x: bLine.end.x - bLine.start.x, y: bLine.end.y - bLine.start.y, z: 0 },
            pointAVec = { x: point.x - aLine.start.x, y: point.y - aLine.start.y, z: 0 },
            pointBVec = { x: point.x - bLine.start.x, y: point.y - bLine.start.y, z: 0 },
            res1 = this.pseudoscalarMult(pointAVec, a),
            res2 = this.pseudoscalarMult(pointBVec, b);

        if ((res1 > Configs.Epsilon) && (res2 < Configs.Epsilon) || (res1 < Configs.Epsilon) && (res2 > Configs.Epsilon))
            return true;

        return false;
    }

    public static shiftBy(point: Vector, dirVec: Vector, factor: number): Vector {
        return {
            x: point.x + factor * dirVec.x,
            y: point.y + factor * dirVec.y,
            z: 0
        };
    }

    public static toScale(coords: any, targetSize: number): any {
        const scaleFactor: number = 0.5 * targetSize / Math.max(this.getAbsMax(coords, "x"),
            this.getAbsMax(coords, "y"),
            this.getAbsMax(coords, "z")),
            coordsCnt: number = coords.length;

        for (let i = 0; i < coordsCnt; ++i) {
            coords[i].pos.x *= scaleFactor;
            coords[i].pos.y *= scaleFactor;
            coords[i].pos.z *= scaleFactor;
        }

        return coords;
    }

    public static getAbsMax(arr: any, component: string): number {
        let maxVal: number = Math.abs(arr[0].pos[component]);
        const arrLength: number = arr.length;

        for (let i: number = 0; i < arrLength; ++i) {
            maxVal = Math.max(maxVal, Math.abs(arr[i].pos[component]));
        }

        return maxVal;
    }

    public static rotateByY(atoms: any, angle: any): void {
        var atomsCnt = atoms.length,
            i = 0,
            newX = 0.0,
            newZ = 0.0;

        for (i = 0; i < atomsCnt; ++i) {
            newX = atoms[i].pos.x * Math.cos(angle) - atoms[i].pos.z * Math.sin(angle);
            newZ = atoms[i].pos.x * Math.sin(angle) + atoms[i].pos.z * Math.cos(angle);
            atoms[i].pos.x = newX;
            atoms[i].pos.z = newZ;
        }
    }

    public static rotateByX(atoms: any, angle: any): void {
        var atomsCnt = atoms.length,
            i = 0,
            newY = 0.0,
            newZ = 0.0;

        for (i = 0; i < atomsCnt; ++i) {
            newY = atoms[i].pos.y * Math.cos(angle) - atoms[i].pos.z * Math.sin(angle);
            newZ = atoms[i].pos.y * Math.sin(angle) + atoms[i].pos.z * Math.cos(angle);
            atoms[i].pos.y = newY;
            atoms[i].pos.z = newZ;
        }
    }
    
    public static compareByZ(a: any, b: any): number {
        if (a.pos.z + Configs.Epsilon < b.pos.z) {
            return -1;
        }

        if (b.pos.z + Configs.Epsilon < a.pos.z) {
            return 1;
        }

        if (a.id < b.id) {
            return -1;
        }

        return 1;
    }
}