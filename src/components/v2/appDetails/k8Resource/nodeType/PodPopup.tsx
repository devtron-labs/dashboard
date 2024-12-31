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

import { ModuleNameMap, useMainContext } from '@devtron-labs/devtron-fe-common-lib'
import { getShowResourceScanModal, importComponentFromFELibrary } from '../../../../common'
import { NodeDetailTabs } from '../../../../app/types'
import { PodPopupProps } from './types'
import { ReactComponent as ICDeleteInteractive } from '../../../../../assets/icons/ic-delete-interactive.svg'
import { NodeType } from '../../appDetails.type'

const OpenSecurityModalButton = importComponentFromFELibrary('OpenSecurityModalButton', null, 'function')

// TODO: Need to make it common and use this in ResourceTree component as well
const PodPopup = ({
    kind,
    describeNode,
    toggleShowDeleteConfirmation,
    handleShowVulnerabilityModal,
}: PodPopupProps) => {
    const { installedModuleMap } = useMainContext()
    const showResourceScanModal = getShowResourceScanModal(
        kind as NodeType,
        installedModuleMap.current?.[ModuleNameMap.SECURITY_TRIVY],
    )

    const handleDescribeEvents = () => {
        describeNode(NodeDetailTabs.EVENTS)
    }

    const handleDescribeLogs = () => {
        describeNode(NodeDetailTabs.LOGS)
    }

    return (
        <div className="pod-info__popup-container flexbox-col">
            {kind === NodeType.Pod && (
                <span
                    data-testid="view-events-button"
                    className="flex pod-info__popup-row"
                    onClickCapture={handleDescribeEvents}
                >
                    View Events
                </span>
            )}
            {kind === NodeType.Pod && (
                <span data-testid="view-logs-button" className="flex pod-info__popup-row" onClick={handleDescribeLogs}>
                    View Container Logs
                </span>
            )}
            {showResourceScanModal && OpenSecurityModalButton && (
                <OpenSecurityModalButton handleShowVulnerabilityModal={handleShowVulnerabilityModal} />
            )}
            <span
                data-testid="delete-resource-button"
                className="flex dc__gap-8 pod-info__popup-row cr-5"
                onClick={toggleShowDeleteConfirmation}
            >
                <ICDeleteInteractive className="icon-dim-16 scr-5" />
                <span>Delete</span>
            </span>
        </div>
    )
}

export default PodPopup
