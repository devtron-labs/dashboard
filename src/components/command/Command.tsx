import React, { Component } from 'react'
import { Progressing } from '../common';
import { ReactComponent as ArrowRight } from '../../assets/icons/ic-arrow-forward.svg';
import { getArgumentSuggestions } from './command.util';
import { COMMAND, COMMAND_REV, CommandProps, CommandState, ArgumentType, PlaceholderText, SuggestedArgumentType } from './command.types';
import './command.css';
const FlexSearch = require("flexsearch");
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
        this.state = this.getDefaultState();
        this.selectTab = this.selectTab.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.runCommand = this.runCommand.bind(this);
        this.handleArgumentInputChange = this.handleArgumentInputChange.bind(this);
        this.isSuggestionInView = this.isSuggestionInView.bind(this);
        this.noopOnArgumentInput = this.noopOnArgumentInput.bind(this);
        this.disableTab = this.disableTab.bind(this);
    }

    componentDidMount() {
        document.addEventListener("keydown", this.handleKeyPress);
        this.callGetArgumentSuggestions(this.state.arguments);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.match.url !== this.props.match.url || prevProps.location.pathname !== this.props.location.pathname) {
            let args = this.getDefaultArgs();
            this.setState({ argumentInput: '' }, ()=>{
                this.callGetArgumentSuggestions(args);
            });
        }
        if (this._input.current && (prevState.focussedArgument !== this.state.focussedArgument || this.state.suggestedArguments.length !== prevState.suggestedArguments.length || this.state.argumentInput !== prevState.argumentInput || this.props.isCommandBarActive)) {
            this._input.current.placeholder = this.state.suggestedArguments[this.state.focussedArgument]?.value || PlaceholderText;
            if (!this._input.current.placeholder.startsWith(this.state.argumentInput)) {
                this._input.current.placeholder = "";
            }
        }
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeyPress);
    }

    getDefaultState(): CommandState {
        return {
            isLoading: false,
            focussedArgument: 0,
            argumentInput: '',
            arguments: this.getDefaultArgs(),
            tab: 'this-app',
            command: [{
                label: 'Applications', argument: {
                    value: COMMAND.APPLICATIONS,
                    data: {
                        group: COMMAND_REV.none,
                        groupStart: false,
                        groupEnd: false, isValid: true, isEOC: false
                    }
                }
            },
            {
                label: 'Helm Charts', argument: {
                    value: COMMAND.CHART,
                    data: {
                        group: COMMAND_REV.none,
                        groupStart: false,
                        groupEnd: false, isValid: true, isEOC: false
                    }
                }
            },
            {
                label: 'Security', argument: {
                    value: COMMAND.SECURITY,
                    data: {
                        group: COMMAND_REV.none,
                        groupStart: false,
                        groupEnd: false, isValid: true, isEOC: false
                    }
                }
            },
            {
                label: 'Global Configuration', argument: {
                    value: COMMAND.GLOBAL_CONFIG,
                    data: {
                        group: COMMAND_REV.none,
                        groupStart: false,
                        groupEnd: false, isValid: true, isEOC: false
                    }
                }
            },
            ],
            allSuggestedArguments: [],
            suggestedArguments: [],
            groups: [{ name: '' }],
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

    getDefaultArgs() {
        if (this.props.location.pathname.includes("/app")) return [{
            value: COMMAND.APPLICATIONS, data: {
                group: COMMAND_REV.none,
                groupStart: false,
                groupEnd: false, isValid: true, isEOC: false
            }
        }];
        else if (this.props.location.pathname.includes("/chart-store")) return [{
            value: COMMAND.CHART, data: {
                group: COMMAND_REV.none,
                groupStart: false,
                groupEnd: false, isValid: true, isEOC: false
            }
        }];
        else if (this.props.location.pathname.includes("/global-config")) return [{
            value: COMMAND.GLOBAL_CONFIG,
            data: {
                group: COMMAND_REV.none,
                groupStart: false,
                groupEnd: false,
                isValid: true,
                isEOC: false
            }
        }];
        else if (this.props.location.pathname.includes("/security")) return [{
            value: COMMAND.SECURITY,
            data: {
                group: COMMAND_REV.none,
                groupStart: false,
                groupEnd: false,
                isValid: true,
                isEOC: false
            }
        }];
        return [{
            value: COMMAND.APPLICATIONS,
            data: {
                group: COMMAND_REV.none,
                groupStart: false,
                groupEnd: false,
                isValid: true,
                isEOC: false
            }
        }];
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

    runCommand(): void {
        let focussedArg = this.state.suggestedArguments[this.state.focussedArgument];
        let allArgs = this.state.arguments;
        let candidateArg = this.state.suggestedArguments.find(a => a.value === this.state.argumentInput);

        if (focussedArg) {
            allArgs = [...this.state.arguments, focussedArg];
            this.setState({ arguments: allArgs }, () => {
                let last = allArgs[allArgs.length - 1];
                this.props.history.push(last.data.url);
                this.props.toggleCommandBar(false);
            })
        }
        else {
            if (this.state.argumentInput && candidateArg) {
                allArgs = [...this.state.arguments, candidateArg];
                this.setState({ arguments: allArgs }, () => {
                    let last = allArgs[allArgs.length - 1];
                    this.props.history.push(last.data.url);
                    this.props.toggleCommandBar(false);
                })
            }
            else if (this.state.argumentInput) {
                allArgs = [...this.state.arguments, {
                    value: this.state.argumentInput,
                    data: {
                        isValid: false,
                        isEOC: false,
                        group: 'none',
                        groupEnd: false,
                        groupStart: false
                    }
                }];
                this.setState({ arguments: allArgs, argumentInput: '' })
            }
            else {
                let last = allArgs[allArgs.length - 1];
                this.props.history.push(last.data.url);
                this.props.toggleCommandBar(false);
            }
        }
    }

    callGetArgumentSuggestions(args): void {
        let arg = this.state.arguments.find(a => !a.data?.isValid);
        if (arg) return;

        this.setState({ isLoading: true }, async () => {
            try {
                let response = await getArgumentSuggestions(args);
                this._flexsearchIndex.clear();
                for (let i = 0; i < response.allSuggestionArguments.length; i++) {
                    this._flexsearchIndex.add(response.allSuggestionArguments[i].value, response.allSuggestionArguments[i].value);
                }

                let suggestedArguments = this.applyQueryOnSuggestions(response.allSuggestionArguments, this.state.argumentInput);
                this.setState({
                    arguments: args,
                    suggestedArguments: suggestedArguments,
                    allSuggestedArguments: response.allSuggestionArguments,
                    focussedArgument: -1,
                    isLoading: false,
                });
            } catch (error) {
                this.setState({ isLoading: false });
                console.error(error);
            }
        });
    }

    isSuggestionInView(element): boolean {
        if (!element) return true;

        let container = this._menu;
        let cTop = container.scrollTop;
        let cBottom = cTop + container.clientHeight;
        let eTop = element.offsetTop - 128;
        let eBottom = eTop + element.clientHeight;
        let isTotal = (eTop >= cTop && eBottom <= cBottom);
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
                allArgs.pop();
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
            if (!this.isSuggestionInView(this.state.suggestedArguments[pos]?.ref)) {
                this.state.suggestedArguments[pos]?.ref.scrollIntoView({ behaviour: "smooth", block: "end", });
            }
            this.setState({ focussedArgument: pos });
        }
        else if (this.props.isCommandBarActive && this.state.suggestedArguments.length && event.key === "ArrowUp") {
            let pos = (this.state.focussedArgument - 1) < 0 ? this.state.suggestedArguments.length - 1 : this.state.focussedArgument - 1;
            if (!this.isSuggestionInView(this.state.suggestedArguments[pos]?.ref)) {
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
                        group: COMMAND_REV.none,
                        groupStart: false,
                        groupEnd: false,
                        isValid: false,
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
        let last = this.state.arguments[this.state.arguments.length - 1];
        if (last && !last.data.isValid) return;

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
            let suggestedArguments = this.applyQueryOnSuggestions(this.state.allSuggestedArguments, event.target.value);
            this.setState({
                argumentInput: event.target.value,
                suggestedArguments: suggestedArguments,
                focussedArgument: 0,
            })
        }
    }

    applyQueryOnSuggestions(allSuggestedArguments, searchString: string): SuggestedArgumentType[] {
        if (!searchString) return allSuggestedArguments;

        let argumentsMap = this.state.allSuggestedArguments.reduce((argumentsMap, arg) => {
            argumentsMap[arg.value] = arg.data;
            return argumentsMap;
        }, {});

        let suggestedArguments = [];
        let results = this._flexsearchIndex.search(searchString);
        suggestedArguments = results.map((a) => {
            return {
                value: a,
                data: argumentsMap[a]
            }
        })
        suggestedArguments.sort((a, b) => {
            if (a.data?.group < b.data?.group) return -1;
            else return 0;
        })

        return suggestedArguments;
    }

    renderTabContent() {
        if (this.state.isLoading) {
            return <div className="command__suggested-args-container"><Progressing /></div>
        }
        else if (this.state.tab === 'this-app') {
            let groupStartIndex = this.state.suggestedArguments.findIndex(a => a?.data?.group !== "none");
            let groupEndIndex = this.state.suggestedArguments.findIndex(a => a?.data?.group === "none");

            let lastArg = this.state.arguments[this.state.arguments.length - 1];
            if (lastArg && lastArg.data.isEOC) {
                return <div ref={node => this._menu = node} className="command__suggested-args-container flex column">
                    <h4 className="ff-monospace command__control command__control--tab">&crarr; Enter</h4>
                    <p className="command-empty-state__subtitle">Hit enter to navigate</p>
                </div>
            }
            else return <div ref={node => this._menu = node} className="command__suggested-args-container">
                <div className="suggested-arguments">
                    {this.state.suggestedArguments.map((a, index) => {
                        return <>
                            {index === groupStartIndex ? <h6 key={`${index}-start`} className="suggested-arguments__heading m-0 pl-20 pr-20 pt-5 pb-5">{a?.data?.group}</h6> : ""}
                            {index === groupEndIndex ? <>
                                <hr className="m-0"></hr>
                                <h6 key={`${index}-end`} className="suggested-arguments__heading m-0 pl-20 pr-20 pt-5 pb-5">{this.state.arguments[1]?.value}</h6>
                            </> : ""}
                            <div ref={node => a['ref'] = node} key={`${index}-${a.value}`}
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
        let lastArg = this.state.arguments[this.state.arguments.length - 1];
        if (this.props.isCommandBarActive) {
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
                    <div className="flex column pl-20 pr-20" style={{ backgroundColor: "var(--window-bg)" }}>
                        <div className="command-arg flex top w-100">
                            <div className="flex-1 flex left flex-wrap">
                                {this.state.arguments.map((arg, index) => {
                                    return <>
                                        <span key={`${index}-${arg.value}`} className="command-arg__arg m-4">{arg.value}</span>
                                        {arg.data?.isValid && !arg.data?.isEOC ? <span key={`${index}-/`} className="m-4">/</span> : null}
                                    </>
                                })}
                                {!this.state.arguments[this.state.arguments.length - 1]?.data.isEOC && <div className="position-rel m-4 flex-1" style={{ height: '22px' }}>
                                    <input ref={this._input} type="text" placeholder={PlaceholderText} className="w-100 command__input" />
                                    <input type="text" value={this.state.argumentInput} tabIndex={1} autoFocus className="w-100 command__input"
                                        placeholder="" onKeyDown={this.noopOnArgumentInput} onChange={this.handleArgumentInputChange} />
                                </div>}
                            </div>
                            {this.state.arguments?.find(a => a?.data?.url) &&
                                <span className="ff-monospace command__control p-0 fs-16 mt-4 mb-4" style={{ lineHeight: "1.1", backgroundColor: "var(--N100)" }}>&crarr;</span>
                            }
                        </div>
                    </div>
                    {lastArg && !lastArg?.data.isValid ? <p className="command-empty-state__error pl-20 pr-20 pt-4 pb-4 mb-12">Err! We couldn’t find anything by that name. Try one of the suggestions instead?</p> : null}
                    {this.renderTabContent()}
                </div>
            </div>
        }
        else return null;
    }
}