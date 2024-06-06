import React from 'react'
import { GenericEmptyState, GenericFilterEmptyState } from '@devtron-labs/devtron-fe-common-lib'
import { JobListViewType, JOBLIST_EMPTY_STATE_MESSAGING } from './Constants'
import { JobsEmptyProps } from './Types'
import nojobs from '../../assets/img/empty-joblist@2x.png'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'

export default function JobsEmptyState(props: JobsEmptyProps) {
    const renderNoJobsView = () => {
        const handleButton = () => {
            return (
                <button type="button" className="cta flex" onClick={props.clickHandler}>
                    <Add className="icon-dim-20 mr-8 fcn-0" />
                    {JOBLIST_EMPTY_STATE_MESSAGING.createJobButtonLabel}
                </button>
            )
        }
        return (
            <GenericEmptyState
                image={nojobs}
                title={JOBLIST_EMPTY_STATE_MESSAGING.createJob}
                subTitle={JOBLIST_EMPTY_STATE_MESSAGING.createJobInfoText}
                isButtonAvailable
                renderButton={handleButton}
            />
        )
    }

    const renderNoResultsView = () => {
        return (
            <GenericFilterEmptyState
                handleClearFilters={props.clickHandler}
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
