import {
    NavigationGroupType,
    NavigationItemType,
    SERVER_MODE,
    URLS as COMMON_URLS,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import { Routes } from '@Config/constants'
import { URLS } from '@Config/routes'

import { filterNavGroupAndItem } from './utils'

const APPLICATION_MANAGEMENT_POLICIES_NAV_ITEM: NavigationItemType = importComponentFromFELibrary(
    'APPLICATION_MANAGEMENT_POLICIES_NAV_GROUP',
    null,
    'function',
)

const APPLICATION_MANAGEMENT_TEMPLATES_NAV_ITEM: NavigationItemType = importComponentFromFELibrary(
    'APPLICATION_MANAGEMENT_TEMPLATES_NAV_GROUP',
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
        href: URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_GITOPS,
        keywords: ['config'],
    },
    {
        title: 'Git Accounts',
        dataTestId: 'click-on-configurations-git-accounts',
        id: 'application-management-configurations-git-accounts',
        href: URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_GIT_ACCOUNTS,
        keywords: ['config'],
    },
    {
        title: 'Deployment Charts',
        dataTestId: 'click-on-configurations-deployment-charts',
        id: 'application-management-configurations-deployment-charts',
        href: COMMON_URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_DEPLOYMENT_CHARTS,
        keywords: ['config'],
    },
    {
        title: 'Notifications',
        dataTestId: 'click-on-configurations-notifications',
        id: 'application-management-configurations-notifications',
        href: URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_NOTIFICATIONS,
        keywords: ['config'],
    },
    {
        title: 'Scoped Variables',
        dataTestId: 'click-on-configurations-scoped-variables',
        id: 'application-management-configurations-scoped-variables',
        href: COMMON_URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_SCOPED_VARIABLES,
        keywords: ['config'],
        forceHideEnvKey: 'ENABLE_SCOPED_VARIABLES',
    },
    {
        title: 'Build Infra',
        dataTestId: 'click-on-configurations-build-infra',
        id: 'application-management-configurations-build-infra',
        href: COMMON_URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_BUILD_INFRA,
        keywords: ['config'],
    },
]

const GLOBAL_CONFIGURATION_AUTHORIZATION: NavigationItemType['subItems'] = [
    {
        title: 'User Permissions',
        dataTestId: 'user-permissions',
        id: 'global-configuration-authorization-user-permissions',
        href: URLS.GLOBAL_CONFIG_AUTH_USER_PERMISSION,
    },
    {
        title: 'Permission Groups',
        dataTestId: 'permission-groups',
        id: 'global-configuration-authorization-permission-groups',
        href: URLS.GLOBAL_CONFIG_AUTH_PERMISSION_GROUPS,
    },
    {
        title: 'API Tokens',
        dataTestId: 'authorization-api-tokens',
        id: 'global-configuration-authorization-api-tokens',
        href: `${URLS.GLOBAL_CONFIG_AUTH}/${Routes.API_TOKEN}/list`,
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
                href: COMMON_URLS.APPLICATION_MANAGEMENT_OVERVIEW,
            },
            {
                title: 'Devtron Applications',
                dataTestId: 'click-on-devtron-application',
                id: 'application-management-devtron-applications',
                icon: 'ic-application',
                href: COMMON_URLS.APPLICATION_MANAGEMENT_APP,
            },
            {
                title: 'Application Groups',
                dataTestId: 'click-on-application-groups',
                id: 'application-management-application-groups',
                icon: 'ic-application-group',
                href: COMMON_URLS.APPLICATION_MANAGEMENT_APPLICATION_GROUP,
            },
            {
                title: 'Bulk Edit',
                dataTestId: 'click-on-bulk-edit',
                id: 'application-management-bulk-edit',
                icon: 'ic-code',
                href: URLS.APPLICATION_MANAGEMENT_BULK_EDIT,
            },
            ...(APPLICATION_MANAGEMENT_TEMPLATES_NAV_ITEM ? [APPLICATION_MANAGEMENT_TEMPLATES_NAV_ITEM] : []),
            {
                title: 'Projects',
                dataTestId: 'click-on-projects',
                id: 'application-management-projects',
                icon: 'ic-folder',
                href: COMMON_URLS.APPLICATION_MANAGEMENT_PROJECTS,
            },
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
                href: COMMON_URLS.INFRASTRUCTURE_MANAGEMENT_OVERVIEW,
                isAvailableInEA: true,
            },
            {
                title: 'Applications',
                dataTestId: 'click-on-application',
                id: 'infrastructure-management-applications',
                icon: 'ic-grid-view',
                href: COMMON_URLS.INFRASTRUCTURE_MANAGEMENT_APP,
                isAvailableInEA: true,
            },
            {
                title: 'Chart Store',
                dataTestId: 'click-on-chart-store',
                id: 'infrastructure-management-chart-store',
                icon: 'ic-helm',
                href: COMMON_URLS.INFRASTRUCTURE_MANAGEMENT_CHART_STORE,
                isAvailableInEA: true,
            },
            {
                title: 'Resource Browser',
                dataTestId: 'resource-browser',
                id: 'infrastructure-management-resource-browser',
                icon: 'ic-resource-browser',
                href: COMMON_URLS.INFRASTRUCTURE_MANAGEMENT_RESOURCE_BROWSER,
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
                href: COMMON_URLS.SECURITY_CENTER_OVERVIEW,
                icon: 'ic-chart-line-up',
                isAvailableInEA: true,
            },
            {
                title: 'Vulnerabilities',
                dataTestId: 'security-vulnerabilities',
                id: 'security-center-security-vulnerabilities',
                href: COMMON_URLS.SECURITY_CENTER_VULNERABILITIES,
                icon: 'ic-bug',
                isAvailableInEA: true,
            },
            ...(SECURITY_ENABLEMENT_NAV_ITEM ? [SECURITY_ENABLEMENT_NAV_ITEM] : []),
            {
                title: 'Security Policy',
                dataTestId: 'security-policy',
                id: 'security-center-security-policy',
                href: COMMON_URLS.SECURITY_CENTER_POLICIES,
                icon: 'ic-security-policy',
                isAvailableInEA: true,
            },
        ],
        isAvailableInEA: true,
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
                href: URLS.AUTOMATION_AND_ENABLEMENT_JOB,
            },
            {
                title: 'Alerting',
                dataTestId: 'alerting',
                id: 'automation-and-enablement-alerting',
                icon: 'ic-bug',
                href: '/dummy-url',
                disabled: true,
            },
            {
                title: 'Incident Response',
                dataTestId: 'incident-response',
                id: 'automation-and-enablement-incident-response',
                icon: 'ic-clipboard',
                href: '/dummy-url',
                disabled: true,
            },
            {
                title: 'API Portal',
                dataTestId: 'api-portal',
                id: 'automation-and-enablement-api-portal',
                icon: 'ic-code',
                href: '/dummy-url',
                disabled: true,
            },
            {
                title: 'Runbook Automation',
                dataTestId: 'runbook-automation',
                id: 'automation-and-enablement-runbook-automation',
                icon: 'ic-book-open',
                href: '/dummy-url',
                disabled: true,
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
                href: `${URLS.GLOBAL_CONFIG_AUTH}/${Routes.SSO_LOGIN_SERVICES}`,
                isAvailableInEA: true,
            },
            {
                title: 'Host URL',
                dataTestId: 'host-url',
                id: 'global-configuration-host-urls',
                icon: 'ic-link',
                href: URLS.GLOBAL_CONFIG_HOST_URL,
            },
            {
                title: 'External Links',
                dataTestId: 'click-on-configurations-external-links',
                id: 'global-configuration-external-links',
                href: URLS.GLOBAL_CONFIG_EXTERNAL_LINKS,
                icon: 'ic-link',
                isAvailableInEA: true,
            },
            {
                title: 'Chart Repository',
                dataTestId: 'click-on-configurations-chart-repository',
                id: 'global-configuration-chart-repository',
                href: URLS.GLOBAL_CONFIG_CHART_REPO,
                icon: 'ic-cube',
                isAvailableInEA: true,
            },
            {
                title: 'Cluster & Environments',
                dataTestId: 'cluster-and-environments',
                id: 'global-configuration-cluster-and-environments',
                icon: 'ic-cluster',
                href: URLS.GLOBAL_CONFIG_CLUSTER,
                isAvailableInEA: true,
            },
            {
                title: 'Container/OCI Registry',
                dataTestId: 'container-oci-registry',
                id: 'global-configuration-container-oci-registry',
                icon: 'ic-folder',
                href: URLS.GLOBAL_CONFIG_DOCKER,
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

export const getNavigationList = (serverMode: SERVER_MODE) =>
    NAVIGATION_LIST.filter((group) =>
        filterNavGroupAndItem(
            { forceHideEnvKey: group.forceHideEnvKey, hideNav: group.hideNav, isAvailableInEA: group.isAvailableInEA },
            serverMode,
        ),
    ).map((group) => ({
        ...group,
        items: (group.items ?? []).filter((item) =>
            filterNavGroupAndItem(
                {
                    forceHideEnvKey: item.forceHideEnvKey,
                    hideNav: item.hideNav,
                    isAvailableInEA: item.isAvailableInEA,
                },
                serverMode,
            ),
        ),
    }))
