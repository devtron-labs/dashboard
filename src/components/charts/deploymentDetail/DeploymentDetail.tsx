import React, { useState } from 'react';
import { Progressing, useBreadcrumb, BreadCrumb, OpaqueModal } from '../../common';
import { ReactComponent as Settings } from '../../../assets/icons/ic-settings.svg';
import { getInstalledAppDetail, getChartVersionDetails2, getInstalledCharts } from '../charts.service';
import { Details, EnvSelector } from '../../app/details/appDetails/AppDetails';
import { toast } from 'react-toastify';
import { useParams, useHistory, useRouteMatch, Route, generatePath} from 'react-router'
import DeployChart from '../modal/DeployChart';
import yamlJsParser from 'yamljs';
import { URLS } from '../../../config';
import './deploymentDetail.scss'
import AppSelector from '../../AppSelector';
import { UpdateWarn } from '../../common/deprecatedUpdateWarn';

function mapById(arr) {
    if (!Array.isArray(arr)) {
        throw 'parameter is not an array'
    }
    return arr.reduce((agg, curr) => agg.set(curr.id || curr.Id, curr), new Map())
}

export default function AppDetail() {
    const params = useParams<{ appId: string; envId: string }>();
    const { url, path } = useRouteMatch();
    const [loading, setLoading] = useState<boolean>(false)
    const history = useHistory()
    const [installedConfig, setInstalledConfig] = useState(null)
    const [appDetails, setAppDetails] = useState(null)
    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                ':appId(\\d+)': {
                    component: (
                        <AppSelector
                            api={getInstalledCharts}
                            primaryKey="appId"
                            primaryValue="appName"
                            matchedKeys={['envId']}
                            apiPrimaryKey="installedAppId"
                            onChange={handleBreadcrumbChartChange}
                        />
                    ),
                    linked: false,
                },
                'chart-store': null,
                deployments: 'Deployed',
            },
        },
        [params.appId, params.envId],
    );

    const closeModal = (isReload) => {
        const url = `${URLS.CHARTS}/deployments/${params.appId}/env/${params.envId}`;
        history.push(url);
    }

    function handleBreadcrumbChartChange(selected){
        const newUrl = generatePath(path, { appId: selected.installedAppId, envId: selected.environmentId });
        history.push(newUrl)
    }

    async function fetchChartVersionDetails(event) {
        try {
            setLoading(true);
            const { result } = await getChartVersionDetails2(appDetails.appStoreInstalledAppVersionId);
            setInstalledConfig(result);
            history.push(`${url}/update-chart`);
        } catch (err) {
            if (Array.isArray(err.errors)) {
                err.errors.map(({ userMessage }, idx) => toast.error(userMessage));
            }
        } finally {
            setLoading(false);
        }
    }
    return (
        <>
        <div className="deployment-page">
            <div className="page-header" style={{ height: '80px' }}>
                <div className="flex left column">
                    <div className="flex left fs-12 cn-7">
                        <BreadCrumb breadcrumbs={breadcrumbs.slice(0, breadcrumbs.length - 2)} />
                    </div>
                    <div className="flex left page-header__title">{appDetails?.appName}</div>
                </div>
                <div className="page-header__cta-container flex">
                    {
                        appDetails?.deprecated &&
                        <div style={{margin: "0 20px 0 0"}}>
                            <UpdateWarn/>
                        </div>
                    }
                    
                    <button type="button" className="cta-with-img cancel" onClick={fetchChartVersionDetails}>
                        {loading ? <Progressing /> : <Settings className="icon-dim-20 mr-5" />}
                        configure
                    </button>
                </div>
            </div>
            <div className="deployment-page__body">
                {/* <div className="flex left w-100 p-16">
                    <EnvSelector
                        environments={[{ environmentId: params.envId, environmentName: appDetails?.environmentName }]}
                    />
                </div> */}
                <Details key={params.appId} appDetailsAPI={getInstalledAppDetail} setAppDetails={setAppDetails}
                    environments={[{ environmentId: params.envId, environmentName: appDetails?.environmentName }]}/>
            </div>
        </div>
        <Route
            path={`${path}/update-chart`}
            render={(props) => {
                return (
                    <OpaqueModal onHide={closeModal}>
                        {installedConfig && installedConfig.valuesOverride ? (
                            <DeployChart
                                versions={mapById([
                                    {
                                        id: installedConfig.appStoreVersion,
                                        version: appDetails.appStoreAppVersion,
                                    },
                                ])}
                                {...installedConfig}
                                valuesYaml={JSON.stringify(installedConfig.valuesOverride)}
                                rawValues={
                                    installedConfig.valuesOverrideYaml ||
                                    yamlJsParser.stringify(installedConfig.valuesOverride, 50, 2)
                                }
                                appName={installedConfig.appName}
                                installedAppVersion={installedConfig.id}
                                chartValuesFromParent={{
                                    id: appDetails.appStoreInstalledAppVersionId,
                                    kind: 'DEPLOYED',
                                }}
                                chartIdFromDeploymentDetail={appDetails.appStoreChartId}
                                chartName={appDetails.appStoreChartName}
                                name={appDetails.appStoreAppName}
                                onHide={closeModal}
                            />
                        ) : (
                            <Progressing pageLoader />
                        )}
                    </OpaqueModal>
                );
            }}
        />
        </>
    );
}