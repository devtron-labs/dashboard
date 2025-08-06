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

import { useMemo, useState } from 'react'
import { generatePath, useRouteMatch } from 'react-router-dom'

import {
    APIResponseHandler,
    Button,
    ButtonComponentType,
    ButtonVariantType,
    ComponentSizeType,
    DeleteConfirmationModal,
    FiltersTypeEnum,
    Icon,
    PaginationEnum,
    Table,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'

import { deleteChartValues } from '@Components/charts/charts.service'
import { URLS } from '@Config/routes'
import { ApplicationDeletionInfo } from '@Pages/Shared/ApplicationDeletionInfo/ApplicationDeletionInfo'

import {
    PRESET_VALUES_TABLE_COLUMNS,
    PresetValuesTableRowActionsOnHoverComponent,
    PresetValuesTableViewWrapper,
} from './ChartDetailsTableComponents'
import { CHART_DETAILS_NEW_PRESET_VALUE_ID } from './constants'
import { fetchChartValuesTemplateList } from './services'
import {
    ChartDetailsRouteParams,
    ChartValuesTemplateDTO,
    PresetValuesTableAdditionalProps,
    PresetValuesTableProps,
} from './types'

const renderEmptyStateButton = (path: string) => () => (
    <Button
        dataTestId="create-chart-preset-value"
        variant={ButtonVariantType.secondary}
        text="Create Preset Value"
        startIcon={<Icon name="ic-add" color={null} />}
        size={ComponentSizeType.medium}
        component={ButtonComponentType.link}
        linkProps={{ to: `${path}${URLS.PRESET_VALUES}/${CHART_DETAILS_NEW_PRESET_VALUE_ID}` }}
    />
)

export const ChartDetailsPresetValues = () => {
    // STATES
    const [deletePresetValue, setDeletePresetValue] = useState<ChartValuesTemplateDTO | null>(null)

    // HOOKS
    const {
        path,
        params: { chartId },
    } = useRouteMatch<ChartDetailsRouteParams>()

    // ASYNC CALLS
    const [
        isFetchingChartValuesTemplateList,
        chartValuesTemplateList,
        chartValuesTemplateListErr,
        reloadChartValuesTemplateList,
    ] = useAsync(() => fetchChartValuesTemplateList(chartId), [chartId], true, { resetOnChange: false })

    const rows = useMemo<PresetValuesTableProps['rows']>(
        () =>
            (chartValuesTemplateList || []).map<PresetValuesTableProps['rows'][0]>(
                ({ id, chartVersion, name, updatedBy, updatedOn }) => ({
                    id: id.toString(),
                    data: { chartVersion, name, updatedBy, updatedOn, id },
                }),
            ),
        [chartValuesTemplateList],
    )

    // HANDLERS
    const handleChartPresetDelete = async () => {
        await deleteChartValues(deletePresetValue.id)
        reloadChartValuesTemplateList()
    }

    const showDeleteModal = (_deletePresetValue: typeof deletePresetValue) => () => {
        setDeletePresetValue(_deletePresetValue)
    }

    const hideDeleteModal = () => {
        setDeletePresetValue(null)
    }

    const filter: PresetValuesTableProps['filter'] = (rowData, filterData) =>
        rowData.data.name.includes(filterData.searchKey.toLowerCase())

    return (
        <div className="mh-500 flexbox-col bg__primary border__primary br-4 w-100 dc__overflow-auto">
            <APIResponseHandler
                isLoading={false}
                progressingProps={{ size: 24 }}
                error={chartValuesTemplateListErr}
                errorScreenManagerProps={{
                    code: chartValuesTemplateListErr?.code,
                    reload: reloadChartValuesTemplateList,
                }}
            >
                <Table<ChartValuesTemplateDTO, FiltersTypeEnum.STATE, PresetValuesTableAdditionalProps>
                    id="table__chart-details-preset-values"
                    loading={isFetchingChartValuesTemplateList}
                    columns={PRESET_VALUES_TABLE_COLUMNS}
                    rows={rows}
                    stylesConfig={{ showSeparatorBetweenRows: false }}
                    emptyStateConfig={{
                        noRowsConfig: {
                            title: 'Create your first Preset Template',
                            subTitle:
                                'Create reusable Helm config templates for different scenarios. Set them up once and let your team deploy with confidence.',
                            imgName: 'img-code',
                            isButtonAvailable: true,
                            renderButton: renderEmptyStateButton(generatePath(path, { chartId })),
                        },
                        noRowsForFilterConfig: {
                            title: 'No results',
                            subTitle: 'We couldn’t find any matching results',
                        },
                    }}
                    paginationVariant={PaginationEnum.NOT_PAGINATED}
                    filtersVariant={FiltersTypeEnum.STATE}
                    filter={filter}
                    ViewWrapper={PresetValuesTableViewWrapper}
                    RowActionsOnHoverComponent={PresetValuesTableRowActionsOnHoverComponent}
                    additionalProps={{ showDeleteModal, chartValuesTemplateList }}
                    additionalFilterProps={{
                        initialSortKey: 'name',
                    }}
                />
            </APIResponseHandler>
            {deletePresetValue && (
                <DeleteConfirmationModal
                    title={deletePresetValue.name}
                    subtitle={<ApplicationDeletionInfo isPresetValue />}
                    component="preset value"
                    onDelete={handleChartPresetDelete}
                    closeConfirmationModal={hideDeleteModal}
                />
            )}
        </div>
    )
}
