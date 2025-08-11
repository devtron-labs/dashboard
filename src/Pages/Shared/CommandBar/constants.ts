import { getUniqueId, IconName } from '@devtron-labs/devtron-fe-common-lib'
import { SupportedKeyboardKeysType } from '@devtron-labs/devtron-fe-common-lib/dist/Common/Hooks/UseRegisterShortcut/types'

import { URLS } from '@Config/routes'

import { CommandBarGroupType, NavigationGroupType, NavigationItemTitle } from './types'

export const NAVIGATION_LIST: NavigationGroupType[] = [
    {
        id: 'application-management',
        title: 'Application Management',
        icon: 'ic-grid-view',
        items: [
            {
                title: NavigationItemTitle.Overview,
                dataTestId: 'application-management-overview',
                icon: 'ic-speedometer',
            },
            {
                title: NavigationItemTitle.Applications,
                dataTestId: 'click-on-application',
                icon: 'ic-grid-view',
                href: URLS.APP,
            },
            {
                title: NavigationItemTitle.ApplicationGroups,
                dataTestId: 'click-on-application-groups',
                icon: 'ic-app-group',
                href: URLS.APPLICATION_GROUP,
            },
            {
                title: NavigationItemTitle.ChartStore,
                dataTestId: 'click-on-chart-store',
                icon: 'ic-helm',
                href: URLS.CHARTS,
            },
            {
                title: NavigationItemTitle.BulkEdit,
                dataTestId: 'click-on-bulk-edit',
                icon: 'ic-code',
                href: URLS.BULK_EDITS,
            },
            {
                title: NavigationItemTitle.Configurations,
                dataTestId: 'click-on-configurations',
                hasSubMenu: true,
                subItems: [
                    {
                        title: NavigationItemTitle.GitOps,
                        dataTestId: 'click-on-configurations-gitops',
                        href: URLS.GIT_OPS_CONFIG,
                    },
                    {
                        title: NavigationItemTitle.GitAccounts,
                        dataTestId: 'click-on-configurations-git-accounts',
                        href: URLS.GIT_OPS_CONFIG,
                    },
                    {
                        title: NavigationItemTitle.ExternalLinks,
                        dataTestId: 'click-on-configurations-external-links',
                        href: URLS.GIT_OPS_CONFIG,
                    },
                    {
                        title: NavigationItemTitle.ChartRepository,
                        dataTestId: 'click-on-configurations-chart-repository',
                        href: URLS.GIT_OPS_CONFIG,
                    },
                    {
                        title: NavigationItemTitle.DeploymentCharts,
                        dataTestId: 'click-on-configurations-deployment-charts',
                        href: URLS.GIT_OPS_CONFIG,
                    },
                    {
                        title: NavigationItemTitle.Notifications,
                        dataTestId: 'click-on-configurations-notifications',
                        href: URLS.GIT_OPS_CONFIG,
                    },
                    {
                        title: NavigationItemTitle.CatalogFrameworks,
                        dataTestId: 'click-on-configurations-catalog-frameworks',
                        href: URLS.GIT_OPS_CONFIG,
                    },
                    {
                        title: NavigationItemTitle.ScopedVariables,
                        dataTestId: 'click-on-configurations-scoped-variables',
                        href: URLS.GIT_OPS_CONFIG,
                    },
                    {
                        title: NavigationItemTitle.BuildInfra,
                        dataTestId: 'click-on-configurations-build-infra',
                        href: URLS.GIT_OPS_CONFIG,
                    },
                ],
            },
            {
                title: NavigationItemTitle.Policies,
                dataTestId: 'click-on-policies',
                hasSubMenu: true,
                subItems: [
                    {
                        title: NavigationItemTitle.DeploymentWindow,
                        dataTestId: 'click-on-policies-deployment-window',
                        href: URLS.GIT_OPS_CONFIG,
                    },
                    {
                        title: NavigationItemTitle.ApprovalPolicy,
                        dataTestId: 'click-on-policies-approval-policy',
                        href: URLS.GIT_OPS_CONFIG,
                    },
                    {
                        title: NavigationItemTitle.PluginPolicy,
                        dataTestId: 'click-on-policies-plugin-policy',
                        href: URLS.GIT_OPS_CONFIG,
                    },
                    {
                        title: NavigationItemTitle.PullImageDigest,
                        dataTestId: 'click-on-policies-pull-image-digest',
                        href: URLS.GIT_OPS_CONFIG,
                    },
                    {
                        title: NavigationItemTitle.TagPolicy,
                        dataTestId: 'click-on-policies-tag-policy',
                        href: URLS.GIT_OPS_CONFIG,
                    },
                    {
                        title: NavigationItemTitle.FilterConditions,
                        dataTestId: 'click-on-policies-filter-conditions',
                        href: URLS.GIT_OPS_CONFIG,
                    },
                    {
                        title: NavigationItemTitle.LockDeploymentConfiguration,
                        dataTestId: 'click-on-policies-lock-deployment-configuration',
                        href: URLS.GIT_OPS_CONFIG,
                    },
                ],
            },
            {
                title: NavigationItemTitle.Others,
                dataTestId: 'click-on-others',
                hasSubMenu: true,
                subItems: [
                    {
                        title: NavigationItemTitle.ApplicationTemplates,
                        dataTestId: 'click-on-others-application-templates',
                        href: URLS.GIT_OPS_CONFIG,
                    },
                    {
                        title: NavigationItemTitle.Projects,
                        dataTestId: 'click-on-others-projects',
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
                title: NavigationItemTitle.Overview,
                dataTestId: 'infrastructure-management-overview',
                icon: 'ic-speedometer',
            },
            {
                title: NavigationItemTitle.ResourceBrowser,
                dataTestId: 'resource-browser',
                icon: 'ic-cube',
                href: URLS.RESOURCE_BROWSER,
            },
            {
                title: NavigationItemTitle.InterceptedChanges,
                dataTestId: 'intercepted-changes',
                icon: 'ic-file',
            },
            {
                title: NavigationItemTitle.ResourceWatcher,
                dataTestId: 'resource-watcher',
                icon: 'ic-monitoring',
                href: URLS.RESOURCE_WATCHER,
            },
            {
                title: NavigationItemTitle.CatalogFramework,
                dataTestId: 'catalog-framework',
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
                title: NavigationItemTitle.Overview,
                dataTestId: 'software-release-management-overview',
                icon: 'ic-speedometer',
            },
            {
                title: NavigationItemTitle.SoftwareRelease,
                dataTestId: 'software-release',
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
                title: NavigationItemTitle.Overview,
                dataTestId: 'cost-visibility-overview',
                icon: 'ic-speedometer',
            },
            {
                title: NavigationItemTitle.Trends,
                dataTestId: 'cost-visibility-trends',
                icon: 'ic-open-box',
            },
            {
                title: NavigationItemTitle.CostBreakdown,
                dataTestId: 'cost-breakdown',
                hasSubMenu: true,
                subItems: [
                    {
                        title: NavigationItemTitle.Clusters,
                        dataTestId: 'cost-breakdown-clusters',
                    },
                    {
                        title: NavigationItemTitle.Environments,
                        dataTestId: 'cost-breakdown-environments',
                    },
                    {
                        title: NavigationItemTitle.Projects,
                        dataTestId: 'cost-breakdown-projects',
                    },
                    {
                        title: NavigationItemTitle.Applications,
                        dataTestId: 'cost-breakdown-applications',
                    },
                ],
            },
            {
                title: NavigationItemTitle.Configurations,
                dataTestId: 'cost-visibility-configurations',
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
                title: NavigationItemTitle.Overview,
                dataTestId: 'security-center-overview',
                icon: 'ic-speedometer',
            },
            {
                title: NavigationItemTitle.ApplicationSecurity,
                dataTestId: 'application-security',
                icon: 'ic-bug',
            },
            {
                title: NavigationItemTitle.SecurityPolicies,
                dataTestId: 'security-policies',
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
                title: NavigationItemTitle.Jobs,
                dataTestId: 'jobs',
                icon: 'ic-k8s-job',
            },
            {
                title: NavigationItemTitle.Alerting,
                dataTestId: 'alerting',
                icon: 'ic-bug',
            },
            {
                title: NavigationItemTitle.IncidentResponse,
                dataTestId: 'incident-response',
                icon: 'ic-bug',
            },
            {
                title: NavigationItemTitle.APIPortal,
                dataTestId: 'api-portal',
                icon: 'ic-code',
            },
            {
                title: NavigationItemTitle.RunbookAutomation,
                dataTestId: 'runbook-automation',
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
                title: NavigationItemTitle.SSOLoginServices,
                dataTestId: 'sso-login-services',
                icon: 'ic-key',
            },
            {
                title: NavigationItemTitle.HostURLS,
                dataTestId: 'host-urls',
                icon: 'ic-link',
            },
            {
                title: NavigationItemTitle.ClusterAndEnvironments,
                dataTestId: 'cluster-and-environments',
                icon: 'ic-cluster',
            },
            {
                title: NavigationItemTitle.ContainerOCIRegistry,
                dataTestId: 'container-oci-registry',
                icon: 'ic-folder',
            },
            {
                title: NavigationItemTitle.Authorization,
                dataTestId: 'authorization',
                hasSubMenu: true,
                subItems: [
                    {
                        title: NavigationItemTitle.UserPermissions,
                        dataTestId: 'user-permissions',
                    },
                    {
                        title: NavigationItemTitle.PermissionGroups,
                        dataTestId: 'permission-groups',
                    },
                    {
                        title: NavigationItemTitle.AuthorizationAPITokens,
                        dataTestId: 'authorization-api-tokens',
                    },
                ],
            },
        ],
    },
]

const NAVIGATION_ITEM_TITLE_TO_ICON_MAP: Record<NavigationItemTitle, IconName> = {
    [NavigationItemTitle.Overview]: 'ic-speedometer',
    [NavigationItemTitle.Applications]: 'ic-grid-view',
    [NavigationItemTitle.ApplicationGroups]: 'ic-app-group',
    [NavigationItemTitle.ChartStore]: 'ic-helm',
    [NavigationItemTitle.BulkEdit]: 'ic-code',
    [NavigationItemTitle.Configurations]: 'ic-gear',
    [NavigationItemTitle.GitOps]: 'ic-pencil',
    [NavigationItemTitle.GitAccounts]: 'ic-pencil',
    [NavigationItemTitle.ExternalLinks]: 'ic-pencil',
    [NavigationItemTitle.ChartRepository]: 'ic-pencil',
    [NavigationItemTitle.DeploymentCharts]: 'ic-pencil',
    [NavigationItemTitle.Notifications]: 'ic-pencil',
    [NavigationItemTitle.CatalogFrameworks]: 'ic-pencil',
    [NavigationItemTitle.ScopedVariables]: 'ic-pencil',
    [NavigationItemTitle.BuildInfra]: 'ic-pencil',
    [NavigationItemTitle.Policies]: 'ic-pencil',
    [NavigationItemTitle.DeploymentWindow]: 'ic-pencil',
    [NavigationItemTitle.ApprovalPolicy]: 'ic-pencil',
    [NavigationItemTitle.PluginPolicy]: 'ic-pencil',
    [NavigationItemTitle.PullImageDigest]: 'ic-pencil',
    [NavigationItemTitle.TagPolicy]: 'ic-pencil',
    [NavigationItemTitle.FilterConditions]: 'ic-pencil',
    [NavigationItemTitle.LockDeploymentConfiguration]: 'ic-pencil',
    [NavigationItemTitle.Others]: 'ic-pencil',
    [NavigationItemTitle.ApplicationTemplates]: 'ic-pencil',
    [NavigationItemTitle.Projects]: 'ic-pencil',
    [NavigationItemTitle.ResourceBrowser]: 'ic-cube',
    [NavigationItemTitle.InterceptedChanges]: 'ic-file',
    [NavigationItemTitle.ResourceWatcher]: 'ic-monitoring',
    [NavigationItemTitle.CatalogFramework]: 'ic-file',
    [NavigationItemTitle.SoftwareRelease]: 'ic-open-box',
    [NavigationItemTitle.Trends]: 'ic-open-box',
    [NavigationItemTitle.CostBreakdown]: 'ic-pencil',
    [NavigationItemTitle.Clusters]: 'ic-pencil',
    [NavigationItemTitle.Environments]: 'ic-pencil',
    [NavigationItemTitle.ApplicationSecurity]: 'ic-bug',
    [NavigationItemTitle.SecurityPolicies]: 'ic-gavel',
    [NavigationItemTitle.Jobs]: 'ic-k8s-job',
    [NavigationItemTitle.Alerting]: 'ic-bug',
    [NavigationItemTitle.IncidentResponse]: 'ic-bug',
    [NavigationItemTitle.APIPortal]: 'ic-code',
    [NavigationItemTitle.RunbookAutomation]: 'ic-book-open',
    [NavigationItemTitle.SSOLoginServices]: 'ic-key',
    [NavigationItemTitle.HostURLS]: 'ic-link',
    [NavigationItemTitle.ClusterAndEnvironments]: 'ic-cluster',
    [NavigationItemTitle.ContainerOCIRegistry]: 'ic-folder',
    [NavigationItemTitle.Authorization]: 'ic-pencil',
    [NavigationItemTitle.UserPermissions]: 'ic-pencil',
    [NavigationItemTitle.PermissionGroups]: 'ic-pencil',
    [NavigationItemTitle.AuthorizationAPITokens]: 'ic-pencil',
}

export const NAVIGATION_GROUPS: CommandBarGroupType[] = NAVIGATION_LIST.map((group) => ({
    title: group.title,
    id: getUniqueId(),
    items: group.items.flatMap((item) => {
        if (item.hasSubMenu && item.subItems) {
            return item.subItems.map((subItem) => ({
                title: `${group.title} / ${subItem.title}`,
                id: getUniqueId(),
                dataTestId: subItem.dataTestId,
                icon: NAVIGATION_ITEM_TITLE_TO_ICON_MAP[subItem.title],
                // TODO: No href present for some subItems
                href: subItem.href ?? null,
            }))
        }

        return {
            title: item.title,
            id: getUniqueId(),
            dataTestId: item.dataTestId,
            icon: NAVIGATION_ITEM_TITLE_TO_ICON_MAP[item.title],
            // TODO: No href present for some items
            href: item.href ?? null,
        }
    }),
}))

export const SHORT_CUTS: Record<
    'OPEN_COMMAND_BAR',
    {
        keys: SupportedKeyboardKeysType[]
        description: string
    }
> = {
    OPEN_COMMAND_BAR: {
        keys: ['Meta', 'K'],
        description: 'Open Command Bar',
    },
} as const
