import { CommonNodeAttr, RouterV5Props, SelectedNode } from '@devtron-labs/devtron-fe-common-lib'

import { WorkflowProps } from '../types'

export interface StaticNodeProps {
    x: number
    y: number
    branch: string
    icon: string
    id: string
    url: string
    title: string
    height: number
    width: number
    downstreams: any[]
    sourceType: string
    regex?: string
    primaryBranchAfterRegex?: string
    to?: string
    handleGoToWorkFlowEditor?: (e?: any) => void
}

export interface CINodeProps
    extends RouterV5Props<{}>, Pick<WorkflowProps, 'isOffendingPipelineView' | 'isTemplateView'> {
    x: number
    y: number
    width: number
    height: number
    id: number
    title: string
    type: string
    description: string
    workflowId: number
    triggerType: string
    isLinkedCI: boolean
    isExternalCI: boolean
    isJobCI: boolean
    isTrigger: boolean
    linkedCount: number
    downstreams: CommonNodeAttr[]
    to: string
    toggleCDMenu: () => void
    configDiffView?: boolean
    hideWebhookTippy?: () => void
    isJobView?: boolean
    showPluginWarning?: boolean
    envList?: any[]
    filteredCIPipelines?: any[]
    addNewPipelineBlocked?: boolean
    handleSelectedNodeChange?: (selectedNode: SelectedNode) => void
    selectedNode?: SelectedNode
    isLastNode?: boolean
    appId: string
    getWorkflows: () => void
}
