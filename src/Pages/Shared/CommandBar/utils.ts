import { SERVER_MODE, URLS as COMMON_URLS } from '@devtron-labs/devtron-fe-common-lib'

import { NAVIGATION_LIST } from '@Components/Navigation/constants'
import { URLS } from '@Config/routes'

import {
    DEVTRON_APPLICATIONS_COMMAND_GROUP_ID,
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

export const parseAppListToNavItems = (appList: CommandBarBackdropProps['appList']): CommandBarGroupType[] => {
    if (!appList?.length) {
        return []
    }

    return [
        {
            title: 'Devtron Applications',
            id: DEVTRON_APPLICATIONS_COMMAND_GROUP_ID,
            items: appList.map((app) => ({
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

export const getAdditionalNavGroups = (
    searchText: string,
    appList: CommandBarBackdropProps['appList'],
): CommandBarGroupType[] => {
    if (searchText.length < 3 || !appList?.length) {
        return []
    }

    const lowerCaseSearchText = searchText.toLowerCase()

    const filteredAppList = appList.filter((app) => app.name && app.name.toLowerCase().includes(lowerCaseSearchText))
    return parseAppListToNavItems(filteredAppList)
}
