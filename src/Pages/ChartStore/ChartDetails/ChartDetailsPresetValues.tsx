import { useMemo, useState } from 'react'
import { generatePath, Link, useRouteMatch } from 'react-router-dom'
import moment from 'moment'

import {
    APIResponseHandler,
    Button,
    ButtonComponentType,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    DeleteConfirmationModal,
    GenericEmptyState,
    getAlphabetIcon,
    handleAnalyticsEvent,
    Icon,
    PortalContainer,
    SortableTableHeaderCell,
    stringComparatorBySortOrder,
    Tooltip,
    useAsync,
    useStateFilters,
} from '@devtron-labs/devtron-fe-common-lib'

import { deleteChartValues } from '@Components/charts/charts.service'
import { SavedValueType } from '@Components/charts/SavedValues/types'
import { Moment12HourFormat } from '@Config/constants'
import { URLS } from '@Config/routes'
import { ApplicationDeletionInfo } from '@Pages/Shared/ApplicationDeletionInfo/ApplicationDeletionInfo'

import { CHART_DETAILS_PORTAL_CONTAINER_ID } from './constants'
import { fetchChartValuesTemplateList } from './services'
import { ChartDetailsPresetValuesProps, ChartDetailsRouteParams } from './types'

const renderEmptyStateButton = (path: string) => () => (
    <Button
        dataTestId="create-chart-preset-value"
        variant={ButtonVariantType.secondary}
        text="Create Preset Value"
        startIcon={<Icon name="ic-add" color={null} />}
        size={ComponentSizeType.medium}
        component={ButtonComponentType.link}
        linkProps={{ to: `${path}${URLS.PRESET_VALUES}/0` }}
    />
)

const renderFilterEmptyStateButton = (onClick: () => void) => () => (
    <Button
        dataTestId="chart-preset-values-clear-filters"
        variant={ButtonVariantType.secondary}
        text="Clear Filters"
        size={ComponentSizeType.medium}
        onClick={onClick}
    />
)

export const ChartDetailsPresetValues = ({ searchKey, onClearFilters }: ChartDetailsPresetValuesProps) => {
    // STATES
    const [deletePresetValue, setDeletePresetValue] = useState<SavedValueType | null>(null)

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

    const { sortBy, sortOrder, handleSorting } = useStateFilters<'name'>({ initialSortKey: 'name' })

    const filteredChartValuesTemplateList = useMemo(() => {
        if (!isFetchingChartValuesTemplateList && chartValuesTemplateList) {
            return chartValuesTemplateList
                .filter((cluster) => cluster.name.includes(searchKey.toLowerCase()))
                .sort((a, b) => stringComparatorBySortOrder(a.name, b.name, sortOrder))
        }

        return []
    }, [chartValuesTemplateList, isFetchingChartValuesTemplateList, searchKey, sortOrder])

    // HANDLERS
    const triggerSorting = () => {
        handleSorting('name')
    }

    const handleChartPresetDeployAndEdit = () => {
        handleAnalyticsEvent({ category: 'Chart Store', action: 'CS_CHART_PRESET_VALUES_NEW' })
    }

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

    return (
        <div className="mh-500 flexbox-col bg__primary border__primary br-4 w-100 dc__overflow-hidden">
            <PortalContainer
                portalParentId={CHART_DETAILS_PORTAL_CONTAINER_ID}
                condition={Array.isArray(chartValuesTemplateList) && !!chartValuesTemplateList.length}
            >
                <Button
                    dataTestId="chart-preset-values-clear-filters"
                    variant={ButtonVariantType.secondary}
                    startIcon={<Icon name="ic-add" color={null} />}
                    text="Create Preset"
                    size={ComponentSizeType.medium}
                    component={ButtonComponentType.link}
                    linkProps={{ to: `${generatePath(path, { chartId })}${URLS.PRESET_VALUES}/0` }}
                />
            </PortalContainer>
            <APIResponseHandler
                isLoading={isFetchingChartValuesTemplateList}
                progressingProps={{ size: 24 }}
                error={chartValuesTemplateListErr}
                errorScreenManagerProps={{
                    code: chartValuesTemplateListErr?.code,
                    reload: reloadChartValuesTemplateList,
                }}
            >
                {!chartValuesTemplateList?.length && (
                    <GenericEmptyState
                        title="Create your first Preset Template"
                        subTitle="Create reusable Helm config templates for different scenarios. Set them up once and let your team deploy with confidence."
                        illustrationName="illustration-code"
                        isButtonAvailable
                        renderButton={renderEmptyStateButton(generatePath(path, { chartId }))}
                    />
                )}
                {!!chartValuesTemplateList?.length &&
                    (filteredChartValuesTemplateList.length ? (
                        <>
                            <div className="chart-details-preset-value__row px-16 pt-6 pb-5 border__primary--bottom">
                                <span className="icon-dim-24" />
                                <SortableTableHeaderCell
                                    title="Name"
                                    isSortable
                                    isSorted={sortBy === 'name'}
                                    sortOrder={sortOrder}
                                    triggerSorting={triggerSorting}
                                    disabled={false}
                                />
                                <SortableTableHeaderCell title="Version" isSortable={false} />
                                <SortableTableHeaderCell title="Last updated by" isSortable={false} />
                                <SortableTableHeaderCell title="Updated at" isSortable={false} />
                            </div>
                            {filteredChartValuesTemplateList.map(({ chartVersion, id, name, updatedBy, updatedOn }) => (
                                <div
                                    key={id}
                                    className="chart-details-preset-value__row px-16 py-12 bg__hover dc__visible-hover dc__visible-hover--parent"
                                >
                                    <Icon name="ic-file" color="N700" size={24} />
                                    <Link
                                        className="fs-13 lh-20 dc__truncate"
                                        to={`${generatePath(path, { chartId })}${URLS.PRESET_VALUES}/${id}`}
                                    >
                                        {name}
                                    </Link>
                                    <span className="fs-13 lh-20 cn-9">{chartVersion}</span>
                                    <span className="flex left">
                                        {updatedBy && getAlphabetIcon(updatedBy)}
                                        <Tooltip content={updatedBy}>
                                            <span className="fs-13 lh-20 cn-9 dc__truncate">{updatedBy || '-'}</span>
                                        </Tooltip>
                                    </span>
                                    <div className="flex dc__content-space">
                                        <span className="fs-13 lh-20 cn-9">
                                            {updatedOn && !updatedOn.startsWith('0001-01-01')
                                                ? moment(updatedOn).format(Moment12HourFormat)
                                                : '-'}
                                        </span>
                                        <div className="flex dc__gap-4 dc__visible-hover--child">
                                            <Button
                                                dataTestId="chart-deploy-with-preset-value"
                                                ariaLabel="Use value to deploy"
                                                icon={<Icon name="ic-rocket-launch" color={null} />}
                                                variant={ButtonVariantType.borderLess}
                                                style={ButtonStyleType.neutral}
                                                size={ComponentSizeType.xs}
                                                component={ButtonComponentType.link}
                                                linkProps={{
                                                    to: `${generatePath(path, { chartId })}${URLS.DEPLOY_CHART}/${id}`,
                                                }}
                                                onClick={handleChartPresetDeployAndEdit}
                                            />
                                            <Button
                                                dataTestId="chart-preset-value-edit"
                                                ariaLabel="Edit value"
                                                icon={<Icon name="ic-edit" color={null} />}
                                                variant={ButtonVariantType.borderLess}
                                                style={ButtonStyleType.neutral}
                                                size={ComponentSizeType.xs}
                                                component={ButtonComponentType.link}
                                                linkProps={{
                                                    to: `${generatePath(path, { chartId })}${URLS.PRESET_VALUES}/${id}`,
                                                }}
                                                onClick={handleChartPresetDeployAndEdit}
                                            />
                                            <Button
                                                dataTestId="chart-preset-value-delete"
                                                ariaLabel="Delete value"
                                                icon={<Icon name="ic-delete" color={null} />}
                                                variant={ButtonVariantType.borderLess}
                                                style={ButtonStyleType.negativeGrey}
                                                size={ComponentSizeType.xs}
                                                onClick={showDeleteModal({
                                                    chartVersion,
                                                    id,
                                                    name,
                                                    updatedBy,
                                                    updatedOn,
                                                    isLoading: false,
                                                })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        <GenericEmptyState
                            title="No results"
                            subTitle="We couldn’t find any matching results"
                            illustrationName="illustration-no-result"
                            isButtonAvailable
                            renderButton={renderFilterEmptyStateButton(onClearFilters)}
                        />
                    ))}
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
