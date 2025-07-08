import { generatePath, Link, useRouteMatch } from 'react-router-dom'
import moment from 'moment'

import {
    Button,
    ButtonComponentType,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    getAlphabetIcon,
    handleAnalyticsEvent,
    Icon,
    PortalContainer,
    SearchBar,
    Tooltip,
} from '@devtron-labs/devtron-fe-common-lib'

import { Moment12HourFormat } from '@Config/constants'
import { URLS } from '@Config/routes'

import { CHART_DETAILS_PORTAL_CONTAINER_ID } from './constants'
import {
    ChartDetailsRouteParams,
    PresetValuesTableCellComponentProps,
    PresetValuesTableRowActionsOnHoverComponentProps,
    PresetValuesTableViewWrapperProps,
} from './types'

export const PresetValuesTableLinkCellComponent = ({ value, row }: PresetValuesTableCellComponentProps) => {
    const {
        path,
        params: { chartId },
    } = useRouteMatch<ChartDetailsRouteParams>()

    return (
        <Link
            className="py-12 fs-13 lh-20 dc__truncate"
            to={`${generatePath(path, { chartId })}${URLS.PRESET_VALUES}/${row.id}`}
        >
            {value}
        </Link>
    )
}

export const PresetValuesTableIconCellComponent = () => (
    <div className="flex py-6">
        <Icon name="ic-file" color="N700" size={24} />
    </div>
)

export const PresetValuesTableLastUpdatedByCellComponent = ({ row }: PresetValuesTableCellComponentProps) => {
    const { updatedBy } = row.data

    return (
        <span className="flex left">
            {updatedBy && getAlphabetIcon(updatedBy)}
            <Tooltip content={updatedBy}>
                <span className="fs-13 lh-20 cn-9 dc__truncate">{updatedBy || '-'}</span>
            </Tooltip>
        </span>
    )
}

export const PresetValuesTableUpdatedAtCellComponent = ({ row }: PresetValuesTableCellComponentProps) => {
    const { updatedOn } = row.data

    return (
        <span className="dc__inline-block py-12 fs-13 lh-20 cn-9">
            {updatedOn && !updatedOn.startsWith('0001-01-01') ? moment(updatedOn).format(Moment12HourFormat) : '-'}
        </span>
    )
}

export const PresetValuesTableRowActionsOnHoverComponent = ({
    row,
    showDeleteModal,
}: PresetValuesTableRowActionsOnHoverComponentProps) => {
    const { id, data } = row

    const {
        path,
        params: { chartId },
    } = useRouteMatch<ChartDetailsRouteParams>()

    const handleChartPresetDeployAndEdit = () => {
        handleAnalyticsEvent({ category: 'Chart Store', action: 'CS_CHART_PRESET_VALUES_NEW' })
    }

    return (
        <div className="flex dc__gap-4 py-10 pr-16">
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
                onClick={showDeleteModal(data)}
            />
        </div>
    )
}

export const PresetValuesTableViewWrapper = ({
    handleSearch,
    searchKey,
    chartValuesTemplateList,
    children,
}: PresetValuesTableViewWrapperProps) => {
    // HOOKS
    const {
        path,
        params: { chartId },
    } = useRouteMatch<ChartDetailsRouteParams>()

    return (
        <>
            <PortalContainer portalParentId={CHART_DETAILS_PORTAL_CONTAINER_ID}>
                <div className="flex dc__gap-8">
                    <SearchBar
                        containerClassName="w-250"
                        dataTestId="chart-details-search-bar"
                        initialSearchText={searchKey}
                        handleEnter={handleSearch}
                    />
                    {Array.isArray(chartValuesTemplateList) && !!chartValuesTemplateList.length && (
                        <Button
                            dataTestId="chart-preset-values-clear-filters"
                            variant={ButtonVariantType.secondary}
                            startIcon={<Icon name="ic-add" color={null} />}
                            text="Create Preset"
                            size={ComponentSizeType.medium}
                            component={ButtonComponentType.link}
                            linkProps={{ to: `${generatePath(path, { chartId })}${URLS.PRESET_VALUES}/0` }}
                        />
                    )}
                </div>
            </PortalContainer>
            {children}
        </>
    )
}
