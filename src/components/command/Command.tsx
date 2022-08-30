import React, { Component } from 'react'
import { Progressing } from '../common';
import { ReactComponent as ArrowRight } from '../../assets/icons/ic-arrow-forward.svg';
import { getArgumentSuggestions, AllSuggestedArguments } from './command.util';
import { COMMAND_REV, CommandProps, CommandState, ArgumentType, PlaceholderText } from './command.types';
import ReactGA from 'react-ga4';
import './command.css';

const FlexSearch = require("flexsearch");
export class Command extends Component<CommandProps, CommandState>  {
    _inputText;
    _inputPlaceholder;
    _menu;
    _flexsearchIndex;
    controller: AbortController;

    constructor(props) {
        super(props);
        this._inputText = React.createRef();
        this._inputPlaceholder = React.createRef();
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
        this.navigate = this.navigate.bind(this);
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
        if (prevProps.match.url !== this.props.match.url || prevProps.location.pathname !== this.props.location.pathname ||
            (this.props.isCommandBarActive && prevProps.isCommandBarActive !== this.props.isCommandBarActive)) {
            let args = this.getDefaultArgs();
            this.setState({ argumentInput: '', arguments: args, suggestedArguments: [] }, () => {
                this.callGetArgumentSuggestions(args);
            });
        }
        if (this._inputPlaceholder.current && (prevState.focussedArgument !== this.state.focussedArgument ||
            this.state.suggestedArguments.length !== prevState.suggestedArguments.length ||
            this.state.argumentInput !== prevState.argumentInput || this.props.isCommandBarActive)) {
            //Placeholder text handling
            this._inputPlaceholder.current.placeholder = this.state.suggestedArguments[this.state.focussedArgument]?.value || PlaceholderText;
            if (!this._inputPlaceholder.current.placeholder.startsWith(this.state.argumentInput)) {
                this._inputPlaceholder.current.placeholder = "";
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
            isSuggestionError: false,
            arguments: this.getDefaultArgs(),
            tab: 'this-app',
            command: [{
                label: 'Applications',
                argument: AllSuggestedArguments[0],
            },
            {
                label: 'Helm Charts',
                argument: AllSuggestedArguments[1],
            },
            {
                label: 'Security',
                argument: AllSuggestedArguments[2],
            },
            {
                label: 'Global Configuration',
                argument: AllSuggestedArguments[3],
            }],
            allSuggestedArguments: [],
            suggestedArguments: [],
            groupName: undefined,
        }
    }

    noopOnArgumentInput(event): void {
        if (event.key === "ArrowUp") {
            event.preventDefault();
        }
    }

    disableArrowKeys(event): void {
        if (event.key === "ArrowUp" || event.key === "ArrowDown" || event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
        }
    }

    disableTab(event): void {
        if (event.key === "Tab") {
            event.preventDefault();
        }
    }

    getDefaultArgs() {
        if (this.props.location.pathname.includes("/app")) return [AllSuggestedArguments[0]];
        else if (this.props.location.pathname.includes("/chart-store")) return [AllSuggestedArguments[1]];
        else if (this.props.location.pathname.includes("/security")) return [AllSuggestedArguments[2]];
        else if (this.props.location.pathname.includes("/global-config")) return [AllSuggestedArguments[3]];
        else if (this.props.location.pathname.includes("/stack-manager")) return [AllSuggestedArguments[4]];
        return [];
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
            this.setState({ tab: 'this-app' });
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
                this.navigate();
            })
        }
        else {
            if (this.state.argumentInput && candidateArg) {
                allArgs = [...this.state.arguments, candidateArg];
                this.setState({ arguments: allArgs }, () => {
                    this.navigate();
                })
            }
            else if (this.state.argumentInput) {
                this.setState({
                    suggestedArguments: this.state.allSuggestedArguments,
                    argumentInput: '',
                })
            }
            else {
                this.navigate();
            }
        }
    }

    navigate() {
        let last = this.state.arguments[this.state.arguments.length - 1];
        let args = this.state.arguments.reduce((acc, current) => {
            acc = `${acc}/${current.value}`;
            return acc;
        }, "");
        ReactGA.event({
            category: 'Command Bar',
            action: 'Enter',
            label: args,
        });
        this.props.history.push(last.data.url);
        this.props.toggleCommandBar(false);
    }

    callGetArgumentSuggestions(args): void {
        if (!this.props.isCommandBarActive) return;

        let last = this.state.arguments[this.state.arguments.length - 1];
        if (last && last.data.isEOC) return;

        this.setState({ isLoading: true }, async () => {
            try {
                if (this.controller) {
                    this.controller.abort();
                }

                this.controller = new AbortController();
                let options = {
                    signal: this.controller.signal
                }

                let response = await getArgumentSuggestions(args, options);
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
                    groupName: response.groups[0],
                });
                this._inputText?.current?.focus();
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
            this.props.toggleCommandBar(true);
            ReactGA.event({
                category: 'Command Bar',
                action: 'Open (⌘+/)',
                label: `${this.props.location.pathname.replace(/\d+/g, '')}`,
            });
        }
        else if (event.key === "Escape") {
            this.props.toggleCommandBar(false);
            ReactGA.event({
                category: 'Command Bar',
                action: 'Close',
                label: '',
            });
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
                this.setState({ isSuggestionError: true, argumentInput: '', suggestedArguments: this.state.allSuggestedArguments });
            }
            else {
                allArgs = [...this.state.arguments, newArg];
                this.setState({ arguments: allArgs, argumentInput: '', suggestedArguments: [] }, () => {
                    this.callGetArgumentSuggestions(this.state.arguments);
                });
            }
        }
    }

    handleArgumentInputChange(event) {
        if (event.target.value === '/') {
            this.setState({ argumentInput: '' });
        }
        else if (!event.target.value?.length) {
            this.setState({
                argumentInput: event.target.value,
                suggestedArguments: this.state.allSuggestedArguments,
            })
        }
        else {
            let suggestedArguments = this.applyQueryOnSuggestions(this.state.allSuggestedArguments, event.target.value);
            this.setState({
                argumentInput: event.target.value,
                suggestedArguments: suggestedArguments,
                isSuggestionError: false,
            })
        }
    }

    applyQueryOnSuggestions(allSuggestedArguments, searchString: string): ArgumentType[] {
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
            return <div className="command__suggested-args-container mt-8"><Progressing /></div>
        }
        else if (this.state.tab === 'this-app') {
            let lastArg = this.state.arguments[this.state.arguments.length - 1];
            if (lastArg && lastArg.data.isEOC) {
                return <div ref={node => this._menu = node} className="command__suggested-args-container mt-8 flex column">
                    <h4 className="ff-monospace command__control command__control--tab cursor" onClick={this.runCommand}>&crarr; Enter</h4>
                    <p className="command-empty-state__subtitle">Hit enter to navigate</p>
                </div>
            }
            else {
                let groupStart = this.state.suggestedArguments.findIndex(s => s.data?.group !== "misc");
                let groupEnd = this.state.suggestedArguments.findIndex(s => s.data?.group === "misc");
                return <div ref={node => this._menu = node} className="command__suggested-args-container mt-8">
                    <div className="suggested-arguments">
                        {this.state.suggestedArguments.length && this.state.groupName && (groupStart < 0) ? <>
                            <h6 className="pl-20 pr-20 suggested-arguments__heading text-uppercase mb-0">{this.state.groupName}</h6>
                            <div className="pl-20 pr-20 pt-20 pb-20 suggested-arguments__desc">No Environments Configured</div>
                        </> : null}
                        {this.state.suggestedArguments.map((a, index) => {
                            return <>
                                {this.state.groupName && groupStart === index ? <h6 className="pl-20 pr-20 mb-0 suggested-arguments__heading text-uppercase">{this.state.groupName}</h6> : null}
                                {this.state.groupName && groupEnd === index ? <>
                                    <hr className="m-0"></hr>
                                    <h6 className="pl-20 pr-20 mb-0 suggested-arguments__heading">
                                        <span className="text-uppercase">More in </span> "{this.state.arguments[1].value}"
                                    </h6>
                                </> : null}
                                <button ref={node => a['ref'] = node} key={`${index}-${a.value}`} onMouseOver={(e) => this.setState({ focussedArgument: index })} onClick={(event) => this.selectArgument(a)}
                                    className={this.state.focussedArgument === index ? "pl-20 pr-20 pt-6 pb-6 flexbox suggested-arguments__arg bcn-1 cursor" : "pl-20 pr-20 pt-6 pb-6 flexbox suggested-arguments__arg bcn-0 cursor"}>
                                    <span>{a.value}</span>
                                    <span className="ff-monospace command__control ml-20"
                                        style={{ display: this.state.focussedArgument === index ? 'inline-block' : 'none' }}>
                                        <ArrowRight className="icon-dim-16 vertical-align-middle mr-5" /><span>expand</span>
                                    </span>
                                </button>
                            </>
                        })}
                    </div>
                </div>
            }
        }
        else {
            return <div ref={node => this._menu = node} className="command__suggested-args-container mt-8">
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
        if (this.props.isCommandBarActive) {
            return <div className="transparent-div" onKeyDown={this.disableTab}
                onClick={() => {
                    ReactGA.event({
                        category: 'Command Bar',
                        action: 'Close',
                        label: '',
                    });
                    this.props.toggleCommandBar(false);
                }}>
                <div className="command" onClick={(event) => event.stopPropagation()}>
                    <div className="command-tab">
                        <div className="">
                            <label className={this.state.tab === "this-app" ? "command-tab__tab command-tab__tab-selected" : "command-tab__tab"}>
                                <input type="radio" name="command-tab" checked={this.state.tab === 'this-app'} value="this-app" onKeyDown={this.disableArrowKeys} onChange={this.selectTab} />
                                {COMMAND_REV[this.state.arguments[0]?.value] || "Applications"}
                            </label>
                            <label className={this.state.tab === "jump-to" ? "command-tab__tab command-tab__tab-selected" : "command-tab__tab"}>
                                <input type="radio" name="command-tab" checked={this.state.tab === 'jump-to'} value="jump-to" onKeyDown={this.disableArrowKeys} onChange={this.selectTab} />
                                Jump To
                            </label>
                        </div>
                        <span className="command__press-tab ff-monospace">Press <span className="command__control command__control--tab">Tab</span> to switch</span>
                    </div>
                    <div className="flex column pl-20 pr-20" style={{ backgroundColor: "var(--window-bg)" }}>
                        <div className="command-arg flex top w-100">
                            <div className="flex-1 flex left flex-wrap">
                                {this.state.arguments.map((arg, index) => {
                                    return <>
                                        <span key={`${index}-${arg.value}`} className="command-arg__arg m-4">{arg.value}</span>
                                        {!arg.data?.isEOC ? <span key={`${index}-/`} className="m-4">/</span> : null}
                                    </>
                                })}
                                {!this.state.arguments[this.state.arguments.length - 1]?.data?.isEOC && <div className="position-rel m-4 flex-1" style={{ height: '22px' }}>
                                    <input ref={this._inputPlaceholder} type="text" placeholder={PlaceholderText} className="w-100 command__input" />
                                    <input ref={this._inputText} type="text" value={this.state.argumentInput} tabIndex={1} autoFocus className="w-100 command__input"
                                        placeholder="" onKeyDown={this.noopOnArgumentInput} onChange={this.handleArgumentInputChange} />
                                </div>}
                            </div>
                            {this.state.arguments?.find(a => a?.data?.url) &&
                                <span className="ff-monospace command__control p-0 fs-16 mt-4 mb-4 cursor" style={{ lineHeight: "1.1", backgroundColor: "var(--N100)" }} onClick={this.runCommand} >&crarr;</span>
                            }
                        </div>
                    </div>
                    {this.state.isSuggestionError ? <p className="command-empty-state__error pl-20 pr-20 pt-4 pb-4 mb-12">Err! We couldn’t find anything by that name. Try one of the suggestions instead?</p> : null}
                    {this.renderTabContent()}
                </div>
            </div>
        }
        else return null;
    }
}