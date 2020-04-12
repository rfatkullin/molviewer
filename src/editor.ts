import Mol2Parser from "./mol2_parser";
import * as Snap from 'snapsvg';
import Drawer from "./drawer";

export default class Editor {
    private readonly svgCtx: Snap.Paper = null;
    private readonly svgCtxSize: any = null;
    private readonly mol2DataArea: HTMLTextAreaElement = null;
    private readonly svgBoundary: HTMLElement = null;

    private isMouseDown: boolean = true;
    private currMousPos: any = null;
    private mousePrevPos: any = null;
    private drawer: Drawer = null;



    public constructor() {
        this.svgCtx = Snap(600, 600);

        this.svgBoundary = document.getElementById("svg-boundary");
        const svgCtxEl: SVGSVGElement = document.getElementsByTagName("svg")[0];

        this.svgBoundary.appendChild(svgCtxEl);

        this.svgCtxSize = svgCtxEl.getBoundingClientRect();
        this.svgCtxSize.correctedTop = this.svgCtxSize.top + pageYOffset;

        this.mol2DataArea = document.getElementById("mol2-data") as HTMLTextAreaElement;

        this.drawer = new Drawer(this.svgCtx, this.svgCtxSize);
    }

    public init(): void {
        setInterval(() => this.mainLoop(), 33);
    }

    public onDrawClick(): void {
        this.processData(this.mol2DataArea.value);
    }

    public onDownloadClick(): void {
        const element: HTMLAnchorElement = document.createElement('a');
        element.setAttribute("href", "data:application/octet-stream," + encodeURIComponent(this.svgBoundary.innerHTML));
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

        this.drawer.init(atomsBlock, bondsBlock);
        this.drawer.draw();
    }

    private mouseWorldPos(event: any): any {
        if (typeof this.svgCtxSize === 'undefined') {
            return {
                x: 0,
                y: 0
            };
        }

        return {
            x: event.pageX - this.svgCtxSize.left,
            y: this.svgCtxSize.height - (event.pageY - this.svgCtxSize.correctedTop)
        };
    }

    public onMouseMove(event: any): void {
        if (!this.isMouseDown) {
            return;
        }

        this.currMousPos = this.mouseWorldPos(event);

        if (typeof this.svgCtxSize === 'undefined') {
            return;
        }

        if (this.currMousPos.x <= 10 || this.currMousPos.x >= this.svgCtxSize.width ||
            this.currMousPos.y <= 10 || this.currMousPos.y >= this.svgCtxSize.height) {
            this.isMouseDown = false;
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

        this.isMouseDown = true;
        this.currMousPos = this.mouseWorldPos(event);
        this.mousePrevPos = this.currMousPos;
    }

    public onMouseUp(event: any): void {
        this.isMouseDown = !(event.button === 0);
    }

    public mainLoop(): void {
        if (!this.drawer) {
            return;
        }

        if (this.isMouseDown) {
            this.drawer.rotate({ x: this.currMousPos.x - this.mousePrevPos.x, y: this.currMousPos.y - this.mousePrevPos.y });
            this.mousePrevPos = this.currMousPos;

            this.drawer.draw();
        }
    }
}