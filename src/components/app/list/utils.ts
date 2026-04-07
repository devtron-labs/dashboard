import { FiltersTypeEnum, TableColumnType } from '@devtron-labs/devtron-fe-common-lib'

import { AppListSortableKeys } from '../list-new/AppListType'
import { APP_LIST_HEADERS } from '../list-new/Constants'
import { CellComponent } from './CellComponent'
import { EnvironmentCellComponent } from './EnvironmentCellComponent'
import { NameCellComponent } from './NameCellComponent'
import { App, TableAdditionalPropsType } from './types'

export const getTableColumns = (
    isArgoInstalled: boolean,
): TableColumnType<App, FiltersTypeEnum.URL, TableAdditionalPropsType>[] => [
    {
        field: AppListSortableKeys.APP_NAME,
        label: APP_LIST_HEADERS.AppName,
        size: {
            fixed: 220,
        },
        CellComponent: NameCellComponent,
        isSortable: true,
        horizontallySticky: true,
    },
    ...(isArgoInstalled
        ? [
              {
                  field: APP_LIST_HEADERS.AppStatus,
                  label: APP_LIST_HEADERS.AppStatus,
                  size: {
                      fixed: 160,
                  },
                  CellComponent,
              },
          ]
        : []),
    {
        field: APP_LIST_HEADERS.Environment,
        label: APP_LIST_HEADERS.Environment,
        size: {
            fixed: 180,
        },
        CellComponent: EnvironmentCellComponent,
        infoTooltipText: 'Environment is a unique combination of cluster and namespace',
    },
    {
        field: APP_LIST_HEADERS.Cluster,
        label: APP_LIST_HEADERS.Cluster,
        size: {
            fixed: 160,
        },
        CellComponent,
    },
    {
        field: APP_LIST_HEADERS.Namespace,
        label: APP_LIST_HEADERS.Namespace,
        size: {
            fixed: 160,
        },
        CellComponent,
    },
    {
        field: AppListSortableKeys.LAST_DEPLOYED,
        label: APP_LIST_HEADERS.LastDeployedAt,
        size: {
            fixed: 220,
        },
        CellComponent,
        isSortable: true,
    },
]
