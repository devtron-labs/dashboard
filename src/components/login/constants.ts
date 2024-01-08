/**
 * Authorization config types for SSO
 */
export const AUTHORIZATION_CONFIG_TYPES = {
    DEVTRON_MANAGED: 'devtron-system-managed',
    GROUP_CLAIMS: 'group-claims',
} as const

export const SwitchItemValues = {
    Sample: 'sample',
    Configuration: 'configuration',
}

export enum SSOProvider {
    google = 'google',
    github = 'github',
    gitlab = 'gitlab',
    microsoft = 'microsoft',
    ldap = 'ldap',
    oidc = 'oidc',
    openshift = 'openshift',
}

// FIXME: The following constants can be combined into a single config constant and used across
export const ssoDocumentationMap: Record<SSOProvider, string> = {
    google: 'https://dexidp.io/docs/connectors/google/',
    github: 'https://dexidp.io/docs/connectors/github/',
    gitlab: 'https://dexidp.io/docs/connectors/gitlab/',
    microsoft: 'https://dexidp.io/docs/connectors/microsoft/',
    ldap: 'https://dexidp.io/docs/connectors/ldap/',
    oidc: 'https://dexidp.io/docs/connectors/oidc/',
    openshift: 'https://dexidp.io/docs/connectors/openshift/',
}

/**
 * List of providers for which the flow should be configured
 *
 * Note: Remove once ON for all providers
 */
export const autoAssignPermissionsFlowActiveProviders = [SSOProvider.microsoft, SSOProvider.ldap]

export const ssoProviderToDisplayNameMap: Record<SSOProvider, string> = {
    [SSOProvider.google]: 'Google',
    [SSOProvider.github]: 'GitHub',
    [SSOProvider.gitlab]: 'GitLab',
    [SSOProvider.microsoft]: 'Microsoft',
    [SSOProvider.ldap]: 'LDAP',
    [SSOProvider.oidc]: 'OIDC',
    [SSOProvider.openshift]: 'OpenShift',
} as const
