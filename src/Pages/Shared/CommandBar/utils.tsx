import {
    Icon,
    ImageWithFallback,
    SERVER_MODE,
    URL_FILTER_KEYS,
    URLS as COMMON_URLS,
} from '@devtron-labs/devtron-fe-common-lib'

import { QueryParams as ChartStoreQueryParams } from '@Components/charts/constants'
import { NAVIGATION_LIST } from '@Components/Navigation/constants'
import { getClusterChangeRedirectionUrl } from '@Components/ResourceBrowser/Utils'
import { URLS } from '@Config/routes'

import {
    CHART_LIST_COMMAND_GROUP_ID,
    CLUSTER_LIST_COMMAND_GROUP_ID,
    DEVTRON_APPLICATIONS_COMMAND_GROUP_ID,
    HELM_APP_LIST_COMMAND_GROUP_ID,
    NAV_SUB_ITEMS_ICON_MAPPING,
    RECENT_NAVIGATION_ITEM_ID_PREFIX,
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

const getAppManagementAdditionalNavItems = (
    serverMode: SERVER_MODE,
    isSuperAdmin: boolean,
): CommandBarGroupType['items'] => [
    ...(serverMode === SERVER_MODE.FULL
        ? [
              {
                  id: 'app-management-devtron-app-list',
                  title: 'Devtron Applications',
                  icon: 'ic-devtron-app',
                  iconColor: 'none',
                  href: URLS.DEVTRON_APP_LIST,
                  keywords: [],
              } satisfies CommandBarGroupType['items'][number],
          ]
        : []),
    {
        id: 'app-management-helm-app-list',
        title: 'Helm Applications',
        icon: 'ic-helm-app',
        iconColor: 'none',
        href: URLS.HELM_APP_LIST,
        keywords: [],
    },
    ...(window._env_?.ENABLE_EXTERNAL_ARGO_CD && isSuperAdmin
        ? [
              {
                  id: 'app-management-argo-app-list',
                  title: 'ArgoCD Applications',
                  icon: 'ic-argocd-app',
                  iconColor: 'none',
                  href: URLS.ARGO_APP_LIST,
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
                  href: URLS.FLUX_APP_LIST,
                  keywords: [],
              } satisfies CommandBarGroupType['items'][number],
          ]
        : []),
]

export const getNavigationGroups = (serverMode: SERVER_MODE, isSuperAdmin: boolean): CommandBarGroupType[] =>
    NAVIGATION_LIST.map<CommandBarGroupType>((group) => {
        const isAppManagementBlock = group.id === 'application-management'
        const additionalItems = isAppManagementBlock ? getAppManagementAdditionalNavItems(serverMode, isSuperAdmin) : []

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
            items: [...additionalItems, ...parsedItems],
        }
    })

export const parseAppListToNavItems = (
    appList: CommandBarBackdropProps['resourceList']['appList'],
    shouldSliceTopFive = false,
    searchKey = '',
): CommandBarGroupType[] => {
    if (!appList?.length) {
        return []
    }

    const slicedApps = shouldSliceTopFive ? appList.slice(0, 5) : appList
    const numberOfOtherApps = appList.length - slicedApps.length

    const appItems = slicedApps.map<CommandBarGroupType['items'][number]>((app) => ({
        id: `app-management-devtron-app-list-${app.id}`,
        title: app.name,
        icon: 'ic-devtron-app',
        iconColor: 'none',
        href: `${COMMON_URLS.APPLICATION_MANAGEMENT_APP}/${app.id}/${URLS.APP_OVERVIEW}`,
        keywords: [],
    }))

    if (shouldSliceTopFive && numberOfOtherApps > 0) {
        appItems.push({
            id: 'search-app-list-view',
            title: `${numberOfOtherApps} more matching devtron apps`,
            icon: 'ic-arrow-right',
            href: `${URLS.DEVTRON_APP_LIST}?${URL_FILTER_KEYS.SEARCH_KEY}=${encodeURIComponent(searchKey)}`,
            keywords: [],
            excludeFromRecent: true,
        })
    }

    return [
        {
            title: 'Devtron Applications',
            id: DEVTRON_APPLICATIONS_COMMAND_GROUP_ID,
            items: appItems,
        },
    ]
}

export const parseChartListToNavItems = (
    chartList: CommandBarBackdropProps['resourceList']['chartList'],
    shouldSliceTopFive = false,
    searchKey = '',
): CommandBarGroupType[] => {
    if (!chartList?.length) {
        return []
    }

    const slicedCharts = shouldSliceTopFive ? chartList.slice(0, 5) : chartList
    const numberOfOtherCharts = chartList.length - slicedCharts.length

    const chartItems = slicedCharts.map<CommandBarGroupType['items'][number]>((chart) => ({
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
        href: `${COMMON_URLS.APPLICATION_MANAGEMENT_CHART_STORE_DISCOVER}${URLS.CHART}/${chart.id}`,
        keywords: [],
    }))

    if (shouldSliceTopFive && numberOfOtherCharts > 0) {
        chartItems.push({
            id: 'search-chart-list-view',
            title: `${numberOfOtherCharts} more matching charts`,
            icon: 'ic-arrow-right',
            href: `${COMMON_URLS.APPLICATION_MANAGEMENT_CHART_STORE_DISCOVER}?${ChartStoreQueryParams.AppStoreName}=${encodeURIComponent(
                searchKey,
            )}`,
            keywords: [],
            excludeFromRecent: true,
        })
    }

    return [
        {
            title: 'Charts',
            id: CHART_LIST_COMMAND_GROUP_ID,
            items: chartItems,
        },
    ]
}

export const parseClusterListToNavItems = (
    clusterList: CommandBarBackdropProps['resourceList']['clusterList'],
    shouldSliceTopFive = false,
    searchKey = '',
): CommandBarGroupType[] => {
    if (!clusterList?.length) {
        return []
    }

    const slicedClusters = shouldSliceTopFive ? clusterList.slice(0, 5) : clusterList
    const numberOfOtherClusters = clusterList.length - slicedClusters.length

    const clusterItems = slicedClusters.map<CommandBarGroupType['items'][number]>((cluster) => ({
        id: `cluster-list-${cluster.id}`,
        title: cluster.name,
        icon: 'ic-bg-cluster',
        // TODO: Do we need to verify clusterCreatingPhase here?
        href: getClusterChangeRedirectionUrl(false, String(cluster.id)),
        keywords: [],
    }))

    if (shouldSliceTopFive && numberOfOtherClusters > 0) {
        clusterItems.push({
            id: 'search-cluster-list-view',
            title: `${numberOfOtherClusters} more matching clusters`,
            icon: 'ic-arrow-right',
            href: `${COMMON_URLS.INFRASTRUCTURE_MANAGEMENT_RESOURCE_BROWSER}?${URL_FILTER_KEYS.SEARCH_KEY}=${encodeURIComponent(
                searchKey,
            )}`,
            keywords: [],
            excludeFromRecent: true,
        })
    }

    return [
        {
            title: 'Clusters',
            id: CLUSTER_LIST_COMMAND_GROUP_ID,
            items: clusterItems,
        },
    ]
}

export const parseHelmAppListToNavItems = (
    helmAppList: CommandBarBackdropProps['resourceList']['helmAppList'],
    shouldSliceTopFive = false,
    searchKey = '',
): CommandBarGroupType[] => {
    if (!helmAppList?.length) {
        return []
    }

    const slicedHelmApps = shouldSliceTopFive ? helmAppList.slice(0, 5) : helmAppList
    const numberOfOtherHelmApps = helmAppList.length - slicedHelmApps.length

    const helmAppItems = slicedHelmApps.map<CommandBarGroupType['items'][number]>((helmApp) => ({
        id: `helm-app-list-${+helmApp.appId}`,
        title: helmApp.appName,
        subText: helmApp.chartName,
        icon: 'ic-helm-app',
        iconColor: 'none',
        href: `${URLS.APPLICATION_MANAGEMENT_APP}/${URLS.DEVTRON_CHARTS}/deployments/${helmApp.appId}/env/${helmApp.environmentDetail?.environmentId}`,
        keywords: [],
    }))

    if (shouldSliceTopFive && numberOfOtherHelmApps > 0) {
        helmAppItems.push({
            id: 'search-helm-app-list-view',
            title: `${numberOfOtherHelmApps} more matching helm apps`,
            icon: 'ic-arrow-right',
            href: `${URLS.HELM_APP_LIST}?${URL_FILTER_KEYS.SEARCH_KEY}=${encodeURIComponent(searchKey)}`,
            keywords: [],
            excludeFromRecent: true,
        })
    }

    return [
        {
            title: 'Helm Applications',
            id: HELM_APP_LIST_COMMAND_GROUP_ID,
            items: helmAppItems,
        },
    ]
}

export const getAdditionalNavGroups = (
    searchText: string,
    resourceList: CommandBarBackdropProps['resourceList'],
): CommandBarGroupType[] => {
    const { appList, chartList } = resourceList || { appList: [], chartList: [] }

    if (searchText.length < 3) {
        return []
    }

    const lowerCaseSearchText = searchText.toLowerCase()

    const filteredAppList = appList.filter((app) => app.name && app.name.toLowerCase().includes(lowerCaseSearchText))
    const filteredChartList = chartList.filter(
        (chart) => chart.name && chart.name.toLowerCase().includes(lowerCaseSearchText),
    )
    return [
        ...parseAppListToNavItems(filteredAppList, true, searchText),
        ...parseHelmAppListToNavItems(resourceList.helmAppList, true, searchText),
        ...parseChartListToNavItems(filteredChartList, true, searchText),
        ...parseClusterListToNavItems(resourceList.clusterList, true, searchText),
    ]
}
