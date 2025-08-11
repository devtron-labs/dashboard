import { customEnv, IconsProps, Never, URLS as CommonURLS } from '@devtron-labs/devtron-fe-common-lib'

import { URLS } from '@Config/routes'

export enum NavigationItemTitle {
    Overview = 'Overview',
    Applications = 'Applications',
    ApplicationGroups = 'Application Groups',
    ChartStore = 'Chart Store',
    BulkEdit = 'Bulk Edit',
    Configurations = 'Configurations',
    GitOps = 'GitOps',
    GitAccounts = 'Git accounts',
    ExternalLinks = 'External links',
    ChartRepository = 'Chart Repository',
    DeploymentCharts = 'Deployment Charts',
    Notifications = 'Notifications',
    CatalogFrameworks = 'Catalog Frameworks',
    ScopedVariables = 'Scoped Variables',
    BuildInfra = 'Build Infra',
    Policies = 'Policies',
    DeploymentWindow = 'Deployment Window',
    ApprovalPolicy = 'Approval policy',
    PluginPolicy = 'Plugin policy',
    PullImageDigest = 'Pull image digest',
    TagPolicy = 'Tag Policy',
    FilterConditions = 'Filter conditions',
    LockDeploymentConfiguration = 'Lock Deployment configuration',
    Others = 'Others',
    ApplicationTemplates = 'Application Templates',
    Projects = 'Projects',
    ResourceBrowser = 'Resource Browser',
    InterceptedChanges = 'Intercepted Changes',
    ResourceWatcher = 'Resource Watcher',
    CatalogFramework = 'Catalog Framework',
    SoftwareRelease = 'Software Release',
    Trends = 'Trends',
    CostBreakdown = 'Cost Breakdown',
    Clusters = 'Clusters',
    Environments = 'Environments',
    ApplicationSecurity = 'Application Security',
    SecurityPolicies = 'Security Policies',
    Jobs = 'Jobs',
    Alerting = 'Alerting',
    IncidentResponse = 'Incident Response',
    APIPortal = 'API portal',
    RunbookAutomation = 'Runbook Automation',
    SSOLoginServices = 'SSO Login Services',
    HostURLS = 'Host URLS',
    ClusterAndEnvironments = 'Cluster & environments',
    ContainerOCIRegistry = 'Container/OCI Registry',
    Authorization = 'Authorization',
    UserPermissions = 'User Permissions',
    PermissionGroups = 'Permission Groups',
    AuthorizationAPITokens = 'API Tokens',
}

type CommonNavigationItemType = {
    title: string
    dataTestId: string
    icon: IconsProps['name']
    href?: (typeof URLS)[keyof typeof URLS] | (typeof CommonURLS)[keyof typeof CommonURLS]
}

export type NavigationItemType = Pick<CommonNavigationItemType, 'dataTestId'> & {
    isAvailableInEA?: boolean
    markOnlyForSuperAdmin?: boolean
    forceHideEnvKey?: keyof customEnv
    title: NavigationItemTitle
    hideNav?: boolean
    markAsBeta?: boolean
    isAvailableInDesktop?: boolean
    moduleName?: string
    moduleNameTrivy?: string
} & (
        | (Pick<CommonNavigationItemType, 'icon' | 'href'> & {
              hasSubMenu?: false
              subItems?: never
          })
        | (Never<Pick<CommonNavigationItemType, 'icon' | 'href'>> & {
              hasSubMenu: true
              subItems: (Omit<CommonNavigationItemType, 'icon' | 'title'> & { title: NavigationItemTitle })[]
          })
    )

export interface NavigationGroupType extends Pick<CommonNavigationItemType, 'title' | 'icon'> {
    id: string
    items: NavigationItemType[]
}

export type CommandBarItemType = {
    id: string
    title: string
    dataTestId: string
    icon: IconsProps['name']
} & (
    | {
          href: CommonNavigationItemType['href']
          onSelect?: never
      }
    | {
          href?: never
          onSelect: (e: React.MouseEvent<HTMLButtonElement>) => void
      }
)

export interface CommandBarGroupType {
    id: string
    title: string
    items: CommandBarItemType[]
}
