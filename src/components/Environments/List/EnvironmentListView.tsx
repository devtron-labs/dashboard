import React, { useState, useEffect } from 'react'
import EnvEmptyStates from '../EnvEmptyStates'
import { ReactComponent as EnvIcon } from '../../../assets/icons/ic-environment-list.svg'
import { NavLink, useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import { URLS } from '../../../config'
import { Pagination, Progressing, useAsync } from '../../common'
import { EnvAppListType, getEnvAppList } from '../EnvironmentListService'
import { EnvAppList } from '../EnvironmentGroup.types'
import { toast } from 'react-toastify'

export default function EnvironmentsListView({ clearSearch }) {
    const match = useRouteMatch()
    const location = useLocation()
    const history = useHistory()
    const [filteredEnvList, setFilteredEnvList] = useState<EnvAppList[]>([])
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

    useEffect(() => {
        setParamsData(paramObj)
    }, [location.search])

    useEffect(() => {
        if (appList?.result) {
            setFilteredEnvList(appList.result)
            setPaginationParamsChange({ pageSize: +params.get('pageSize') || 20, offset: +params.get('offset') })
        } else {
            setFilteredEnvList([])
        }
    }, [appList])

    const changePage = (pageNo: number): void => {
        const newOffset = +params.get('pageSize') * (pageNo - 1)
        params.set('offset', newOffset.toString())
        history.push(`${match.url}?${params.toString()}`)
    }

    const changePageSize = (size: number) => {
        params.set('pageSize', size.toString())
        params.set('offset', '0')
        history.push(`${match.url}?${params.toString()}`)
    }

    const renderPagination = () => {
        if (filteredEnvList.length > 1) {
            return (
                <Pagination
                    size={filteredEnvList.length}
                    pageSize={paginationParamsChange.pageSize}
                    offset={paginationParamsChange.offset}
                    changePage={changePage}
                    changePageSize={changePageSize}
                />
            )
        }
    }

    const handleClusterClick = (e,noApp): void => {
        if(noApp){
            e.preventDefault()
            toast.info('You don’t have access to any application in this app group')
        }
    }

    return filteredEnvList.length === 0 || loading ? (
        <div className="flex" style={{ height: `calc(100vh - 160px)` }}>
            {loading ? <Progressing /> : <EnvEmptyStates actionHandler={clearSearch} />}
        </div>
    ) : (
        <>
            <div className="dc__overflow-scroll">
                <div className="env-list-row fw-6 cn-7 fs-12 pt-8 pb-8 pr-20 pl-20 dc__uppercase bc-n50">
                    <div></div>
                    <div>Environments</div>
                    <div>Namespace</div>
                    <div>Cluster</div>
                    <div>Applications</div>
                </div>
                {filteredEnvList?.map((envData) => (
                    <div className="env-list-row fw-4 cn-9 fs-13 dc__border-bottom-n1 pt-12 pb-12 pr-20 pl-20 ">
                        <EnvIcon className="icon-dim-20" />
                        <div className="cb-5 dc__ellipsis-right">
                            <NavLink to={`/environment/${envData.id}`} onClick={(e) => handleClusterClick(e,!envData.appCount)}>{envData.environment_name}</NavLink>
                        </div>
                        <div>{envData.namespace}</div>
                        <div>{envData.cluster_name}</div>
                        <div>{envData.appCount || 0} running</div>
                    </div>
                ))}
            </div>
            {renderPagination()}
        </>
    )
}
