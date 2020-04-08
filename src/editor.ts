import Mol2Parser from "./mol2_parser";
import * as Snap from 'snapsvg';

export default class Editor {
    private svgCtx: any = Snap(600, 600);
    private svgCtxSize: any = null;
    private isMouseDown: boolean = true;
    private currMousPos: any = this.mouseWorldPos(event);
    private mousePrevPos: any = this.currMousPos;
    private drawer: any = null;

    public init(): void {
        setInterval(this.mainLoop, 33);
    }

    public onLoad(): void {
        this.svgCtx = Snap(600, 600);

        var svgBoundary = document.getElementById("svg_boundary"),
            svgCtxEl = document.getElementsByTagName("svg")[0];

        svgBoundary.appendChild(svgCtxEl);

        this.svgCtxSize = svgCtxEl.getBoundingClientRect();
        this.svgCtxSize.correctedTop = this.svgCtxSize.top + pageYOffset;
    }

    private onDrawClick(): void {
        const selectObj: any = document.getElementById("fileSelect");

        //this.processData(document.getElementById("mol2data").value);
    }

    public onSaveClick(): void {
        var svgBoundary = document.getElementById("svg_boundary"),
            anchor = document.getElementById("save_anchor");

        anchor.setAttribute("href", "data:application/octet-stream," + encodeURIComponent(svgBoundary.innerHTML));
        anchor.setAttribute("download", "scene.svg");
    }

    private processData(content: any): any {
        var atomsBlock,
            bondsBlock;

        if (content) {
            atomsBlock = Mol2Parser.getBlock("ATOM", content);
            bondsBlock = Mol2Parser.getBlock("BOND", content);
            this.drawer = new this.drawer(atomsBlock, bondsBlock);
            this.drawer.Draw();
        }
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
        if (event.button === 0) {
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
    }

    public onMouseUp(event: any): void {
        this.isMouseDown = !(event.button === 0);
    }

    public mainLoop(): void {
        if (!this.drawer) {
            return;
        }

        if (this.isMouseDown) {
            this.drawer.Rotate({ x: this.currMousPos.x - this.mousePrevPos.x, y: this.currMousPos.y - this.mousePrevPos.y });
            this.mousePrevPos = this.currMousPos;

            this.drawer.Draw();
        }
    }    
}