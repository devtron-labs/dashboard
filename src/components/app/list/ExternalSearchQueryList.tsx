import React, { Component } from 'react';
import { ExternalSearchQueryListProps } from './types';
import { Progressing, showError } from '../../../components/common';
import { ExternalDefaultListProps } from './types'
import * as queryString from 'query-string';
import { URLS, ViewType } from '../../../config';
import { Link } from 'react-router-dom';
import { ReactComponent as Edit } from '../../../assets/icons/ic-settings.svg';
import Tippy from '@tippyjs/react';
import { ReactComponent as Question } from '../../../assets/icons/ic-help-outline.svg';

export default class ExternalSearchQueryList extends Component<ExternalSearchQueryListProps> {
    renderDefaultListTitle() {
        return (<div>
            <div className=" bcn-0 pl-20 pr-20">

                <div className="external-list__header pt-8 pb-8">
                    <div className="external-list__cell pr-12">
                        <button className="app-list__cell-header" onClick={e => { e.preventDefault(); }}> App name
                         {/* {this.props.sortRule.key == SortBy.APP_NAME ? <span className={icon}></span> : <span className="sort-col"></span>} */}
                        </button>
                    </div>
                    <div className="external-list__cell pl-12 pr-12">
                        <span className="app-list__cell-header">Cluster/Namespace</span>
                        <Tippy className="default-tt" arrow={false} placement="top" content={
                            <span style={{ display: "block", width: "200px" }}> Environment is a unique combination of cluster and namespace. </span>}>
                            <Question className="icon-dim-20" />
                        </Tippy>
                    </div>
                    <div className="external-list__cell external-list__cell--width pl-12 pr-12">
                        <span className="app-list__cell-header ml-12 mr-12">Query Matches </span>
                    </div>
                    <div className="app-list__cell app-list__cell--action"></div>
                </div>
            </div>
        </div>
        )
    }

    renderExternalList(list) {
        return (
            <div className="bcn-0">
                <Link to="" className="external-list__row flex left cn-9 pt-19 pb-19 pl-20">
                    <div className="external-list__cell content-left mr-12"> 
                    <p className="truncate-text m-0 overflow-hidden">{list.appname}</p></div>
                    <div className="external-list__cell ml-12 mr-12 external__overflow-handling">
                        <span className="overflow-hidden">{list.environment}</span></div>
                    <div className="external-list__cell external-list__cell--width ml-12 mr-12">
                        <span className="overflow-hidden">{list.queryMatch}</span> </div>
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
        let keys = Object.keys(this.props.filters);
        let savedFilters = <div className="saved-filters">
            {keys.map((key) => {
                return this.props.filters[key].map((filter) => {
                    if (filter.isChecked) {
                        count++;
                        return <div key={filter.key} className="saved-filter">{filter.label}
                            <button type="button" className="saved-filter__clear-btn"
                                onClick={(event) => this.removeFilter(filter.key, key)} >
                                <i className="fa fa-times-circle" aria-hidden="true"></i>
                            </button>
                        </div>
                    }
                })
            })}
            <button type="button" className="saved-filters__clear-btn" >
                Clear All Filters
            </button>
        </div>
    }

    removeFilter = (val, type: string): void => {
        let qs = queryString.parse(this.props.location.search);
        let keys = Object.keys(qs);
        let query = {};
        keys.map((key) => {
            query[key] = qs[key];
        })
        query['offset'] = 0;
        let appliedFilters = query[type];
        let arr = appliedFilters.split(",");
        arr = arr.filter((item) => item != val.toString());
        query[type] = arr.toString();
        if (query[type] == "") delete query[type];
        let queryStr = queryString.stringify(query);
        let url = `${URLS.APP}?${queryStr}`;
        this.props.history.push(url);
    }

    renderDefaultList() {
        if (this.props.view === ViewType.LOADING) {
            return <div style={{ height: "calc(100vh - 280px)" }}> <Progressing pageLoader /> </div>
        } else {
            return <>{this.renderSavedFilters()}
                {this.props.externalQueryList.map((list) => { return this.renderExternalList(list) })}
            </>
        }
    }
    render() {
        return (
            <div>
                {this.renderDefaultListTitle()}
                {this.renderDefaultList()}
            </div>
        )
    }
}
