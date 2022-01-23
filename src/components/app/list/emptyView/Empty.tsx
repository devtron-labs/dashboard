import React, { Children, Component } from 'react';
import { AppListViewType } from '../../config';
import noapps from '../../../../assets/img/empty-applist@2x.png';
import noresult from '../../../../assets/img/empty-noresult@2x.png';
import EmptyState from '../../../EmptyState/EmptyState';
import { EmptyProps } from './types';
import { ReactComponent as Add } from '../../../../assets/icons/ic-add.svg';
import { DOCUMENTATION } from '../../../../config';

export class Empty extends Component<EmptyProps>{

    renderNoAppsView() {
        return <div style={{ height: "calc(100vh - 160px)" }}>
            <EmptyState>
                <EmptyState.Image>
                    <img src={noapps} width="250" height="200" alt="no apps found" />
                </EmptyState.Image>
                <EmptyState.Title>
                    <h2 className="fs-16 fw-4 c-9">{this.props.title}</h2>
                </EmptyState.Title>
                <EmptyState.Subtitle>
                    {this.props.message}<br />
                    <a rel="noreferrer noopener" target="_blank" href={DOCUMENTATION.APP_CREATE} className="anchor">
                        Learn about creating applications
                    </a>
                </EmptyState.Subtitle>
                <EmptyState.Button>
                    <button type="button" className="cta flex"
                        onClick={this.props.clickHandler}>
                        <Add className="icon-dim-20 mr-8 fcn-0" />
                        {this.props.buttonLabel}
                    </button>
                </EmptyState.Button>
            </EmptyState>
        </div>
    }

    renderNoResultsView(children) {
        return <div style={{ height: "calc(100vh - 250px)" }}>
            <EmptyState>
                <EmptyState.Image>
                    <img src={noresult} width="250" height="200" alt="no results" />
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
                  {children && children}
            </EmptyState>
         

        </div>
    }

    render() {
        if (this.props.view === AppListViewType.NO_RESULT) return this.renderNoResultsView(this.props.children);
        else return this.renderNoAppsView();
    }
}
