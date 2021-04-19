import React, { Component } from 'react'
import Select, { components } from 'react-select';
import './list.css';
import { Link } from 'react-router-dom';
import { ReactComponent as Edit } from '../../../assets/icons/ic-settings.svg';
import { ReactComponent as Check } from '../../../assets/icons/ic-check.svg';
import { ReactComponent as Dropdown } from '../../../assets/icons/appstatus/ic-dropdown.svg'
import { ReactComponent as Search } from '../../../assets/icons/ic-search.svg';
import { ReactComponent as Clear } from '../../../assets/icons/ic-error.svg';
import { FilterOption, Option, multiSelectStyles } from '../../common';
import { ExternalListContainerState, ExternalListContainerProps } from './types' 



const MenuList = props => {
    return (
        <components.MenuList {...props}>
            {props.children}
            <div className="chartListApplyFilter flex bcn-0 pt-10 pb-10">
                <button type="button" className="cta flex cta--chart-store"
                    disabled={false}
                    onClick={(selected: any) => { }}>Apply Filter</button>
            </div>
        </components.MenuList>
    );
};

const ValueContainer = props => {
    let length = props.getValue().length;
    let count = ''
    if (length === props.options.length && (props.selectProps.name === 'entityName' || props.selectProps.name === 'environment')) {
        count = 'All'
    }
    else {
        count = length
    }

    const Item = props.selectProps.name === 'entityName' ? 'cluster' : 'Namespace'
    const counting = <span className="badge">{count}</span>

    return (
        <components.ValueContainer  {...props}>
            {length > 0 ?
                <>
                    {!props.selectProps.menuIsOpen && ` ${Item}${length !== 1 ? "s" : ""} ${count}`}
                    {React.cloneElement(props.children[1])}
                </>
                : <>{props.children}</>}
        </components.ValueContainer>
    );
};

export default class ExternalListContainer extends Component<ExternalListContainerProps, ExternalListContainerState> {
    constructor(props) {
        super(props)
    
        this.state = {
            collapsed: false,
             
        }
        this.toggleHeaderName = this.toggleHeaderName.bind(this)

    }

    toggleHeaderName() {
        this.setState({ collapsed: !this.state.collapsed })
    }

    
    renderExternalTitle() {
        return <div className="app-header">
            <div className="app-header__title">
                <h1 className="app-header__text flex">External Apps
                <Dropdown onClick={this.toggleHeaderName} className="icon-dim-24 rotate ml-4" style={{ ['--rotateBy' as any]: this.state.collapsed ? '180deg' : '0deg' }} />
                </h1>
                {this.state.collapsed ? <>
                    <div className="app-list-card bcn-0 br-4 en-1 bw-1 pt-8 pr-8 pb-8 pl-8 ">
                        <div className="flex left pt-8 pr-8 pb-8 pl-8 cursor">
                            <Check className="scb-5 mr-8 icon-dim-16" />
                            <div>
                                <div className="cn-9 fs-13">Devtron Apps & Charts</div>
                                <div className="cn-5">Apps & charts deployed using Devtron</div>
                            </div>
                        </div>
                        <div className="flex left pt-8 pr-8 pb-8 pl-8 cursor">
                            <Check className="scb-5 mr-8 icon-dim-16" />
                            <div>
                                <div className="cn-9 fs-13">External Apps</div>
                                <div className="cn-5">Helm charts, Argocd objects</div>
                            </div>
                        </div>
                        <div className="flex left pt-8 pr-8 pb-8 pl-8 cursor">
                            <Check className="scb-5 mr-8 icon-dim-16" />
                            <div>
                                <div className="cn-9 fs-13">K8s Objects</div>
                                <div className="cn-5">All objects for which you have direct access</div>
                            </div>
                        </div>
                    </div>
                </> : ""}
            </div>
        </div>
    }

    renderExternalSearch() {
        return <div className="flexbox flex-justify">
            <form
                // onSubmit={handleAppStoreChange} 
                className="search position-rel" style={{ flexBasis: "100%" }} >
                <Search className="search__icon icon-dim-18" />
                <input className="search__input bcn-1" type="text" placeholder="Search applications"
                // value={appStoreName} 
                // onChange={(event) => { setAppStoreName(event.target.value); }} 
                />
                {/* {searchApplied ? <button className="search__clear-button" type="button" onClick={clearSearch}>
                    <Clear className="icon-dim-18 icon-n4 vertical-align-middle" />
                </button> : null} */}
            </form>
        </div>
    }




    renderExternalListHeader() {
        {/* // if (this.props.apps.length) { 
        // let icon = this.props.sortRule.order == OrderBy.ASC ? "sort-up" : "sort-down";*/}
        return <div className=" bcn-0 pl-20 pr-20">
            <div className="external-list--grid pt-12 pb-12">
                {this.renderExternalSearch()}
                <Select className="cn-9 fs-14"
                    placeholder="Cluster: All"
                    options={this.props.environment?.map((env) => ({ label: env.label, value: env.key }))}
                    components={{
                        Option,
                        MenuList,
                        ValueContainer
                        // ValueContainer :  props => { return <components.ValueContainer {...props} > </components.ValueContainer>}
                    }}
                    isMulti
                    hideSelectedOptions={false}
                    closeMenuOnSelect={false}
                    styles={{
                        ...multiSelectStyles,
                        control: (base, state) => ({
                            ...base,
                            border: state.isFocused ? '1px solid #06c' : '1px solid #d6dbdf',
                            boxShadow: 'none',
                        }),
                    }}
                />
                <Select className="cn-9 fs-14"
                    placeholder="Namespace: All" />
            </div>
            <div className="external-list__header pt-8 pb-8">
                <div className="external-list__cell pr-12">
                    <button className="app-list__cell-header" onClick={e => { e.preventDefault(); }}> App name
                         {/* {this.props.sortRule.key == SortBy.APP_NAME ? <span className={icon}></span> : <span className="sort-col"></span>} */}
                    </button>
                </div>
                <div className="external-list__cell external-list__cell--width pl-12 pr-12">
                    <span className="app-list__cell-header">Environment</span>
                </div>
                <div className="external-list__cell pl-12 pr-12">
                    <span className="app-list__cell-header ">Last Updated </span>
                </div>
                <div className="app-list__cell app-list__cell--action"></div>
            </div>
        </div>
    }

    renderExternalList() {
        return (
            <div className="bcn-0">
                <Link to="" className="external-list__row flex left cn-9 pt-19 pb-19 pl-20">
                    <div className="external-list__cell content-left pr-12"> <p className="truncate-text m-0">testing</p></div>
                    <div className="external-list__cell external-list__cell--width pl-12 pr-12">status </div>
                    <div className="external-list__cell pr-12"> hi </div>
                    {/* <div className="external-list__cell app-list__cell--action">
                        <button type="button" className="button-edit" onClick={(event) => { event.stopPropagation(); event.preventDefault(); }}>
                            <Edit className="button-edit__icon" />
                        </button>
                    </div> */}
                    <div className="app-list__cell app-list__cell--action"></div>
                </Link>
                <Link to="" className="external-list__row flex left cn-9 pt-19 pb-19 pl-20">
                    <div className="external-list__cell content-left pr-12"> <p className="truncate-text m-0">testing</p></div>
                    <div className="external-list__cell external-list__cell--width pl-12 pr-12">status </div>
                    <div className="external-list__cell pl-12 pr-12"> hi </div>
                    <div className="app-list__cell app-list__cell--action"></div>
                </Link>
            </div>
        )
    }

    render() {
        return (
            <>
                {this.renderExternalTitle()}
                {this.renderExternalListHeader()}
                {this.renderExternalList()}
            </>
        )
    }
}
