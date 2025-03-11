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
import { DetailsProgressing, ToastManager, ToastVariantType } from '@devtron-labs/devtron-fe-common-lib'
import { getChartVersionDetailsV2 } from '../../charts/charts.service'
import IndexStore from '../appDetails/index.store'
import ChartValuesView from './chartValuesDiff/ChartValuesView'
// TODO: appDetails from useSharedState

export interface ValueComponentTypes {
    appId: string
    init: () => void
}

const ValuesComponent = ({ appId, init }: ValueComponentTypes) => {
    const [installedConfig, setInstalledConfig] = useState(null)
    const appDetails = IndexStore.getAppDetails()

    useEffect(() => {
        if (appDetails.appStoreInstalledAppVersionId) {
            getChartVersionDetailsV2(appDetails.appStoreInstalledAppVersionId)
                .then((res) => {
                    setInstalledConfig(res.result)
                })
                .catch((err) => {
                    if (Array.isArray(err.errors)) {
                        err.errors.map(({ userMessage }) =>
                            ToastManager.showToast({
                                variant: ToastVariantType.error,
                                description: userMessage,
                            }),
                        )
                    }
                })
        }
    }, [appDetails.appStoreInstalledAppVersionId])

    return !installedConfig ? (
        <DetailsProgressing fullHeight loadingText="Please wait…" size={24} />
    ) : (
        <ChartValuesView
            appId={appId}
            installedConfigFromParent={installedConfig}
            appDetails={appDetails}
            init={init}
        />
    )
}

export default ValuesComponent
