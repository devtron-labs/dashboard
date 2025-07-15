import { ChangeEvent, Dispatch, SetStateAction } from 'react'

import {
    CIMaterialSidebarType,
    CIMaterialType,
    RuntimePluginVariables,
    WorkflowType,
} from '@devtron-labs/devtron-fe-common-lib'

import { EnvironmentWithSelectPickerType } from '@Components/CIPipelineN/types'

import { BuildImageModalProps, HandleRuntimeParamChange, RefreshMaterialType, RuntimeParamsErrorState } from '../types'

export interface TriggerBuildSidebarProps {
    currentSidebarTab: CIMaterialSidebarType
    handleSidebarTabChange: (e: ChangeEvent<HTMLInputElement>) => void
    runtimeParamsErrorState: RuntimeParamsErrorState
    materialList: CIMaterialType[]
    clearSearch: () => void
    selectMaterial: (materialId: string) => void
    refreshMaterial: RefreshMaterialType['refresh']
    ciNodeId: number
}

export type GitInfoMaterialProps = Pick<BuildImageModalProps, 'appId' | 'isJobView'> & {
    workflow: WorkflowType
    setMaterialList: Dispatch<SetStateAction<CIMaterialType[]>>
    runtimeParamsErrorState: RuntimeParamsErrorState
    materialList: CIMaterialType[]
    showWebhookModal: boolean
    reloadCompleteMaterialList: () => void
    onClickShowBranchRegexModal: () => void
    handleRuntimeParamChange: HandleRuntimeParamChange
    handleRuntimeParamError: (errorState: RuntimeParamsErrorState) => void
    selectedEnv: EnvironmentWithSelectPickerType
    runtimeParams: RuntimePluginVariables[]
    handleDisplayWebhookModal: () => void
}
