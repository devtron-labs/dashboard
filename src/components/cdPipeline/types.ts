import { ChangeCIPayloadType } from '../workflowEditor/types'

// Have added any type for most of these since they were legacy do not know the implications of changing them
export interface NewCDPipelineProps {
    match: any
    location: any
    appName: any
    close: any
    getWorkflows: any
    refreshParentWorkflows: any
    envIds: any
    changeCIPayload?: ChangeCIPayloadType
}

export enum DeleteDialogType {
    showForceDeleteDialog = 'showForceDeleteDialog',
    showNonCascadeDeleteDialog = 'showNonCascadeDeleteDialog',
    showNormalDeleteDialog = 'showNormalDeleteDialog',
}

export interface ForceDeleteMessageType {
    forceDeleteDialogMessage: string
    forceDeleteDialogTitle: string
}

export interface DeleteCDNodeProps {
    deleteDialog: DeleteDialogType
    setDeleteDialog: React.Dispatch<React.SetStateAction<DeleteDialogType>>
    clusterName: string
    appName: string
    hideDeleteModal: () => void
    deleteCD: (force: boolean, cascadeDelete: boolean) => void
    deploymentAppType: string
    forceDeleteData: ForceDeleteMessageType
    deleteTitleName: string
}
