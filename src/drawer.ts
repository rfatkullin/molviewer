import Configs from "./config";
import Geom from "./geom";
import Vector from "./vector";

export default class Drawer {
    private readonly MolMinRad: number = 10;
    private readonly MolMaxRad: number = 30;
    private readonly MolRadDelta: number = this.MolMaxRad - this.MolMinRad;
    private readonly Border: number = 50;

    private readonly _svgCtx: Snap.Paper = null;
    private readonly _drawWidth: number;
    private readonly _svgCtxSize: any;

    private _atoms: any;
    private _edgesMap: any;

    private _minZ: number;
    private _maxZ: number;
    private _widthZ: number;

    private _isItDrawn: any;

    public constructor(newSvgCtx: Snap.Paper, newSvgCtxSize: any) {
        this._svgCtx = newSvgCtx;
        this._svgCtxSize = newSvgCtxSize;
        this._drawWidth = this._svgCtxSize.width - 2 * this.Border;
    }

    public init(atoms: any, bonds: any): void {
        this._atoms = Geom.toScale(atoms, this._drawWidth);
        this._edgesMap = this.getEdgesMap(bonds);
    }

    private getEdgesMap(bonds: any): any {
        const atomsCnt: number = this._atoms.length;
        const bondsCnt: number = bonds.length
        const edgesMap: any = {};

        for (let i = 0; i < atomsCnt; ++i) {
            edgesMap[this._atoms[i].id] = {
                pos: this._atoms[i].pos,
                edges: []
            };
        }

        for (let j = 0; j < bondsCnt; ++j) {
            edgesMap[bonds[j][0]].edges.push(bonds[j][1]);
            edgesMap[bonds[j][1]].edges.push(bonds[j][0]);
        }

        return edgesMap;
    }

    public draw(): void {
        const atomsCnt: number = this._atoms.length;

        let edges: any = [];
        let edgesCnt: number = 0;
        let atomPos: Vector;
        let atomRad: number = -1;
        let adjAtomPos: Vector;

        this._atoms.sort(Geom.compareByZ);

        this._minZ = this._atoms[0].pos.z;
        this._maxZ = this._atoms[atomsCnt - 1].pos.z;
        this._widthZ = this._maxZ - this._minZ;

        //Если все точки лежат в одной плоскости по Z
        if (Math.abs(this._widthZ) < Configs.Epsilon) {
            this._widthZ = 0.1;
        }

        this._svgCtx.clear();

        this.drawContextRect();

        this._isItDrawn = {};

        for (let i = 0; i < atomsCnt; ++i) {
            atomPos = this.offsetToDrawCanvas(this._atoms[i].pos);
            atomRad = this.getMoleculeRad(atomPos.z);
            this.drawMolecule(atomPos, atomRad);

            edges = this._edgesMap[this._atoms[i].id].edges;
            edgesCnt = edges.length;
            for (let j = 0; j < edgesCnt; ++j) {
                adjAtomPos = this._edgesMap[edges[j]].pos;

                if (atomPos.z + Configs.Epsilon < adjAtomPos.z) {
                    this.drawEdge(atomPos, atomRad, this.offsetToDrawCanvas(adjAtomPos));
                }
                else if (Math.abs(atomPos.z - adjAtomPos.z) < Configs.Epsilon && this.isDrawn(this._atoms[i].id, edges[j]) === false) {
                    this.drawEdge(atomPos, atomRad, this.offsetToDrawCanvas(adjAtomPos));
                    this.setDrawn(this._atoms[i].id, edges[j]);
                }
            }
        }
    }

    private isDrawn(id1: string, id2: string): boolean {
        if (this._isItDrawn[id1] === undefined) {
            return false;
        }

        if (this._isItDrawn[id1][id2] === undefined) {
            return false;
        }

        return true;
    }

    private setDrawn(id1: string, id2: string): void {
        if (this._isItDrawn[id1] === undefined)
            this._isItDrawn[id1] = {};

        this._isItDrawn[id1][id2] = true;

        if (this._isItDrawn[id2] === undefined)
            this._isItDrawn[id2] = {};

        this._isItDrawn[id2][id1] = true;
    }

    private offsetToDrawCanvas(pos: Vector): Vector {
        return {
            x: pos.x + this._drawWidth / 2 + this.Border,
            y: pos.y + this._drawWidth / 2 + this.Border,
            z: pos.z
        };
    }

    public rotate(rotateVec: Vector): void {
        Geom.rotateByY(this._atoms, -rotateVec.x * 0.01);
        Geom.rotateByX(this._atoms, rotateVec.y * 0.01);
    }

    private arc(startPos: any, endPos: any, clockWise: boolean): void {
        const length: number = Geom.vecLength({ x: endPos.x - startPos.x, y: endPos.y - startPos.y, z: 0 });
        const rad: number = length / 2.0;

        const clockWiseInt: number = clockWise ? 0 : 1;
        const path: string = `M ${startPos.x} ${startPos.y} A ${rad} ${rad} 0 1 ${clockWiseInt} ${endPos.x} ${endPos.y}`;

        this._svgCtx.path(path).attr({ fill: "none", stroke: "black", strokeWidth: "1" });
    }

    private drawContextRect(): void {
        this._svgCtx.rect(0, 0, this._svgCtxSize.width, this._svgCtxSize.height, 5, 5)
            .attr({ stroke: "black", strokeWidth: "1", fill: "white", "fill-opacity": "1.0" });
    }

    private drawEdge(startPos: Vector, startRad: number, endPos: Vector): void {
        var endRad = this.getMoleculeRad(endPos.z),
            startFactor = 0.2 * startRad,
            endFactor = 0.2 * endRad,
            dirVec = { x: endPos.x - startPos.x, y: endPos.y - startPos.y, z: 0 },
            normVec = Geom.normalizeVec({ x: -dirVec.y, y: dirVec.x, z: 0 }),
            shiftedStart = Geom.shiftBy(startPos, Geom.normalizeVec(dirVec), 0.5 * startRad),
            startTop = {
                x: shiftedStart.x - normVec.x,
                y: shiftedStart.y - normVec.y,
                xDelta: -(startFactor - 1) * normVec.x,
                yDelta: -(startFactor - 1) * normVec.y
            },
            startBot = {
                x: shiftedStart.x + normVec.x,
                y: shiftedStart.y + normVec.y,
                xDelta: (startFactor - 1) * normVec.x,
                yDelta: (startFactor - 1) * normVec.y
            },
            endTop = {
                x: endPos.x - normVec.x,
                y: endPos.y - normVec.y,
                xDelta: -(endFactor - 1) * normVec.x,
                yDelta: -(endFactor - 1) * normVec.y
            },
            endBot = {
                x: endPos.x + normVec.x,
                y: endPos.y + normVec.y,
                xDelta: (endFactor - 1) * normVec.x,
                yDelta: (endFactor - 1) * normVec.y
            },
            i = 0;

        const edgeLines = Geom.sortByPerpendicularDist({ x: 0, y: 0, z: 0 }, { start: startBot, end: endBot }, { start: startTop, end: endTop });

        for (i = 0; i < edgeLines.length; ++i) {
            edgeLines[i].start.x += edgeLines[i].start.xDelta;
            edgeLines[i].start.y += edgeLines[i].start.yDelta;

            edgeLines[i].end.x += edgeLines[i].end.xDelta;
            edgeLines[i].end.y += edgeLines[i].end.yDelta;
        }

        this._svgCtx.polyline([startTop.x, startTop.y,
        endTop.x, endTop.y,

        endBot.x, endBot.y,
        startBot.x, startBot.y,

        startBot.x, startBot.y,
        startTop.x, startTop.y]).attr({ strokeWidth: "0", stroke: "black", fill: "white" });

        this._svgCtx.line(edgeLines[0].start.x, edgeLines[0].start.y,
            edgeLines[0].end.x, edgeLines[0].end.y).attr({ strokeWidth: "1", stroke: "black", fill: "black" });

        var color = "black",
            width = "1";

        if (!Geom.inMiddle({ x: 0, y: 0, z: 0 }, edgeLines[0], edgeLines[1])) {
            color = "gray";
            width = "3";
        }

        this._svgCtx.line(edgeLines[1].start.x, edgeLines[1].start.y,
            edgeLines[1].end.x, edgeLines[1].end.y).attr({ strokeWidth: width, stroke: color, fill: "black" });

        this.arc(startTop, startBot, true);
        this.arc(endTop, endBot, false);
    }

    private getMoleculeRad(zCompVal: number): number {
        return this.MolMinRad + this.MolRadDelta * Math.abs(zCompVal - this._minZ) / this._widthZ;
    }

    private drawMolecule(pos: Vector, rad: number): void {
        const bigCircle: Snap.Element = this._svgCtx.circle(pos.x, pos.y, rad);
        bigCircle.attr({
            fill: "gray"
        });

        const smallCircle: Snap.Element = this._svgCtx.circle(pos.x - 0.2 * rad, pos.y - 0.2 * rad, rad);
        smallCircle.attr({
            fill: "white"
        });

        const bigCircleStroke: Snap.Element = this._svgCtx.circle(pos.x, pos.y, rad);
        bigCircleStroke.attr({
            fill: "gray",
            "fill-opacity": "0.0",
            stroke: "black",
            strokeWidth: "1"
        });

        const masking: Snap.Paper = this._svgCtx.group(this._svgCtx.circle(pos.x, pos.y, rad));
        masking.attr({ fill: "#fff" });

        smallCircle.attr({ mask: masking });
    }
}