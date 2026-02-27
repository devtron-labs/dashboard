import { SSOConfig } from './types'

export const SSO_CONFIG: SSOConfig = {
    microsoft: {
        permissionGroupName: 'Azure Active Directory',
        tippyConfig: {
            heading: 'Groups on Azure Active Directory',
            infoText:
                'Upon user login, Devtron will check for Azure Active Directory Groups associated with the user and assign them to Permission Groups with the same name in Devtron.',
        },
        documentationLink: 'https://learn.microsoft.com/en-us/entra/fundamentals/groups-view-azure-portal/',
        devtronDocLink: 'GLOBAL_CONFIG_SSO_LOGIN_MICROSOFT',
    },
    ldap: {
        permissionGroupName: 'LDAP User Groups',
        tippyConfig: {
            heading: 'LDAP User Groups',
            infoText:
                'Upon user login, Devtron will check for LDAP User Groups associated with the user and assign them to Permission Groups with the same name in Devtron.',
        },
        documentationLink: 'https://www.ldap.com/',
        devtronDocLink: 'GLOBAL_CONFIG_SSO_LOGIN_LDAP',
    },
    oidc: {
        permissionGroupName: 'OpenID Connect',
        tippyConfig: {
            heading: 'OpenID Connect',
            infoText:
                'Upon user login, Devtron will check for OpenID Connect Groups associated with the user and assign them to Permission Groups with the same name in Devtron.',
        },
        documentationLink: 'https://openid.net/connect/',
        devtronDocLink: 'GLOBAL_CONFIG_SSO_LOGIN_OIDC',
    },
} as const

export const CONFIG_TYPES = {
    DEVTRON_MANAGED: 'devtron-system-managed',
    GROUP_CLAIMS: 'group-claims',
} as const
