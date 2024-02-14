import { ChangeCIPayloadType, PipelineFormType } from '../workflowEditor/types'

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
    isLastNode: any
    noGitOpsModuleInstalledAndConfigured: any
    isGitOpsRepoNotConfigured: any
    reloadAppConfig: () => void
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
    setDeleteDialog: React.Dispatch<React.SetStateAction<DeleteDialogType>> | ((deleteDialog: DeleteDialogType) => void)
    clusterName: string
    appName: string
    hideDeleteModal: () => void
    deleteCD: (force: boolean, cascadeDelete: boolean) => void
    deploymentAppType: string
    forceDeleteData: ForceDeleteMessageType
    deleteTitleName: string
    isLoading?: boolean
    showConfirmationBar?: boolean
}

export interface PullImageDigestToggleType {
    formData: PipelineFormType
    setFormData: React.Dispatch<React.SetStateAction<PipelineFormType>>
}
