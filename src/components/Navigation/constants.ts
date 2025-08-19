import { URLS as COMMON_URLS } from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import { Routes } from '@Config/constants'
import { URLS } from '@Config/routes'

import { NavigationGroupType, NavigationItemType } from './types'

const FE_LIB_URLS = importComponentFromFELibrary('URLS', {}, 'function')
const FE_LIB_ROUTER_URLS = importComponentFromFELibrary('ROUTER_URLS', {}, 'function')

const APPLICATION_MANAGEMENT_CONFIGURATIONS: NavigationItemType['subItems'] = [
    {
        title: 'GitOps',
        dataTestId: 'click-on-configurations-gitops',
        id: 'application-management-configurations-gitops',
        href: URLS.GLOBAL_CONFIG_GITOPS,
    },
    {
        title: 'Git accounts',
        dataTestId: 'click-on-configurations-git-accounts',
        id: 'application-management-configurations-git-accounts',
        href: URLS.GLOBAL_CONFIG_GIT,
    },
    {
        title: 'External links',
        dataTestId: 'click-on-configurations-external-links',
        id: 'application-management-configurations-external-links',
        href: URLS.GLOBAL_CONFIG_EXTERNAL_LINKS,
    },
    {
        title: 'Chart Repository',
        dataTestId: 'click-on-configurations-chart-repository',
        id: 'application-management-configurations-chart-repository',
        href: URLS.GLOBAL_CONFIG_CHART,
    },
    {
        title: 'Deployment Charts',
        dataTestId: 'click-on-configurations-deployment-charts',
        id: 'application-management-configurations-deployment-charts',
        href: COMMON_URLS.GLOBAL_CONFIG_DEPLOYMENT_CHARTS_LIST,
    },
    {
        title: 'Notifications',
        dataTestId: 'click-on-configurations-notifications',
        id: 'application-management-configurations-notifications',
        href: URLS.GLOBAL_CONFIG_NOTIFIER,
    },
    {
        title: 'Catalog Frameworks',
        dataTestId: 'click-on-configurations-catalog-frameworks',
        id: 'application-management-configurations-catalog-frameworks',
        href: URLS.GLOBAL_CONFIG_CATALOG_FRAMEWORK,
    },
    {
        title: 'Scoped Variables',
        dataTestId: 'click-on-configurations-scoped-variables',
        id: 'application-management-configurations-scoped-variables',
        href: COMMON_URLS.GLOBAL_CONFIG_SCOPED_VARIABLES,
    },
    {
        title: 'Build Infra',
        dataTestId: 'click-on-configurations-build-infra',
        id: 'application-management-configurations-build-infra',
        href: URLS.GLOBAL_CONFIG_BUILD_INFRA,
    },
]

const APPLICATION_MANAGEMENT_POLICIES: NavigationItemType['subItems'] = [
    {
        title: 'Deployment Window',
        dataTestId: 'click-on-policies-deployment-window',
        id: 'application-management-policies-deployment-window',
        href: URLS.GLOBAL_CONFIG_DEPLOYMENT_WINDOW,
    },
    {
        title: 'Approval policy',
        dataTestId: 'click-on-policies-approval-policy',
        id: 'application-management-policies-approval-policy',
        href: FE_LIB_ROUTER_URLS.APPROVAL_POLICY_LIST,
    },
    {
        title: 'Plugin policy',
        dataTestId: 'click-on-policies-plugin-policy',
        id: 'application-management-policies-plugin-policy',
        href: FE_LIB_ROUTER_URLS.PLUGIN_POLICY_PROFILE_LIST,
    },
    {
        title: 'Pull image digest',
        dataTestId: 'click-on-policies-pull-image-digest',
        id: 'application-management-policies-pull-image-digest',
        href: URLS.GLOBAL_CONFIG_PULL_IMAGE_DIGEST,
    },
    {
        title: 'Tag Policy',
        dataTestId: 'click-on-policies-tag-policy',
        id: 'application-management-policies-tag-policy',
        href: URLS.GLOBAL_CONFIG_TAGS,
    },
    {
        title: 'Filter conditions',
        dataTestId: 'click-on-policies-filter-conditions',
        id: 'application-management-policies-filter-conditions',
        href: URLS.GLOBAL_CONFIG_FILTER_CONDITION,
    },
    {
        title: 'Lock Deployment configuration',
        dataTestId: 'click-on-policies-lock-deployment-configuration',
        id: 'application-management-policies-lock-deployment-configuration',
        href: URLS.GLOBAL_CONFIG_LOCK_DEPLOYMENT_CONFIGURATION,
    },
]

const APPLICATION_MANAGEMENT_OTHERS: NavigationItemType['subItems'] = [
    {
        title: 'Application Templates',
        dataTestId: 'click-on-others-application-templates',
        id: 'application-management-others-application-templates',
        href: COMMON_URLS.GLOBAL_CONFIG_TEMPLATES_DEVTRON_APP,
    },
    {
        title: 'Projects',
        dataTestId: 'click-on-others-projects',
        id: 'application-management-others-projects',
        href: URLS.GLOBAL_CONFIG_PROJECT,
    },
]

const COST_VISIBILITY_COST_BREAKDOWN: NavigationItemType['subItems'] = [
    {
        title: 'Clusters',
        dataTestId: 'cost-breakdown-clusters',
        id: 'cost-visibility-cost-breakdown-clusters',
        href: '/cost-breakdown',
        disabled: true,
    },
    {
        title: 'Environments',
        dataTestId: 'cost-breakdown-environments',
        id: 'cost-visibility-cost-breakdown-environments',
        href: '/cost-breakdown',
        disabled: true,
    },
    {
        title: 'Projects',
        dataTestId: 'cost-breakdown-projects',
        id: 'cost-visibility-cost-breakdown-projects',
        href: '/cost-breakdown',
        disabled: true,
    },
    {
        title: 'Applications',
        dataTestId: 'cost-breakdown-applications',
        id: 'cost-visibility-cost-breakdown-applications',
        href: '/cost-breakdown',
        disabled: true,
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

export const NAVIGATION_LIST: NavigationGroupType[] = [
    {
        id: 'application-management',
        title: 'Application Management',
        icon: 'ic-grid-view',
        items: [
            {
                title: 'Overview',
                dataTestId: 'application-management-overview',
                id: 'application-management-overview',
                icon: 'ic-speedometer',
                href: URLS.APPLICATION_MANAGEMENT_OVERVIEW,
                disabled: true,
            },
            {
                title: 'Applications',
                dataTestId: 'click-on-application',
                id: 'application-management-applications',
                icon: 'ic-grid-view',
                href: URLS.APP,
            },
            {
                title: 'Application Groups',
                dataTestId: 'click-on-application-groups',
                id: 'application-management-application-groups',
                icon: 'ic-app-group',
                href: URLS.APPLICATION_GROUP,
            },
            {
                title: 'Chart Store',
                dataTestId: 'click-on-chart-store',
                id: 'application-management-chart-store',
                icon: 'ic-helm',
                href: URLS.CHARTS,
            },
            {
                title: 'Bulk Edit',
                dataTestId: 'click-on-bulk-edit',
                id: 'application-management-bulk-edit',
                icon: 'ic-code',
                href: URLS.BULK_EDITS,
            },
            {
                title: 'Configurations',
                dataTestId: 'click-on-configurations',
                id: 'application-management-configurations',
                hasSubMenu: true,
                subItems: APPLICATION_MANAGEMENT_CONFIGURATIONS,
            },
            {
                title: 'Policies',
                dataTestId: 'click-on-policies',
                id: 'application-management-policies',
                hasSubMenu: true,
                subItems: APPLICATION_MANAGEMENT_POLICIES,
            },
            {
                title: 'Others',
                dataTestId: 'click-on-others',
                id: 'application-management-others',
                hasSubMenu: true,
                subItems: APPLICATION_MANAGEMENT_OTHERS,
            },
        ],
    },
    {
        id: 'infrastructure-management',
        title: 'Infrastructure Management',
        icon: 'ic-cloud',
        items: [
            {
                title: 'Overview',
                dataTestId: 'infrastructure-management-overview',
                id: 'infrastructure-management-overview',
                icon: 'ic-speedometer',
                href: '/dummy-url',
                disabled: true,
            },
            {
                title: 'Resource Browser',
                dataTestId: 'resource-browser',
                id: 'infrastructure-management-resource-browser',
                icon: 'ic-cube',
                href: URLS.RESOURCE_BROWSER,
            },
            {
                title: 'Intercepted Changes',
                dataTestId: 'intercepted-changes',
                id: 'infrastructure-management-intercepted-changes',
                icon: 'ic-files-changed',
                href: `${URLS.RESOURCE_WATCHER}/${FE_LIB_URLS.INTERCEPTED_CHANGES}`,
            },
            {
                title: 'Resource Watcher',
                dataTestId: 'resource-watcher',
                id: 'infrastructure-management-resource-watcher',
                icon: 'ic-monitoring',
                href: `${URLS.RESOURCE_WATCHER}/${FE_LIB_URLS.WATCHERS}`,
            },
            {
                title: 'Catalog Framework',
                dataTestId: 'catalog-framework',
                id: 'infrastructure-management-catalog-framework',
                icon: 'ic-file',
                disabled: true,
                href: '/dummy-url',
            },
        ],
    },
    {
        id: 'software-release-management',
        title: 'Software Release Management',
        icon: 'ic-open-box',
        items: [
            {
                title: 'Overview',
                dataTestId: 'software-release-management-overview',
                id: 'software-release-management-overview',
                icon: 'ic-speedometer',
                href: '/dummy-url',
                disabled: true,
            },
            {
                title: 'Software Release',
                dataTestId: 'software-release',
                id: 'software-release-management-software-release',
                icon: 'ic-open-box',
                href: URLS.SOFTWARE_DISTRIBUTION_HUB,
            },
        ],
    },
    {
        id: 'cost-visibility',
        title: 'Cost Visibility',
        icon: 'ic-coins',
        items: [
            {
                title: 'Overview',
                dataTestId: 'cost-visibility-overview',
                id: 'cost-visibility-overview',
                icon: 'ic-speedometer',
                href: '/cost-overview',
                disabled: true,
            },
            {
                title: 'Cost Breakdown',
                dataTestId: 'cost-breakdown',
                id: 'cost-visibility-cost-breakdown',
                hasSubMenu: true,
                subItems: COST_VISIBILITY_COST_BREAKDOWN,
            },
            {
                title: 'Configurations',
                dataTestId: 'cost-visibility-configurations',
                id: 'cost-visibility-configurations',
                icon: 'ic-gear',
                href: '/cost-configurations',
                disabled: true,
            },
        ],
    },
    {
        id: 'security-center',
        title: 'Security Center',
        icon: 'ic-shield-check',
        items: [
            {
                title: 'Overview',
                dataTestId: 'security-center-overview',
                id: 'security-center-overview',
                icon: 'ic-speedometer',
                href: '/dummy-url',
                disabled: true,
            },
            {
                title: 'Application Security',
                dataTestId: 'application-security',
                id: 'security-center-application-security',
                icon: 'ic-bug',
                href: `${URLS.SECURITY}/scans`,
            },
            {
                title: 'Security Policies',
                dataTestId: 'security-policies',
                id: 'security-center-security-policies',
                icon: 'ic-gavel',
                href: `${URLS.SECURITY}/policies`,
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
                href: URLS.JOB,
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
                title: 'API portal',
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
            },
            {
                title: 'Host URLS',
                dataTestId: 'host-urls',
                id: 'global-configuration-host-urls',
                icon: 'ic-link',
                href: URLS.GLOBAL_CONFIG_HOST_URL,
            },
            {
                title: 'Cluster & environments',
                dataTestId: 'cluster-and-environments',
                id: 'global-configuration-cluster-and-environments',
                icon: 'ic-cluster',
                href: URLS.GLOBAL_CONFIG_CLUSTER,
            },
            {
                title: 'Container/OCI Registry',
                dataTestId: 'container-oci-registry',
                id: 'global-configuration-container-oci-registry',
                icon: 'ic-folder',
                href: URLS.GLOBAL_CONFIG_DOCKER,
            },
            {
                title: 'Authorization',
                dataTestId: 'authorization',
                id: 'global-configuration-authorization',
                hasSubMenu: true,
                subItems: GLOBAL_CONFIGURATION_AUTHORIZATION,
            },
        ],
    },
]
