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

import {
    AppStatus,
    GenericEmptyState,
    getRandomColor,
    handleRelativeDateSorting,
    processDeployedTime,
    SortableTableHeaderCell,
    SortingOrder,
    useAsync,
    useUrlFilters,
    CommitChipCell,
    ArtifactInfoModal,
    ArtifactInfoModalProps,
    ImageChipCell,
    RegistryType,
    AppEnvironment,
    StatusType,
} from '@devtron-labs/devtron-fe-common-lib'
import { Link, useHistory } from 'react-router-dom'
import { ReactComponent as ActivityIcon } from '../../../assets/icons/ic-activity.svg'
import { ReactComponent as IconForward } from '../../../assets/icons/ic-arrow-forward.svg'
import { ReactComponent as ArrowLineDown } from '@Icons/ic-arrow-line-down.svg'
import { ReactComponent as Database } from '../../../assets/icons/ic-env.svg'
import { ReactComponent as VirtualEnvIcon } from '../../../assets/icons/ic-environment-temp.svg'
import { ModuleNameMap, URLS } from '../../../config'
import { EMPTY_STATE_STATUS } from '../../../config/constantMessaging'
import { getAppOtherEnvironment } from '@Services/service'
import { getModuleInfo } from '../../v2/devtronStackManager/DevtronStackManager.service'
import { ModuleStatus } from '../../v2/devtronStackManager/DevtronStackManager.type'
import { AppMetaInfo, AppOverviewProps } from '../types'
import { EnvironmentListSortableKeys, loadingEnvironmentList } from './constants'
import { renderCIListHeader } from '../details/cdDetails/utils'

const {
    OVERVIEW: { DEPLOYMENT_TITLE, DEPLOYMENT_SUB_TITLE },
} = EMPTY_STATE_STATUS

export const EnvironmentList = ({
    appId,
    filteredEnvIds,
}: {
    appId: AppMetaInfo['appId']
    filteredEnvIds?: AppOverviewProps['filteredEnvIds']
}) => {
    const history = useHistory()
    const [isLastDeployedExpanded, setIsLastDeployedExpanded] = useState<boolean>(false)
    const lastDeployedClassName = isLastDeployedExpanded ? 'last-deployed-expanded' : ''
    const [otherEnvsLoading, otherEnvsResult] = useAsync(
        () => Promise.all([getAppOtherEnvironment(appId), getModuleInfo(ModuleNameMap.ARGO_CD)]),
        [appId],
    )
    const isArgoInstalled: boolean = otherEnvsResult?.[1]?.result?.status === ModuleStatus.INSTALLED
    const [commitInfoModalConfig, setCommitInfoModalConfig] = useState<Pick<
        ArtifactInfoModalProps,
        'ciArtifactId' | 'envId'
    > | null>(null)
    const { sortBy, sortOrder, handleSorting } = useUrlFilters({
        initialSortKey: EnvironmentListSortableKeys.environmentName,
    })

    const envList = useMemo(() => {
        if (otherEnvsResult?.[0]?.result?.length > 0) {
            const filteredEnvMap = filteredEnvIds?.split(',').reduce((agg, curr) => agg.set(+curr, true), new Map())

            return (
                otherEnvsResult[0].result
                    .filter((env) => !filteredEnvMap || filteredEnvMap.get(env.environmentId))
                    ?.sort((a, b) => {
                        if (sortBy === EnvironmentListSortableKeys.deployedAt) {
                            return handleRelativeDateSorting(a.lastDeployed, b.lastDeployed, sortOrder)
                        }

                        return sortOrder === SortingOrder.ASC
                            ? a.environmentName.localeCompare(b.environmentName)
                            : b.environmentName.localeCompare(a.environmentName)
                    }) || []
            )
        }
        return otherEnvsLoading ? loadingEnvironmentList : []
    }, [filteredEnvIds, otherEnvsResult, sortBy, sortOrder])

    const toggleIsLastDeployedExpanded = () => {
        setIsLastDeployedExpanded(!isLastDeployedExpanded)
    }

    const envIcon = (isVirtualCluster) =>
        isVirtualCluster ? <VirtualEnvIcon className="fcb-5 icon-dim-20" /> : <Database className="icon-dim-20" />

    const renderEmptyStateButton = () => (
        <button
            className="flex cta dc__gap-4"
            onClick={() => {
                history.push(`${URLS.APP}/${appId}/${URLS.APP_CONFIG}`)
            }}
        >
            Continue App Configuration <IconForward className="icon-dim-12" />
        </button>
    )

    const getDeploymentHistoryLink = (environment: AppEnvironment) =>
        `${URLS.APP}/${appId}/${URLS.APP_CD_DETAILS}/${environment.environmentId}/${environment.pipelineId}/${
            environment.latestCdWorkflowRunnerId ?? ''
        }`

    const closeCommitInfoModal = () => {
        setCommitInfoModalConfig(null)
    }

    const sortByEnvironment = () => {
        handleSorting(EnvironmentListSortableKeys.environmentName)
    }

    const sortByDeployedAt = () => {
        handleSorting(EnvironmentListSortableKeys.deployedAt)
    }

    return (
        <div className="flex column left">
            {envList.length > 0 ? (
                <div
                    className={`env-deployments-info-wrapper ${
                        isArgoInstalled ? 'env-deployments-info-wrapper--argo-installed' : ''
                    } w-100`}
                >
                    <div
                        className={`env-deployments-info-header display-grid dc__align-items-center dc__border-bottom dc__uppercase fs-12 fw-6 cn-7 pr-16 pl-16 ${lastDeployedClassName}`}
                    >
                        <span />
                        {isArgoInstalled && <ActivityIcon className="icon-dim-16" />}
                        <SortableTableHeaderCell
                            title="Environment"
                            triggerSorting={sortByEnvironment}
                            isSorted={sortBy === EnvironmentListSortableKeys.environmentName}
                            sortOrder={sortOrder}
                            disabled={otherEnvsLoading}
                        />
                        <span className={`flex left dc__gap-4 ${lastDeployedClassName}`}>
                            Last deployed
                            <button
                                type="button"
                                className="dc__outline-none-imp p-0 dc__transparent flex"
                                onClick={toggleIsLastDeployedExpanded}
                            >
                                <ArrowLineDown
                                    className="icon-dim-14 scn-7 rotate"
                                    style={{ ['--rotateBy' as any]: isLastDeployedExpanded ? '90deg' : '-90deg' }}
                                />
                            </button>
                        </span>
                        <span>Commit</span>
                        <SortableTableHeaderCell
                            title="Deployed At"
                            triggerSorting={sortByDeployedAt}
                            isSorted={sortBy === EnvironmentListSortableKeys.deployedAt}
                            sortOrder={sortOrder}
                            disabled={otherEnvsLoading}
                        />
                    </div>

                    <div className="env-deployments-info-body show-shimmer-loading">
                        {envList.map((_env) => {
                            const openCommitInfoModal = (e) => {
                                e.stopPropagation()
                                setCommitInfoModalConfig({
                                    envId: _env.environmentId,
                                    ciArtifactId: _env.ciArtifactId,
                                })
                            }

                            return (
                                !_env.deploymentAppDeleteRequest && (
                                    <div
                                        key={`${_env.environmentName}-${_env.environmentId}`}
                                        className={`env-deployments-info-row ${lastDeployedClassName}`}
                                    >
                                        {otherEnvsLoading ? (
                                            <>
                                                <div className="child child-shimmer-loading" />
                                                <div className="child child-shimmer-loading" />
                                                <div className="child child-shimmer-loading" />
                                                <div className="child child-shimmer-loading" />
                                                <div className="child child-shimmer-loading" />
                                            </>
                                        ) : (
                                            <>
                                                {envIcon(_env.isVirtualEnvironment)}
                                                {isArgoInstalled && (
                                                    <AppStatus
                                                        status={
                                                            _env.lastDeployed ? _env.appStatus : StatusType.NOT_DEPLOYED
                                                        }
                                                        isVirtualEnv={_env.isVirtualEnvironment}
                                                        hideMessage
                                                    />
                                                )}
                                                <Link
                                                    to={`${URLS.APP}/${appId}/details/${_env.environmentId}/`}
                                                    className="anchor fs-13 dc__ellipsis-right"
                                                >
                                                    {_env.environmentName}
                                                </Link>
                                                {_env.lastDeployedImage ? (
                                                    <ImageChipCell
                                                        handleClick={openCommitInfoModal}
                                                        imagePath={_env.lastDeployedImage}
                                                        isExpanded={isLastDeployedExpanded}
                                                        registryType={RegistryType.DOCKER}
                                                    />
                                                ) : (
                                                    <AppStatus status={StatusType.NOT_DEPLOYED} />
                                                )}
                                                <CommitChipCell
                                                    handleClick={openCommitInfoModal}
                                                    commits={_env.commits}
                                                />
                                                {_env.lastDeployed && (
                                                    <span className="fs-13 fw-4 cn-9 dc__ellipsis-right dc__word-break flex left dc__gap-6">
                                                        <span className="flex left dc__gap-8">
                                                            <span
                                                                className="icon-dim-20 mw-20 flex dc__border-radius-50-per dc__uppercase cn-0 fw-4"
                                                                style={{
                                                                    backgroundColor: getRandomColor(
                                                                        _env.lastDeployedBy,
                                                                    ),
                                                                }}
                                                            >
                                                                {_env.lastDeployedBy[0]}
                                                            </span>
                                                            <span>{_env.lastDeployedBy}</span>
                                                        </span>
                                                        <Link
                                                            to={getDeploymentHistoryLink(_env)}
                                                            className="anchor cursor"
                                                        >
                                                            {processDeployedTime(_env.lastDeployed, isArgoInstalled)}
                                                        </Link>
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )
                            )
                        })}
                    </div>
                </div>
            ) : (
                <div className="w-100 mh-500 bg__primary flex en-2 bw-1 br-4">
                    <GenericEmptyState
                        layout="row"
                        title={DEPLOYMENT_TITLE}
                        subTitle={DEPLOYMENT_SUB_TITLE}
                        isButtonAvailable
                        renderButton={renderEmptyStateButton}
                        contentClassName="empty-state-content"
                    />
                </div>
            )}
            {commitInfoModalConfig && (
                <ArtifactInfoModal
                    ciArtifactId={commitInfoModalConfig.ciArtifactId}
                    envId={commitInfoModalConfig.envId}
                    handleClose={closeCommitInfoModal}
                    renderCIListHeader={renderCIListHeader}
                />
            )}
        </div>
    )
}
