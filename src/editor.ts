import Mol2Parser from "./mol2_parser";
import * as Snap from 'snapsvg';
import Drawer from "./drawer";
import Configs from "./config";
import Vector from "./vector";

export default class Editor {
    private readonly _svgCtx: Snap.Paper = null;
    private readonly _svgCtxSize: any = null;
    private readonly _mol2DataArea: HTMLTextAreaElement = null;
    private readonly _svgBoundary: HTMLElement = null;

    private _isMouseDown: boolean = false;
    private _currMousPos: Vector = null;
    private _mousePrevPos: Vector = null;
    private _drawer: Drawer = null;

    public constructor() {
        this._svgCtx = Snap(600, 600);

        this._svgBoundary = document.getElementById("svg-boundary");
        const svgCtxEl: SVGSVGElement = document.getElementsByTagName("svg")[0];

        this._svgBoundary.appendChild(svgCtxEl);

        this._svgCtxSize = svgCtxEl.getBoundingClientRect();
        this._svgCtxSize.correctedTop = this._svgCtxSize.top + pageYOffset;

        this._mol2DataArea = document.getElementById("mol2-data") as HTMLTextAreaElement;

        this._drawer = new Drawer(this._svgCtx, this._svgCtxSize);
    }

    public init(): void {
        setInterval(() => this.mainLoop(), Configs.FrameRenderTime);
    }

    public onDrawClick(): void {
        this.processData(this._mol2DataArea.value);
    }

    public onDownloadClick(): void {
        const element: HTMLAnchorElement = document.createElement('a');
        element.setAttribute("href", "data:application/octet-stream," + encodeURIComponent(this._svgBoundary.innerHTML));
        element.setAttribute("download", "scene.svg");

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    private processData(content: string): any {
        if (!content) {
            return;
        }

        const atomsBlock = Mol2Parser.getBlock("ATOM", content);
        const bondsBlock = Mol2Parser.getBlock("BOND", content);

        this._drawer.init(atomsBlock, bondsBlock);
        this._drawer.draw();
    }

    private mouseWorldPos(event: any): Vector {
        if (!this._svgCtxSize) {
            return Vector.Empty();
        }

        return {
            x: event.pageX - this._svgCtxSize.left,
            y: this._svgCtxSize.height - (event.pageY - this._svgCtxSize.correctedTop),
            z: 0
        };
    }

    public onMouseMove(event: any): void {
        if (!this._isMouseDown) {
            return;
        }

        this._currMousPos = this.mouseWorldPos(event);

        if (!this._svgCtxSize) {
            return;
        }

        if (this._currMousPos.x <= 10 || this._currMousPos.x >= this._svgCtxSize.width ||
            this._currMousPos.y <= 10 || this._currMousPos.y >= this._svgCtxSize.height) {
            this._isMouseDown = false;
        }
    }

    public onMouseDown(event: any): void {
        if (event.button !== 0) {
            return;
        }

        if (event.preventDefault) {
            event.preventDefault();
            event.stopPropagation();
        }
        else {
            event.returnValue = false;
            event.cancelBubble = true;
        }

        this._isMouseDown = true;
        this._currMousPos = this.mouseWorldPos(event);
        this._mousePrevPos = this._currMousPos;
    }

    public onMouseUp(event: any): void {
        this._isMouseDown = !(event.button === 0);
    }

    public mainLoop(): void {
        if (!this._drawer) {
            return;
        }

        if (this._isMouseDown) {
            this._drawer.rotate({ x: this._currMousPos.x - this._mousePrevPos.x, y: this._currMousPos.y - this._mousePrevPos.y });
            this._mousePrevPos = this._currMousPos;

            this._drawer.draw();
        }
    }
}