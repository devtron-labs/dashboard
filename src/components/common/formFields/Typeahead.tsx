import React, { Component, createContext } from 'react';
import dropdown from '../../../assets/icons/appstatus/ic-chevron-down.svg';
import { isArrayEqual } from '../helpers/util';
//id must exist
const TypeaheadContext = createContext({ name: "", search: "", multi: false, labelKey: 0 as any, selections: [], selectItem: (item) => { }, onChange: (...args: any[]) => { } });

export interface TypeaheadProps {
    dataTestIdContainer?: string;
    dataTestIdInput?: string;
    onChange: (...args: any[]) => void;
    defaultSelections?: any[];
    labelKey: string | number;
    name: string;
    label: string;
    disabled?: boolean;
    multi?: boolean;
}

export class Typeahead extends Component<TypeaheadProps, { defaultSelections: any[], search: string, showMenu: boolean, selections: any[] }> {
    constructor(props) {
        super(props);
        this.state = {
            search: "",
            showMenu: false,
            selections: [],
            defaultSelections: [],
        }
    }

    static getDerivedStateFromProps(nextProps, state) {
        if (!isArrayEqual(nextProps.defaultSelections, state.defaultSelections, nextProps.labelKey)) {
            return {
                selections: nextProps.defaultSelections,
                defaultSelections: nextProps.defaultSelections,
            }
        }
        return null;
    }

    handleClick = (event: React.MouseEvent): void => {
        event.stopPropagation();
        this.setState({ search: "", showMenu: false });
    }

    selectItem = (item): void => {
        let { selections } = { ...this.state };
        if (!this.props.multi) selections = [];
        selections.push(item);
        this.setState({ selections, showMenu: this.props.multi ? true : false }, () => {
            this.props.onChange(selections);
        });
    }

    removeItem = (item): void => {
        let { selections } = { ...this.state };
        selections = selections.filter(e => item.id !== e.id);
        this.setState({ selections });
    }

    onChange = (event) => {
        let searchStr = event.target.value;
        this.setState({ search: searchStr });
    }

    renderSingleSelection() {
        const { selections } = { ...this.state };
        let selection = selections.length && !this.state.showMenu ? selections[0] : undefined;
        let classes = this.props.disabled ? "typeahead__single-selection disabled" : "typeahead__single-selection";
        return <label className="w-100">
            <span className="form__label">{this.props.label}</span>
            <span data-testid = {this.props.dataTestIdContainer} style={{ 'position': 'relative', 'display': 'block' }}>
                {selection
                    ? <span className={classes} onClick={() => { if (!this.props.disabled) this.setState({ showMenu: true }) }}>{selection[this.props.labelKey]}</span>
                    : <input data-testid = {this.props.dataTestIdInput} type="text" value={this.state.search} placeholder={"Select"} disabled={this.props.disabled}
                        className={classes}
                        onClick={() => { if (!this.props.disabled) this.setState({ showMenu: true }) }}
                        onChange={this.onChange} />}
                <img src={dropdown} className="typeahead__dropdown-icon" />
            </span>
        </label>
    }

    renderMultiSelection() {
        const { selections } = { ...this.state };
        let showSelection = selections.length;
        return <label className="w-100">
            <span className="form__label">{this.props.label}</span>
            <span className="typeahead__multi-selection" style={{ border: this.props.multi ? "solid 1px #d2d2d2" : "none", 'display': 'block' }}
                onClick={() => { this.setState({ showMenu: true }) }}>
                {showSelection
                    ? <>
                        {selections.map((item) => {
                            return <span className="selection-chip"
                                onClick={(e) => { this.removeItem(item) }}>{item[this.props.labelKey]}</span>
                        })}
                    </> : null}
                <input type="text" value={this.state.search} placeholder={"Select"} disabled={this.props.disabled}
                    className={"typeahead__search-multi"}
                    onClick={() => { this.setState({ showMenu: true }) }}
                    onChange={this.onChange} />
                <img src={dropdown} className="typeahead__dropdown-icon" />
            </span>
        </label>
    }

    render() {
        return <TypeaheadContext.Provider value={{
            name: this.props.name,
            search: this.state.search,
            selections: this.state.selections,
            multi: this.props.multi,
            labelKey: this.props.labelKey,
            selectItem: this.selectItem,
            onChange: this.props.onChange,
        }}>
            {this.state.showMenu ? <div className="dc__transparent-div" onClick={this.handleClick}></div> : null}
            {this.props.multi ? this.renderMultiSelection() : this.renderSingleSelection()}
            {this.state.showMenu ? <ul className="typeahead__menu">{this.props.children}</ul> : null}
        </TypeaheadContext.Provider>
    }
}

export class TypeaheadOption extends Component<{ dataTestIdMenuList?: string, item: any, id: number | string }> {
    render() {
        return <TypeaheadContext.Consumer>
            {(context) => {
                if (context.search.length && this.props.item[context.labelKey].search(context.search) === -1)
                    return null;
                else return <>
                    <li data-testid = {this.props.dataTestIdMenuList} className="typeahead__menu-item" key={this.props.id}
                        onClick={(event) => { context.selectItem(this.props.item); }}>
                        {this.props.children}
                    </li>
                </>
            }}
        </TypeaheadContext.Consumer>
    }
}

export class TypeaheadErrorOption extends Component<{ className?: string }> {
    render() {
        return <TypeaheadContext.Consumer>
            {(context) => {
                let classes = this.props.className ? `${this.props.className} typeahead__menu-item` : `typeahead__menu-item`
                return <>
                    <li className={classes}>
                        {this.props.children}
                    </li>
                </>
            }}
        </TypeaheadContext.Consumer>
    }
}