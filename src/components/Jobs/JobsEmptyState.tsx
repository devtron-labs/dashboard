/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
        return <GenericFilterEmptyState handleClearFilters={props.clickHandler} />
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
