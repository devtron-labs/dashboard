import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { DetailsProgressing } from '@devtron-labs/devtron-fe-common-lib'
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
                        err.errors.map(({ userMessage }, idx) => toast.error(userMessage))
                    }
                })
        }
    }, [appDetails.appStoreInstalledAppVersionId])

    return (
        <div>
            {!installedConfig ? (
                <DetailsProgressing loadingText="Please wait…" size={24} />
            ) : (
                <ChartValuesView
                    appId={appId}
                    installedConfigFromParent={installedConfig}
                    appDetails={appDetails}
                    init={init}
                />
            )}
        </div>
    )
}

export default ValuesComponent
