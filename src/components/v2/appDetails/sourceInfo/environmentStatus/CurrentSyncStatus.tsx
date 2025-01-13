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

import Tippy from '@tippyjs/react'
import { ReactComponent as ICHelpOutline } from '../../../../../assets/icons/ic-help-outline.svg'
import { CurrentSyncStatusType } from './notesDrawer.type'

const CurrentSyncStatus = ({ status, loadingResourceTree }: CurrentSyncStatusType): JSX.Element => {
    const renderloadingShimmer = () => (
        <div className="flex left column mt-6">
            <div className="shimmer-loading w-80px h-16 br-2 mb-6" />
            <div className="shimmer-loading w-60 h-12 br-2" />
        </div>
    )
    const renderStatusCard = () => (
        <>
            <div className={`f-${status.toLowerCase()} dc__capitalize fw-6 fs-14 flex left`}>
                <span data-testid="application-status-app-details">{status}</span>
                <figure className={`${status.toLowerCase()} dc__app-summary__icon ml-8 icon-dim-20`} />
            </div>
            <div>
                <span className="details-hover cb-5 fw-6" data-testid="details-button-app-details">
                    Details
                </span>
            </div>
        </>
    )

    return (
        <div className="app-status-card bg__primary mr-12 br-8 p-16 cursor">
            <div className="cn-9 flex left">
                <span data-testid="application-status-heading">Application status</span>
                <Tippy
                    className="default-tt cursor"
                    arrow={false}
                    content="The health status of your app"
                    maxWidth={250}
                >
                    <ICHelpOutline className="cursor icon-dim-16 ml-4" />
                </Tippy>
            </div>
            {loadingResourceTree ? renderloadingShimmer() : renderStatusCard()}
        </div>
    )
}

export default CurrentSyncStatus
