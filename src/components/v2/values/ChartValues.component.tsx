import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getChartVersionDetails2 } from '../../charts/charts.service';
import { DetailsProgressing } from '../../common';
import IndexStore from '../appDetails/index.store';
import DeployChart from './DeployChart';
// TODO: appDetails from useSharedState

function ValuesComponent() {
    const [installedConfig, setInstalledConfig] = useState(null);
    const appDetails = IndexStore.getAppDetails();

    function mapById(arr) {
        if (!Array.isArray(arr)) {
            throw 'parameter is not an array';
        }
        return arr.reduce((agg, curr) => agg.set(curr.id || curr.Id, curr), new Map());
    }

    useEffect(() => {
        getChartVersionDetails2(appDetails.appStoreInstalledAppVersionId)
            .then((res) => {
                console.log('getChartVersionDetails2 result', res.result);
                setInstalledConfig(res.result);
            })
            .catch((err) => {
                console.log(err);
                if (Array.isArray(err.errors)) {
                    err.errors.map(({ userMessage }, idx) => toast.error(userMessage));
                }
            });
        // history.push(`${url}/update-chart`);
    }, []);

    return (
        <div>
            {!installedConfig ? (
                <DetailsProgressing loadingText="Please wait…" size={24} />
            ) : (
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
                    rawValues={installedConfig.valuesOverrideYaml}
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
            )}
        </div>
    );
}

export default ValuesComponent;
