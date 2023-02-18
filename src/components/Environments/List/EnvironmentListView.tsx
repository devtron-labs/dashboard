import React, { useState, useEffect } from 'react'
import EnvEmptyStates from '../EnvEmptyStates'
import { ReactComponent as EnvIcon } from '../../../assets/icons/ic-app-group.svg'
import { NavLink, useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import { Pagination, Progressing, useAsync } from '../../common'
import { getEnvAppList } from '../EnvironmentListService'
import { EnvAppList, EnvironmentsListViewType } from '../EnvironmentGroup.types'
import { toast } from 'react-toastify'
import { GROUP_LIST_HEADER, NO_ACCESS_TOAST_MESSAGE } from '../Constants'

export default function EnvironmentsListView({ removeAllFilters }: EnvironmentsListViewType) {
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
        offset: params.get('offset'),
        size: params.get('pageSize'),
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
        const newOffset = (+pageSize) * (pageNo - 1)
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

    const handleClusterClick = (e, noApp): void => {
        if (noApp) {
            e.preventDefault()
            toast.info(NO_ACCESS_TOAST_MESSAGE)
        }
    }

    return filteredEnvList.length === 0 || loading ? (
        <div className="flex dc__border-top-n1" style={{ height: `calc(100vh - 120px)` }}>
            {loading ? (
                <Progressing />
            ) : (
                <EnvEmptyStates
                    title={emptyStateData.title}
                    subTitle={emptyStateData.subTitle}
                    actionHandler={removeAllFilters}
                />
            )}
        </div>
    ) : (
        <>
            <div className="dc__overflow-scroll">
                <div className="env-list-row fw-6 cn-7 fs-12 pt-8 pb-8 pr-20 pl-20 dc__uppercase bc-n50">
                    <div></div>
                    <div>{GROUP_LIST_HEADER.ENVIRONMENT}</div>
                    <div>{GROUP_LIST_HEADER.NAMESPACE}</div>
                    <div>{GROUP_LIST_HEADER.CLUSTER}</div>
                    <div>{GROUP_LIST_HEADER.APPLICATIONS}</div>
                </div>
                {filteredEnvList?.map((envData) => (
                    <div className="env-list-row fw-4 cn-9 fs-13 dc__border-bottom-n1 pt-12 pb-12 pr-20 pl-20 ">
                        <span className="icon-dim-24 bcb-1 flex br-6">
                            <EnvIcon className="icon-dim-16 scb-4" />
                        </span>
                        <div className="cb-5 dc__ellipsis-right">
                            <NavLink
                                to={`/environment/${envData.id}`}
                                onClick={(e) => handleClusterClick(e, !envData.appCount)}
                            >
                                {envData.environment_name}
                            </NavLink>
                        </div>
                        <div>{envData.namespace}</div>
                        <div>{envData.cluster_name}</div>
                        <div>{envData.appCount || 0} {GROUP_LIST_HEADER.APPLICATIONS}</div>
                    </div>
                ))}
            </div>
            {renderPagination()}
        </>
    )
}
