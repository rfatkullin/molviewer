import Editor from "./editor";

const workArea: HTMLElement = document.getElementById("draw-canvas")
const svgCanvas: HTMLElement = document.getElementById("svg-boundary")
const saveAnchor: HTMLElement = document.getElementById("save-anchor")
const drawButton: HTMLElement = document.getElementById("save-button")

const editor: Editor = new Editor();
editor.init();

workArea.addEventListener("mouseover", (event) => editor.onMouseMove(event))

svgCanvas.addEventListener("mousedown", (event) => editor.onMouseDown(event))
svgCanvas.addEventListener("mouseup", (event) => editor.onMouseUp(event))

saveAnchor.addEventListener("click", () => editor.onSaveClick())
drawButton.addEventListener("click", () => editor.onDrawClick())
