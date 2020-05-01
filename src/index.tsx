import * as React from "react"
import * as ReactDOM from "react-dom"

import Editor from "./editor";
import TopMenu from "./ui/top_menu";

type MyProps = {};
type MyState = {
  mode: string
};

class App extends React.Component<MyProps, MyState> {
  private readonly _editor: Editor;

  constructor(props: MyProps) {
    super(props)

    this.state = {
      mode: 'Coronene'
    };

    this._editor = new Editor();

    this.onMenuItemClick = this.onMenuItemClick.bind(this);
  }

  public componentDidMount(): void {
    this._editor.init();
  }

  public render(): React.ReactNode {
    return <div>
      <div>
        <TopMenu mode={this.state.mode} onItemClick={e => this.onMenuItemClick(e)} />
      </div>
      <div id="draw-canvas" onMouseOver={e => this._editor.onMouseMove(e)}>

        <div id="svg-boundary" onMouseDown={e => this._editor.onMouseDown(e)} onMouseUp={e => this._editor.onMouseUp(e)} ></div>

        <p>
          <textarea id="mol2-data" name="text"></textarea>
        </p>
        <button id="draw-button" onClick={e => this._editor.onDrawClick()} >Draw</button>
        <button id="download-button" onClick={e => this._editor.onDownloadClick()}>Download as SVG</button>

      </div>
    </div>
  }

  private onMenuItemClick(itemName: string): void {
    this.setState({
      mode: itemName
    });
  }

}

ReactDOM.render(
  React.createElement(App),
  document.getElementById("react-app")
);