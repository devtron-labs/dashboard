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

import React, { useEffect, useState } from 'react'
import { useHistory, useParams, useRouteMatch } from 'react-router-dom'
import { Progressing, noop, useAsync } from '@devtron-labs/devtron-fe-common-lib'
import { importComponentFromFELibrary } from '../../../common'
import EnvironmentOverride from '../../../EnvironmentOverride/EnvironmentOverride'
import { getConfigAppList } from '../../AppGroup.service'
import { AppGroupDetailDefaultType, ConfigAppList } from '../../AppGroup.types'
import ApplicationRoute from './ApplicationRoutes'

const getEnvConfigProtections = importComponentFromFELibrary('getEnvConfigProtections', null, 'function')

export default function EnvConfig({ filteredAppIds, envName }: AppGroupDetailDefaultType) {
    const { envId, appId } = useParams<{ envId: string; appId: string }>()
    const { url } = useRouteMatch()
    const history = useHistory()
    const [envAppList, setEnvAppList] = useState<ConfigAppList[]>([])
    const [loading, initDataResults] = useAsync(
        () =>
            Promise.allSettled([
                getConfigAppList(+envId, filteredAppIds),
                typeof getEnvConfigProtections === 'function'
                    ? getEnvConfigProtections(Number(envId))
                    : { result: null },
            ]),
        [envId, filteredAppIds],
    )

    useEffect(() => {
        if (initDataResults?.[0]?.['value']?.['result']?.length) {
            const configProtectionMap = initDataResults[1]?.['value']?.['result'] ?? {}
            let appIdExist = false
            const _appList = (initDataResults[0]?.['value']?.['result'] ?? []).map((appData) => {
                if (appData.id === +appId) {
                    appIdExist = true
                }
                return { ...appData, isProtected: configProtectionMap[appData.id] ?? false }
            })
            _appList.sort((a, b) => a.name.localeCompare(b.name))
            setEnvAppList(_appList)
            if (!appId) {
                history.replace(`${url}/${_appList[0].id}`)
            } else if (!appIdExist) {
                const oldUrlSubstring = `/edit/${appId}`
                const newUrlSubstring = `/edit/${_appList[0].id}`
                history.push(`${url.replace(oldUrlSubstring, newUrlSubstring)}`)
            }
        }
    }, [initDataResults])

    if (loading || !appId) {
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
                    <div
                        className="cn-6 pl-8 pr-8 pt-4 pb-4 fs-12 fw-6 w-100"
                        data-testid="application-group-configuration-heading"
                    >
                        APPLICATIONS
                    </div>
                    {envAppList.map((envData, key) => (
                        <ApplicationRoute envListData={envData} key={`app-${envData.id}`} />
                    ))}
                </div>
            </div>
            <div className="env-compose__main">
                <EnvironmentOverride
                    appList={envAppList}
                    environments={[]}
                    reloadEnvironments={noop}
                    envName={envName}
                    isAppGroup
                />
            </div>
        </div>
    )
}
