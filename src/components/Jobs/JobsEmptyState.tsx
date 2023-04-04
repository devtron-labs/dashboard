import React from 'react'
import { EmptyState } from '@devtron-labs/devtron-fe-common-lib'
import { JobListViewType, JOBLIST_EMPTY_STATE_MESSAGING } from './Constants'
import { JobsEmptyProps } from './Types'
import nojobs from '../../assets/img/empty-joblist@2x.png'
import noresult from '../../assets/img/empty-noresult@2x.png'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'

export default function JobsEmptyState(props: JobsEmptyProps) {
    const renderNoJobsView = () => {
        return (
            <EmptyState>
                <EmptyState.Image>
                    <img src={nojobs} width="250" height="200" alt="no jobs found" />
                </EmptyState.Image>
                <EmptyState.Title>
                    <h2 className="fs-16 fw-4 c-9">{JOBLIST_EMPTY_STATE_MESSAGING.createJob}</h2>
                </EmptyState.Title>
                <EmptyState.Subtitle>{JOBLIST_EMPTY_STATE_MESSAGING.createJobInfoText}</EmptyState.Subtitle>
                <EmptyState.Button>
                    <button type="button" className="cta flex" onClick={props.clickHandler}>
                        <Add className="icon-dim-20 mr-8 fcn-0" />
                        {JOBLIST_EMPTY_STATE_MESSAGING.createJobButtonLabel}
                    </button>
                </EmptyState.Button>
            </EmptyState>
        )
    }

    const renderNoResultsView = () => {
        return (
            <EmptyState>
                <EmptyState.Image>
                    <img src={noresult} width="250" height="200" alt="no results" />
                </EmptyState.Image>
                <EmptyState.Title>
                    <h2 className="fs-16 fw-4 c-9">{JOBLIST_EMPTY_STATE_MESSAGING.noJobsFound}</h2>
                </EmptyState.Title>
                <EmptyState.Subtitle>{JOBLIST_EMPTY_STATE_MESSAGING.noJobFoundInfoText}</EmptyState.Subtitle>
                <EmptyState.Button>
                    <button
                        type="button"
                        className="saved-filter__clear-btn dc__saved-filter__clear-btn--dark"
                        onClick={props.clickHandler}
                    >
                        {JOBLIST_EMPTY_STATE_MESSAGING.noJobsButtonLabel}
                    </button>
                </EmptyState.Button>
            </EmptyState>
        )
    }

    return (
        <div
            className="bcn-0"
            style={{ height: `calc(100vh - ${props.view === JobListViewType.NO_RESULT ? '146px' : '48px'})` }}
        >
            {props.view === JobListViewType.NO_RESULT ? renderNoResultsView() : renderNoJobsView()}
        </div>
    )
}
