import React, { useEffect, useState } from 'react'
import { useHistory, useParams, useRouteMatch } from 'react-router-dom'
import { Progressing } from '@devtron-labs/devtron-fe-common-lib'
import { useAsync } from '../../../common'
import EnvironmentOverride from '../../../EnvironmentOverride/EnvironmentOverride'
import { getConfigAppList } from '../../AppGroup.service'
import { AppGroupDetailDefaultType, ConfigAppList } from '../../AppGroup.types'
import ApplicationRoute from './ApplicationRoutes'

export default function EnvConfig({ filteredAppIds }: AppGroupDetailDefaultType) {
    const { envId, appId } = useParams<{ envId: string; appId: string }>()
    const { url } = useRouteMatch()
    const history = useHistory()
    const [environments, setEnvironments] = useState([])
    const [envAppList, setEnvAppList] = useState<ConfigAppList[]>([])
    const [loading, appList] = useAsync(() => getConfigAppList(+envId, filteredAppIds), [envId, filteredAppIds])

    useEffect(() => {
        if (appList?.result) {
            const appIdExist = appList.result.some((app) => app.id === +appId)
            appList.result.sort((a, b) => a.name.localeCompare(b.name))
            setEnvAppList(appList.result)
            if (!appId) {
                history.replace(`${url}/${appList.result[0].id}`)
            } else if (!appIdExist) {
                const oldUrlSubstring = `/edit/${appId}`
                const newUrlSubstring = `/edit/${appList.result[0].id}`
                history.push(`${url.replace(oldUrlSubstring, newUrlSubstring)}`)
            }
        }
    }, [appList])

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
                        <ApplicationRoute envListData={envData} key={`app-${envData.id}`} />
                    ))}
                </div>
            </div>
            <div className="env-compose__main">
                <EnvironmentOverride
                    appList={envAppList}
                    environments={environments}
                    setEnvironments={setEnvironments}
                />
            </div>
        </div>
    )
}
