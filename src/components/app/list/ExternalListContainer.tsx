import React, { Component } from 'react'
import './list.css';
import { Link, Switch, Route, RouteComponentProps } from 'react-router-dom';
import { ReactComponent as Edit } from '../../../assets/icons/ic-settings.svg';

export default class ExternalListContainer extends Component {
    renderAppList() {
        // if (this.props.apps.length) {
        // let icon = this.props.sortRule.order == OrderBy.ASC ? "sort-up" : "sort-down";
        return <div className="app-list">
            <div className="external-list__header">
                <div className="external-list__cell">
                    <button className="app-list__cell-header" onClick={e => { e.preventDefault(); }}> App name
                         {/* {this.props.sortRule.key == SortBy.APP_NAME ? <span className={icon}></span> : <span className="sort-col"></span>} */}
                    </button>
                </div>
                <div className="external-list__cell external-list__cell--width">
                    <span className="app-list__cell-header">Environment</span>
                </div>
                <div className="external-list__cell ">
                    <span className="app-list__cell-header">Last Updated </span>
                </div>
                <div className="app-list__cell app-list__cell--action"></div>
            </div>
            <Link to="" className="external-list__row">
                <div className="app-list__cell app-list__cell--name">
                    <p className="truncate-text m-0">testing</p>
                </div>
                <div className="app-list__cell app-list__cell--name">
                    status
                                </div>
                <div className="app-list__cell app-list__cell--name">
                    hi
                                </div>
                <div className="app-list__cell app-list__cell--action">
                    <button type="button" className="button-edit" onClick={(event) => { event.stopPropagation(); event.preventDefault(); }}>
                        <Edit className="button-edit__icon" />
                    </button>
                </div>
            </Link>

        </div>
    }

    render() {
        return (
            <>{this.renderAppList()}</>
        )
    }
}
