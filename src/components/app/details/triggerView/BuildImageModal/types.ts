import { ChangeEvent } from 'react'

import {
    APIOptions,
    CIMaterialSidebarType,
    CIMaterialType,
    CommonNodeAttr,
    RuntimeParamsTriggerPayloadType,
    RuntimePluginVariables,
    WorkflowType,
} from '@devtron-labs/devtron-fe-common-lib'

import { BulkCIDetailType } from '@Components/ApplicationGroup/AppGroup.types'
import { CIPipelineBuildType } from '@Components/ciPipeline/types'
import { EnvironmentWithSelectPickerType } from '@Components/CIPipelineN/types'

import {
    BuildImageModalProps,
    CIPipelineMaterialDTO,
    HandleRuntimeParamChange,
    MaterialSourceProps,
    RuntimeParamsErrorState,
    TriggerViewState,
} from '../types'

export interface TriggerBuildSidebarProps {
    currentSidebarTab: CIMaterialSidebarType
    handleSidebarTabChange: (e: ChangeEvent<HTMLInputElement>) => void
    runtimeParamsErrorState: RuntimeParamsErrorState
    materialList: CIMaterialType[]
    clearSearch: () => void
    selectMaterial: (materialId: string) => void
    refreshMaterial: MaterialSourceProps['refreshMaterial']
    // For Bulk Trigger
    appId?: number
    appList?: BulkCIDetailType[]
    handleAppChange?: (appId: number) => void
    isBlobStorageConfigured?: boolean
    toggleSelectedAppIgnoreCache?: () => void
}

type SetMaterialCBType = (prevMaterialList: CIMaterialType[]) => CIMaterialType[]

export type GitInfoMaterialProps = Pick<BuildImageModalProps, 'appId' | 'isJobView'> & {
    workflowId: string
    node: CommonNodeAttr
    setMaterialList: (cb: SetMaterialCBType) => void
    runtimeParamsErrorState: RuntimeParamsErrorState
    materialList: CIMaterialType[]
    showWebhookModal: boolean
    reloadCompleteMaterialList: () => void
    handleRuntimeParamChange: HandleRuntimeParamChange
    handleRuntimeParamError: (errorState: RuntimeParamsErrorState) => void
    /**
     * Only required for isJobView
     */
    selectedEnv?: EnvironmentWithSelectPickerType
    runtimeParams: RuntimePluginVariables[]
    handleDisplayWebhookModal: () => void
    selectedCIPipeline: TriggerViewState['filteredCIPipelines'][number]
    handleReloadWithWorkflows: () => void
} & (
        | {
              isBulkTrigger: true
              appList: BulkCIDetailType[]
              handleAppChange: (appId: number) => void
              isBlobStorageConfigured: boolean
              toggleSelectedAppIgnoreCache: () => void
          }
        | {
              isBulkTrigger?: false
              appList?: never
              handleAppChange?: never
              isBlobStorageConfigured?: never
              toggleSelectedAppIgnoreCache?: never
          }
    )

export interface BulkBuildImageModalProps
    extends Pick<BuildImageModalProps, 'handleClose' | 'workflows' | 'reloadWorkflows'> {
    filteredCIPipelineMap: Map<string, TriggerViewState['filteredCIPipelines']>
}

export interface BuildImageHeaderProps {
    showWebhookModal: boolean
    handleWebhookModalBack: () => void
    pipelineName: string
    handleClose: () => void
    /**
     * @default false
     */
    isJobView?: boolean
    /**
     * @default false
     */
    isBulkTrigger?: boolean
}

export interface GetTriggerBuildPayloadProps {
    ciConfiguredGitMaterialId: number
    materialList: CIMaterialType[]
    runtimeParams: RuntimePluginVariables[]
    selectedEnv: EnvironmentWithSelectPickerType
    isJobCI: boolean
    invalidateCache: boolean
    ciNodeId: number
}

export interface TriggerBuildPayloadType {
    pipelineId: number
    ciPipelineMaterials: CIPipelineMaterialDTO[]
    invalidateCache: boolean
    pipelineType: CIPipelineBuildType.CI_JOB | CIPipelineBuildType.CI_BUILD
    environmentId?: number
    runtimeParamsPayload?: RuntimeParamsTriggerPayloadType
}

export interface TriggerBuildProps {
    payload: TriggerBuildPayloadType
    /**
     * Only need in case of job
     */
    redirectToCIPipeline?: () => void
}

export interface GetCIMaterialsProps extends Pick<APIOptions, 'abortControllerRef'> {
    ciNodeId: string
    selectedWorkflow: WorkflowType
    isCINodePresent: boolean
}
