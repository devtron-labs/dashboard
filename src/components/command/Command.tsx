import React, { Component } from 'react'
import { COMMAND, getArgumentSuggestions } from './command.util';
import { RouteComponentProps } from 'react-router-dom';
import { ReactComponent as Arrow } from '../../assets/icons/ic-chevron-down.svg';
import { toast } from 'react-toastify';
import './command.css';
import { Progressing } from '../common';
interface CommandProps extends RouteComponentProps<{}> {
    defaultArguments: ArgumentType[];
    isTabMode: boolean;
    toggleCommandBar: (flag: boolean) => void;
}
export interface ArgumentType {
    value: string;
    data?: {
        readonly kind?: string;
        readonly value?: string | number;
        readonly url?: string;
        readonly isClearable: boolean;
        readonly isValid: boolean;
        // readonly isEOC: boolean;
    }
}

type SuggestedArgumentType = ArgumentType & { focussable: boolean; ref: any; };
interface CommandState {
    argumentInput: string;
    arguments: ArgumentType[];
    command: { label: string; argument: string }[];
    suggestedCommands: any[];
    suggestedArguments: SuggestedArgumentType[];
    isLoading: boolean;
    focussedArgument: number; //index of the higlighted argument
    tab: 'jump-to' | 'this-app';
    showCommandBar: boolean;
    inputPosition: {
        top: string;
        left: string;
    }
}

const PlaceholderText = "Search in applications across devtron";
export class Command extends Component<CommandProps, CommandState>  {
    _input;
    _menu;

    constructor(props) {
        super(props);
        this._input = React.createRef();
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
            tab: 'this-app',
            isLoading: false,
            suggestedCommands: [],
            suggestedArguments: [],
            focussedArgument: 0,
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
        this.isInViewport = this.isInViewport.bind(this);
        this.noopOnArgumentInput = this.noopOnArgumentInput.bind(this);
        this.disableTab = this.disableTab.bind(this);
        // this.toggleCommandBar = this.toggleCommandBar.bind(this);
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
        if (this.state.arguments.length) {
            this.callGetArgumentSuggestions(this.state.arguments);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this._input.current && (prevState.focussedArgument !== this.state.focussedArgument || this.state.suggestedArguments.length !== prevState.suggestedArguments.length || this.state.argumentInput !== prevState.argumentInput || this.state.showCommandBar)) {
            this._input.current.placeholder = this.state.suggestedArguments[this.state.focussedArgument]?.value || PlaceholderText;
            if (!this._input.current.placeholder.startsWith(this.state.argumentInput)) {
                this._input.current.placeholder = "";
            }
        }
    }

    noopOnArgumentInput(event): void {
        if (event.key === "ArrowUp") {
            event.preventDefault();
        }
    }

    disableTab(event): void {
        if (event.key === "Tab") {
            event.preventDefault();
        }
    }

    // toggleCommandBar(flag) {
    //     this.setState({ showCommandBar: flag });
    // }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeyPress);
    }

    selectArgument(arg: ArgumentType): void {
        this.setState({
            arguments: [...this.state.arguments, arg, { value: '/' }],
            argumentInput: '',
            suggestedArguments: []
        }, () => {
            this.callGetArgumentSuggestions(this.state.arguments);
        });
    }

    selectFirstArgument(arg: ArgumentType): void {
        this.setState({
            arguments: [arg, { value: '/' }],
            argumentInput: '',
            suggestedArguments: []
        }, () => {
            this.callGetArgumentSuggestions(this.state.arguments);
        });
    }

    selectTab(event): void {
        this.setState({ tab: event.target.value });
    }

    runCommand() {
        let currentSuggestion = this.state.suggestedArguments[this.state.focussedArgument];
        let newArg = this.state.suggestedArguments.find(a => (a.value === currentSuggestion.value && currentSuggestion.focussable));

        if (newArg) {
            this.setState({ arguments: [...this.state.arguments, newArg, { value: '/' }] }, () => {
                let last = this.state.arguments[this.state.arguments.length - 2];
                this.props.history.push(last.data.url);
                this.props.toggleCommandBar(false)
            })
        }
        else {
            let last = this.state.arguments[this.state.arguments.length - 2];
            this.props.history.push(last.data.url);
            this.props.toggleCommandBar(false)
        }
    }

    callGetArgumentSuggestions(args): void {
        let invalidArgs = args.filter((a) => {
            if (a.value !== "/" && !a.data.isValid) return true;
        })
        if (invalidArgs.length) {
            toast.error("You have at least one Invalid Argument");
            this.setState({
                suggestedArguments: [],
            });
        }
        else {
            this.setState({ isLoading: true });

            getArgumentSuggestions(args).then((response) => {
                response = response.map((a) => {
                    return {
                        ...a,
                        focussable: a.value.includes(this.state.argumentInput)
                    }
                })
                let suggestArgIndex = response.findIndex(a => a.focussable);
                this.setState({
                    suggestedArguments: response,
                    focussedArgument: suggestArgIndex,
                    isLoading: false
                });
            }).catch((error) => {
                this.setState({ isLoading: false })
                console.error(error);
            })
        }
    }

    handleArgumentInputClick() {
        this.callGetArgumentSuggestions(this.state.arguments);
    }

    isInViewport(element): boolean {
        if (!element) return true;

        var container = this._menu;
        var cTop = container.scrollTop;
        var cBottom = cTop + container.clientHeight;
        var eTop = element.offsetTop - 128;
        var eBottom = eTop + element.clientHeight;
        var isTotal = (eTop >= cTop && eBottom <= cBottom);
        return (isTotal);
    }

    handleKeyPress(event) {
        // if (event.metaKey && event.key === '/') {
        //     this.toggleCommandBar(true)
        // }
        // else if (event.key === "Escape") {
        //     this.toggleCommandBar(false)
        // }
        if (event.key === "Enter") {
            this.runCommand();
        }
        else if (event.key === "Tab") {
            this.setState({
                tab: this.state.tab === 'this-app' ? 'jump-to' : 'this-app',
            })
        }
        else if (event.key === 'Backspace') {
            if (!this.state.argumentInput?.length) {
                let allArgs = this.state.arguments;
                if (allArgs[allArgs.length - 2]?.data?.isClearable) {
                    let start = this.state.arguments.length - 2;
                    allArgs.splice(start, 2);
                    this.setState({ arguments: allArgs, argumentInput: '', suggestedArguments: [] }, () => {
                        this.callGetArgumentSuggestions(this.state.arguments);
                    });
                }
            }
        }
        else if (event.key === "ArrowRight") {
            let newArg = this.state.suggestedArguments[this.state.focussedArgument];
            if (!newArg) return;

            this.setState({
                argumentInput: '',
                arguments: [...this.state.arguments, newArg, { value: "/" }],
                suggestedArguments: [],
            }, () => {
                this.callGetArgumentSuggestions(this.state.arguments)
            });

        }
        else if (event.key === "ArrowDown") {
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
            if (!this.isInViewport(this.state.suggestedArguments[pos]?.ref)) {
                this.state.suggestedArguments[pos]?.ref.scrollIntoView({ behaviour: "smooth", block: "end", });
            }
            this.setState({ focussedArgument: pos });

        }
        else if (event.key === "ArrowUp") {
            let pos = -1;
            let focussedArgument = this.state.focussedArgument <= 0 ? this.state.suggestedArguments.length : this.state.focussedArgument;
            for (let i = focussedArgument - 1; i >= 0; i--) {
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
            if (!this.isInViewport(this.state.suggestedArguments[pos]?.ref)) {
                this.state.suggestedArguments[pos]?.ref.scrollIntoView({ behaviour: "smooth", block: "start", });
            }
            this.setState({ focussedArgument: pos });
        }
        else if ((event.key === '/') && this.state.argumentInput.length) {
            let argInput = this.state.argumentInput.trim();
            let newArg = this.state.suggestedArguments.find(a => a.value === argInput);
            let allArgs = [];
            if (!newArg) {
                newArg = {
                    value: this.state.argumentInput, focussable: true, ref: undefined,
                    data: {
                        isValid: false,
                        isClearable: true,
                    }
                };
            }
            allArgs = [...this.state.arguments, newArg, { value: '/' }];
            this.setState({ arguments: allArgs, argumentInput: '', suggestedArguments: [] }, () => {
                this.callGetArgumentSuggestions(this.state.arguments);
            });
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
            let suggestArgIndex = suggestedArguments.findIndex(a => a.focussable);
            this.setState({
                argumentInput: event.target.value,
                suggestedArguments: suggestedArguments,
                focussedArgument: suggestArgIndex,
            })
        }
    }

    renderTabContent() {
        if (this.state.tab === 'this-app') {
            return <div ref={node => this._menu = node} className="command__suggested-args-container">
                {this.state.arguments.length ? <>
                    <div className="suggested-arguments">
                        {this.state.suggestedArguments.map((a, index) => {
                            if (a.focussable)
                                return <div ref={node => a['ref'] = node} key={a.value}
                                    className="pl-20 pr-20 pt-10 pb-10 flexbox flex-justify"
                                    style={{ backgroundColor: this.state.focussedArgument === index ? `var(--N100)` : `var(--N00)` }}>
                                    <button type="button" onClick={(event) => this.selectArgument(a)}>{a.value}</button>
                                    <span className="ff-monospace command__control"
                                        style={{ display: this.state.focussedArgument === index ? 'inline-block' : 'none' }}>
                                        <span className="fs-16" style={{ lineHeight: "1.3" }}>&nbsp;&rarr;&nbsp;</span>to accept</span>
                                </div>
                        })}
                    </div>
                    {this.state.isLoading ? <Progressing /> : null}
                </> : <div className="pl-20 pr-20">
                        <p className="mb-8">I'm looking for...</p>
                        <p className="command-options mb-0">
                            {this.state.command.map((opt) => {
                                return <span key={opt.label} className="command-options__option" onClick={() => this.selectFirstArgument({ value: opt.argument })}>{opt.label}</span>
                            })}
                        </p>
                    </div>}
                {/* <div className="pl-20 pr-20">
                    <p className="mt-18 mb-8">Jump to</p>
                    {this.state.suggestedCommands.map((s) => {
                        return <article className="suggested-command pt-8" key={s.title} onClick={(event) => this.selectFirstArgument(s.argument)}>
                            <Arrow className="scn-4" />
                            <div>
                                <p className="m-0">{s.title}</p>
                                <p className="m-0">{s.desc}</p>
                            </div>
                        </article>
                    })}
                </div> */}
            </div>
        }
        else {
            return <div ref={node => this._menu = node} className="command__suggested-args-container">

            </div>
        }
    }

    render() {
        return <div className="transparent-div" onKeyDown={this.disableTab} onClick={() => this.props.toggleCommandBar(false)}>
            <div className="command" onClick={(event) => event.stopPropagation()}>
                {this.props.isTabMode ? <div className="command-tab">
                    <div className="">
                        <label className={this.state.tab === "this-app" ? "command-tab__tab command-tab__tab-selected" : "command-tab__tab"}>
                            <input type="radio" name="command-tab" checked={this.state.tab === 'this-app'} value="this-app" onChange={this.selectTab} />Applications
                            </label>
                        <label className={this.state.tab === "jump-to" ? "command-tab__tab command-tab__tab-selected" : "command-tab__tab"}>
                            <input type="radio" name="command-tab" checked={this.state.tab === 'jump-to'} value="jump-to" onChange={this.selectTab} />Jump To
                            </label>
                    </div>
                    <span className="command__press-tab ff-monospace">Press <span className="command__control command__control--tab">Tab</span> to switch</span>
                </div> : null}
                <div className="flexbox mb-20" style={{ backgroundColor: "var(--window-bg)" }}>
                    <div className="command-arg flex top w-100">
                        <div className="flex-1 flex left flex-wrap">
                            {this.state.arguments.map((arg, index) => {
                                return <span key={`${index}-${arg.value}`} className={arg.value == "/" ? "m-4" : "command-arg__arg m-4"}>{arg.value}</span>
                            })}
                            <div className="position-rel m-4 flex-1" style={{ height: '22px' }}>
                                <input ref={this._input} type="text" placeholder={PlaceholderText} className="w-100 command__input" />
                                <input type="text" value={this.state.argumentInput} tabIndex={1} autoFocus className="w-100 command__input" placeholder=""
                                    onKeyDown={this.noopOnArgumentInput} onClick={(event) => { this.handleArgumentInputClick() }} onChange={this.handleArgumentInputChange} />
                            </div>
                        </div>
                        {this.state.arguments.find(a => a?.data?.url) &&
                            <span className="ff-monospace command__control p-0 fs-16 mt-4 mb-4" style={{ lineHeight: "1.1", backgroundColor: "var(--N100)" }}> &crarr;</span>
                        }
                    </div>
                </div>
                {this.renderTabContent()}
            </div>
        </div>
    }
}