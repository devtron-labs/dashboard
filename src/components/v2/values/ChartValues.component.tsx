import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { getChartVersionDetails2 } from '../../charts/charts.service'
import { DetailsProgressing } from '../../common'
import IndexStore from '../appDetails/index.store'
import ChartValuesView from './chartValuesDiff/ChartValuesView'
// TODO: appDetails from useSharedState

function ValuesComponent({ appId }: { appId: string }) {
    const [installedConfig, setInstalledConfig] = useState(null)
    const appDetails = IndexStore.getAppDetails()

    useEffect(() => {
        getChartVersionDetails2(appDetails.appStoreInstalledAppVersionId)
            .then((res) => {
                setInstalledConfig(res.result)
            })
            .catch((err) => {
                console.log(err)
                if (Array.isArray(err.errors)) {
                    err.errors.map(({ userMessage }, idx) => toast.error(userMessage))
                }
            })
        // history.push(`${url}/update-chart`);
    }, [])

    return (
        <div>
            {!installedConfig ? (
                <DetailsProgressing loadingText="Please wait…" size={24} />
            ) : (
                <ChartValuesView appId={appId} installedConfigFromParent={installedConfig} appDetails={appDetails} />
            )}
        </div>
    )
}

export default ValuesComponent
