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

import { useEffect, useState } from 'react'

import { Progressing } from '@devtron-labs/devtron-fe-common-lib'

import { APP_TYPE } from '@Config/constants'

import AppOverview from '../../app/Overview/Overview'
import { getHelmAppOverviewInfo } from '../../app/service'
import { AppMetaInfo } from '../../app/types'

export const HelmAppOverview = (props: { appId: string; setErrorResponseCode: (code) => void }) => {
    const { appId, setErrorResponseCode } = props
    const [appOverviewInfo, setAppOverviewInfo] = useState<AppMetaInfo>()
    const [isLoading, setIsLoading] = useState<boolean>(true)

    // eslint-disable-next-line consistent-return
    const getInstalledAppOverview = async (): Promise<AppMetaInfo> => {
        try {
            const { result } = await getHelmAppOverviewInfo(appId)
            if (result) {
                setAppOverviewInfo(result)
                setIsLoading(false)
                return result
            }
        } catch (err: any) {
            if (err.code) {
                setErrorResponseCode(err)
            }
        }
    }

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        getInstalledAppOverview()
    }, [])

    return isLoading ? (
        <Progressing />
    ) : (
        <AppOverview
            appType={APP_TYPE.HELM_CHART}
            appMetaInfo={appOverviewInfo}
            getAppMetaInfoRes={getInstalledAppOverview}
        />
    )
}
