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
    extends Pick<DeploymentTemplateQueryParamsType, 'editMode' | 'hideLockedKeys' | 'selectedTab'>,
        Pick<DeploymentTemplateProps, 'isUnSet'>,
        Pick<
            DeploymentTemplateGUIViewProps,
            'wasGuiOrHideLockedKeysEdited' | 'handleChangeToYAMLMode' | 'handleEnableWasGuiOrHideLockedKeysEdited'
        > {
    editorOnChange: (value: string) => void
    lockedConfigKeysWithLockType: ConfigKeysWithLockType
    readOnly: boolean
    /**
     * Used for fetching guiSchema, etc, can also send primitive values
     */
    currentEditorTemplateData: DeploymentTemplateEditorDataStateType
    editedDocument: string
    uneditedDocument: string
}

export interface ResolvedEditorTemplateType {
    originalTemplate: string
    templateWithoutLockedKeys: string
}
