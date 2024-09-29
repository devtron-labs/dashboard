import {
    ConfigHeaderTabType,
    ConfigToolbarPopupMenuConfigType,
    ConfigToolbarPopupNodeType,
    DeploymentTemplateConfigState,
    OverrideMergeStrategyType,
    ProtectConfigTabsType,
} from '@devtron-labs/devtron-fe-common-lib'
import { FunctionComponent, ReactNode } from 'react'

export interface ConfigHeaderProps {
    configHeaderTab: ConfigHeaderTabType
    handleTabChange: (tab: ConfigHeaderTabType) => void
    areChangesPresent: boolean
    isDisabled: boolean
    /**
     * If false, can not override config and will show values tab as Configuration
     */
    isOverridable: boolean
    /**
     * This prop holds meaning if isOverridable is true
     * This depicts if we show No override if false,
     * In case of true, we show Override
     */
    isPublishedTemplateOverridden: boolean
}

export interface ConfigHeaderTabProps
    extends Pick<
        ConfigHeaderProps,
        'handleTabChange' | 'isDisabled' | 'areChangesPresent' | 'isOverridable' | 'isPublishedTemplateOverridden'
    > {
    tab: ConfigHeaderTabType
    activeTabIndex: number
    currentTabIndex: number
}

export interface ConfigHeaderTabConfigType {
    text: string
    icon?: FunctionComponent<React.SVGProps<SVGSVGElement>> | null
}

interface ConfigToolbarPopupConfigType {
    menuConfig: Record<string, ConfigToolbarPopupMenuConfigType[]>
    /**
     * If true, would show popupMenuNode in body of the popup menu
     */
    popupNodeType?: ConfigToolbarPopupNodeType
    /**
     * If provided, will replace the popup menu view with the provided node given popupMenuConfig is not empty
     */
    popupMenuNode?: ReactNode
}

export interface ConfigToolbarProps {
    configHeaderTab: ConfigHeaderTabType
    handleToggleScopedVariablesView: () => void
    resolveScopedVariables: boolean
    /**
     * Route for redirection to base configurations shown in case configHeaderTab is inherited
     */
    baseConfigurationURL: string
    /**
     * Will feed the selected tab in the protection tab group
     */
    selectedProtectionViewTab: ProtectConfigTabsType
    handleProtectionViewTabChange: (tab: ProtectConfigTabsType) => void

    handleToggleCommentsView: () => void
    /**
     * Would show red dot on comments icon if comments are present
     */
    areCommentsPresent: boolean

    showMergePatchesButton: boolean
    shouldMergeTemplateWithPatches: boolean
    handleToggleShowTemplateMergedWithPatch: () => void

    mergeStrategy: OverrideMergeStrategyType
    handleMergeStrategyChange: (strategy: OverrideMergeStrategyType) => void

    /**
     * Used to place toggle editor view and chart selectors in deployment template
     */
    children?: ReactNode
    /**
     * If provided, will show the button to enable the readme view
     */
    handleEnableReadmeView?: () => void
    /**
     * If provided, will show popup menu on click three dots button
     * If empty/null, will not show the button
     */
    popupConfig?: ConfigToolbarPopupConfigType
    /**
     * @default false
     */
    isProtected?: boolean
    /**
     * @default false
     */
    isApprovalPending?: boolean
    isDraftPresent?: boolean
    approvalUsers: string[]
    /**
     * Loading state fetching initial info (template, draft info, etc) to hide comments, approvals.
     */
    isLoadingInitialData: boolean
    /**
     * @default - false
     * If given would disable all the actions
     */
    disableAllActions?: boolean
    /**
     * This key means if have saved a draft and have not proposed it yet, and we are creating a new entity like override.
     * @default - true
     * If false we will hide all the action in toolbar.
     */
    isPublishedConfigPresent?: boolean
}

interface ConfigToolbarPopupMenuLockedConfigDataType {
    /**
     * If false would not show hide/show locked keys button
     */
    areLockedKeysPresent: boolean
    hideLockedKeys: boolean
    handleSetHideLockedKeys: (value: boolean) => void
}

export interface GetConfigToolbarPopupConfigProps {
    /**
     * If not provided won't show locked config data
     */
    lockedConfigData?: ConfigToolbarPopupMenuLockedConfigDataType | null
    configHeaderTab: ConfigHeaderTabType
    isOverridden: boolean
    isPublishedValuesView: boolean
    isPublishedConfigPresent: boolean
    handleDeleteOverride: () => void
    handleDiscardDraft: () => void
    unableToParseData: boolean
    isLoading: boolean
    isDraftAvailable: boolean
    handleShowEditHistory: () => void
}

export interface ConfigDryRunProps {
    isLoading: boolean
    handleToggleResolveScopedVariables: () => void
    resolveScopedVariables: boolean
    showManifest: boolean
    chartRefId?: number
    editorTemplate: string
    editorSchema?: DeploymentTemplateConfigState['schema']
    selectedChartVersion?: string
    dryRunEditorMode: string
    handleChangeDryRunEditorMode: (mode: string) => void
    isDraftPresent: boolean
    isPublishedConfigPresent: boolean
}

export interface ToggleResolveScopedVariablesProps {
    resolveScopedVariables: boolean
    handleToggleScopedVariablesView: () => void
    isDisabled?: boolean
}
