import React, { Component } from 'react'
import { COMMAND, COMMAND_REV, getArgumentSuggestions } from './command.util';
import { RouteComponentProps } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Progressing } from '../common';
import { ReactComponent as ArrowRight } from '../../assets/icons/ic-arrow-forward.svg';
import './command.css';
const FlexSearch = require("flexsearch");
interface CommandProps extends RouteComponentProps<{}> {
    defaultArguments: ArgumentType[];
    isTabMode: boolean;
    isCommandBarActive: boolean;
    toggleCommandBar: (flag: boolean) => void;
}
export interface ArgumentType {
    value: string;
    readonly data: {
        readonly value?: string | number;
        readonly kind?: string;
        readonly url?: string;
        readonly group?: string;
        readonly isValid: boolean;
        readonly isEOC: boolean;
    }
}

export type SuggestedArgumentType = ArgumentType & { ref: any; };
interface CommandState {
    argumentInput: string;
    arguments: ArgumentType[];
    command: { label: string; argument: ArgumentType; }[];
    suggestedArguments: SuggestedArgumentType[];
    readonly allSuggestedArguments: SuggestedArgumentType[];
    isLoading: boolean;
    focussedArgument: number; //index of the higlighted argument
    tab: 'jump-to' | 'this-app';
    inputPosition: {
        top: string;
        left: string;
    }
}

const PlaceholderText = "Search";
export class Command extends Component<CommandProps, CommandState>  {
    _input;
    _menu;
    _flexsearchIndex;

    constructor(props) {
        super(props);
        this._input = React.createRef();
        this._flexsearchIndex = new FlexSearch({
            encode: "balance",
            tokenize: "full",
            threshold: 0,
            async: false,
            worker: false,
            cache: false,
        });
        this.state = {
            argumentInput: '',
            arguments: this.props.defaultArguments || [],
            command: [
                { label: 'Applications', argument: { value: COMMAND.APPLICATIONS, data: { isValid: true, isEOC: false } } },
                { label: 'Helm Charts', argument: { value: COMMAND.CHART, data: { isValid: true, isEOC: false } } },
                { label: 'Security', argument: { value: COMMAND.SECURITY, data: { isValid: true, isEOC: false } } },
                { label: 'Global Configuration', argument: { value: COMMAND.GLOBAL_CONFIG, data: { isValid: true, isEOC: false } } },
            ],
            tab: 'this-app',
            isLoading: false,
            allSuggestedArguments: [],
            suggestedArguments: [],
            focussedArgument: 0,
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
    }

    componentDidMount() {
        document.addEventListener("keydown", this.handleKeyPress);
        if (this.state.arguments.length) {
            this.callGetArgumentSuggestions(this.state.arguments);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this._input.current && (prevState.focussedArgument !== this.state.focussedArgument || this.state.suggestedArguments.length !== prevState.suggestedArguments.length || this.state.argumentInput !== prevState.argumentInput || this.props.isCommandBarActive)) {
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

    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeyPress);
    }

    getDefaultArgs() {
        if (this.props.location.pathname.includes("app/")) return []
        else if (this.props.location.pathname.includes("chart-store/")) return []
        else if (this.props.location.pathname.includes("global-config/")) return []

    }

    selectArgument(arg: ArgumentType): void {
        this.setState({
            arguments: [...this.state.arguments, arg],
            argumentInput: '',
            suggestedArguments: []
        }, () => {
            this.callGetArgumentSuggestions(this.state.arguments);
        });
    }

    selectFirstArgument(arg: ArgumentType): void {
        this.setState({
            arguments: [arg],
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
        let newArg = this.state.suggestedArguments.find(a => (a.value === currentSuggestion.value));

        if (newArg) {
            this.setState({ arguments: [...this.state.arguments, newArg] }, () => {
                let allArgs = [...this.state.arguments, newArg];
                let last = allArgs[allArgs.length - 1];
                this.props.history.push(last.data.url);
            })
        }
        else {
            let allArgs = this.state.arguments;
            let last = allArgs[allArgs.length - 1];
            this.props.toggleCommandBar(false)
            this.props.history.push(last.data.url);
        }
    }

    callGetArgumentSuggestions(args): void {
        let invalidArgs = args.filter(a => !a.data.isValid);
        if (invalidArgs.length) {
            toast.error("You have at least one Invalid Argument");
            this.setState({
                suggestedArguments: [],
            });
        }
        else {
            this.setState({ isLoading: true });
            getArgumentSuggestions(args).then((response) => {
                this._flexsearchIndex.clear();
                for (let i = 0; i < response.length; i++) {
                    this._flexsearchIndex.add(response[i].value, response[i].value)
                }
                response.sort((a, b) => {
                    if (!a.data?.group || !b.data?.group) return -1;
                    return 0;
                })
                this.setState({
                    suggestedArguments: response,
                    allSuggestedArguments: response,
                    focussedArgument: -1,
                    isLoading: false
                });
            }).catch((error) => {
                this.setState({ isLoading: false });
                console.error(error);
            })
        }
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
        if (event.metaKey && event.key === '/') {
            this.props.toggleCommandBar(true)
        }
        else if (event.key === "Escape") {
            this.props.toggleCommandBar(false)
        }
        else if (this.props.isCommandBarActive && event.key === "Enter") {
            this.runCommand();
        }
        else if (this.props.isCommandBarActive && event.key === "Tab") {
            this.setState({
                tab: this.state.tab === 'this-app' ? 'jump-to' : 'this-app',
            })
        }
        else if (this.props.isCommandBarActive && event.key === 'Backspace') {
            if (!this.state.argumentInput?.length) {
                let allArgs = this.state.arguments;
                let start = this.state.arguments.length - 1;
                allArgs.splice(start, 1);
                this.setState({ arguments: allArgs, argumentInput: '', suggestedArguments: [] }, () => {
                    this.callGetArgumentSuggestions(this.state.arguments);
                });
            }
        }
        else if (this.props.isCommandBarActive && this.state.suggestedArguments.length && event.key === "ArrowRight") {
            let newArg = this.state.suggestedArguments[this.state.focussedArgument];
            if (!newArg) return;

            this.setState({
                argumentInput: '',
                arguments: [...this.state.arguments, newArg],
                suggestedArguments: [],
            }, () => {
                this.callGetArgumentSuggestions(this.state.arguments)
            });

        }
        else if (this.props.isCommandBarActive && this.state.suggestedArguments.length && event.key === "ArrowDown") {
            let pos = (this.state.focussedArgument + 1) % this.state.suggestedArguments.length;
            if (!this.isInViewport(this.state.suggestedArguments[pos]?.ref)) {
                this.state.suggestedArguments[pos]?.ref.scrollIntoView({ behaviour: "smooth", block: "end", });
            }
            this.setState({ focussedArgument: pos });
        }
        else if (this.props.isCommandBarActive && this.state.suggestedArguments.length && event.key === "ArrowUp") {
            let pos = (this.state.focussedArgument - 1) < 0 ? this.state.suggestedArguments.length - 1 : this.state.focussedArgument - 1;
            if (!this.isInViewport(this.state.suggestedArguments[pos]?.ref)) {
                this.state.suggestedArguments[pos]?.ref.scrollIntoView({ behaviour: "smooth", block: "start" });
            }
            this.setState({ focussedArgument: pos });
        }
        else if (this.props.isCommandBarActive && (event.key === '/') && this.state.argumentInput.length) {
            let argInput = this.state.argumentInput.trim();
            let newArg = this.state.suggestedArguments.find(a => a.value === argInput);
            let allArgs = [];
            if (!newArg) {
                newArg = {
                    value: this.state.argumentInput, ref: undefined,
                    data: {
                        isValid: false,
                        group: undefined,
                        isEOC: false
                    }
                };
            }
            allArgs = [...this.state.arguments, newArg];
            this.setState({ arguments: allArgs, argumentInput: '', suggestedArguments: [] }, () => {
                this.callGetArgumentSuggestions(this.state.arguments);
            });
        }
    }

    handleArgumentInputChange(event) {
        if (event.target.value === '/') {
            this.setState({ argumentInput: '', focussedArgument: 0 });
        }
        else if (!event.target.value?.length) {
            this.setState({
                argumentInput: event.target.value,
                suggestedArguments: this.state.allSuggestedArguments,
                focussedArgument: 0,
            })
        }
        else {
            let argumentsMap = this.state.allSuggestedArguments.reduce((argumentsMap, arg) => {
                argumentsMap[arg.value] = arg.data;
                return argumentsMap;
            }, {})
            let suggestedArguments = [];
            let results = this._flexsearchIndex.search(event.target.value);
            suggestedArguments = results.map((a) => {
                return {
                    value: a,
                    data: argumentsMap[a]
                }
            })
            suggestedArguments.sort((a, b) => {
                if (!a.data?.group || !b.data?.group) return -1;
                return 0;
            })
            this.setState({
                argumentInput: event.target.value,
                suggestedArguments: suggestedArguments,
                focussedArgument: 0,
            })
        }
    }

    renderTabContent() {
        if (this.state.tab === 'this-app') {
            let argIndex = this.state.suggestedArguments.findIndex(a => a.data.group);
            return <div ref={node => this._menu = node} className="command__suggested-args-container">
                <div className="suggested-arguments">
                    {this.state.suggestedArguments.map((a, index) => {
                        return <>
                            {index === argIndex ? <h6 className="suggested-arguments__heading m-0 pl-20 pr-20 pt-5 pb-5">{a.data.group}</h6> : ""}
                            <div ref={node => a['ref'] = node} key={a.value}
                                className="pl-20 pr-20 pt-10 pb-10 flexbox"
                                style={{ backgroundColor: this.state.focussedArgument === index ? `var(--N100)` : `var(--N00)` }}>
                                <button type="button" onClick={(event) => this.selectArgument(a)}>{a.value}</button>
                                <span className="ff-monospace command__control ml-20"
                                    style={{ display: this.state.focussedArgument === index ? 'inline-block' : 'none' }}>
                                    <ArrowRight className="icon-dim-16 vertical-align-middle mr-5" /><span>select</span>
                                </span>
                            </div>
                        </>
                    })}
                </div>
                {this.state.isLoading ? <Progressing /> : null}
            </div>
        }
        else {
            return <div ref={node => this._menu = node} className="command__suggested-args-container">
                <div className="pl-20 pr-20">
                    <p className="mb-8">I'm looking for...</p>
                    <p className="command-options mb-0">
                        {this.state.command.map((opt) => {
                            return <span key={opt.label} className="command-options__option" onClick={() => this.selectFirstArgument(opt.argument)}>{opt.label}</span>
                        })}
                    </p>
                </div>
            </div>
        }
    }

    render() {
        if (this.props.isCommandBarActive)
            return <div className="transparent-div" onKeyDown={this.disableTab} onClick={() => this.props.toggleCommandBar(false)}>
                <div className="command" onClick={(event) => event.stopPropagation()}>
                    {this.props.isTabMode ? <div className="command-tab">
                        <div className="">
                            <label className={this.state.tab === "this-app" ? "command-tab__tab command-tab__tab-selected" : "command-tab__tab"}>
                                <input type="radio" name="command-tab" checked={this.state.tab === 'this-app'} value="this-app" onChange={this.selectTab} />
                                {COMMAND_REV[this.state.arguments[0]?.value] || "Applications"}
                            </label>
                            <label className={this.state.tab === "jump-to" ? "command-tab__tab command-tab__tab-selected" : "command-tab__tab"}>
                                <input type="radio" name="command-tab" checked={this.state.tab === 'jump-to'} value="jump-to" onChange={this.selectTab} />
                                Jump To
                            </label>
                        </div>
                        <span className="command__press-tab ff-monospace">Press <span className="command__control command__control--tab">Tab</span> to switch</span>
                    </div> : null}
                    <div className="flexbox mb-20" style={{ backgroundColor: "var(--window-bg)" }}>
                        <div className="command-arg flex top w-100">
                            <div className="flex-1 flex left flex-wrap">
                                {this.state.arguments.map((arg, index) => {
                                    return <>
                                        <span key={`${index}-${arg.value}`} className="command-arg__arg m-4">{arg.value}</span>
                                        {!arg.data?.isEOC ? <span key={`${index}-/`} className="m-4">/</span> : null}
                                    </>
                                })}
                                {!this.state.arguments[this.state.arguments.length - 1]?.data.isEOC && <div className="position-rel m-4 flex-1" style={{ height: '22px' }}>
                                    <input ref={this._input} type="text" placeholder={PlaceholderText} className="w-100 command__input" />
                                    <input type="text" value={this.state.argumentInput} tabIndex={1} autoFocus className="w-100 command__input" placeholder=""
                                        onKeyDown={this.noopOnArgumentInput} onChange={this.handleArgumentInputChange} />
                                </div>}
                            </div>
                            {this.state.arguments.find(a => a?.data?.url) &&
                                <span className="ff-monospace command__control p-0 fs-16 mt-4 mb-4" style={{ lineHeight: "1.1", backgroundColor: "var(--N100)" }}> &crarr;</span>
                            }
                        </div>
                    </div>
                    {this.renderTabContent()}
                </div>
            </div>
        else return null;
    }
}