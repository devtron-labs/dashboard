import React, { Component } from 'react'
import { ExternalListViewProps } from './types'
import { Progressing, Pagination, ErrorScreenManager } from '../../common';
import { ViewType } from '../../../config';
import { Link } from 'react-router-dom';
import { ReactComponent as Question } from '../../../assets/icons/ic-help-outline.svg';
import Tippy from '@tippyjs/react';
import emptyImage from '../../../assets/img/empty-noresult@2x.png';
import EmptyState from '../../EmptyState/EmptyState';

export class ExternalListView extends Component<ExternalListViewProps>{

    renderDefaultListTitle() {
        return (
            <div className="app-list__header bcn-0">
                <div className="app-list__cell app-list__cell--name">
                    <span className="app-list__cell-header">
                        App name
                    </span>
                </div>
                <div className="app-list__cell app-list__cell--material-info">
                    <span className="app-list__cell-header">Environment</span>
                    <Tippy className="default-tt" arrow={false} placement="top" content={
                        <span style={{ display: "block", width: "200px" }}> Environment is a unique combination of cluster and namespace. </span>}>
                        <Question className="icon-dim-16 ml-4" />
                    </Tippy>
                </div>
                <div className="app-list__cell">
                    <span className="app-list__cell-header">
                        Last Updated
                    </span>
                </div>
            </div>
        )
    }

    renderListRow(row) {
        return (
            <Link to="" className="app-list__row">
                <div className="app-list__cell app-list__cell--name">
                    <p className="truncate-text m-0">{row.appName}</p>
                </div>
                <div className="app-list__cell app-list__cell--material-info">
                    {row.environment}/{row.namespace}
                </div>
                <div className="app-list__cell">
                    {row.lastDeployedOn}
                </div>
            </Link>
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

    renderPagination() {
        if (this.props.pagination.size > 20) {
            return <Pagination size={this.props.pagination.size}
                pageSize={this.props.pagination.pageSize}
                offset={this.props.pagination.offset}
                changePage={this.props.changePage}
                changePageSize={this.props.changePageSize} />
        }
    }

    render() {
        if (this.props.view === ViewType.EMPTY) {
            return <EmptyState>
                <EmptyState.Image><img src={emptyImage} alt="" /></EmptyState.Image>
                <EmptyState.Title><h4>No  matching Charts</h4></EmptyState.Title>
                <EmptyState.Subtitle>We couldn't find any matching results</EmptyState.Subtitle>
                {/* <button type="button" onClick={handleViewAllCharts} className="cta ghosted mb-24">View all charts</button> */}
            </EmptyState>
        }
        else if (this.props.view === ViewType.ERROR) {
            return <>
                <ErrorScreenManager code={this.props.code} />
            </>
        }
        else {
            return (
                <div>
                    {this.renderSavedFilters()}
                    {this.renderDefaultListTitle()}
                    {this.renderDefaultListRows()}
                    {this.renderPagination()}
                </div>
            )
        }
    }
}
