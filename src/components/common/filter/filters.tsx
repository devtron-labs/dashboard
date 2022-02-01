import React, { Component } from 'react';
import { FilterProps, FilterState } from './types';
import { Progressing } from '../../common';
import './filter.css';
import Tippy from '@tippyjs/react';

export class Filter extends Component<FilterProps, FilterState>{
    node;

    constructor(props) {
        super(props);
        this.state = {
            list: this.props.list.map((item) => { return { ...item } }),
            filteredList: this.props.list.map((item) => { return { ...item } }),
            searchStr: "",
            show: false,
        }
    }

    componentDidMount() {
        let list = JSON.parse(JSON.stringify(this.props.list));
        this.setState({ list, filteredList: list });
    }

    componentWillReceiveProps(nextProps) {
        let _searchKey = this._getSearchKey();
        let list = JSON.parse(JSON.stringify(nextProps.list));
        let filteredList = list.filter(item => item[_searchKey].search(this.state.searchStr.toLocaleLowerCase()) != -1);
        this.setState({ list, filteredList });
    }

    handleClick = (event: React.MouseEvent): void => {
        event.stopPropagation();
        let _show = false;
        let list = JSON.parse(JSON.stringify(this.props.list));
        this.setState({ list: list, filteredList: list, searchStr: "", show: _show });
        this.notifiyShowHideFilterContent(_show);
    }

    handleSearch = (event): void => {
        let _searchKey = this._getSearchKey();
        let searchStr = event.target.value;
        let filteredList = this.state.list.filter((item) => {
            if (item[_searchKey].search(searchStr.toLocaleLowerCase()) != -1) {
                return {
                    key: item.key,
                    label: item.label,
                    isSaved: item.isSaved,
                    isChecked: item.isChecked,
                }
            }
        });
        this.setState({ filteredList, searchStr });
    }

    handleSelection = (event) => {
        let list = this.state.list;
        list = list.map((item) => {
            return {
                ...item,
                isChecked: (event.target.value == item.key) ? event.target.checked : item.isChecked,
                isSaved: (event.target.value == item.key) ? !item.isSaved : item.isSaved
            }
        })
        let searchStr = this.state.searchStr;
        let filteredList = list.filter(item => item.label.search(searchStr.toLocaleLowerCase()) != -1)
        this.setState({ list, filteredList: filteredList });
    }

    shouldApplyFilter = (): boolean => {
        let unsavedFilters = this.state.list.filter(item => !item.isSaved) || [];
        return !(unsavedFilters.length > 0);
    }

    applyFilter = (): void => {
        let _show = false;
        this.setState({ show: _show });
        this.props.applyFilter(this.props.type, this.state.list);
        this.notifiyShowHideFilterContent(_show);
    }

    getSavedFilter = (): number => {
        let count = 0;
        this.props.list.map((item) => {
            if (item.isChecked) count++;
        })
        return count;
    }

    onFilterButtonClick = () : void => {
        let _show = !this.state.show;
        this.setState({ show: _show });
        this.notifiyShowHideFilterContent(_show);
    }

    notifiyShowHideFilterContent = (show : boolean) : void => {
        if(this.props.onShowHideFilterContent){
            this.props.onShowHideFilterContent(show);
        }
    }

    _getSearchKey = () : string => {
        let _searchKey = this.props.searchKey || this.props.labelKey;
        return _searchKey;
    }

    render() {
        let classNames = this.state.show ? "filter__menu filter__menu--show" : "filter__menu";
        let faIcon = this.state.show ? "fa fa-caret-up" : "fa fa-caret-down";
        let isDisable = this.shouldApplyFilter();
        let badge = this.props.badgeCount ? this.props.badgeCount : this.getSavedFilter();

        let filterOptions = this.state.filteredList.map((env, index) => {
            return <label key={index} className={`filter-element ${!env.key ? 'fw-6' : 'fw-4'}`}>
                <input type="checkbox" className="filter-element__input" value={env.key}
                    checked={env.isChecked} onChange={this.handleSelection} />
                {
                    this.props.isLabelHtml ?
                    <div dangerouslySetInnerHTML={{__html: env[this.props.labelKey]}} /> :
                    <span>{env[this.props.labelKey]}</span>
                }

                <span className="filter-element__checkmark"></span>
            </label>
        })

        if (filterOptions.length == 0) {
            filterOptions = [<p key={"none"} className="filter__no-result">{this.state.searchStr.length ? "No Matching Results" : "No Filters Found"}</p>]
        }

        
        return <div className="filter" >
            {
                (!this.props.isDisabled || !this.props.disableTooltipMessage) &&
                <div>
                    {
                        this.props.showPulsatingDot && !this.state.show &&
                        <div className="pulse-highlight"></div>
                    }
                    <button type="button" className="filter__trigger" onClick={() => this.onFilterButtonClick()}>
                        {this.props.buttonText}
                        {badge > 0 ? <span className="badge">{badge}</span> : null}
                        <span className="filter-icon"><i className={faIcon}></i></span>
                    </button>
                </div>
            }
            {
                this.props.isDisabled && this.props.disableTooltipMessage &&
                <Tippy className="default-tt" arrow={true} placement="top" content={this.props.disableTooltipMessage} hideOnClick={false}>
                    <button type="button" className="filter__trigger disable__button">
                        {this.props.buttonText}
                        <span className="filter-icon"><i className={faIcon}></i></span>
                    </button>
                </Tippy>
            }
            {
                !this.props.isDisabled &&
                <>
                    {this.state.show ? <div className="transparent-div" onClick={this.handleClick}></div> : null}
                    <div className={classNames} ref={node => this.node = node}>
                        {
                            this.props.loading ? <Progressing /> :
                                <>
                                    {this.props.searchable && <input type="text" placeholder={this.props.placeholder} className="filter__search" onChange={this.handleSearch} value={this.state.searchStr} />}
                                    <div className="filter__options">
                                        {filterOptions}
                                    </div>
                                    {this.props.multi && <button type="button" className="filter__apply" disabled={isDisable} onClick={() => { this.applyFilter(); }}>
                                        Apply Filter
                                    </button>}
                                </>
                        }
                    </div>
                </>
            }
        </div>
    }

}

