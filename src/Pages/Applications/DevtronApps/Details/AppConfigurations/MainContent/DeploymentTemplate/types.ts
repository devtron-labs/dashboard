import { SyntheticEvent } from 'react'
import { GroupBase } from 'react-select'
import {
    ConfigKeysWithLockType,
    DeploymentTemplateQueryParamsType,
    AppEnvironment,
    DeploymentChartVersionType,
    ChartMetadataType,
    DeploymentTemplateConfigState,
    TemplateListType,
    SelectPickerOptionType,
    TemplateListDTO,
    SelectedChartDetailsType,
} from '@devtron-labs/devtron-fe-common-lib'
import { Operation } from 'fast-json-patch'
import { DeploymentTemplateGUIViewProps } from '@Components/deploymentConfig/types'

export interface DeploymentTemplateProps {
    respondOnSuccess?: (redirection: boolean) => void
    /**
     * Given in case we have'nt saved any deployment template
     * If true, would show chart type selector.
     */
    isUnSet?: boolean
    /**
     * Something related to git-ops
     */
    isCiPipeline?: boolean
    environments: AppEnvironment[]
    isProtected: boolean
    reloadEnvironments: () => void
    environmentName?: string
    clusterId?: string
}

export interface DeploymentTemplateChartStateType {
    charts: DeploymentChartVersionType[]
    chartsMetadata: Record<string, ChartMetadataType>
    globalChartRefId: number
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

export interface DeploymentTemplateEditorHeaderProps
    extends Pick<DeploymentTemplateQueryParamsType, 'showReadMe'>,
        Pick<DeploymentTemplateProps, 'isUnSet'> {
    selectedChartVersion: string
    isOverridden: boolean
    handleOverride: () => void
    showOverrideButton: boolean
    environmentName: string
    isCompareView: boolean
    latestDraft: any
    readOnly: boolean
}

// Can derive editMode from url as well, just wanted the typing to be more explicit
export interface DeploymentTemplateFormProps
    extends Pick<DeploymentTemplateQueryParamsType, 'editMode' | 'hideLockedKeys' | 'showReadMe'>,
        Pick<DeploymentTemplateProps, 'isUnSet'>,
        Pick<
            DeploymentTemplateGUIViewProps,
            'wasGuiOrHideLockedKeysEdited' | 'handleChangeToYAMLMode' | 'handleEnableWasGuiOrHideLockedKeysEdited'
        >,
        Pick<DeploymentTemplateConfigState, 'guiSchema' | 'selectedChart' | 'schema'>,
        Pick<DeploymentTemplateEditorHeaderProps, 'isOverridden' | 'environmentName' | 'latestDraft'> {
    editorOnChange: (value: string) => void
    lockedConfigKeysWithLockType: ConfigKeysWithLockType
    readOnly: boolean
    editedDocument: string
    uneditedDocument: string
    readMe: string
    isPublishedValuesView: boolean
    handleOverride: () => void
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
    shouldDisableEditingInheritedTemplate: boolean
    handleSave: (e: SyntheticEvent) => void
    toggleAppMetrics: () => void
}

export interface CompareWithValuesDataStoreItemType {
    id: number
    originalTemplate: string
    resolvedTemplate: string
    originalTemplateWithoutLockedKeys: string
    resolvedTemplateWithoutLockedKeys: string
}

export type CompareWithOptionGroupKindType =
    | TemplateListType.DefaultVersions
    | TemplateListType.DeployedOnSelfEnvironment
    | TemplateListType.PublishedOnEnvironments

export interface CompareWithTemplateGroupedSelectPickerOptionType extends GroupBase<SelectPickerOptionType> {}

export interface TemplateListItemType extends TemplateListDTO {
    /**
     * This ID is generated at UI, not from the server. DO NOT USE THIS FOR COMMUNICATION WITH SERVER
     */
    id: number
}

export interface HandleFetchDeploymentTemplateReturnType {
    globalTemplate: string
    templateConfig: Omit<DeploymentTemplateConfigState, keyof SelectedChartDetailsType>
}

export interface DeleteOverrideDialogProps {
    environmentConfigId: number
    handleReload: () => void
    handleClose: () => void
    handleShowDeleteDraftOverrideDialog: () => void
    reloadEnvironments: () => void
}
