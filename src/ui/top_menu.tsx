import * as React from "react";
import { ReactNode } from "react";
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';

type Props = {
    mode: string,
    onItemClick: ((itemName: string) => void)
};
type State = {};

export default class TopMenu extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {}        
    }

    public render(): ReactNode {
        return <div className="top-menu">
            <div>
                <ButtonGroup variant="outlined" color="primary" aria-label="outlined primary button group">
                    
                    <Button onClick={() => this.props.onItemClick('Coronene')} disabled={this.props.mode == "Coronene"}>
                        Coronene
                    </Button>
                    
                    <Button onClick={() => this.props.onItemClick('Benzene')} disabled={this.props.mode == "Benzene"}>
                        Benzene
                    </Button>
                    
                    <Button onClick={() => this.props.onItemClick('Butadiene')} disabled={this.props.mode == "Butadiene"}>
                        Butadiene
                    </Button>

                    <Button onClick={() => this.props.onItemClick('Anthracene')} disabled={this.props.mode == "Anthracene"}>
                        Anthracene
                    </Button>

                    <Button onClick={() => this.props.onItemClick('Naphthalene')} disabled={this.props.mode == "Naphthalene"}>
                        Naphthalene
                    </Button>

                    <Button onClick={() => this.props.onItemClick('Perylene')} disabled={this.props.mode == "Perylene"}>
                        Perylene
                    </Button>
                
                </ButtonGroup>
            </div>
        </div>
    }
}