import { NodeType } from '../../appDetails.type'
import { NodeDetailTabsType } from '../../../../app/types'

export interface PodPopupProps {
    kind: NodeType
    describeNode: (tab?: NodeDetailTabsType) => void
    isExternalArgoApp: boolean
    toggleShowDeleteConfirmation: () => void
    handleShowVulnerabilityModal: () => void
}
