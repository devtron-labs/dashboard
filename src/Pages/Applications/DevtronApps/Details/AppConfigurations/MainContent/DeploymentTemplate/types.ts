import { SyntheticEvent } from 'react'
import {
    ConfigKeysWithLockType,
    DeploymentTemplateQueryParamsType,
    AppEnvironment,
    DeploymentChartVersionType,
    ChartMetadataType,
    DeploymentTemplateConfigState,
} from '@devtron-labs/devtron-fe-common-lib'
import { Operation } from 'fast-json-patch'
import { DeploymentTemplateGUIViewProps } from '@Components/deploymentConfig/types'

export interface DeploymentTemplateProps {
    respondOnSuccess: (redirection: boolean) => void
    /**
     * Given in case we have'nt saved any deployment template
     * If true, would show chart type selector.
     */
    isUnSet: boolean
    /**
     * Something related to git-ops
     */
    isCiPipeline: boolean
    environments: AppEnvironment[]
    isProtected: boolean
    reloadEnvironments: () => void
    environmentName?: string
}

export interface DeploymentTemplateChartStateType {
    charts: DeploymentChartVersionType[]
    chartsMetadata: Record<string, ChartMetadataType>
}

export interface DeploymentTemplateOptionsHeaderProps
    extends Pick<DeploymentTemplateQueryParamsType, 'editMode' | 'showReadMe' | 'selectedTab'>,
        Pick<DeploymentTemplateProps, 'isUnSet'> {
    disableVersionSelect: boolean
    handleChangeToGUIMode: () => void
    handleChangeToYAMLMode: () => void
    unableToParseYaml: boolean
    canEditTemplate: boolean
    restoreLastSavedTemplate: () => void
    handleChartChange: (selectedChart: DeploymentChartVersionType) => void
    selectedChart: DeploymentChartVersionType
    chartDetails: DeploymentTemplateChartStateType
}

export interface DeploymentTemplateEditorDataStateType
    extends Omit<DeploymentTemplateConfigState, 'editorTemplateWithoutLockedKeys'> {
    unableToParseYaml: boolean
    removedPatches: Operation[]
}

// Can derive editMode from url as well, just wanted the typing to be more explicit
export interface DeploymentTemplateFormProps
    extends Pick<DeploymentTemplateQueryParamsType, 'editMode' | 'hideLockedKeys'>,
        Pick<DeploymentTemplateProps, 'isUnSet'>,
        Pick<
            DeploymentTemplateGUIViewProps,
            'wasGuiOrHideLockedKeysEdited' | 'handleChangeToYAMLMode' | 'handleEnableWasGuiOrHideLockedKeysEdited'
        >,
        Pick<DeploymentTemplateConfigState, 'guiSchema' | 'selectedChart' | 'schema'> {
    editorOnChange: (value: string) => void
    lockedConfigKeysWithLockType: ConfigKeysWithLockType
    readOnly: boolean
    editedDocument: string
    uneditedDocument: string
}

export interface ResolvedEditorTemplateType {
    originalTemplate: string
    templateWithoutLockedKeys: string
}

export interface DeploymentTemplateCTAProps
    extends Pick<DeploymentTemplateQueryParamsType, 'showReadMe' | 'selectedTab'>,
        Pick<DeploymentTemplateProps, 'isCiPipeline'> {
    isLoading: boolean
    isDisabled: boolean
    showApplicationMetrics: boolean
    isAppMetricsEnabled: boolean
    selectedChart: DeploymentChartVersionType
    isInheriting: boolean
    handleSave: (e: SyntheticEvent) => void
    toggleAppMetrics: () => void
}
