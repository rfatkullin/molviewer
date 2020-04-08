import Configs from "./config";
import Geom from "./geom";

export default class Drawer {
    private readonly MolMinRad: number = 10;
    private readonly MolMaxRad: number = 30;
    private readonly MolRadDelta: number = this.MolMaxRad - this.MolMinRad;
    private readonly Border: number = 50;

    private DrawWidth: number;

    private atoms: any;
    private edgesMap: any;
    private svgCtxSize: any;

    private minZ: number;
    private maxZ: number;
    private widthZ: number;

    private svgCtx: any;

    private isItDrawn: any;

    constructor(atoms: any, bonds: any) {

    }

    public init(atoms: any, bonds: any): void {
        this.DrawWidth = this.svgCtxSize.width - 2 * this.Border;

        this.atoms = Geom.toScale(this.atoms, this.DrawWidth);
        this.edgesMap = this.getEdgesMap(bonds);
    }

    private getEdgesMap(bonds: any): any {
        var atomsCnt = this.atoms.length,
            bondsCnt = bonds.length,
            i = 0,
            j = 0,
            adjAtomId: number = -1,
            edgesMap: any = {};

        for (i = 0; i < atomsCnt; ++i) {
            edgesMap[this.atoms[i].id] = { pos: this.atoms[i].pos, edges: [] };
        }

        for (j = 0; j < bondsCnt; ++j) {
            this.edgesMap[bonds[j][0]].edges.push(bonds[j][1]);
            this.edgesMap[bonds[j][1]].edges.push(bonds[j][0]);
        }

        return edgesMap;
    }

    public draw(): void {
        let atomsCnt: number = this.atoms.length,
            i: number = 0,
            j: number = 0,
            edges: any = [],
            edgesCnt: number = 0,
            atomId: number = -1,
            atomPos: any = {},
            atomRad: number = -1,
            adjAtomPos: any = {};

        this.atoms.sort(Geom.compareByZ);

        this.minZ = this.atoms[0].pos.z;
        this.maxZ = this.atoms[atomsCnt - 1].pos.z;
        this.widthZ = this.maxZ - this.minZ;

        //Если все точки лежат в одной плоскости по Z
        if (Math.abs(this.widthZ) < Configs.Epsilon) {
            this.widthZ = 0.1;
        }

        this.svgCtx.clear();

        this.drawContextRect();

        this.isItDrawn = {};

        for (i = 0; i < atomsCnt; ++i) {
            atomPos = this.offsetToDrawCanvas(this.atoms[i].pos);
            atomRad = this.getMoleculeRad(atomPos.z);
            this.drawMolecule(atomPos, atomRad, this.atoms[i].id);

            edges = this.edgesMap[this.atoms[i].id].edges;
            edgesCnt = edges.length;
            for (j = 0; j < edgesCnt; ++j) {
                adjAtomPos = this.edgesMap[edges[j]].pos;

                if (atomPos.z + Configs.Epsilon < adjAtomPos.z) {
                    this.drawEdge(atomPos, atomRad, this.offsetToDrawCanvas(adjAtomPos));
                }
                else if (Math.abs(atomPos.z - adjAtomPos.z) < Configs.Epsilon && this.isDrawn(this.atoms[i].id, edges[j]) === false) {
                    this.drawEdge(atomPos, atomRad, this.offsetToDrawCanvas(adjAtomPos));
                    this.setDrawn(this.atoms[i].id, edges[j]);
                }
            }
        }
    }

    private isDrawn(id1: string, id2: string): boolean {
        if (this.isItDrawn[id1] === undefined) {
            return false;
        }

        if (this.isItDrawn[id1][id2] === undefined) {
            return false;
        }

        return true;
    }

    private setDrawn(id1: string, id2: string): void {
        if (this.isItDrawn[id1] === undefined)
            this.isItDrawn[id1] = {};

        this.isItDrawn[id1][id2] = true;

        if (this.isItDrawn[id2] === undefined)
            this.isItDrawn[id2] = {};

        this.isItDrawn[id2][id1] = true;
    }

    private offsetToDrawCanvas(pos: any): any {
        return {
            x: pos.x + this.DrawWidth / 2 + this.Border,
            y: pos.y + this.DrawWidth / 2 + this.Border,
            z: pos.z
        };
    }

    private rotate(rotateVec: any) {
        Geom.rotateByY(this.atoms, -rotateVec.x * 0.01);
        Geom.rotateByX(this.atoms, rotateVec.y * 0.01);
    }

    private arc(startPos: any, endPos: any, clockWise: boolean): void {
        const length: number = Geom.vecLength({ x: endPos.x - startPos.x, y: endPos.y - startPos.y });
        const rad: number = length / 2.0;

        const clockWiseInt: number = clockWise ? 0 : 1;
        const path: string = `M ${startPos.x} ${startPos.y} A ${rad} ${rad} 0 1 ${clockWiseInt} ${endPos.x} ${endPos.y}`;

        this.svgCtx.path(path).attr({ fill: "none", stroke: "black", strokeWidth: "1" });
    }

    private drawContextRect(): void {
        this.svgCtx.rect(0, 0, this.svgCtxSize.width, this.svgCtxSize.height, 5, 5)
            .attr({ stroke: "black", strokeWidth: "1", fill: "white", "fill-opacity": "1.0" });
    }

    private drawEdge(startPos: any, startRad: any, endPos: any): void {
        var endRad = this.getMoleculeRad(endPos.z),
            startFactor = 0.2 * startRad,
            endFactor = 0.2 * endRad,
            dirVec = { x: endPos.x - startPos.x, y: endPos.y - startPos.y },
            normVec = Geom.normalizeVec({ x: -dirVec.y, y: dirVec.x }),
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

        const edgeLines = Geom.sortByPerpendicularDist({ x: 0, y: 0 }, { start: startBot, end: endBot }, { start: startTop, end: endTop });

        for (i = 0; i < edgeLines.length; ++i) {
            edgeLines[i].start.x += edgeLines[i].start.xDelta;
            edgeLines[i].start.y += edgeLines[i].start.yDelta;

            edgeLines[i].end.x += edgeLines[i].end.xDelta;
            edgeLines[i].end.y += edgeLines[i].end.yDelta;
        }

        this.svgCtx.polyline([startTop.x, startTop.y,
        endTop.x, endTop.y,

        endBot.x, endBot.y,
        startBot.x, startBot.y,

        startBot.x, startBot.y,
        startTop.x, startTop.y]).attr({ strokeWidth: "0", stroke: "black", fill: "white" });

        this.svgCtx.line(edgeLines[0].start.x, edgeLines[0].start.y,
            edgeLines[0].end.x, edgeLines[0].end.y).attr({ strokeWidth: "1", stroke: "black", fill: "black" });

        var color = "black",
            width = "1";

        if (!Geom.inMiddle({ x: 0, y: 0 }, edgeLines[0], edgeLines[1])) {
            color = "gray";
            width = "3";
        }

        this.svgCtx.line(edgeLines[1].start.x, edgeLines[1].start.y,
            edgeLines[1].end.x, edgeLines[1].end.y).attr({ strokeWidth: width, stroke: color, fill: "black" });

        this.arc(startTop, startBot, true);
        this.arc(endTop, endBot, false);
    }

    private getMoleculeRad(zCompVal: number): number {
        return this.MolMinRad + this.MolRadDelta * Math.abs(zCompVal - this.minZ) / this.widthZ;
    }

    private drawMolecule(pos: any, rad: number, molId: string): void {
        var bigCircle = this.svgCtx.circle(pos.x, pos.y, rad);

        bigCircle.attr({
            fill: "gray"
        });

        var smallCircle = this.svgCtx.circle(pos.x - 0.2 * rad, pos.y - 0.2 * rad, rad);
        smallCircle.attr({
            fill: "white"
        });

        var bigCircleStroke = this.svgCtx.circle(pos.x, pos.y, rad);

        bigCircleStroke.attr({
            fill: "gray",
            "fill-opacity": "0.0",
            stroke: "black",
            strokeWidth: "1"
        });

        var masker = this.svgCtx.group(this.svgCtx.circle(pos.x, pos.y, rad));

        masker.attr({ fill: "#fff" });

        smallCircle.attr({ mask: masker });

        //svgCtx.text(pos.x, pos.y, molId.toString());
    }

    
}