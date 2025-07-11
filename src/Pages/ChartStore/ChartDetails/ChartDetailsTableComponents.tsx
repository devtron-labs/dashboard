import { generatePath, Link, useRouteMatch } from 'react-router-dom'
import moment from 'moment'

import {
    ActionMenu,
    ActionMenuProps,
    AppStatus,
    Button,
    ButtonComponentType,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    dateComparatorBySortOrder,
    handleAnalyticsEvent,
    handleUTCTime,
    Icon,
    ImageWithFallback,
    PortalContainer,
    SearchBar,
    SERVER_MODE,
    stringComparatorBySortOrder,
    UserIdentifier,
} from '@devtron-labs/devtron-fe-common-lib'

import { getAppId } from '@Components/v2/appDetails/k8Resource/nodeDetail/nodeDetail.api'
import { Moment12HourFormat } from '@Config/constants'
import { URLS } from '@Config/routes'

import { CHART_DETAILS_NEW_PRESET_VALUE_ID, CHART_DETAILS_PORTAL_CONTAINER_ID } from './constants'
import {
    ChartDetailsRouteParams,
    DeploymentsTableCellComponentProps,
    DeploymentsTableProps,
    DeploymentsTableViewWrapperProps,
    PresetValuesTableCellComponentProps,
    PresetValuesTableProps,
    PresetValuesTableRowActionsOnHoverComponentProps,
    PresetValuesTableViewWrapperProps,
} from './types'

// PRESET VALUES TABLE
const PresetValuesTableLinkCellComponent = ({ value, row }: PresetValuesTableCellComponentProps) => {
    const {
        path,
        params: { chartId },
    } = useRouteMatch<ChartDetailsRouteParams>()

    return (
        <Link
            className="flex left fs-13 lh-20 dc__truncate dc__w-fit-content"
            to={`${generatePath(path, { chartId })}${URLS.PRESET_VALUES}/${row.id}`}
        >
            {value}
        </Link>
    )
}

const PresetValuesTableIconCellComponent = () => (
    <div className="flex py-12">
        <Icon name="ic-file" color="N700" size={24} />
    </div>
)

const PresetValuesTableLastUpdatedByCellComponent = ({ row }: PresetValuesTableCellComponentProps) => {
    const { updatedBy } = row.data

    return <UserIdentifier identifier={updatedBy} displayYouLabelForCurrentUser={updatedBy !== 'admin'} />
}

const PresetValuesTableUpdatedAtCellComponent = ({ row }: PresetValuesTableCellComponentProps) => {
    const { updatedOn } = row.data

    return (
        <span className="flex left fs-13 lh-20 cn-9 dc__truncate">
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
                            linkProps={{
                                to: `${generatePath(path, { chartId })}${URLS.PRESET_VALUES}/${CHART_DETAILS_NEW_PRESET_VALUE_ID}`,
                            }}
                        />
                    )}
                </div>
            </PortalContainer>
            {children}
        </>
    )
}

export const PRESET_VALUES_TABLE_COLUMNS: PresetValuesTableProps['columns'] = [
    {
        field: 'icon',
        size: {
            fixed: 24,
        },
        CellComponent: PresetValuesTableIconCellComponent,
    },
    {
        field: 'name',
        label: 'name',
        size: {
            fixed: 200,
        },
        CellComponent: PresetValuesTableLinkCellComponent,
        isSortable: true,
        comparator: stringComparatorBySortOrder,
    } as PresetValuesTableProps['columns'][0],
    {
        field: 'chartVersion',
        label: 'Version',
        size: {
            fixed: 100,
        },
    },
    {
        field: 'updatedBy',
        label: 'Last updated by',
        size: {
            fixed: 200,
        },
        CellComponent: PresetValuesTableLastUpdatedByCellComponent,
    },
    {
        field: 'updatedOn',
        label: 'Updated at',
        size: {
            fixed: 220,
        },
        CellComponent: PresetValuesTableUpdatedAtCellComponent,
    },
]

// DEPLOYMENTS TABLE
const DeploymentsTableIconCellComponent = ({ row, chartIcon }: DeploymentsTableCellComponentProps) => (
    <ImageWithFallback
        fallbackImage={
            <div className="flex py-12">
                <Icon name="ic-helm" color="N700" size={24} />
            </div>
        }
        imageProps={{
            src: row.data.icon || chartIcon,
            className: 'icon-dim-24 mt-12 mb-12',
            alt: 'chart-icon',
            height: 24,
            width: 24,
        }}
    />
)

const DeploymentsTableLinkCellComponent = ({ row }: DeploymentsTableCellComponentProps) => {
    const { appName, appOfferingMode, environmentId, clusterId, namespace, installedAppId } = row.data

    return (
        <Link
            className="flex left fs-13 lh-20 dc__truncate dc__w-fit-content"
            to={
                appOfferingMode === SERVER_MODE.EA_ONLY
                    ? `${URLS.APP}/${URLS.EXTERNAL_APPS}/${getAppId({ clusterId, namespace, appName })}/${appName}`
                    : `${URLS.APP}/${URLS.DEVTRON_CHARTS}/deployments/${installedAppId}/env/${environmentId}`
            }
        >
            {row.data.appName}
        </Link>
    )
}

const DeploymentsTableStatusCellComponent = ({ row }: DeploymentsTableCellComponentProps) => (
    <AppStatus status={row.data.status} />
)

const DeploymentsTableDeployedByCellComponent = ({ row }: DeploymentsTableCellComponentProps) => {
    const { deployedBy } = row.data

    return <UserIdentifier identifier={deployedBy} displayYouLabelForCurrentUser={deployedBy !== 'admin'} />
}

const DeploymentsTableDeployedAtCellComponent = ({ row }: DeploymentsTableCellComponentProps) => {
    const { deployedAt } = row.data

    return <span className="flex left fs-13 lh-20 cn-9">{handleUTCTime(deployedAt, true) || '-'}</span>
}

const DeploymentsTableActionMenuCellComponent = ({ row, onDelete }: DeploymentsTableCellComponentProps) => {
    const handleClick: ActionMenuProps['onClick'] = (item) => {
        switch (item.id) {
            case 'delete':
                onDelete(row.data)
                break
            default:
        }
    }

    return (
        <ActionMenu
            id={`chart-details-deployments-table-action-menu-${row.id}`}
            onClick={handleClick}
            options={[
                {
                    items: [
                        {
                            id: 'delete',
                            label: 'Delete',
                            startIcon: { name: 'ic-delete' },
                            type: 'negative',
                        },
                    ],
                },
            ]}
            buttonProps={{
                dataTestId: `chart-details-deployments-table-action-menu-delete-${row.id}`,
                ariaLabel: `chart-details-deployments-table-action-menu-delete-${row.id}`,
                showAriaLabelInTippy: false,
                icon: <Icon name="ic-more-vertical" color={null} />,
                variant: ButtonVariantType.borderLess,
                style: ButtonStyleType.neutral,
                size: ComponentSizeType.xs,
            }}
        />
    )
}

export const DeploymentsTableViewWrapper = ({
    handleSearch,
    searchKey,
    children,
}: DeploymentsTableViewWrapperProps) => (
    <>
        <PortalContainer portalParentId={CHART_DETAILS_PORTAL_CONTAINER_ID}>
            <SearchBar
                containerClassName="w-250"
                dataTestId="chart-details-search-bar"
                initialSearchText={searchKey}
                handleEnter={handleSearch}
            />
        </PortalContainer>
        {children}
    </>
)

export const DEPLOYMENTS_TABLE_COLUMNS: DeploymentsTableProps['columns'] = [
    {
        field: 'icon',
        size: {
            fixed: 24,
        },
        CellComponent: DeploymentsTableIconCellComponent,
    },
    {
        field: 'appName',
        label: 'App name',
        size: {
            fixed: 250,
        },
        CellComponent: DeploymentsTableLinkCellComponent,
        isSortable: true,
        comparator: stringComparatorBySortOrder,
    } as DeploymentsTableProps['columns'][0],
    {
        field: 'appStatus',
        label: 'App status',
        size: {
            fixed: 110,
        },
        CellComponent: DeploymentsTableStatusCellComponent,
    },
    {
        field: 'environmentName',
        label: 'Environment',
        size: {
            fixed: 120,
        },
    },
    {
        field: 'deployedBy',
        label: 'Last Deployed by',
        size: {
            fixed: 200,
        },
        CellComponent: DeploymentsTableDeployedByCellComponent,
    },
    {
        field: 'deployedAt',
        label: 'Deployed at',
        size: {
            fixed: 130,
        },
        CellComponent: DeploymentsTableDeployedAtCellComponent,
        isSortable: true,
        comparator: dateComparatorBySortOrder,
    } as DeploymentsTableProps['columns'][0],
    {
        field: 'actionMenu',
        size: {
            fixed: 24,
        },
        CellComponent: DeploymentsTableActionMenuCellComponent,
    },
]
