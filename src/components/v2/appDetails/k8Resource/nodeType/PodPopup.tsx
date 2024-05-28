import React from 'react'
import { ModuleNameMap, useMainContext } from '@devtron-labs/devtron-fe-common-lib'
import { getShowResourceScanModal, importComponentFromFELibrary } from '../../../../common'
import { NodeDetailTabs } from '../../../../app/types'
import { PodPopupProps } from './types'
import { NodeType } from '../../appDetails.type'
import { ReactComponent as ICDeleteInteractive } from '../../../../../assets/icons/ic-delete-interactive.svg'

const OpenSecurityModalButton = importComponentFromFELibrary('OpenSecurityModalButton')

// TODO: Need to make it common and use this in ResourceTree component as well
const PodPopup = ({
    kind,
    describeNode,
    isExternalArgoApp,
    toggleShowDeleteConfirmation,
    handleShowVulnerabilityModal,
}: PodPopupProps) => {
    const { installedModuleMap } = useMainContext()
    const showResourceScanModal = getShowResourceScanModal(
        kind,
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
            {!isExternalArgoApp && (
                <span
                    data-testid="delete-resource-button"
                    className="flex dc__gap-8 pod-info__popup-row cr-5"
                    onClick={toggleShowDeleteConfirmation}
                >
                    <ICDeleteInteractive className="icon-dim-16 scr-5" />
                    <span>Delete</span>
                </span>
            )}
        </div>
    )
}

export default PodPopup
