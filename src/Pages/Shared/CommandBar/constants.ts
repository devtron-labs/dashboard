import { SupportedKeyboardKeysType } from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '@Config/routes'

import { CommandBarGroupType, NavigationGroupType } from './types'

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
                subItems: [
                    {
                        title: 'GitOps',
                        dataTestId: 'click-on-configurations-gitops',
                        id: 'application-management-configurations-gitops',
                        href: URLS.GIT_OPS_CONFIG,
                    },
                    {
                        title: 'Git accounts',
                        dataTestId: 'click-on-configurations-git-accounts',
                        id: 'application-management-configurations-git-accounts',
                        href: URLS.GIT_OPS_CONFIG,
                    },
                    {
                        title: 'External links',
                        dataTestId: 'click-on-configurations-external-links',
                        id: 'application-management-configurations-external-links',
                        href: URLS.GIT_OPS_CONFIG,
                    },
                    {
                        title: 'Chart Repository',
                        dataTestId: 'click-on-configurations-chart-repository',
                        id: 'application-management-configurations-chart-repository',
                        href: URLS.GIT_OPS_CONFIG,
                    },
                    {
                        title: 'Deployment Charts',
                        dataTestId: 'click-on-configurations-deployment-charts',
                        id: 'application-management-configurations-deployment-charts',
                        href: URLS.GIT_OPS_CONFIG,
                    },
                    {
                        title: 'Notifications',
                        dataTestId: 'click-on-configurations-notifications',
                        id: 'application-management-configurations-notifications',
                        href: URLS.GIT_OPS_CONFIG,
                    },
                    {
                        title: 'Catalog Frameworks',
                        dataTestId: 'click-on-configurations-catalog-frameworks',
                        id: 'application-management-configurations-catalog-frameworks',
                        href: URLS.GIT_OPS_CONFIG,
                    },
                    {
                        title: 'Scoped Variables',
                        dataTestId: 'click-on-configurations-scoped-variables',
                        id: 'application-management-configurations-scoped-variables',
                        href: URLS.GIT_OPS_CONFIG,
                    },
                    {
                        title: 'Build Infra',
                        dataTestId: 'click-on-configurations-build-infra',
                        id: 'application-management-configurations-build-infra',
                        href: URLS.GIT_OPS_CONFIG,
                    },
                ],
            },
            {
                title: 'Policies',
                dataTestId: 'click-on-policies',
                id: 'application-management-policies',
                hasSubMenu: true,
                subItems: [
                    {
                        title: 'Deployment Window',
                        dataTestId: 'click-on-policies-deployment-window',
                        id: 'application-management-policies-deployment-window',
                        href: URLS.GIT_OPS_CONFIG,
                    },
                    {
                        title: 'Approval policy',
                        dataTestId: 'click-on-policies-approval-policy',
                        id: 'application-management-policies-approval-policy',
                        href: URLS.GIT_OPS_CONFIG,
                    },
                    {
                        title: 'Plugin policy',
                        dataTestId: 'click-on-policies-plugin-policy',
                        id: 'application-management-policies-plugin-policy',
                        href: URLS.GIT_OPS_CONFIG,
                    },
                    {
                        title: 'Pull image digest',
                        dataTestId: 'click-on-policies-pull-image-digest',
                        id: 'application-management-policies-pull-image-digest',
                        href: URLS.GIT_OPS_CONFIG,
                    },
                    {
                        title: 'Tag Policy',
                        dataTestId: 'click-on-policies-tag-policy',
                        id: 'application-management-policies-tag-policy',
                        href: URLS.GIT_OPS_CONFIG,
                    },
                    {
                        title: 'Filter conditions',
                        dataTestId: 'click-on-policies-filter-conditions',
                        id: 'application-management-policies-filter-conditions',
                        href: URLS.GIT_OPS_CONFIG,
                    },
                    {
                        title: 'Lock Deployment configuration',
                        dataTestId: 'click-on-policies-lock-deployment-configuration',
                        id: 'application-management-policies-lock-deployment-configuration',
                        href: URLS.GIT_OPS_CONFIG,
                    },
                ],
            },
            {
                title: 'Others',
                dataTestId: 'click-on-others',
                id: 'application-management-others',
                hasSubMenu: true,
                subItems: [
                    {
                        title: 'Application Templates',
                        dataTestId: 'click-on-others-application-templates',
                        id: 'application-management-others-application-templates',
                        href: URLS.GIT_OPS_CONFIG,
                    },
                    {
                        title: 'Projects',
                        dataTestId: 'click-on-others-projects',
                        id: 'application-management-others-projects',
                        href: URLS.GIT_OPS_CONFIG,
                    },
                ],
            },
        ],
    },
    {
        id: 'infrastructure-management',
        title: 'Infrastructure Management',
        icon: 'ic-grid-view',
        items: [
            {
                title: 'Overview',
                dataTestId: 'infrastructure-management-overview',
                id: 'infrastructure-management-overview',
                icon: 'ic-speedometer',
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
                icon: 'ic-file',
            },
            {
                title: 'Resource Watcher',
                dataTestId: 'resource-watcher',
                id: 'infrastructure-management-resource-watcher',
                icon: 'ic-monitoring',
                href: URLS.RESOURCE_WATCHER,
            },
            {
                title: 'Catalog Framework',
                dataTestId: 'catalog-framework',
                id: 'infrastructure-management-catalog-framework',
                icon: 'ic-file',
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
            },
            {
                title: 'Software Release',
                dataTestId: 'software-release',
                id: 'software-release-management-software-release',
                icon: 'ic-open-box',
            },
        ],
    },
    {
        id: 'cost-visibility',
        title: 'Cost Visibility',
        icon: 'ic-grid-view',
        items: [
            {
                title: 'Overview',
                dataTestId: 'cost-visibility-overview',
                id: 'cost-visibility-overview',
                icon: 'ic-speedometer',
            },
            {
                title: 'Trends',
                dataTestId: 'cost-visibility-trends',
                id: 'cost-visibility-trends',
                icon: 'ic-open-box',
            },
            {
                title: 'Cost Breakdown',
                dataTestId: 'cost-breakdown',
                id: 'cost-visibility-cost-breakdown',
                hasSubMenu: true,
                subItems: [
                    {
                        title: 'Clusters',
                        dataTestId: 'cost-breakdown-clusters',
                        id: 'cost-visibility-cost-breakdown-clusters',
                    },
                    {
                        title: 'Environments',
                        dataTestId: 'cost-breakdown-environments',
                        id: 'cost-visibility-cost-breakdown-environments',
                    },
                    {
                        title: 'Projects',
                        dataTestId: 'cost-breakdown-projects',
                        id: 'cost-visibility-cost-breakdown-projects',
                    },
                    {
                        title: 'Applications',
                        dataTestId: 'cost-breakdown-applications',
                        id: 'cost-visibility-cost-breakdown-applications',
                    },
                ],
            },
            {
                title: 'Configurations',
                dataTestId: 'cost-visibility-configurations',
                id: 'cost-visibility-configurations',
                icon: 'ic-gear',
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
            },
            {
                title: 'Application Security',
                dataTestId: 'application-security',
                id: 'security-center-application-security',
                icon: 'ic-bug',
            },
            {
                title: 'Security Policies',
                dataTestId: 'security-policies',
                id: 'security-center-security-policies',
                icon: 'ic-gavel',
            },
        ],
    },
    {
        id: 'automation-and-enablement',
        title: 'Automation & Enablement',
        icon: 'ic-grid-view',
        items: [
            {
                title: 'Jobs',
                dataTestId: 'jobs',
                id: 'automation-and-enablement-jobs',
                icon: 'ic-k8s-job',
            },
            {
                title: 'Alerting',
                dataTestId: 'alerting',
                id: 'automation-and-enablement-alerting',
                icon: 'ic-bug',
            },
            {
                title: 'Incident Response',
                dataTestId: 'incident-response',
                id: 'automation-and-enablement-incident-response',
                icon: 'ic-bug',
            },
            {
                title: 'API portal',
                dataTestId: 'api-portal',
                id: 'automation-and-enablement-api-portal',
                icon: 'ic-code',
            },
            {
                title: 'Runbook Automation',
                dataTestId: 'runbook-automation',
                id: 'automation-and-enablement-runbook-automation',
                icon: 'ic-book-open',
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
            },
            {
                title: 'Host URLS',
                dataTestId: 'host-urls',
                id: 'global-configuration-host-urls',
                icon: 'ic-link',
            },
            {
                title: 'Cluster & environments',
                dataTestId: 'cluster-and-environments',
                id: 'global-configuration-cluster-and-environments',
                icon: 'ic-cluster',
            },
            {
                title: 'Container/OCI Registry',
                dataTestId: 'container-oci-registry',
                id: 'global-configuration-container-oci-registry',
                icon: 'ic-folder',
            },
            {
                title: 'Authorization',
                dataTestId: 'authorization',
                id: 'global-configuration-authorization',
                hasSubMenu: true,
                subItems: [
                    {
                        title: 'User Permissions',
                        dataTestId: 'user-permissions',
                        id: 'global-configuration-authorization-user-permissions',
                    },
                    {
                        title: 'Permission Groups',
                        dataTestId: 'permission-groups',
                        id: 'global-configuration-authorization-permission-groups',
                    },
                    {
                        title: 'API Tokens',
                        dataTestId: 'authorization-api-tokens',
                        id: 'global-configuration-authorization-api-tokens',
                    },
                ],
            },
        ],
    },
]

export const NAVIGATION_GROUPS: CommandBarGroupType[] = NAVIGATION_LIST.map((group) => ({
    title: group.title,
    id: group.id,
    items: group.items.flatMap(({ hasSubMenu, subItems, title, href, id, icon }) => {
        if (hasSubMenu && subItems) {
            return subItems.map((subItem) => ({
                title: `${title} / ${subItem.title}`,
                id,
                dataTestId: subItem.dataTestId,
                // Since icon is not present for some subItems, using from group
                icon: group.icon,
                // TODO: No href present for some subItems
                href: subItem.href ?? null,
            }))
        }

        return {
            title,
            id,
            icon: icon || 'ic-arrow-right',
            // TODO: No href present for some items
            href: href ?? null,
        }
    }),
}))

export const RECENT_ACTIONS_GROUP: CommandBarGroupType = {
    id: 'command-bar-recent-navigation-group',
    items: [],
    title: 'Recent Navigation',
}

export const SHORT_CUTS: Record<
    'OPEN_COMMAND_BAR' | 'FOCUS_SEARCH_BAR',
    {
        keys: SupportedKeyboardKeysType[]
        description: string
    }
> = {
    OPEN_COMMAND_BAR: {
        keys: ['Meta', 'K'],
        description: 'Open Command Bar',
    },
    FOCUS_SEARCH_BAR: {
        keys: ['Shift', '>'],
        description: 'Focus Search Bar',
    },
} as const
