import React, { useEffect, useState } from 'react'
import { useHistory, useParams, useRouteMatch } from 'react-router-dom'
import { Progressing, useAsync } from '../../common'
import { ConfigAppList } from '../EnvironmentGroup.types'
import { getConfigAppList } from '../EnvironmentListService'
import ApplicationRoute from './ApplicationRoutes'
import AppOverrides from './AppOverrides'

export default function EnvConfig() {
    const params = useParams<{ envId: string; appId: string }>()
    const { url } = useRouteMatch()
    const history = useHistory()
    const [environments, setEnvironments] = useState([])
    const [envAppList, setEnvAppList] = useState<ConfigAppList[]>([])
    const [loading, appList] = useAsync(() => getConfigAppList(+params.envId), [params.envId])

    useEffect(() => {
        if (appList?.result) {
            const envAppList = appList.result.sort((a, b) => a.name.localeCompare(b.name))
            setEnvAppList(envAppList)
            if (!params.appId) {
                history.push(`${url}/${envAppList[0].id}`)
            }
        }
    }, [appList])

    if (loading) {
        return (
            <div className="loading-state">
                <Progressing />
            </div>
        )
    }

    return (
        <div className="env-compose">
            <div className="env-compose__nav flex column left top dc__position-rel dc__overflow-scroll">
                <div className="pt-4 pb-4 w-100">
                    <div className="cn-6 pl-8 pr-8  fs-12 fw-6 w-100">APPLICATION</div>
                    {envAppList.map((envData) => (
                        <ApplicationRoute envListData={envData} />
                    ))}
                </div>
            </div>
            <div className="env-compose__main">
                <AppOverrides appList={envAppList} environments={environments} setEnvironments={setEnvironments} />
            </div>
        </div>
    )
}
