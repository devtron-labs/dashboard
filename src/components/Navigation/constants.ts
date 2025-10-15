import { generatePath } from 'react-router-dom'

import { BackupLocationsTypes, URLS as COMMON_URLS } from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'
import { Routes } from '@Config/constants'
import { URLS } from '@Config/routes'

import { NavigationGroupType, NavigationItemType } from './types'

const FE_LIB_ROUTER_URLS = importComponentFromFELibrary('ROUTER_URLS', {}, 'function')

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
        title: 'External Links',
        dataTestId: 'click-on-configurations-external-links',
        id: 'application-management-configurations-external-links',
        href: URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_EXTERNAL_LINKS,
        keywords: ['config'],
    },
    {
        title: 'Chart Repository',
        dataTestId: 'click-on-configurations-chart-repository',
        id: 'application-management-configurations-chart-repository',
        href: URLS.APPLICATION_MANAGEMENT_CONFIGURATIONS_CHART_REPO,
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

const APPLICATION_MANAGEMENT_POLICIES: NavigationItemType['subItems'] = [
    {
        title: 'Deployment Window',
        dataTestId: 'click-on-policies-deployment-window',
        id: 'application-management-policies-deployment-window',
        href: FE_LIB_ROUTER_URLS.APPLICATION_MANAGEMENT_POLICIES_DEPLOYMENT_WINDOW,
        keywords: ['policy'],
    },
    {
        title: 'Approval Policy',
        dataTestId: 'click-on-policies-approval-policy',
        id: 'application-management-policies-approval-policy',
        href: FE_LIB_ROUTER_URLS.APPROVAL_POLICY_LIST,
        keywords: ['policy'],
    },
    {
        title: 'Plugin Policy',
        dataTestId: 'click-on-policies-plugin-policy',
        id: 'application-management-policies-plugin-policy',
        href: FE_LIB_ROUTER_URLS.PLUGIN_POLICY_PROFILE_LIST,
        keywords: ['policy'],
    },
    {
        title: 'Pull Image Digest',
        dataTestId: 'click-on-policies-pull-image-digest',
        id: 'application-management-policies-pull-image-digest',
        href: FE_LIB_ROUTER_URLS.APPLICATION_MANAGEMENT_POLICIES_PULL_IMAGE_DIGEST,
        keywords: ['policy'],
    },
    {
        title: 'Tag Policy',
        dataTestId: 'click-on-policies-tag-policy',
        id: 'application-management-policies-tag-policy',
        href: FE_LIB_ROUTER_URLS.APPLICATION_MANAGEMENT_POLICIES_TAG_POLICY,
        keywords: ['policy'],
    },
    {
        title: 'Filter Conditions',
        dataTestId: 'click-on-policies-filter-conditions',
        id: 'application-management-policies-filter-conditions',
        href: FE_LIB_ROUTER_URLS.APPLICATION_MANAGEMENT_POLICIES_FILTER_CONDITIONS,
        keywords: ['policy'],
    },
    {
        title: 'Image Promotion',
        dataTestId: 'click-on-policies-image-promotion',
        id: 'application-management-policies-image-promotion',
        href: FE_LIB_ROUTER_URLS.APPLICATION_MANAGEMENT_POLICIES_IMAGE_PROMOTION,
        keywords: ['policy'],
        forceHideEnvKey: 'FEATURE_IMAGE_PROMOTION_ENABLE',
    },
    {
        title: 'Lock Deployment Configuration',
        dataTestId: 'click-on-policies-lock-deployment-configuration',
        id: 'application-management-policies-lock-deployment-configuration',
        href: FE_LIB_ROUTER_URLS.APPLICATION_MANAGEMENT_POLICIES_LOCK_DEPLOYMENT_CONFIGURATION,
        keywords: ['policy'],
    },
]

const COST_VISIBILITY_COST_BREAKDOWN: NavigationItemType['subItems'] = [
    {
        title: 'Clusters',
        dataTestId: 'cost-breakdown-clusters',
        id: 'cost-visibility-cost-breakdown-clusters',
        href: COMMON_URLS.COST_BREAKDOWN_CLUSTERS,
        keywords: ['cost'],
    },
    {
        title: 'Environments',
        dataTestId: 'cost-breakdown-environments',
        id: 'cost-visibility-cost-breakdown-environments',
        href: COMMON_URLS.COST_BREAKDOWN_ENVIRONMENTS,
        keywords: ['cost'],
    },
    {
        title: 'Projects',
        dataTestId: 'cost-breakdown-projects',
        id: 'cost-visibility-cost-breakdown-projects',
        href: COMMON_URLS.COST_BREAKDOWN_PROJECTS,
        keywords: ['cost'],
    },
    {
        title: 'Applications',
        dataTestId: 'cost-breakdown-applications',
        id: 'cost-visibility-cost-breakdown-applications',
        href: COMMON_URLS.COST_BREAKDOWN_APPLICATIONS,
        keywords: ['cost'],
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
                href: COMMON_URLS.APPLICATION_MANAGEMENT_OVERVIEW,
            },
            {
                title: 'Applications',
                dataTestId: 'click-on-application',
                id: 'application-management-applications',
                icon: 'ic-grid-view',
                href: COMMON_URLS.APPLICATION_MANAGEMENT_APP,
            },
            {
                title: 'Application Groups',
                dataTestId: 'click-on-application-groups',
                id: 'application-management-application-groups',
                icon: 'ic-app-group',
                href: COMMON_URLS.APPLICATION_MANAGEMENT_APPLICATION_GROUP,
            },
            {
                title: 'Chart Store',
                dataTestId: 'click-on-chart-store',
                id: 'application-management-chart-store',
                icon: 'ic-helm',
                href: COMMON_URLS.APPLICATION_MANAGEMENT_CHART_STORE,
            },
            {
                title: 'Bulk Edit',
                dataTestId: 'click-on-bulk-edit',
                id: 'application-management-bulk-edit',
                icon: 'ic-code',
                href: URLS.APPLICATION_MANAGEMENT_BULK_EDIT,
            },
            {
                title: 'Application Templates',
                dataTestId: 'click-on-application-templates',
                id: 'application-management-application-templates',
                icon: 'ic-files',
                href: COMMON_URLS.APPLICATION_MANAGEMENT_TEMPLATES_DEVTRON_APP,
                forceHideEnvKey: 'FEATURE_APPLICATION_TEMPLATES_ENABLE',
            },
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
            {
                title: 'Policies',
                dataTestId: 'click-on-policies',
                id: 'application-management-policies',
                hasSubMenu: true,
                subItems: APPLICATION_MANAGEMENT_POLICIES,
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
                href: COMMON_URLS.INFRASTRUCTURE_MANAGEMENT_OVERVIEW,
            },
            {
                title: 'Resource Browser',
                dataTestId: 'resource-browser',
                id: 'infrastructure-management-resource-browser',
                icon: 'ic-cube',
                href: COMMON_URLS.INFRASTRUCTURE_MANAGEMENT_RESOURCE_BROWSER,
            },
            {
                title: 'Resource Watcher',
                dataTestId: 'resource-watcher',
                id: 'infrastructure-management-resource-watcher',
                icon: 'ic-monitoring',
                href: COMMON_URLS.INFRASTRUCTURE_MANAGEMENT_RESOURCE_WATCHER,
            },
        ],
    },
    {
        id: 'observability',
        title: 'Observability',
        icon: 'ic-user-key',
        items: [
            {
                title: 'Overview',
                dataTestId: 'observability-overview',
                id: 'infrastructure-management-overview',
                icon: 'ic-speedometer',
                href: COMMON_URLS.OBSERVABILITY_OVERVIEW,
            },
            {
                title: 'VMs',
                dataTestId: 'observability-vms',
                id: 'observability-vms',
                icon: 'ic-cluster',
                href: COMMON_URLS.OBSERVABILITY_LIST,
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
                title: 'Release Hub',
                dataTestId: 'release-hub',
                id: 'software-release-management-release-hub',
                icon: 'ic-open-box',
                href: FE_LIB_ROUTER_URLS.RELEASES,
            },
            {
                title: 'Tenants',
                dataTestId: 'tenants',
                id: 'software-release-management-tenants',
                icon: 'ic-building',
                href: FE_LIB_ROUTER_URLS.TENANTS,
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
                href: COMMON_URLS.COST_VISIBILITY_OVERVIEW,
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
                href: COMMON_URLS.COST_CONFIGURATIONS,
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
                title: 'Security Scans',
                dataTestId: 'security-scans',
                id: 'security-center-security-scans',
                icon: 'ic-bug',
                href: `${COMMON_URLS.SECURITY_CENTER}/scans`,
            },
            {
                title: 'Security Policy',
                dataTestId: 'security-policy',
                id: 'security-center-security-policy',
                icon: 'ic-gavel',
                href: `${COMMON_URLS.SECURITY_CENTER}/policies`,
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
    {
        title: 'Data Protection Management',
        id: 'data-protection-management',
        icon: 'ic-database-backup',
        items: [
            {
                title: 'Overview',
                dataTestId: 'data-protection-overview',
                id: 'data-protection-overview',
                icon: 'ic-speedometer',
                disabled: true,
                href: COMMON_URLS.DATA_PROTECTION_OVERVIEW,
            },
            {
                title: 'Backup & Schedule',
                dataTestId: 'data-protection-backup-and-schedule',
                id: 'data-protection-backup-and-schedule',
                icon: 'ic-floppy-disk',
                href: generatePath(COMMON_URLS.DATA_PROTECTION_BACKUP_AND_SCHEDULE, { view: 'backups' }),
            },
            {
                title: 'Restores',
                dataTestId: 'data-protection-restores',
                id: 'data-protection-restores',
                icon: 'ic-clock-counterclockwise',
                href: COMMON_URLS.DATA_PROTECTION_RESTORES,
            },
            {
                title: 'Backup Locations',
                dataTestId: 'backup-locations',
                id: 'data-protection-backup-locations',
                icon: 'ic-storage',
                href: generatePath(COMMON_URLS.DATA_PROTECTION_BACKUP_LOCATIONS, {
                    type: BackupLocationsTypes.VOLUME_SNAPSHOT,
                }),
            },
        ],
    },
    {
        id: 'ai-recommendations',
        title: 'AI Recommendations',
        icon: 'ic-openai',
        disabled: true,
        items: [
            {
                title: 'Overview',
                dataTestId: 'ai-recommendations-overview',
                id: 'ai-recommendations-overview',
                icon: 'ic-speedometer',
                disabled: true,
                href: COMMON_URLS.AI_RECOMMENDATIONS_OVERVIEW,
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
                title: 'Cluster & Environments',
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
