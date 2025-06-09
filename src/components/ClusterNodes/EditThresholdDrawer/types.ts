import { DynamicDataTableProps, ResourceDetail } from '@devtron-labs/devtron-fe-common-lib'

import { NodeDetail } from '../types'

export enum ThresholdTableHeaderKeys {
    RESOURCE = 'resource',
    INHERITED_THRESHOLD = 'inherited_threshold',
    OPERATOR = 'operator',
    OVERRIDE_THRESHOLD = 'override_threshold',
}

export type ThresholdTableType = DynamicDataTableProps<
    ThresholdTableHeaderKeys,
    { isThresholdLinked: boolean; isThresholdButtonHovered: boolean }
>

export interface EditThresholdDrawerProps {
    cpuData: ResourceDetail
    memoryData: ResourceDetail
    nodeDetail: NodeDetail
    clusterId: number
    nodeName: string
    closeDrawer: (refreshData?: boolean) => void
}

export interface SaveNodeThresholdPayload {
    clusterId: number
    nodeName: string
    data: Record<string, ResourceDetail['threshold']>
}
