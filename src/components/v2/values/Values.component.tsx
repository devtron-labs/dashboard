import React, { useRef, useState, useEffect } from 'react'
import DeployChart from '../../charts/modal/DeployChart'
import { toast } from 'react-toastify';
import { useParams, useHistory, useRouteMatch, Route, generatePath } from 'react-router'
import { getInstalledAppDetail, getChartVersionDetails2, getInstalledCharts } from '../../charts/charts.service';
import IndexStore from '../appDetails/index.store';
// TODO: appDetails from useSharedState

function ValuesComponent() {
    const [installedConfig, setInstalledConfig] = useState(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [isPollingRequired, setPollingRequired] = useState<boolean>(true);
    const history = useHistory()
    const { url, path } = useRouteMatch();
    const appDetails = IndexStore.getAppDetails()

    function mapById(arr) {
        if (!Array.isArray(arr)) {
            throw 'parameter is not an array'
        }
        return arr.reduce((agg, curr) => agg.set(curr.id || curr.Id, curr), new Map())
    }

    useEffect(() => {
        getChartVersionDetails2(appDetails.appStoreInstalledAppVersionId).then((result) => {
            setInstalledConfig(result);
            setPollingRequired(false);
            setLoading(false);
        }).catch((err) => {
            console.log(err)
            if (Array.isArray(err.errors)) {
                err.errors.map(({ userMessage }, idx) => toast.error(userMessage));
            }
        })

        // history.push(`${url}/update-chart`);

    }, [])

    return (
        <div>
            {!loading &&
                <DeployChart
                    versions={mapById([
                        {
                            id: installedConfig.appStoreVersion,
                            version: appDetails.appStoreAppVersion,
                        },
                    ])}
                    // {...installedConfig}
                    installedAppId={installedConfig.installedAppId}
                    appStoreVersion={installedConfig.appStoreVersion}
                    appName={installedConfig.appName}
                    environmentId={installedConfig.environmentId}
                    teamId={installedConfig.teamId}
                    readme={installedConfig.readme}
                    deprecated={installedConfig.deprecated}
                    appStoreId={installedConfig.appStoreId}
                    installedAppVersionId={installedConfig.id}
                    valuesYaml={JSON.stringify(installedConfig.valuesOverrideYaml)}
                    rawValues={
                        installedConfig.valuesOverrideYaml
                    }
                    installedAppVersion={installedConfig.id}
                    chartIdFromDeploymentDetail={appDetails.appStoreChartId}
                    chartValuesFromParent={{
                        id: appDetails.appStoreInstalledAppVersionId,
                        kind: 'DEPLOYED',
                    }}
                    chartName={appDetails.appStoreChartName}
                    name={appDetails.appStoreAppName}
                    onHide={''}
                />
            }
        </div>

    )
}

export default ValuesComponent
