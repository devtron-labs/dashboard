import React, { Component } from 'react'
import { getArgumentSuggestions } from './command.util';
import { RouteComponentProps } from 'react-router-dom';
import { ReactComponent as Arrow } from '../../assets/icons/ic-chevron-down.svg';
import './command.css';
interface CommandProps extends RouteComponentProps<{}> {
    defaultArguments: { label: string; value: string; }[];
    isTabMode: boolean;
}
export interface ArgumentType {
    value: string;
    data?: {
        kind?: string;
        value?: string | number;
        url?: string;
        isValid: boolean;
    }
}
interface CommandState {
    argumentInput: string;
    arguments: ArgumentType[];
    command: { label: string; argument: string }[];
    suggestedCommands: any[];
    suggestedArguments: any[];
    showSuggestedArguments: boolean;
    tab: 'jump-to' | 'this-app';
    showCommandBar: boolean;
    inputPosition: {
        top: string;
        left: string;
    }
}

const COMMAND = {
    APPLICATIONS: 'app',
    CHART: 'chart',
    DOCUMENTATION: 'docs',
    DEPLOYMENT_GROUP: 'deployment-group',
    SECURITY: 'security',
    GLOBAL_CONFIG: 'global-config'
}

export class Command extends Component<any, CommandState>  {
    _input;
    constructor(props) {
        super(props);
        this.state = {
            argumentInput: '',
            arguments: this.props.defaultArguments || [],
            command: [
                { label: 'Applications', argument: COMMAND.APPLICATIONS },
                { label: 'Helm Charts', argument: COMMAND.CHART },
                { label: 'Documentation', argument: COMMAND.DOCUMENTATION },
                { label: 'Deployment Group', argument: COMMAND.DEPLOYMENT_GROUP },
                { label: 'Security', argument: COMMAND.SECURITY },
                { label: 'Global Configuration', argument: COMMAND.GLOBAL_CONFIG },
            ],
            tab: 'jump-to',
            suggestedCommands: [],
            suggestedArguments: [
                { value: COMMAND.APPLICATIONS, data: { isEOC: false, isValid: true } },
                { value: COMMAND.CHART, data: { isEOC: false, isValid: true } },
                { value: COMMAND.DOCUMENTATION, data: { isEOC: false, isValid: true } },
                { value: COMMAND.DEPLOYMENT_GROUP, data: { isEOC: false, isValid: true } },
                { value: COMMAND.SECURITY, data: { isEOC: false, isValid: true } },
                { value: COMMAND.GLOBAL_CONFIG, data: { isEOC: false, isValid: true } },
            ],
            showSuggestedArguments: false,
            showCommandBar: false,
            inputPosition: {
                top: '0px',
                left: '0px'
            }
        }
        this.selectTab = this.selectTab.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.runCommand = this.runCommand.bind(this);
        this.handleArgumentInputChange = this.handleArgumentInputChange.bind(this);
    }

    componentDidMount() {
        document.addEventListener("keydown", this.handleKeyPress);
        this.setState({
            suggestedCommands: [
                { title: 'Go to app', desc: 'app/app_name', argument: { value: 'app' } },
                { title: 'To a section in an application', desc: 'app/app_name/configure', argument: { value: 'app' } },
                { title: 'Other locations', desc: 'Try user access or helm charts', argument: { value: 'app' } },
            ]
        });
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeyPress);
    }

    selectArgument(arg: ArgumentType): void {
        this.setState({
            arguments: [...this.state.arguments, arg, { value: '/' }],
            argumentInput: '',
        }, () => {
            let last = this.state.arguments[this.state.arguments.length - 2];
            this._input.focus();
            getArgumentSuggestions(this.state.arguments)?.then((response) => {
                this.setState({
                    showSuggestedArguments: true,
                    suggestedArguments: response,
                });
            })
        });
    }

    selectFirstArgument(arg: ArgumentType): void {
        this.setState({
            arguments: [arg, { value: '/' }],
            argumentInput: '',
        }, () => {
            getArgumentSuggestions(this.state.arguments)?.then((response) => {
            this._input.focus();

                this.setState({
                    showSuggestedArguments: true,
                    suggestedArguments: response,

                });
            })
        });
    }

    selectTab(event): void {
        this.setState({ tab: event.target.value });
    }

    runCommand() {
        let newArg = this.state.suggestedArguments.find(a => a.value === this.state.argumentInput);
        if (newArg) {
            this.setState({ arguments: [...this.state.arguments, newArg, { value: '/' }] }, () => {
                let last = this.state.arguments[this.state.arguments.length - 2];
                this.props.history.push(last.data.url);
            })
        }
        else {
            let last = this.state.arguments[this.state.arguments.length - 2];
            this.props.history.push(last.data.url);
        }
    }

    handleArgumentInputClick() {
        let last = this.state.arguments[this.state.arguments.length - 2];

        getArgumentSuggestions(this.state.arguments).then((response) => {
            this.setState({
                suggestedArguments: response,

            });
        })
    }

    handleKeyPress(event) {
        if (event.metaKey && event.key === '/') {
            this.setState({ showCommandBar: true });
        }
        else if (event.key === "Escape") {
            this.setState({ showCommandBar: false, showSuggestedArguments: false });
        }
        else if (event.key === "Enter") {
            this.runCommand()
        }
        else if ((event.key === '/') && this.state.argumentInput.length) {
            let argInput = this.state.argumentInput.trim();
            let newArg = this.state.suggestedArguments.find(a => a.value === argInput);
            if (!newArg) newArg = { value: this.state.argumentInput, data: { isValid: false } }
            let allArgs = [...this.state.arguments, newArg, { value: '/' }];
            this.setState({ arguments: allArgs, argumentInput: '' }, () => {
            this._input.focus();

                getArgumentSuggestions(allArgs).then((response) => {
                    this.setState({
                        showSuggestedArguments: true,
                        suggestedArguments: response,
                    });
                })
            });
        }
        else if (event.key === 'Backspace' && !this.state.argumentInput.length) {
            let allArgs = this.state.arguments;
            let start = this.state.arguments.length - 2;
            allArgs.splice(start, 2);
            this.setState({ arguments: allArgs, argumentInput: '' }, () => {
                getArgumentSuggestions(allArgs).then((response) => {
                    this.setState({
                        showSuggestedArguments: true,
                        suggestedArguments: response,
                    });
                })
            });
        }
    }

    handleArgumentInputChange(event) {
        if (event.target.value === "/") {
            this.setState({ argumentInput: '', });
        }
        else {
            this.setState({ argumentInput: event.target.value, showSuggestedArguments: true });
        }
    }

    render() {
        if (this.state.showCommandBar) {
            return <div className="transparent-div" onClick={() => this.setState({ showCommandBar: false })}>
                <div className="command" onClick={(event) => event.stopPropagation()}>
                    {this.props.isTabMode ? <div>
                        <label>
                            <input type="radio" name="command-tab" value="this-app" onChange={this.selectTab} />This App
                        </label>
                        <label>
                            <input type="radio" name="command-tab" value="jump-to" onChange={this.selectTab} />Jump To
                        </label>
                    </div> : null}
                    <div className="command-arg">
                        {this.state.arguments.map((arg, index) => {
                            return <span key={`${index}-${arg.value}`} className={arg.value !== "/" ? "command-arg__arg m-4" : "ml-4 mr-4"}>{arg.value}</span>
                        })}
                        <input type="text" ref={(c) => this._input = c}  tabIndex={1} value={this.state.argumentInput} autoFocus className="m-4 flex-1 command__input"
                            placeholder="Search for anything accross devtron" onClick={(event) => { this.handleArgumentInputClick() }} onChange={this.handleArgumentInputChange} />
                    </div>
                    <div style={{ height: '350px', overflow: 'auto' }}>
                        {this.state.arguments.length ?
                            <div className="suggested-arguments" tabIndex={0}>
                                {this.state.showSuggestedArguments && this.state.suggestedArguments.map((a, index) => {
                                    //Filter on type
                                    if (!this.state.argumentInput.length) return <button type="button" className="" tabIndex={index + 1}
                                        onClick={(event) => this.selectArgument(a)}>{a.value}</button>
                                    else if (this.state.argumentInput.length && a.value.includes(this.state.argumentInput))
                                        return <button type="button" className="" tabIndex={index + 1}
                                            onClick={(event) => this.selectArgument(a)}>{a.value}</button>

                                })}
                            </div> : <div className="p-8" onClick={(e) => { this.setState({ showSuggestedArguments: false }) }}>
                                <p className="mt-18 mb-8">I'm looking for...</p>
                                <p className="command-options mb-0">
                                    {this.state.command.map((opt) => {
                                        return <span key={opt.label} className="command-options__option" onClick={() => this.selectFirstArgument({ value: opt.argument })}>{opt.label}</span>
                                    })}
                                </p>
                            </div>}
                        <div className="" onClick={(e) => { this.setState({ showSuggestedArguments: false }) }}>
                            <p className="mt-18 mb-8 ml-8 mr-8">Jump to</p>
                            {this.state.suggestedCommands.map((s) => {
                                return <article className="suggested-command p-8" key={s.title} onClick={(event) => this.selectFirstArgument(s.argument)}>
                                    <Arrow className="scn-4" />
                                    <div>
                                        <p className="m-0">{s.title}</p>
                                        <p className="m-0">{s.desc}</p>
                                    </div>
                                </article>
                            })}
                        </div>
                    </div>
                </div>
            </div>
        }
        return null;
    }
}