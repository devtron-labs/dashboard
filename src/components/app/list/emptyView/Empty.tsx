import React, { Component } from 'react';
import { AppListViewType } from '../../config';
import noapps from '../../../../assets/img/empty-applist@2x.png';
import noresult from '../../../../assets/img/empty-noresult@2x.png';
import './empty.css';
import EmptyState from '../../../EmptyState/EmptyState';
import { EmptyProps } from './types';

export class Empty extends Component<EmptyProps>{

    renderNoAppsView() {
        return <div className="no-apps">
            <div className="empty">
                <img src={noapps} width="250" height="200" className="empty__img" alt="no apps found"></img>
                <h1 className="empty__title">{this.props.title}</h1>
                <p className="empty__message">{this.props.message}</p>
                <button type="button" className="round-button round-button--empty"
                    onClick={this.props.clickHandler}>
                    <span className="round-button__icon"><i className="fa fa-plus" aria-hidden="true"></i></span>
                    {this.props.buttonLabel}
                </button>
            </div>
        </div>
    }

    renderNoResultsView() {
        return <div className="no-results">
            <EmptyState>
                <EmptyState.Image>
                    <img src={noresult} width="250" height="200" className="empty__img" alt="no results"></img>
                </EmptyState.Image>
                <EmptyState.Title>
                    <h2 className="fs-16 fw-4 c-9">{this.props.title}</h2>
                </EmptyState.Title>
                <EmptyState.Subtitle>{this.props.message}</EmptyState.Subtitle>
                <EmptyState.Button>
                    <button type="button" className="saved-filter__clear-btn saved-filter__clear-btn--dark" onClick={this.props.clickHandler}>
                        {this.props.buttonLabel}
                    </button>
                </EmptyState.Button>
            </EmptyState>
        </div>
    }

    render() {
        if (this.props.view === AppListViewType.NO_RESULT) return this.renderNoResultsView();
        else return this.renderNoAppsView();
    }
}
