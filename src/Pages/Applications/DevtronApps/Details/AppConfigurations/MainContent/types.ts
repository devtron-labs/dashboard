import {
    ConfigHeaderTabType,
    ConfigToolbarPopupMenuConfigType,
    OverrideMergeStrategyType,
    ProtectConfigTabsType,
} from '@devtron-labs/devtron-fe-common-lib'
import { FunctionComponent, ReactNode } from 'react'

export interface ConfigHeaderProps {
    configHeaderTab: ConfigHeaderTabType
    handleTabChange: (tab: ConfigHeaderTabType) => void
}
export interface ConfigHeaderTabProps extends Pick<ConfigHeaderProps, 'handleTabChange'> {
    tab: ConfigHeaderTabType
    activeTabIndex: number
    currentTabIndex: number
}

export interface ConfigHeaderTabConfigType {
    text: string
    icon?: FunctionComponent<React.SVGProps<SVGSVGElement>> | null
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

    shouldDisableActions: boolean
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
    popupMenuConfig?: {
        items: ConfigToolbarPopupMenuConfigType[]
        /**
         * If provided will append this node to the footer of the popup menu with a separator above it
         */
        footerConfig?: ConfigToolbarPopupMenuConfigType
    }
    /**
     * If provided, will replace the popup menu view with the provided node given popupMenuConfig is not empty
     */
    popupMenuNode?: ReactNode
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
    isLoading: boolean
}
