import { CIMaterialProps, TriggerViewState } from '@Components/app/details/triggerView/types'
import { CIMaterialType } from '@devtron-labs/devtron-fe-common-lib'

export interface GitInfoMaterialProps
    extends Pick<TriggerViewState, 'workflowId'>,
        Pick<
            CIMaterialProps,
            | 'onClickShowBranchRegexModal'
            | 'fromAppGrouping'
            | 'isJobView'
            | 'isJobCI'
            | 'isCITriggerBlocked'
            | 'handleRuntimeParamChange'
            | 'pipelineId'
            | 'runtimeParams'
        > {
    dataTestId?: string
    material: CIMaterialType[]
    title: string
    pipelineName: string
    selectedMaterial: CIMaterialType

    // Only coming from BulkCI
    appName?: string
    fromBulkCITrigger?: boolean
    hideSearchHeader?: boolean

    // Not required for BulkCI
    currentSidebarTab?: string
    handleSidebarTabChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
    handleRuntimeParamError?: (errorState: boolean) => void
}
