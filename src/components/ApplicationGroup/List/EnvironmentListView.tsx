import React, { useState, useEffect } from 'react'
import { Progressing, toastAccessDenied } from '@devtron-labs/devtron-fe-common-lib'
import EnvEmptyStates from '../EnvEmptyStates'
import { ReactComponent as EnvIcon } from '../../../assets/icons/ic-app-group.svg'
import { NavLink, useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import { Pagination, useAsync } from '../../common'
import { toast } from 'react-toastify'
import { EMPTY_LIST_MESSAGING, GROUP_LIST_HEADER, NO_ACCESS_TOAST_MESSAGE } from '../Constants'
import { getEnvAppList } from '../AppGroup.service'
import { EnvironmentsListViewType, EnvAppList } from '../AppGroup.types'

export default function EnvironmentsListView({ isSuperAdmin, removeAllFilters }: EnvironmentsListViewType) {
    const match = useRouteMatch()
    const location = useLocation()
    const history = useHistory()
    const [filteredEnvList, setFilteredEnvList] = useState<EnvAppList[]>([])
    const [envCount, setEnvCount] = useState<number>()
    const [paginationParamsChange, setPaginationParamsChange] = useState({ pageSize: 20, offset: 0 })
    const params = new URLSearchParams(location.search)
    const paramObj = {
        envName: params.get('search'),
        clusterIds: params.get('cluster'),
        offset: params.get('offset') || '0',
        size: params.get('pageSize') || '20',
    }
    const [paramsData, setParamsData] = useState(paramObj)
    const [loading, appList] = useAsync(() => getEnvAppList(paramsData), [paramsData])
    const emptyStateData = paramObj.clusterIds
        ? { title: 'No app groups found', subTitle: "We couldn't find any matching app groups." }
        : { title: '', subTitle: '' }

    useEffect(() => {
        setParamsData(paramObj)
    }, [location.search])

    useEffect(() => {
        if (appList?.result?.envList) {
            setFilteredEnvList(appList.result.envList)
            setEnvCount(appList.result.envCount)
            setPaginationParamsChange({ pageSize: +params.get('pageSize') || 20, offset: +params.get('offset') })
        } else {
            setFilteredEnvList([])
        }
    }, [appList?.result])

    const changePage = (pageNo: number): void => {
        const pageSize = params.get('pageSize') || '20'
        const newOffset = +pageSize * (pageNo - 1)
        params.set('pageSize', pageSize)
        params.set('offset', newOffset.toString())
        history.push(`${match.url}?${params.toString()}`)
    }

    const changePageSize = (size: number): void => {
        params.set('pageSize', size.toString())
        params.set('offset', '0')
        history.push(`${match.url}?${params.toString()}`)
    }

    const renderPagination = () => {
        if (envCount >= 20) {
            return (
                <Pagination
                    size={envCount}
                    pageSize={paginationParamsChange.pageSize}
                    offset={paginationParamsChange.offset}
                    changePage={changePage}
                    changePageSize={changePageSize}
                />
            )
        }
    }

    const handleClusterClick = (e: any): void => {
        if (e.currentTarget.dataset.noapp === 'true') {
            e.preventDefault()
            if (isSuperAdmin) {
                toast.info(NO_ACCESS_TOAST_MESSAGE.SUPER_ADMIN)
            } else {
                toastAccessDenied(EMPTY_LIST_MESSAGING.UNAUTHORIZE_TEXT ,NO_ACCESS_TOAST_MESSAGE.NON_ADMIN)
            }
        }
    }

    const renderEmptyLoader = () => {
        if (loading) {
            return <Progressing pageLoader />
        }
        return (
            <EnvEmptyStates
                title={emptyStateData.title}
                subTitle={emptyStateData.subTitle}
                actionHandler={removeAllFilters}
            />
        )
    }

    const renderApplicationCount = (envData) => {
        return (
            <div>
                {envData.appCount || 0}&nbsp;
                {envData.appCount == 0 || envData.appCount == 1
                    ? GROUP_LIST_HEADER.APPLICATION
                    : GROUP_LIST_HEADER.APPLICATIONS}
            </div>
        )
    }

    return filteredEnvList.length === 0 || loading ? (
        <div className="flex dc__border-top-n1" style={{ height: `calc(100vh - 120px)` }}>
            {renderEmptyLoader()}
        </div>
    ) : (
        <>
            <div className="dc__overflow-scroll" data-testid="app-group-container">
                <div className="env-list-row fw-6 cn-7 fs-12 pt-8 pb-8 pr-20 pl-20 dc__uppercase bc-n50">
                    <div></div>
                    <div>{GROUP_LIST_HEADER.ENVIRONMENT}</div>
                    <div>{GROUP_LIST_HEADER.NAMESPACE}</div>
                    <div>{GROUP_LIST_HEADER.CLUSTER}</div>
                    <div>{GROUP_LIST_HEADER.APPLICATIONS}</div>
                </div>
                {filteredEnvList?.map((envData) => (
                    <div
                        key={envData.id}
                        className="env-list-row fw-4 cn-9 fs-13 dc__border-bottom-n1 pt-12 pb-12 pr-20 pl-20 "
                        data-testid="env-list-row"
                    >
                        <span className="icon-dim-24 bcb-1 flex br-6">
                            <EnvIcon className="icon-dim-16 scb-4" />
                        </span>
                        <div className="cb-5 dc__ellipsis-right">
                            <NavLink
                                data-testid="click-on-env"
                                to={`/application-group/${envData.id}`}
                                data-noapp={!envData.appCount}
                                onClick={handleClusterClick}
                            >
                                {envData.environment_name}
                            </NavLink>
                        </div>
                        <div className="dc__truncate-text" data-testid={`${envData.namespace}-namespace`}>
                            {envData.namespace}
                        </div>
                        <div data-testid={`${envData.cluster_name}-cluster`}>{envData.cluster_name}</div>
                        {renderApplicationCount(envData)}
                    </div>
                ))}
            </div>
            {renderPagination()}
        </>
    )
}
