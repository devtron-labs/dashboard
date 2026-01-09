import { generatePath } from 'react-router-dom'

import {
    Icon,
    ImageWithFallback,
    InfrastructureManagementAppListType,
    NavigationItemID,
    SERVER_MODE,
    URL_FILTER_KEYS,
    URLS as COMMON_URLS,
} from '@devtron-labs/devtron-fe-common-lib'

import { QueryParams as ChartStoreQueryParams } from '@Components/charts/constants'
import { getNavigationList } from '@Components/Navigation'
import { getClusterChangeRedirectionUrl } from '@Components/ResourceBrowser/Utils'
import { URLS } from '@Config/routes'

import {
    CHART_LIST_COMMAND_GROUP_ID,
    CLUSTER_LIST_COMMAND_GROUP_ID,
    DEVTRON_APPLICATIONS_COMMAND_GROUP_ID,
    HELM_APP_LIST_COMMAND_GROUP_ID,
    NAV_SUB_ITEMS_ICON_MAPPING,
    RECENT_NAVIGATION_ITEM_ID_PREFIX,
    UPGRADE_DIALOG_LOCAL_STORAGE_KEY,
} from './constants'
import { CommandBarActionIdType, CommandBarBackdropProps, CommandBarGroupType, CommandBarItemType } from './types'

export const sanitizeItemId = (item: CommandBarItemType) =>
    (item.id.startsWith(RECENT_NAVIGATION_ITEM_ID_PREFIX)
        ? item.id.replace(RECENT_NAVIGATION_ITEM_ID_PREFIX, '')
        : item.id) as CommandBarActionIdType

export const getNewSelectedIndex = (prevIndex: number, type: 'up' | 'down', totalItems: number) => {
    if (type === 'up') {
        return prevIndex === 0 ? totalItems - 1 : prevIndex - 1
    }
    return prevIndex === totalItems - 1 ? 0 : prevIndex + 1
}

const getAppManagementNavItemsBreakdown = (serverMode: SERVER_MODE): CommandBarGroupType['items'] => [
    ...(serverMode === SERVER_MODE.FULL
        ? [
              {
                  id: 'app-management-devtron-app-list',
                  title: 'Devtron Applications',
                  icon: 'ic-devtron-app',
                  iconColor: 'none',
                  href: COMMON_URLS.APPLICATION_MANAGEMENT_APP_LIST,
                  keywords: [],
              } satisfies CommandBarGroupType['items'][number],
          ]
        : []),
]

const getInfraManagementNavItemsBreakdown = (isSuperAdmin: boolean): CommandBarGroupType['items'] => [
    {
        id: 'app-management-helm-app-list',
        title: 'Helm Applications',
        icon: 'ic-helm-app',
        iconColor: 'none',
        href: generatePath(COMMON_URLS.INFRASTRUCTURE_MANAGEMENT_APP_LIST, {
            appType: InfrastructureManagementAppListType.HELM,
        }),
        keywords: [],
    },
    ...(window._env_?.ENABLE_EXTERNAL_ARGO_CD && isSuperAdmin
        ? [
              {
                  id: 'app-management-argo-app-list',
                  title: 'ArgoCD Applications',
                  icon: 'ic-argocd-app',
                  iconColor: 'none',
                  href: generatePath(COMMON_URLS.INFRASTRUCTURE_MANAGEMENT_APP_LIST, {
                      appType: InfrastructureManagementAppListType.ARGO_CD,
                  }),
                  keywords: [],
              } satisfies CommandBarGroupType['items'][number],
          ]
        : []),
    ...(window._env_?.FEATURE_EXTERNAL_FLUX_CD_ENABLE && isSuperAdmin
        ? [
              {
                  id: 'app-management-flux-app-list',
                  title: 'FluxCD Applications',
                  icon: 'ic-fluxcd-app',
                  iconColor: 'none',
                  href: generatePath(COMMON_URLS.INFRASTRUCTURE_MANAGEMENT_APP_LIST, {
                      appType: InfrastructureManagementAppListType.FLUX_CD,
                  }),
                  keywords: [],
              } satisfies CommandBarGroupType['items'][number],
          ]
        : []),
]

const getNavItemBreakdownItems = (
    rootId: NavigationItemID,
    serverMode: SERVER_MODE,
    isSuperAdmin: boolean,
): CommandBarGroupType['items'] => {
    switch (rootId) {
        case 'application-management-devtron-applications':
            return getAppManagementNavItemsBreakdown(serverMode)
        case 'infrastructure-management-applications':
            return getInfraManagementNavItemsBreakdown(isSuperAdmin)
        default:
            return []
    }
}

export const getNavigationGroups = (serverMode: SERVER_MODE, isSuperAdmin: boolean): CommandBarGroupType[] =>
    getNavigationList(serverMode).map<CommandBarGroupType>((group) => {
        const parsedItems = group.items.flatMap<CommandBarGroupType['items'][number]>(
            ({ hasSubMenu, subItems, title, href, id, icon, keywords }) => {
                if (hasSubMenu && subItems?.length) {
                    return subItems.map<CommandBarGroupType['items'][number]>((subItem) => ({
                        title: `${title} / ${subItem.title}`,
                        id: subItem.id,
                        // Since icon is not present for some subItems, using from group
                        icon: NAV_SUB_ITEMS_ICON_MAPPING[id] || group.icon,
                        // TODO: No href present for some subItems
                        href: subItem.href ?? null,
                        keywords: subItem.keywords || [],
                    }))
                }

                const breakdownItems = getNavItemBreakdownItems(id, serverMode, isSuperAdmin)

                if (breakdownItems.length) {
                    return breakdownItems
                }

                return {
                    title,
                    id,
                    icon: icon || 'ic-arrow-right',
                    // TODO: No href present for some items
                    href: href ?? null,
                    keywords: keywords || [],
                }
            },
        )

        return {
            title: group.title,
            id: group.id,
            items: parsedItems,
        }
    })

export const parseAppListToNavItems = (
    appList: CommandBarBackdropProps['resourceList']['appList'],
): CommandBarGroupType[] => {
    if (!appList?.length) {
        return []
    }

    return [
        {
            title: 'Devtron Applications',
            id: DEVTRON_APPLICATIONS_COMMAND_GROUP_ID,
            items: appList.map<CommandBarGroupType['items'][number]>((app) => ({
                id: `app-management-devtron-app-list-${app.id}`,
                title: app.name,
                icon: 'ic-devtron-app',
                iconColor: 'none',
                href: `${COMMON_URLS.APPLICATION_MANAGEMENT_APP}/${app.id}/${URLS.APP_OVERVIEW}`,
                keywords: [],
            })),
        },
    ]
}

export const parseChartListToNavItems = (
    chartList: CommandBarBackdropProps['resourceList']['chartList'],
): CommandBarGroupType[] => {
    if (!chartList?.length) {
        return []
    }

    return [
        {
            title: 'Charts',
            id: CHART_LIST_COMMAND_GROUP_ID,
            items: chartList.map<CommandBarGroupType['items'][number]>((chart) => ({
                id: `chart-list-${chart.id}`,
                title: chart.name,
                subText: chart.chart_name ? chart.chart_name : chart.docker_artifact_store_id,
                iconElement: (
                    <ImageWithFallback
                        imageProps={{
                            src: chart.icon,
                            alt: chart.name,
                            width: '20px',
                            height: '20px',
                        }}
                        fallbackImage={<Icon name="ic-helm-app" color={null} size={20} />}
                    />
                ),
                href: `${COMMON_URLS.INFRASTRUCTURE_MANAGEMENT_CHART_STORE_DISCOVER}${URLS.CHART}/${chart.id}`,
                keywords: [],
            })),
        },
    ]
}

export const parseClusterListToNavItems = (
    clusterList: CommandBarBackdropProps['resourceList']['clusterList'],
): CommandBarGroupType[] => {
    if (!clusterList?.length) {
        return []
    }

    return [
        {
            title: 'Clusters',
            id: CLUSTER_LIST_COMMAND_GROUP_ID,
            items: clusterList.map<CommandBarGroupType['items'][number]>((cluster) => ({
                id: `cluster-list-${cluster.id}`,
                title: cluster.name,
                icon: 'ic-bg-cluster',
                href: getClusterChangeRedirectionUrl(false, String(cluster.id)),
                keywords: [],
            })),
        },
    ]
}

export const parseHelmAppListToNavItems = (
    helmAppList: CommandBarBackdropProps['resourceList']['helmAppList'],
): CommandBarGroupType[] => {
    if (!helmAppList?.length) {
        return []
    }

    return [
        {
            title: 'Helm Applications',
            id: HELM_APP_LIST_COMMAND_GROUP_ID,
            items: helmAppList.map<CommandBarGroupType['items'][number]>((helmApp) => ({
                id: `helm-app-list-${+helmApp.appId}`,
                title: helmApp.appName,
                subText: helmApp.chartName,
                iconElement: (
                    <ImageWithFallback
                        imageProps={{
                            src: helmApp.chartAvatar,
                            alt: helmApp.chartName,
                            width: '20px',
                            height: '20px',
                        }}
                        fallbackImage={<Icon name="ic-helm-app" color={null} size={20} />}
                    />
                ),
                href: `${COMMON_URLS.INFRASTRUCTURE_MANAGEMENT_APP}/${URLS.DEVTRON_CHARTS}/deployments/${helmApp.appId}/env/${helmApp.environmentDetail?.environmentId}`,
                keywords: [],
            })),
        },
    ]
}

const topFiveGroupParser = (
    filteredGroup: CommandBarGroupType,
    additionalItemConfig: Pick<CommandBarGroupType['items'][number], 'id' | 'href'>,
): CommandBarGroupType[] => {
    if (!filteredGroup?.items?.length) {
        return []
    }

    const showOtherItems = filteredGroup.items.length > 5
    const slicedItems = showOtherItems ? filteredGroup.items.slice(0, 5) : filteredGroup.items
    const numberOfOtherItems = filteredGroup.items.length - slicedItems.length

    if (!showOtherItems) {
        return [filteredGroup]
    }

    return [
        {
            ...filteredGroup,
            items: [
                ...slicedItems,
                {
                    id: additionalItemConfig.id,
                    href: additionalItemConfig.href,
                    title: `${numberOfOtherItems} more matching ${filteredGroup.title.toLowerCase()}`,
                    icon: 'ic-arrow-right',
                    keywords: [],
                    excludeFromRecent: true,
                },
            ],
        },
    ]
}

const getTopFiveAppListGroup = (
    appList: CommandBarBackdropProps['resourceList']['appList'],
    searchText: string,
): CommandBarGroupType[] => {
    const lowerCaseSearchText = searchText.toLowerCase()

    const filteredAppList = appList.filter((app) => app.name && app.name.toLowerCase().includes(lowerCaseSearchText))
    const parsedAppList = parseAppListToNavItems(filteredAppList)
    return parsedAppList[0]
        ? topFiveGroupParser(parsedAppList[0], {
              id: 'search-app-list-view',
              href: `${COMMON_URLS.APPLICATION_MANAGEMENT_APP_LIST}?${URL_FILTER_KEYS.SEARCH_KEY}=${encodeURIComponent(searchText)}`,
          })
        : parsedAppList
}

const getTopFiveHelmAppListGroup = (
    helmAppList: CommandBarBackdropProps['resourceList']['helmAppList'],
    searchText: string,
): CommandBarGroupType[] => {
    const lowerCaseSearchText = searchText.toLowerCase()

    const filteredHelmAppList = helmAppList.filter(
        (helmApp) => helmApp.appName && helmApp.appName.toLowerCase().includes(lowerCaseSearchText),
    )
    const parsedHelmAppList = parseHelmAppListToNavItems(filteredHelmAppList)
    return parsedHelmAppList[0]
        ? topFiveGroupParser(parsedHelmAppList[0], {
              id: 'search-helm-app-list-view',
              href: `${generatePath(COMMON_URLS.INFRASTRUCTURE_MANAGEMENT_APP_LIST, { appType: InfrastructureManagementAppListType.HELM })}?${URL_FILTER_KEYS.SEARCH_KEY}=${encodeURIComponent(searchText)}`,
          })
        : parsedHelmAppList
}

const getTopFiveClusterListGroup = (
    clusterList: CommandBarBackdropProps['resourceList']['clusterList'],
    searchText: string,
): CommandBarGroupType[] => {
    const lowerCaseSearchText = searchText.toLowerCase()

    const filteredClusterList = clusterList.filter(
        (cluster) => cluster.name && cluster.name.toLowerCase().includes(lowerCaseSearchText),
    )
    const parsedClusterList = parseClusterListToNavItems(filteredClusterList)
    return parsedClusterList[0]
        ? topFiveGroupParser(parsedClusterList[0], {
              id: 'search-cluster-list-view',
              href: `${COMMON_URLS.INFRASTRUCTURE_MANAGEMENT_RESOURCE_BROWSER}?${URL_FILTER_KEYS.SEARCH_KEY}=${encodeURIComponent(
                  searchText,
              )}`,
          })
        : parsedClusterList
}

const getTopFiveChartListGroup = (
    chartList: CommandBarBackdropProps['resourceList']['chartList'],
    searchText: string,
): CommandBarGroupType[] => {
    const lowerCaseSearchText = searchText.toLowerCase()

    const filteredChartList = chartList.filter(
        (chart) => chart.name && chart.name.toLowerCase().includes(lowerCaseSearchText),
    )
    const parsedChartList = parseChartListToNavItems(filteredChartList)
    return parsedChartList[0]
        ? topFiveGroupParser(parsedChartList[0], {
              id: 'search-chart-list-view',
              href: `${COMMON_URLS.INFRASTRUCTURE_MANAGEMENT_CHART_STORE_DISCOVER}?${ChartStoreQueryParams.AppStoreName}=${encodeURIComponent(
                  searchText,
              )}`,
          })
        : parsedChartList
}

export const getAdditionalNavGroups = (
    searchText: string,
    resourceList: CommandBarBackdropProps['resourceList'],
): CommandBarGroupType[] => {
    const { appList, chartList, clusterList, helmAppList } = resourceList || {
        appList: [],
        chartList: [],
        clusterList: [],
        helmAppList: [],
    }

    if (searchText.length < 3) {
        return []
    }

    return [
        ...getTopFiveAppListGroup(appList, searchText),
        ...getTopFiveHelmAppListGroup(helmAppList, searchText),
        ...getTopFiveChartListGroup(chartList, searchText),
        ...getTopFiveClusterListGroup(clusterList, searchText),
    ]
}

export const getShowUpgradeDialogFromLocalStorage = () => {
    const hasClosedUpgradeDialog = localStorage.getItem(UPGRADE_DIALOG_LOCAL_STORAGE_KEY)
    return hasClosedUpgradeDialog !== 'true'
}

export const hideUpgradeDialogInLocalStorage = () => {
    localStorage.setItem(UPGRADE_DIALOG_LOCAL_STORAGE_KEY, 'true')
}
