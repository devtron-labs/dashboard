import React, { useEffect, useState } from 'react'
import { useHistory, useParams, useRouteMatch } from 'react-router-dom'
import { Progressing, useAsync } from '../../common'
import { ConfigAppList } from '../EnvironmentGroup.types'
import { getConfigAppList } from '../EnvironmentListService'
import AppOverrides from './AppOverrides'
import EnvApplication from './EnvApplication'

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
        return <Progressing />
    }

    return (
        <div className="env-compose">
            <div className="env-compose__nav flex column left top dc__position-rel dc__overflow-scroll">
                <EnvApplication appList={envAppList} />
            </div>
            <div className="env-compose__main">
                <AppOverrides appList={envAppList} environments={environments} setEnvironments={setEnvironments} />
            </div>
        </div>
    )
}
