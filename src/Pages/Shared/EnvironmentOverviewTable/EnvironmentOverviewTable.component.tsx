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

import { ChangeEvent, Fragment, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import {
    AppStatus,
    Checkbox,
    CommitChipCell,
    DeploymentStatus,
    getRandomColor,
    handleRelativeDateSorting,
    ImageChipCell,
    processDeployedTime,
    RegistryType,
    SortableTableHeaderCell,
    StatusType,
    stringComparatorBySortOrder,
    Tooltip,
    useUrlFilters,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICActivity } from '@Icons/ic-activity.svg'
import { ReactComponent as ICArrowLineDown } from '@Icons/ic-arrow-line-down.svg'
import { ReactComponent as DevtronIcon } from '@Icons/ic-devtron-app.svg'

import {
    EnvironmentOverviewTableHeaderFixedKeys,
    EnvironmentOverviewTableHeaderValues,
    EnvironmentOverviewTableHeaderVariableKeys,
    EnvironmentOverviewTableSortableKeys,
} from './EnvironmentOverview.constants'
import { EnvironmentOverviewPopupMenu } from './EnvironmentOverviewPopupMenu'
import { EnvironmentOverviewTableProps, EnvironmentOverviewTableRowData } from './EnvironmentOverviewTable.types'

import './EnvironmentOverviewTable.scss'

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
                    return handleRelativeDateSorting(a.app.deployedAt, b.app.deployedAt, sortOrder)
                }

                return stringComparatorBySortOrder(a.app.name, b.app.name, sortOrder)
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
        app,
        isChecked,
        deployedAtLink,
        redirectLink,
        onCommitClick,
        onLastDeployedImageClick,
        popUpMenuItems = [],
    }: EnvironmentOverviewTableProps['rows'][0]) => {
        const { id, name, status, commits, deployedAt, deployedBy, deploymentStatus, lastDeployedImage } = app

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
                    {!isVirtualEnv && <AppStatus status={deployedAt ? status : StatusType.NOT_DEPLOYED} hideMessage />}
                    <div className="flexbox dc__align-items-center dc__content-space dc__gap-8">
                        <Tooltip content={name}>
                            <Link className="py-2 dc__truncate dc__no-decor" to={redirectLink}>
                                {name}
                            </Link>
                        </Tooltip>
                        {!!popUpMenuItems?.length && <EnvironmentOverviewPopupMenu popUpMenuItems={popUpMenuItems} />}
                    </div>
                </div>
                <div
                    className={`environment-overview-table__variable-cell px-16 py-8 cn-9 fs-13 lh-20 ${isLastDeployedExpandedRowClassName}`}
                >
                    <DeploymentStatus
                        status={deployedAt ? deploymentStatus : StatusType.NOT_DEPLOYED}
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
                <Fragment key={row.app.id}>{renderRow(row)}</Fragment>
            ))}
        </div>
    )
}
