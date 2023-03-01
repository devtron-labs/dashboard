import React, { useEffect, useState } from 'react'
import { useHistory, useParams, useRouteMatch } from 'react-router-dom'
import { Progressing, useAsync } from '../../../common'
import EnvironmentOverride from '../../../EnvironmentOverride/EnvironmentOverride'
import { getConfigAppList } from '../../AppGroup.service'
import { AppGroupDetailDefaultType, ConfigAppList } from '../../AppGroup.types'
import ApplicationRoute from './ApplicationRoutes'
import AppOverrides from './AppOverrides'

export default function EnvConfig({ filteredApps }: AppGroupDetailDefaultType) {
    const { envId, appId } = useParams<{ envId: string; appId: string }>()
    const { url } = useRouteMatch()
    const history = useHistory()
    const [environments, setEnvironments] = useState([])
    const [envAppList, setEnvAppList] = useState<ConfigAppList[]>([])
    const [loading, appList] = useAsync(() => getConfigAppList(+envId), [envId])

    useEffect(() => {
        if (appList?.result && filteredApps.length) {
            const _filteredAppMap = new Map<number, string>()
            filteredApps.forEach((app) => {
                _filteredAppMap.set(+app.value, app.label)
            })
            const _envAppList = appList.result
                .filter((app) => _filteredAppMap.get(app.id))
                .sort((a, b) => a.name.localeCompare(b.name))
            setEnvAppList(_envAppList)
            if (!appId) {
                history.push(`${url}/${_envAppList[0].id}`)
            } else if (!_filteredAppMap.get(+appId)) {
                history.push(`${url.replace(`edit/${appId}`, `edit/${_envAppList[0].id}`)}`)
            }
        }
    }, [appList, filteredApps])

    if (loading) {
        return (
            <div className="loading-state">
                <Progressing pageLoader />
            </div>
        )
    }

    return (
        <div className="env-compose">
            <div className="env-compose__nav flex column left top dc__position-rel dc__overflow-scroll">
                <div className="pt-4 pb-4 w-100">
                    <div className="cn-6 pl-8 pr-8 pt-4 pb-4 fs-12 fw-6 w-100">APPLICATIONS</div>
                    {envAppList.map((envData, key) => (
                        <ApplicationRoute envListData={envData} key={key} />
                    ))}
                </div>
            </div>
            <div className="env-compose__main">
                {/* <AppOverrides appList={envAppList} environments={environments} setEnvironments={setEnvironments} /> */}
                <EnvironmentOverride
                    appList={envAppList}
                    environments={environments}
                    setEnvironments={setEnvironments}
                />
            </div>
        </div>
    )
}
