import { ChangeEvent, Fragment, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import {
    AppStatus,
    Checkbox,
    ImageChipCell,
    SortableTableHeaderCell,
    useUrlFilters,
    RegistryType,
    CommitChipCell,
    getRandomColor,
    processDeployedTime,
    PopupMenu,
    stringComparatorBySortOrder,
    handleRelativeDateSorting,
    Tooltip,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as DevtronIcon } from '@Icons/ic-devtron-app.svg'
import { ReactComponent as ICActivity } from '@Icons/ic-activity.svg'
import { ReactComponent as ICArrowLineDown } from '@Icons/ic-arrow-line-down.svg'
import { ReactComponent as ICMoreOption } from '@Icons/ic-more-option.svg'
import { StatusConstants } from '@Components/app/list-new/Constants'

import {
    EnvironmentOverviewTableHeaderFixedKeys,
    EnvironmentOverviewTableHeaderValues,
    EnvironmentOverviewTableHeaderVariableKeys,
    EnvironmentOverviewTableSortableKeys,
} from './EnvironmentOverview.constants'
import {
    EnvironmentOverviewTableProps,
    EnvironmentOverviewTableRow,
    EnvironmentOverviewTableRowData,
} from './EnvironmentOverviewTable.types'
import './EnvironmentOverviewTable.scss'

const renderPopUpMenu = (items: EnvironmentOverviewTableRow['popUpMenuItems']) => (
    <PopupMenu autoClose>
        <PopupMenu.Button isKebab rootClassName="p-4 flex dc__no-border cursor">
            <ICMoreOption className="icon-dim-16 fcn-6 rotateBy--90" />
        </PopupMenu.Button>
        <PopupMenu.Body rootClassName="dc__border py-4 w-180">
            {items.map((popUpMenuItem) => {
                if ('label' in popUpMenuItem) {
                    const { label, onClick, disabled, Icon, iconType = 'fill' } = popUpMenuItem

                    return (
                        <button
                            key={label}
                            type="button"
                            className={`dc__transparent w-100 py-6 px-8 flexbox dc__align-items-center dc__gap-8 ${disabled ? ' dc__opacity-0_5 cursor-not-allowed' : 'dc__hover-n50'}`}
                            onClick={onClick}
                            disabled={disabled}
                        >
                            {Icon && (
                                <Icon
                                    className={`icon-dim-16 ${iconType === 'fill' ? 'fcn-7' : ''} ${iconType === 'stroke' ? 'scn-7' : ''}`}
                                />
                            )}
                            <span className="dc__truncate cn-9 fs-13 lh-20">{label}</span>
                        </button>
                    )
                }

                return popUpMenuItem
            })}
        </PopupMenu.Body>
    </PopupMenu>
)

export const EnvironmentOverviewTable = ({
    rows = [],
    isVirtualEnv,
    onCheckboxSelect,
}: EnvironmentOverviewTableProps) => {
    // STATES
    const [isLastDeployedExpanded, setIsLastDeployedExpanded] = useState(false)

    // HOOKS
    const { sortBy, sortOrder, handleSorting } = useUrlFilters<
        (typeof EnvironmentOverviewTableSortableKeys)[keyof typeof EnvironmentOverviewTableSortableKeys]
    >({
        initialSortKey: EnvironmentOverviewTableSortableKeys.NAME,
    })

    // ROWS
    const sortedRows = useMemo(
        () =>
            rows.sort((a, b) => {
                if (sortBy === EnvironmentOverviewTableSortableKeys.DEPLOYED_AT) {
                    return handleRelativeDateSorting(a.environment.deployedAt, b.environment.deployedAt, sortOrder)
                }

                return stringComparatorBySortOrder(a.environment.name, b.environment.name, sortOrder)
            }),
        [rows, sortBy, sortOrder],
    )

    // CONSTANTS
    const isAllChecked = sortedRows.every(({ isChecked }) => isChecked)
    const isPartialChecked = sortedRows.some(({ isChecked }) => isChecked)

    // CLASSES
    const isCheckedRowClassName = 'bcb-50 no-hover'
    const isVirtualEnvRowClassName = isVirtualEnv ? 'environment-overview-table__fixed-cell--no-status' : ''
    const isLastDeployedExpandedRowClassName = isLastDeployedExpanded
        ? 'environment-overview-table__variable-cell--last-deployed-expanded'
        : ''

    // METHODS
    const toggleLastDeployedExpanded = () => setIsLastDeployedExpanded(!isLastDeployedExpanded)

    const handleCheckboxChange = (id: EnvironmentOverviewTableRowData['id']) => (e: ChangeEvent<HTMLInputElement>) => {
        const { checked } = e.target
        // if id is null, then it denotes 'ALL CHECKBOX' is checked
        onCheckboxSelect(id, checked, !id)
    }

    // RENDERERS
    const renderHeaderValue = (key: string) => {
        const headerValue = EnvironmentOverviewTableHeaderValues[key]

        if (EnvironmentOverviewTableSortableKeys[key]) {
            return (
                <SortableTableHeaderCell
                    title={headerValue}
                    sortOrder={sortOrder}
                    isSorted={sortBy === EnvironmentOverviewTableSortableKeys[key]}
                    triggerSorting={() => handleSorting(EnvironmentOverviewTableSortableKeys[key])}
                    isSortable
                    disabled={false}
                />
            )
        }

        if (
            EnvironmentOverviewTableHeaderVariableKeys[key] ===
            EnvironmentOverviewTableHeaderVariableKeys.LAST_DEPLOYED_IMAGE
        ) {
            return (
                <button
                    type="button"
                    className="dc__transparent flexbox dc__align-items-center dc__gap-4 p-0"
                    onClick={toggleLastDeployedExpanded}
                >
                    {headerValue}
                    <ICArrowLineDown
                        className="icon-dim-14 scn-7 rotate"
                        style={{ ['--rotateBy' as string]: isLastDeployedExpanded ? '90deg' : '-90deg' }}
                    />
                </button>
            )
        }

        return headerValue ? <span>{headerValue}</span> : null
    }

    const renderHeaderRow = () => (
        <div className="environment-overview-table__row bg__primary dc__border-bottom-n1 no-hover">
            <div
                className={`environment-overview-table__fixed-cell bg__primary pl-16 pr-15 py-8 cn-7 fw-6 fs-12 lh-20 ${isVirtualEnvRowClassName}`}
            >
                <Checkbox
                    isChecked={isPartialChecked}
                    onChange={handleCheckboxChange(null)}
                    value={isAllChecked ? 'CHECKED' : 'INTERMEDIATE'}
                    rootClassName="mb-0 ml-2"
                />
                {!isVirtualEnv && <ICActivity className="icon-dim-16" />}
                {Object.keys(EnvironmentOverviewTableHeaderFixedKeys).map((key) => (
                    <Fragment key={key}>{renderHeaderValue(key)}</Fragment>
                ))}
            </div>
            <div
                className={`environment-overview-table__variable-cell px-16 py-8 cn-7 fw-6 fs-12 lh-20 ${isLastDeployedExpandedRowClassName}`}
            >
                {Object.keys(EnvironmentOverviewTableHeaderVariableKeys).map((key) => (
                    <Fragment key={key}>{renderHeaderValue(key)}</Fragment>
                ))}
            </div>
        </div>
    )

    const renderRow = ({
        environment,
        isChecked,
        deployedAtLink,
        redirectLink,
        onCommitClick,
        onLastDeployedImageClick,
        popUpMenuItems = [],
    }: EnvironmentOverviewTableProps['rows'][0]) => {
        const { id, name, status, commits, deployedAt, deployedBy, deploymentStatus, lastDeployedImage } = environment

        return (
            <div className={`environment-overview-table__row ${isChecked ? isCheckedRowClassName : ''}`}>
                <div
                    className={`environment-overview-table__fixed-cell pl-16 pr-7 py-8 cn-9 fs-13 lh-20 dc__visible-hover dc__visible-hover--parent ${isVirtualEnvRowClassName} ${isChecked ? isCheckedRowClassName : 'bg__primary'}`}
                >
                    {!isPartialChecked && <DevtronIcon className="icon-dim-24 dc__visible-hover--hide-child" />}
                    <Checkbox
                        isChecked={isChecked}
                        onChange={handleCheckboxChange(id)}
                        value="CHECKED"
                        rootClassName={`mb-0 ml-2 ${!isPartialChecked ? 'dc__visible-hover--child' : ''}`}
                    />
                    {!isVirtualEnv && (
                        <AppStatus
                            appStatus={deployedAt ? status : StatusConstants.NOT_DEPLOYED.noSpaceLower}
                            hideStatusMessage
                        />
                    )}
                    <div className="flexbox dc__align-items-center dc__content-space dc__gap-8">
                        <Tooltip content={name}>
                            <Link className="py-2 dc__truncate dc__no-decor" to={redirectLink}>
                                {name}
                            </Link>
                        </Tooltip>
                        {!!popUpMenuItems?.length && renderPopUpMenu(popUpMenuItems)}
                    </div>
                </div>
                <div
                    className={`environment-overview-table__variable-cell px-16 py-8 cn-9 fs-13 lh-20 ${isLastDeployedExpandedRowClassName}`}
                >
                    <AppStatus
                        appStatus={deployedAt ? deploymentStatus : StatusConstants.NOT_DEPLOYED.noSpaceLower}
                        isDeploymentStatus
                        isVirtualEnv={isVirtualEnv}
                    />
                    {lastDeployedImage && (
                        <ImageChipCell
                            imagePath={lastDeployedImage}
                            isExpanded={isLastDeployedExpanded}
                            registryType={RegistryType.DOCKER}
                            handleClick={onLastDeployedImageClick}
                        />
                    )}
                    <CommitChipCell handleClick={onCommitClick} commits={commits} />
                    {deployedBy && (
                        <>
                            {deployedAt ? (
                                <Link className="dc__no-decor" to={deployedAtLink}>
                                    {processDeployedTime(deployedAt, true)}
                                </Link>
                            ) : (
                                <span />
                            )}
                            <div className="flexbox dc__align-items-center dc__gap-8">
                                <span
                                    className="icon-dim-20 mw-20 flex dc__border-radius-50-per dc__uppercase cn-0 fw-4"
                                    style={{
                                        backgroundColor: getRandomColor(deployedBy),
                                    }}
                                >
                                    {deployedBy[0]}
                                </span>
                                <Tooltip content={deployedBy}>
                                    <span className="dc__truncate">{deployedBy}</span>
                                </Tooltip>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="environment-overview-table dc__border br-4 bg__primary w-100">
            {renderHeaderRow()}
            {sortedRows.map((row) => (
                <Fragment key={row.environment.id}>{renderRow(row)}</Fragment>
            ))}
        </div>
    )
}
