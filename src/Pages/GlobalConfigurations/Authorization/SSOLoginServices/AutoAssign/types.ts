import { ReactNode } from 'react'

import { DocLinkProps, UserRoleGroup } from '@devtron-labs/devtron-fe-common-lib'

import { CONFIG_TYPES } from './constants'

/**
 * Currently only microsoft and ldap are supported
 */
type SSOProviders = 'microsoft' | 'ldap' | 'oidc'

/**
 * Configuration types for the SSO providers
 */
type ConfigType = (typeof CONFIG_TYPES)[keyof typeof CONFIG_TYPES]

export interface AutoAssignToggleTileProps {
    /**
     * If the toggle is enabled
     */
    isSelected: boolean
    /**
     * External on change handler for the toggle
     */
    onChange: (isSelected: boolean) => void
    /**
     * Type of the provider for which the toggle is enabled
     */
    ssoType: SSOProviders
}

interface TippyConfig {
    /**
     * Heading for the tippy
     */
    heading: string
    /**
     * Information about the tippy
     */
    infoText: string
}

export type SSOConfig = Record<
    SSOProviders,
    {
        /**
         * Permission group name for the SSO provider
         *
         * eg: Azure active directory for Microsoft
         */
        permissionGroupName: string
        /**
         * Documentation link for AD for the SSO provider
         */
        documentationLink: string
        /**
         * Configuration for the tippy
         */
        tippyConfig: TippyConfig
        /**
         * Documentation link for the SSO provider
         */
        devtronDocLink?: DocLinkProps['docLinkKey']
    }
>

export type LearnMoreProps = TippyConfig & {
    /**
     * Documentation link for the AD
     */
    documentationLink?: string
    /**
     * Documentation text for the AD
     */
    documentationText?: string
    /**
     * Devtron documentation link
     */
    devtronDocLink?: DocLinkProps['docLinkKey']
}

/**
 * Configuration regarding how the permissions are managed when SSO is configured
 */
export type AuthorizationGlobalConfig = Record<ConfigType, boolean>

export interface AuthorizationGlobalConfigRes {
    result?: {
        configType: ConfigType
        /**
         * If true, the corresponding configuration is ON
         */
        active: boolean
    }[]
}

export interface UserPermissionConfirmationModalProps {
    /**
     * On close handler for the modal
     */
    handleCancel: () => void
    /**
     * Permissions save handler for the modal
     */
    handleSave: () => void
    /**
     * If true, the APIs are in loading state & loader is displayed
     */
    isLoading: boolean
    /**
     * SSO Provider for which the permissions are being updated
     */
    ssoType: SSOProviders
}

export interface AuthorizationGlobalConfigWrapperProps {
    children: ReactNode
    /**
     * the `isAutoAssignFlowEnabled` is controlled via the wrapper component
     */
    setIsAutoAssignFlowEnabled: (isAutoAssignFlowEnabled: boolean) => void
}

export interface UserAutoAssignedRoleGroupsTableProps {
    roleGroups: UserRoleGroup[]
}
