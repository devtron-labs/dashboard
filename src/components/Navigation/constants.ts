import { NavigationGroupType, NavigationItemType, ROUTER_URLS, SERVER_MODE } from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'

import { filterNavGroupAndItem } from './utils'

const APPLICATION_MANAGEMENT_POLICIES_NAV_ITEM: NavigationItemType = importComponentFromFELibrary(
    'APPLICATION_MANAGEMENT_POLICIES_NAV_ITEM',
    null,
    'function',
)

const APPLICATION_MANAGEMENT_TEMPLATES_NAV_ITEM: NavigationItemType = importComponentFromFELibrary(
    'APPLICATION_MANAGEMENT_TEMPLATES_NAV_ITEM',
    null,
    'function',
)

const RESOURCE_WATCHER_NAV_ITEM: NavigationItemType = importComponentFromFELibrary(
    'RESOURCE_WATCHER_NAV_ITEM',
    null,
    'function',
)

const SECURITY_ENABLEMENT_NAV_ITEM: NavigationItemType = importComponentFromFELibrary(
    'SECURITY_ENABLEMENT_NAV_ITEM',
    null,
    'function',
)

const DATA_PROTECTION_MANAGEMENT_NAV_GROUP: NavigationGroupType = importComponentFromFELibrary(
    'DATA_PROTECTION_MANAGEMENT_NAV_GROUP',
    null,
    'function',
)

const COST_VISIBILITY_NAV_GROUP: NavigationGroupType = importComponentFromFELibrary(
    'COST_VISIBILITY_NAV_GROUP',
    null,
    'function',
)

const SDH_NAV_GROUP: NavigationGroupType = importComponentFromFELibrary('SDH_NAV_GROUP', null, 'function')

export const APPLICATION_MANAGEMENT_CONFIGURATIONS: NavigationItemType['subItems'] = [
    {
        title: 'GitOps',
        dataTestId: 'click-on-configurations-gitops',
        id: 'application-management-configurations-gitops',
        href: ROUTER_URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS.GITOPS,
        keywords: ['config'],
    },
    {
        title: 'Git Accounts',
        dataTestId: 'click-on-configurations-git-accounts',
        id: 'application-management-configurations-git-accounts',
        href: ROUTER_URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS.GIT_ACCOUNTS,
        keywords: ['config'],
    },
    {
        title: 'Deployment Charts',
        dataTestId: 'click-on-configurations-deployment-charts',
        id: 'application-management-configurations-deployment-charts',
        href: ROUTER_URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS.DEPLOYMENT_CHARTS,
        keywords: ['config'],
    },
    {
        title: 'Notifications',
        dataTestId: 'click-on-configurations-notifications',
        id: 'application-management-configurations-notifications',
        href: ROUTER_URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS.NOTIFICATIONS,
        keywords: ['config'],
    },
    {
        title: 'Scoped Variables',
        dataTestId: 'click-on-configurations-scoped-variables',
        id: 'application-management-configurations-scoped-variables',
        href: ROUTER_URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS.SCOPED_VARIABLES.ROOT,
        keywords: ['config'],
        forceHideEnvKey: 'ENABLE_SCOPED_VARIABLES',
    },
    {
        title: 'Build Infra',
        dataTestId: 'click-on-configurations-build-infra',
        id: 'application-management-configurations-build-infra',
        href: ROUTER_URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS.BUILD_INFRA.ROOT,
        keywords: ['config'],
    },
]

const GLOBAL_CONFIGURATION_AUTHORIZATION: NavigationItemType['subItems'] = [
    {
        title: 'User Permissions',
        dataTestId: 'user-permissions',
        id: 'global-configuration-authorization-user-permissions',
        href: ROUTER_URLS.GLOBAL_CONFIG_AUTH.USERS,
        isAvailableInEA: true,
    },
    {
        title: 'Permission Groups',
        dataTestId: 'permission-groups',
        id: 'global-configuration-authorization-permission-groups',
        href: ROUTER_URLS.GLOBAL_CONFIG_AUTH.GROUPS,
        isAvailableInEA: true,
    },
    {
        title: 'API Tokens',
        dataTestId: 'authorization-api-tokens',
        id: 'global-configuration-authorization-api-tokens',
        href: ROUTER_URLS.GLOBAL_CONFIG_AUTH.API_TOKEN,
        isAvailableInEA: true,
    },
]

const NAVIGATION_LIST: NavigationGroupType[] = [
    {
        id: 'application-management',
        title: 'Application Management',
        icon: 'ic-application-management',
        items: [
            {
                title: 'Overview',
                dataTestId: 'application-management-overview',
                id: 'application-management-overview',
                icon: 'ic-chart-line-up',
                href: ROUTER_URLS.APPLICATION_MANAGEMENT_OVERVIEW,
            },
            {
                title: 'Devtron Applications',
                dataTestId: 'click-on-devtron-application',
                id: 'application-management-devtron-applications',
                icon: 'ic-application',
                href: ROUTER_URLS.DEVTRON_APP,
            },
            {
                title: 'Application Groups',
                dataTestId: 'click-on-application-groups',
                id: 'application-management-application-groups',
                icon: 'ic-application-group',
                href: ROUTER_URLS.APP_GROUP,
            },
            {
                title: 'Bulk Edit',
                dataTestId: 'click-on-bulk-edit',
                id: 'application-management-bulk-edit',
                icon: 'ic-code',
                href: ROUTER_URLS.BULK_EDIT,
            },
            ...(APPLICATION_MANAGEMENT_TEMPLATES_NAV_ITEM ? [APPLICATION_MANAGEMENT_TEMPLATES_NAV_ITEM] : []),
            {
                title: 'Configurations',
                dataTestId: 'click-on-configurations',
                id: 'application-management-configurations',
                hasSubMenu: true,
                subItems: APPLICATION_MANAGEMENT_CONFIGURATIONS,
            },
            ...(APPLICATION_MANAGEMENT_POLICIES_NAV_ITEM ? [APPLICATION_MANAGEMENT_POLICIES_NAV_ITEM] : []),
        ],
    },
    {
        id: 'infrastructure-management',
        title: 'Infrastructure Management',
        icon: 'ic-infrastructure-management',
        items: [
            {
                title: 'Overview',
                dataTestId: 'infrastructure-management-overview',
                id: 'infrastructure-management-overview',
                icon: 'ic-chart-line-up',
                href: ROUTER_URLS.INFRASTRUCTURE_MANAGEMENT_OVERVIEW,
                isAvailableInEA: true,
            },
            {
                title: 'Applications',
                dataTestId: 'click-on-application',
                id: 'infrastructure-management-applications',
                icon: 'ic-grid-view',
                href: ROUTER_URLS.INFRASTRUCTURE_MANAGEMENT_APPS,
                isAvailableInEA: true,
            },
            {
                title: 'Chart Store',
                dataTestId: 'click-on-chart-store',
                id: 'infrastructure-management-chart-store',
                icon: 'ic-helm',
                href: ROUTER_URLS.CHART_STORE,
                isAvailableInEA: true,
            },
            {
                title: 'Resource Browser',
                dataTestId: 'resource-browser',
                id: 'infrastructure-management-resource-browser',
                icon: 'ic-resource-browser',
                href: ROUTER_URLS.RESOURCE_BROWSER.ROOT,
                isAvailableInEA: true,
            },
            ...(RESOURCE_WATCHER_NAV_ITEM ? [RESOURCE_WATCHER_NAV_ITEM] : []),
        ],
        isAvailableInEA: true,
    },
    ...(SDH_NAV_GROUP ? [SDH_NAV_GROUP] : []),
    ...(COST_VISIBILITY_NAV_GROUP ? [COST_VISIBILITY_NAV_GROUP] : []),
    {
        id: 'security-center',
        title: 'Security Center',
        icon: 'ic-shield-check',
        items: [
            {
                title: 'Overview',
                dataTestId: 'security-center-overview',
                id: 'security-center-overview',
                href: ROUTER_URLS.SECURITY_CENTER_OVERVIEW,
                icon: 'ic-chart-line-up',
            },
            {
                title: 'Vulnerabilities',
                dataTestId: 'security-vulnerabilities',
                id: 'security-center-security-vulnerabilities',
                href: ROUTER_URLS.SECURITY_CENTER_VULNERABILITIES,
                icon: 'ic-bug',
            },
            ...(SECURITY_ENABLEMENT_NAV_ITEM ? [SECURITY_ENABLEMENT_NAV_ITEM] : []),
            {
                title: 'Security Policy',
                dataTestId: 'security-policy',
                id: 'security-center-security-policy',
                href: ROUTER_URLS.SECURITY_CENTER_POLICIES,
                icon: 'ic-security-policy',
            },
        ],
    },
    {
        id: 'automation-and-enablement',
        title: 'Automation & Enablement',
        icon: 'ic-bot',
        items: [
            {
                title: 'Jobs',
                dataTestId: 'jobs',
                id: 'automation-and-enablement-jobs',
                icon: 'ic-k8s-job',
                href: ROUTER_URLS.JOBS,
            },
        ],
    },
    ...(DATA_PROTECTION_MANAGEMENT_NAV_GROUP ? [DATA_PROTECTION_MANAGEMENT_NAV_GROUP] : []),
    {
        id: 'global-configuration',
        title: 'Global Configuration',
        icon: 'ic-gear',
        items: [
            {
                title: 'SSO Login Services',
                dataTestId: 'sso-login-services',
                id: 'global-configuration-sso-login-services',
                icon: 'ic-key',
                href: ROUTER_URLS.GLOBAL_CONFIG_AUTH.LOGIN_SERVICE,
                isAvailableInEA: true,
            },
            {
                title: 'Host URL',
                dataTestId: 'host-url',
                id: 'global-configuration-host-urls',
                icon: 'ic-link',
                href: ROUTER_URLS.GLOBAL_CONFIG_HOST_URL,
            },
            {
                title: 'External Links',
                dataTestId: 'click-on-configurations-external-links',
                id: 'global-configuration-external-links',
                href: ROUTER_URLS.GLOBAL_CONFIG_EXTERNAL_LINKS,
                icon: 'ic-external-link',
                isAvailableInEA: true,
            },
            {
                title: 'Chart Repository',
                dataTestId: 'click-on-configurations-chart-repository',
                id: 'global-configuration-chart-repository',
                href: ROUTER_URLS.GLOBAL_CONFIG_CHART_REPOSITORIES,
                icon: 'ic-chart-repo',
                isAvailableInEA: true,
            },
            {
                title: 'Cluster & Environments',
                dataTestId: 'cluster-and-environments',
                id: 'global-configuration-cluster-and-environments',
                icon: 'ic-cluster',
                href: ROUTER_URLS.GLOBAL_CONFIG_CLUSTER_ENV,
                isAvailableInEA: true,
            },
            {
                title: 'Container/OCI Registry',
                dataTestId: 'container-oci-registry',
                id: 'global-configuration-container-oci-registry',
                icon: 'ic-folder',
                href: ROUTER_URLS.GLOBAL_CONFIG_DOCKER,
                isAvailableInEA: true,
            },
            {
                title: 'Projects',
                dataTestId: 'click-on-projects',
                id: 'global-configuration-projects',
                icon: 'ic-folder',
                href: ROUTER_URLS.GLOBAL_CONFIG_PROJECTS,
                isAvailableInEA: true,
            },
            {
                title: 'Authorization',
                dataTestId: 'authorization',
                id: 'global-configuration-authorization',
                hasSubMenu: true,
                subItems: GLOBAL_CONFIGURATION_AUTHORIZATION,
                isAvailableInEA: true,
            },
        ],
        isAvailableInEA: true,
    },
]

export const getNavigationList = (serverMode: SERVER_MODE): NavigationGroupType[] => {
    const filteredNavGroup = NAVIGATION_LIST.filter((group) =>
        filterNavGroupAndItem(
            { forceHideEnvKey: group.forceHideEnvKey, hideNav: group.hideNav, isAvailableInEA: group.isAvailableInEA },
            serverMode,
        ),
    )

    const filteredNavItems = filteredNavGroup.map((group) => {
        const filteredItems = group.items.filter((item) =>
            filterNavGroupAndItem(
                {
                    forceHideEnvKey: item.forceHideEnvKey,
                    hideNav: item.hideNav,
                    isAvailableInEA: item.isAvailableInEA,
                },
                serverMode,
            ),
        )
        return { ...group, items: filteredItems }
    })

    return filteredNavItems.map((group) => ({
        ...group,
        items: group.items.map((item) => {
            if (item.hasSubMenu && item.subItems) {
                const filteredSubItems = item.subItems.filter((subItem) =>
                    filterNavGroupAndItem(
                        {
                            forceHideEnvKey: subItem.forceHideEnvKey,
                            hideNav: subItem.hideNav,
                            isAvailableInEA: subItem.isAvailableInEA,
                        },
                        serverMode,
                    ),
                )
                return { ...item, subItems: filteredSubItems }
            }
            return item
        }),
    }))
}
