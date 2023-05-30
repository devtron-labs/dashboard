import React from 'react'
import { GenericEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import { JobListViewType, JOBLIST_EMPTY_STATE_MESSAGING } from './Constants'
import { JobsEmptyProps } from './Types'
import nojobs from '../../assets/img/empty-joblist@2x.png'
import noresult from '../../assets/img/empty-noresult@2x.png'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'

export default function JobsEmptyState(props: JobsEmptyProps) {
    const handleButton = () => {
        return (
            <button type="button" className="cta flex" onClick={props.clickHandler}>
                <Add className="icon-dim-20 mr-8 fcn-0" />
                {JOBLIST_EMPTY_STATE_MESSAGING.createJobButtonLabel}
            </button>
        )
    }
    const renderNoJobsView = () => {
        return (
            <GenericEmptyState
                image={nojobs}
                title={JOBLIST_EMPTY_STATE_MESSAGING.createJob}
                subTitle={JOBLIST_EMPTY_STATE_MESSAGING.createJobInfoText}
                isButtonAvailable={true}
                renderButton={handleButton}
            />
        )
    }

    const renderNoResultsView = () => {
        const handleButton = () =>{
            return (
                <button
                type="button"
                className="saved-filter__clear-btn dc__saved-filter__clear-btn--dark"
                onClick={props.clickHandler}
            >
                {JOBLIST_EMPTY_STATE_MESSAGING.noJobsButtonLabel}
            </button>
            )
        }
        return (
            <GenericEmptyState
                image={noresult}
                title={JOBLIST_EMPTY_STATE_MESSAGING.noJobsFound}
                subTitle={JOBLIST_EMPTY_STATE_MESSAGING.noJobFoundInfoText}
                renderButton={handleButton}
            />
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
