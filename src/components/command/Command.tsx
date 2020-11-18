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
    suggestedArguments: Array<ArgumentType & { focussable: boolean; ref: any; }>;
    showSuggestedArguments: boolean;
    focussedArgument: number; //index
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
                { value: COMMAND.APPLICATIONS, focussable: true, ref: undefined, data: { isValid: true } },
                { value: COMMAND.CHART, focussable: true, ref: undefined, data: { isValid: true } },
                { value: COMMAND.DOCUMENTATION, focussable: true, ref: undefined, data: { isValid: true } },
                { value: COMMAND.DEPLOYMENT_GROUP, focussable: true, ref: undefined, data: { isValid: true } },
                { value: COMMAND.SECURITY, focussable: true, ref: undefined, data: { isValid: true } },
                { value: COMMAND.GLOBAL_CONFIG, focussable: true, ref: undefined, data: { isValid: true } },
            ],
            focussedArgument: 0,
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
        setTimeout(() => {
        }, 1500)
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
        else if (event.key === "Tab") {
        }
        else if (event.key === "Enter") {
            this.runCommand();
        }
        else if (event.key === "ArrowDown") {
            // event.preventDefault();
            //@ts-ignore
            // active.nextSibling.focus();
            let pos = -1;
            let focussedArgument = this.state.focussedArgument < 0 ? 0 : this.state.focussedArgument;
            for (let i = focussedArgument + 1; i < this.state.suggestedArguments.length; i++) {
                if (this.state.suggestedArguments[i].focussable) {
                    pos = i;
                    break;
                }
            }
            if (pos === -1) {
                for (let i = 0; i <= focussedArgument; i++) {
                    if (this.state.suggestedArguments[i].focussable) {
                        pos = i;
                        break;
                    }
                }
            }
            this.setState({
                focussedArgument: pos,
                argumentInput: this.state.suggestedArguments[pos].value,
            });
        }
        else if (event.key === "ArrowUp") {
            let pos = -1;
            let focussedArgument = this.state.focussedArgument <= 0 ? this.state.suggestedArguments.length - 1 : this.state.focussedArgument;
            for (let i = focussedArgument - 1; i >= 0; i--) {
                console.log(this.state.suggestedArguments[i])
                if (this.state.suggestedArguments[i].focussable) {
                    pos = i;
                    break;
                }
            }
            if (pos === -1) {
                for (let i = this.state.suggestedArguments.length - 1; i >= focussedArgument; i--) {
                    if (this.state.suggestedArguments[i].focussable) {
                        pos = i;
                        break;
                    }
                }
            }
            this.setState({
                focussedArgument: pos,
                argumentInput: this.state.suggestedArguments[pos].value,
            });
        }
        else if (event.key === "ArrowRight") {
            this.setState({
                argumentInput: this.state.suggestedArguments[this.state.focussedArgument].value,
            });
        }
        else if ((event.key === '/') && this.state.argumentInput.length) {
            let argInput = this.state.argumentInput.trim();
            let newArg = this.state.suggestedArguments.find(a => a.value === argInput);
            if (!newArg) newArg = { value: this.state.argumentInput, focussable: true, ref: undefined, data: { isValid: false } }
            let allArgs = [...this.state.arguments, newArg, { value: '/' }];
            this.setState({ arguments: allArgs, argumentInput: '' }, () => {
                getArgumentSuggestions(allArgs).then((response) => {
                    this.setState({
                        showSuggestedArguments: true,
                        suggestedArguments: response,
                    });
                })
            });
        }
        else if (event.key === 'Backspace') {
            this.setState({ focussedArgument: 0 });
            if (!this.state.argumentInput.length) {
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
    }

    handleArgumentInputChange(event) {
        if (event.target.value === "/") {
            this.setState({ argumentInput: '', focussedArgument: 0 });
        }
        else {
            let suggestedArguments = this.state.suggestedArguments;
            suggestedArguments = suggestedArguments.map((s) => {
                return {
                    ...s,
                    focussable: s.value.includes(event.target.value)
                }
            })
            this.setState({
                argumentInput: event.target.value,
                suggestedArguments: suggestedArguments,
                showSuggestedArguments: true,
                focussedArgument: 0,
            });
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
                    <div className="command-arg" tabIndex={0}>
                        {this.state.arguments.map((arg, index) => {
                            return <span key={`${index}-${arg.value}`} className={arg.value !== "/" ? "command-arg__arg m-4" : "ml-4 mr-4"}>{arg.value}</span>
                        })}
                        <input type="text" value={this.state.argumentInput} tabIndex={1} autoFocus className="m-4 flex-1 command__input"
                            placeholder="Search for anything accross devtron" onClick={(event) => { this.handleArgumentInputClick() }} onChange={this.handleArgumentInputChange} />
                    </div>
                    <div style={{ height: '350px', overflow: 'auto' }}>
                        {this.state.arguments.length ?
                            <div className="suggested-arguments" tabIndex={0}>
                                {this.state.showSuggestedArguments && this.state.suggestedArguments.map((a, index) => {
                                    if (a.focussable)
                                        return <button type="button"
                                            className=""
                                            value={a.value}
                                            // ref={a[index].ref}
                                            style={{ backgroundColor: this.state.focussedArgument === index ? `var(--N100)` : `var(--N00)` }}
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