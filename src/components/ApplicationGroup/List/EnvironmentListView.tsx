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

import { useState, useEffect } from 'react'
import {
    useAsync,
    DEFAULT_BASE_PAGE_SIZE,
    Pagination,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'
import { NavLink } from 'react-router-dom'
import { EnvEmptyStates } from '../EnvEmptyStates'
import { ReactComponent as EnvIcon } from '../../../assets/icons/ic-app-group.svg'
import { useAppContext } from '../../common'
import { EMPTY_LIST_MESSAGING, GROUP_LIST_HEADER, NO_ACCESS_TOAST_MESSAGE } from '../Constants'
import { getEnvAppList } from '../AppGroup.service'
import { EnvironmentsListViewType, EnvAppList, EnvironmentLinkProps, EnvApp } from '../AppGroup.types'
import { LoadingShimmerList } from './LoadingShimmer/LoadingShimmerList'

const EnvironmentLink = ({
    namespace,
    environmentId,
    appCount,
    handleClusterClick,
    environmentName,
}: EnvironmentLinkProps) => {
    const { setCurrentEnvironmentName } = useAppContext()

    const handleOnLinkRedirection = (e: any): void => {
        setCurrentEnvironmentName(environmentName)
        handleClusterClick(e)
    }

    return (
        <NavLink
            data-testid={`${namespace}-click-on-env`}
            to={`/application-group/${environmentId}`}
            data-noapp={!appCount}
            onClick={handleOnLinkRedirection}
        >
            {environmentName}
        </NavLink>
    )
}

const EnvironmentsListView = ({
    isSuperAdmin,
    filterConfig,
    clearFilters,
    changePage,
    changePageSize,
}: EnvironmentsListViewType) => {
    const [filteredEnvList, setFilteredEnvList] = useState<EnvAppList[]>([])
    const [envCount, setEnvCount] = useState<number>(0)
    const { cluster } = filterConfig
    const [appListLoading, appListResponse] = useAsync(() => getEnvAppList(filterConfig), [filterConfig])
    const emptyStateData = cluster.join()
        ? { title: 'No app groups found', subTitle: "We couldn't find any matching app groups." }
        : { title: '', subTitle: '' }

    useEffect(() => {
        const appListResult: EnvApp = appListResponse?.result || { envCount: 0, envList: [] }
        setFilteredEnvList(appListResult.envList)
        setEnvCount(appListResult.envCount)
    }, [appListResponse?.result])

    const renderPagination = () => {
        if (envCount >= DEFAULT_BASE_PAGE_SIZE) {
            return (
                <Pagination
                    rootClassName="flex dc__content-space px-20"
                    size={envCount}
                    pageSize={filterConfig.pageSize}
                    offset={filterConfig.offset}
                    changePage={changePage}
                    changePageSize={changePageSize}
                />
            )
        }
        return null
    }

    const handleClusterClick = (e: any): void => {
        if (e.currentTarget.dataset.noapp === 'true') {
            e.preventDefault()
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
        }
    }

    const renderEmptyView = () => (
        <div className="flex dc__gap-12 dc__border-top-n1" style={{ height: `calc(100vh - 120px)` }}>
            <EnvEmptyStates
                title={emptyStateData.title}
                subTitle={emptyStateData.subTitle}
                actionHandler={clearFilters}
            />
        </div>
    )

    const renderApplicationCount = (envData) => (
        <div>
            {envData.appCount || 0}&nbsp;
            {envData.appCount === 0 || envData.appCount === 1
                ? GROUP_LIST_HEADER.APPLICATION
                : GROUP_LIST_HEADER.APPLICATIONS}
        </div>
    )
    const renderAppGroupListContent = () =>
        !filteredEnvList.length ? (
            <div className="flexbox-col dc__gap-12">
                <LoadingShimmerList shimmerRowClassName="pl-20 env-list-row" />
            </div>
        ) : (
            <div className="dc__overflow-scroll">
                {filteredEnvList?.map((envData) => (
                    <div
                        key={envData.id}
                        className="env-list-row fw-4 cn-9 fs-13 dc__border-bottom-n1 pt-12 pb-12 pr-20 pl-20"
                        data-testid="env-list-row"
                    >
                        <span className="icon-dim-24 bcb-1 flex br-6">
                            <EnvIcon className="icon-dim-16 scb-4" />
                        </span>
                        <div className="cb-5 dc__ellipsis-right">
                            <EnvironmentLink
                                namespace={envData.namespace}
                                environmentId={envData.id}
                                appCount={envData.appCount}
                                handleClusterClick={handleClusterClick}
                                environmentName={envData.environment_name}
                            />
                        </div>
                        <div className="dc__truncate-text" data-testid={`${envData.namespace}-namespace`}>
                            {envData.namespace}
                        </div>
                        <div data-testid={`${envData.cluster_name}-cluster`} className="dc__truncate-text">
                            {envData.cluster_name}
                        </div>
                        {renderApplicationCount(envData)}
                    </div>
                ))}
            </div>
        )

    return filteredEnvList.length === 0 && !appListLoading ? (
        renderEmptyView()
    ) : (
        <>
            <div data-testid="app-group-container">
                <div className="env-list-row fw-6 cn-7 fs-12 py-8 px-20 dc__uppercase dc__position-sticky dc__top-48 bcn-0">
                    <div />
                    <div>{GROUP_LIST_HEADER.ENVIRONMENT}</div>
                    <div>{GROUP_LIST_HEADER.NAMESPACE}</div>
                    <div>{GROUP_LIST_HEADER.CLUSTER}</div>
                    <div>{GROUP_LIST_HEADER.APPLICATIONS}</div>
                </div>
                {renderAppGroupListContent()}
            </div>
            {renderPagination()}
        </>
    )
}

export default EnvironmentsListView
