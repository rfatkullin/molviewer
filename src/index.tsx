import * as React from "react"
import * as ReactDOM from "react-dom"

import Editor from "./editor";
import TopMenu from "./ui/top_menu";
import Button from '@material-ui/core/Button';

import './assets/css/index.css'

import * as coronene from '../data/coronene.mol2';
import * as benzene from '../data/benzene.mol2';
import * as butadiene from '../data/butadiene.mol2';
import * as anthracene from '../data/anthracene.mol2';
import * as naphthalene from '../data/naphthalene.mol2';
import * as perylene from '../data/perylene.mol2';

type MyProps = {};
type MyState = {
  mode: string,
  content: string
};

class App extends React.Component<MyProps, MyState> {
  private readonly _editor: Editor;

  constructor(props: MyProps) {
    super(props)

    this.state = {
      mode: 'Coronene',
      content: coronene.default,
    };

    this._editor = new Editor();

    this.onMenuItemClick = this.onMenuItemClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  public componentDidMount(): void {
    this._editor.init();
    this._editor.onDrawClick();
  }

  public componentDidUpdate(): void {
    this._editor.onDrawClick();
  }

  public render(): React.ReactNode {
    return <div>
      <div>
        <TopMenu mode={this.state.mode} onItemClick={e => this.onMenuItemClick(e)} />
      </div>

      <div id="draw-canvas" onMouseOver={e => this._editor.onMouseMove(e)}>
        <div id="svg-boundary" onMouseDown={e => this._editor.onMouseDown(e)} onMouseUp={e => this._editor.onMouseUp(e)} >
          <Button id="download-button" variant="outlined" onClick={e => this._editor.onDownloadClick()}>  Download </Button>
        </div>

        <textarea id="mol2-data" name="text" value={this.state.content} onChange={this.handleChange}></textarea>
      </div>
    </div>
  }

  private handleChange(event: any): void {
    this.setState({ content: event.target.value });
  }

  private onMenuItemClick(itemName: string): void {
    let newContent: string;

    switch (itemName) {
      case 'Coronene':
        newContent = coronene.default;
        break;

      case 'Benzene':
        newContent = benzene.default;
        break;

      case 'Butadiene':
        newContent = butadiene.default;
        break;

      case 'Anthracene':
        newContent = anthracene.default;
        break;

      case 'Naphthalene':
        newContent = naphthalene.default;
        break;

      case 'Perylene':
        newContent = perylene.default;
        break;

    }

    this.setState({
      mode: itemName,
      content: newContent
    });
  }

}

ReactDOM.render(
  React.createElement(App),
  document.getElementById("react-app")
);