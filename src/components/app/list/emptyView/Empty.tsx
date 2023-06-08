import React, { Children, Component } from 'react';
import { AppListViewType } from '../../config';
import noapps from '../../../../assets/img/empty-applist@2x.png';
import noresult from '../../../../assets/img/empty-noresult@2x.png';
import { EmptyProps } from './types';
import { ReactComponent as Add } from '../../../../assets/icons/ic-add.svg';
import { DOCUMENTATION } from '../../../../config';
import { GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib';

export class Empty extends Component<EmptyProps>{

    renderNoAppsView() {
        const renderButton = () => {
            return (
                <button type="button" className="cta flex"
                onClick={this.props.clickHandler}>
                <Add className="icon-dim-20 mr-8 fcn-0" />
                {this.props.buttonLabel}
            </button>
            )
        }

        return <div className='dc__position-rel' style={{ height: "calc(100vh - 160px)" }}>
            <GenericEmptyState
                image={noapps}
                title={this.props.title}
                subTitle={
                    <>
                        {this.props.message}
                        <a rel="noreferrer noopener" target="_blank" href={DOCUMENTATION.APP_CREATE} className="anchor">
                                Learn about creating applications
                        </a>
                    </>
                    }
                isButtonAvailable={true}
                renderButton={renderButton}
            />
        </div>
    }

    renderNoResultsView(children) {
        const renderButton = () => {
            return (
                <button type="button" className="saved-filter__clear-btn dc__saved-filter__clear-btn--dark" data-testid = "clear-filter-button" onClick={this.props.clickHandler}>
                    {this.props.buttonLabel}
                </button>
            )
        }

        return <div className='dc__position-rel' style={{ height: "calc(100vh - 250px)" }}>
            <GenericEmptyState
                image={noresult}
                title={this.props.title}
                subTitle={this.props.message}
                isButtonAvailable={true}
                renderButton={renderButton}
                children={children && children}
            />
        </div>
    }

    render() {
        if (this.props.view === AppListViewType.NO_RESULT) return this.renderNoResultsView(this.props.children);
        else return this.renderNoAppsView();
    }
}
