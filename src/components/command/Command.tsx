import React, { Component } from 'react'
import { getSuggestedCommands } from './command.util';

interface CommandProps {
    defaultArguments: { label: string; value: string; }[];
    isTabMode: boolean;
}

interface CommandState {
    argumentInput: string;
    arguments: { label: string; argument: string }[];
    options: { label: string; argument: string }[];
    suggestedCommands: any[],
    tab: 'jump-to' | 'this-app';
    showCommandBar: boolean;
}

export class Command extends Component<any, CommandState>  {

    constructor(props) {
        super(props);
        this.state = {
            argumentInput: '',
            arguments: this.props.defaultArguments || [],
            options: [
                { label: 'Applications', argument: 'app' },
                { label: 'Helm Charts', argument: '' },
                { label: 'Documentation', argument: '' },
                { label: 'Deployment Group', argument: '' },
                { label: 'Security', argument: '' },
                { label: 'Global Configuration', argument: '' },
            ],
            suggestedCommands: [],
            tab: 'jump-to',
            showCommandBar: false,
        }
        this.selectOption = this.selectOption.bind(this);
        this.selectTab = this.selectTab.bind(this);
        this.invoke = this.invoke.bind(this);
        this.handleArgumentInputChange = this.handleArgumentInputChange.bind(this);
    }

    componentDidMount() {
        document.addEventListener("keydown", this.invoke);
        let suggestedCommands = getSuggestedCommands(this.state.arguments);
        this.setState({ suggestedCommands });
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.invoke);
    }

    selectOption(option: { label: string; argument: string; }): void {
        this.setState({ arguments: [option] });
    }

    selectTab(event): void {
        this.setState({ tab: event.target.value });
    }

    invoke(event) {
        if (event.metaKey && event.key === '/') {
            this.setState({ showCommandBar: true });
        }
        else if (event.key === "Escape") {
            this.setState({ showCommandBar: false });
        }
        else if (event.key === '/') {
            let suggestedCommands = getSuggestedCommands(this.state.arguments);
            this.setState({ suggestedCommands });
        }
    }

    handleArgumentInputChange(event) {
        this.setState({ argumentInput: event.target.value });
    }

    render() {
        if (this.state.showCommandBar) {
            return <div className="command">
                <div>
                    <label>
                        <input type="radio" name="command-tab" value="this-app" onChange={this.selectTab} />This App
                    </label>
                    <label>
                        <input type="radio" name="command-tab" value="jump-to" onChange={this.selectTab} />Jump To
                    </label>
                </div>
                <div>
                    <input type="text" value={this.state.argumentInput} autoFocus onChange={this.handleArgumentInputChange} />
                </div>
            </div>
        }
        return null;
    }
}