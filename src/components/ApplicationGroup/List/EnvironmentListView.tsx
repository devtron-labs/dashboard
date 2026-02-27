/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useMemo } from 'react'
import { NavLink, useHistory } from 'react-router-dom'

import {
    FiltersTypeEnum,
    PaginationEnum,
    preventDefault,
    Table,
    TableCellComponentProps,
    ToastManager,
    ToastVariantType,
    URLS,
} from '@devtron-labs/devtron-fe-common-lib'

import { useAppContext } from '../../common'
import { EnvAppList, EnvironmentsListViewType } from '../AppGroup.types'
import { EMPTY_LIST_MESSAGING, GROUP_LIST_HEADER, NO_ACCESS_TOAST_MESSAGE } from '../Constants'

const EnvironmentNameCellComponent = ({ row, value }: TableCellComponentProps<EnvAppList, FiltersTypeEnum.URL>) => {
    const { setCurrentEnvironmentName } = useAppContext()
    const { namespace, id: environmentId, appCount, environment_name: environmentName } = row.data

    const handleClusterClick = (e: any): void => {
        if (!appCount) {
            preventDefault(e)
        }
    }

    const handleOnLinkRedirection = (e: any): void => {
        setCurrentEnvironmentName(environmentName)
        handleClusterClick(e)
    }

    return (
        <div className="py-10">
            <NavLink
                data-testid={`${namespace}-click-on-env`}
                to={`${URLS.APPLICATION_MANAGEMENT_APPLICATION_GROUP}/${environmentId}`}
                data-noapp={!appCount}
                onClick={handleOnLinkRedirection}
                className="cb-5 dc__ellipsis-right dc__no-decor"
            >
                {value}
            </NavLink>
        </div>
    )
}

// Cell component for application count
const ApplicationCountCellComponent = ({ value }: TableCellComponentProps<EnvAppList, FiltersTypeEnum.URL>) => {
    const count = (value as number) || 0
    return (
        <div>
            {count}&nbsp;
            {count === 0 || count === 1 ? GROUP_LIST_HEADER.APPLICATION : GROUP_LIST_HEADER.APPLICATIONS}
        </div>
    )
}

const EnvironmentsListView = ({
    isSuperAdmin,
    filterConfig,
    appListLoading,
    appListResponse,
}: EnvironmentsListViewType) => {
    const history = useHistory()
    const { setCurrentEnvironmentName } = useAppContext()

    // Handle row click for navigation and toast notifications (also triggered by Enter key press)
    const handleRowClick = (row: { data: EnvAppList }) => {
        const { appCount, id: environmentId, environment_name: environmentName } = row.data

        if (!appCount) {
            if (isSuperAdmin) {
                ToastManager.showToast({
                    variant: ToastVariantType.info,
                    description: NO_ACCESS_TOAST_MESSAGE.SUPER_ADMIN,
                })
            } else {
                ToastManager.showToast({
                    variant: ToastVariantType.notAuthorized,
                    title: EMPTY_LIST_MESSAGING.UNAUTHORIZE_TEXT,
                    description: NO_ACCESS_TOAST_MESSAGE.NON_ADMIN,
                })
            }
        } else {
            // Navigate to the environment detail page
            setCurrentEnvironmentName(environmentName)
            history.push(`${URLS.APPLICATION_MANAGEMENT_APPLICATION_GROUP}/${environmentId}`)
        }
    }

    const hasClusterFilter = filterConfig?.cluster?.length > 0

    // Use getRows for backend pagination
    const getRows = useMemo(
        () => async () => {
            const envList = appListResponse?.result?.envList || []
            const totalRows = appListResponse?.result?.envCount || 0

            return {
                rows: envList.map((env) => ({
                    id: String(env.id),
                    data: env,
                })),
                totalRows,
            }
        },
        [appListResponse],
    )

    return (
        <Table<EnvAppList, FiltersTypeEnum.URL>
            id="table__application-group-environment-list"
            columns={[
                {
                    field: 'environment_name',
                    label: GROUP_LIST_HEADER.ENVIRONMENT,
                    size: { fixed: 250 },
                    CellComponent: EnvironmentNameCellComponent,
                },
                {
                    field: 'namespace',
                    label: GROUP_LIST_HEADER.NAMESPACE,
                    size: null,
                },
                {
                    field: 'cluster_name',
                    label: GROUP_LIST_HEADER.CLUSTER,
                    size: null,
                },
                {
                    field: 'appCount',
                    label: GROUP_LIST_HEADER.APPLICATIONS,
                    size: { fixed: 150 },
                    CellComponent: ApplicationCountCellComponent,
                },
            ]}
            getRows={getRows}
            filtersVariant={FiltersTypeEnum.URL}
            paginationVariant={PaginationEnum.PAGINATED}
            loading={appListLoading}
            filter={null}
            emptyStateConfig={{
                noRowsConfig: {
                    title: hasClusterFilter ? 'No app groups found' : EMPTY_LIST_MESSAGING.TITLE,
                    subTitle: hasClusterFilter ? "We couldn't find any matching app groups." : '',
                },
                noRowsForFilterConfig: hasClusterFilter
                    ? undefined
                    : {
                          title: 'No results',
                          subTitle: "We couldn't find any matching results",
                      },
            }}
            onRowClick={handleRowClick}
            rowStartIconConfig={{
                name: 'ic-app-group',
                color: 'B400',
                size: 24,
            }}
        />
    )
}

export default EnvironmentsListView
