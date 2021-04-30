import React, { Component } from 'react'
import { Progressing, showError } from '../../../components/common';
import { ExternalDefaultListProps } from './types'
import * as queryString from 'query-string';
import { URLS, ViewType } from '../../../config';
import { Link } from 'react-router-dom';
import { ReactComponent as Edit } from '../../../assets/icons/ic-settings.svg';
import Tippy from '@tippyjs/react';
import { ReactComponent as Question } from '../../../assets/icons/ic-help-outline.svg';

const QueryParams = {
    Cluster: "cluster",
    Namespace: "namespace",
    Appstore: "appstore"
}
export default class ExternalDefaultList extends Component<ExternalDefaultListProps>{

    renderDefaultListTitle() {
        return (<div>
            <div className=" bcn-0">
                <div className="external-list__header pt-8 pb-8">
                    <div className="external-list__cell pr-12 pl-20">
                        <button className="app-list__cell-header" onClick={e => { e.preventDefault(); }}> App name
                        <span className={'sort-down'}></span>
                        </button>
                    </div>
                    <div className="external-list__cell external-list__cell--width pl-12 pr-12">
                        <span className="app-list__cell-header">Environment</span>
                        <Tippy className="default-tt" arrow={false} placement="top" content={
                            <span style={{ display: "block", width: "200px" }}> Environment is a unique combination of cluster and namespace. </span>}>
                            <Question className="icon-dim-16 ml-4" />
                        </Tippy>
                    </div>
                    <div className="external-list__cell ">
                        <span className="app-list__cell-header pl-12">Last Updated </span>
                    </div>
                    <div className="app-list__cell app-list__cell--action"></div>
                </div>
            </div>
        </div>
        )
    }

    renderListRow(list) {
        return (
            <div className="bcn-0">
                <Link to="" className="external-list__row flex left cn-9 pt-19 pb-19 pl-20">
                    <div className="external-list__cell content-left pr-12"> <p className="truncate-text m-0">{list.appname}</p></div>
                    <div className="external-list__cell external-list__cell--width ">{list.environment}</div>
                    <div className="external-list__cell pl-12 pr-12"> {list.lastupdate} </div>
                    <div className="app-list__cell app-list__cell--action">
                        <button type="button" className="button-edit" onClick={(event) => { event.stopPropagation(); event.preventDefault(); }}>
                            <Edit className="button-edit__icon" />
                        </button>
                    </div>
                </Link>
            </div>
        )
    }

    

    renderSavedFilters() {
        let count = 0;
   
        let savedFilters = <div className="saved-filters">
            {this.props.appliedCluster.map((filter) => {
                count++;
                return <div key={filter.value} className="saved-filter">{filter.label}
                    <button type="button" className="saved-filter__clear-btn"
                        onClick={(event) => this.props.removeFilter('cluster', filter.value)} >
                        <i className="fa fa-times-circle" aria-hidden="true"></i>
                    </button>
                </div>
            })}
            {this.props.appliedNamespace.map((filter) => {
                count++;
                return <div key={filter.value} className="saved-filter">{filter.label}
                    <button type="button" className="saved-filter__clear-btn"
                        onClick={(event) => this.props.removeFilter('namespace', filter.value)} >
                        <i className="fa fa-times-circle" aria-hidden="true"></i>
                    </button>
                </div>
            })}
            <button type="button" className="saved-filters__clear-btn" onClick={() => { this.props.removeAllFilters() }}>
                Clear All Filters
            </button>
        </div>
        return <React.Fragment>
            {count > 0 ? savedFilters : null}
        </React.Fragment>
    }

    renderDefaultListRows() {
        if (this.props.view === ViewType.LOADING) {
            return <div style={{ height: "calc(100vh - 280px)" }}> <Progressing pageLoader /> </div>
        } else {
            return <>
                {this.props.externalList.map((list) => { return this.renderListRow(list) })}
            </>
        }
    }

    render() {
        return (
            <div>
                {this.renderSavedFilters()}
                {this.renderDefaultListTitle()}
                {this.renderDefaultListRows()}
            </div>
        )
    }
}
