import React, { useState } from 'react';
import { Progressing, useBreadcrumb, BreadCrumb, OpaqueModal } from '../../common';
import { ReactComponent as Settings } from '../../../assets/icons/ic-settings.svg';
import { getInstalledAppDetail, getChartVersionDetails2, getInstalledCharts } from '../charts.service';
import { Details } from '../../app/details/appDetails/AppDetails';
import { toast } from 'react-toastify';
import { useParams, useHistory, useLocation, useRouteMatch, Route, generatePath } from 'react-router'
import DeployChart from '../modal/DeployChart';
import { URLS } from '../../../config';
import './deploymentDetail.scss'
import AppSelector from '../../AppSelector';
import { UpdateWarn } from '../../common/DeprecatedUpdateWarn';
import { Command, CommandErrorBoundary } from '../../command';

function mapById(arr) {
    if (!Array.isArray(arr)) {
        throw 'parameter is not an array'
    }
    return arr.reduce((agg, curr) => agg.set(curr.id || curr.Id, curr), new Map())
}

export default function AppDetail() {
    const location = useLocation();
    const history = useHistory();
    const match = useRouteMatch();
    const params = useParams<{ appId: string; envId: string }>();
    const { url, path } = match;
    const [loading, setLoading] = useState<boolean>(false)
    const [installedConfig, setInstalledConfig] = useState(null)
    const [appDetails, setAppDetails] = useState(null)
    const [isPollingRequired, setPollingRequired] = useState<boolean>(true);
    const [isCommandBarActive, toggleCommandBar] = useState(false);
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
        setPollingRequired(true);
    }

    function handleBreadcrumbChartChange(selected) {
        const newUrl = generatePath(path, { appId: selected.installedAppId, envId: selected.environmentId });
        history.push(newUrl)
    }

    async function fetchChartVersionDetails(event) {
        try {
            setLoading(true);
            const { result } = await getChartVersionDetails2(appDetails.appStoreInstalledAppVersionId);
            setInstalledConfig(result);
            setPollingRequired(false);
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
                <div className="page-header page-header__rows-only p-0">
                    <div className="page-header__top flexbox flex-align-items-center flex-justify pl-24 pr-24">
                        <div className="flex left fs-12 cn-7">
                            <BreadCrumb breadcrumbs={breadcrumbs.slice(0, breadcrumbs.length - 2)} />
                        </div>
                        <div className="cursor flexbox flex-align-items-center flex-justify bcn-1 bw-1 en-2 pl-12 pr-12 br-4 fs-13 cn-5 command-open"
                            onClick={() => { toggleCommandBar(true); }}>
                            <span>Jump to...</span>
                            <span className="command-delimiter">/</span>
                        </div>
                    </div>
                    <div className="flexbox flex-align-items-center flex-justify pl-24 pr-24">
                        <h1 className="flex left fw-6 fs-16 m-0">{appDetails?.appName}</h1>
                        <div className="flex">
                            {appDetails?.deprecated && <div className="mr-20"><UpdateWarn /></div>}
                            <button type="button" className="cta cancel flex left" style={{ height: "30px" }} onClick={fetchChartVersionDetails}>
                                {loading ? <Progressing /> : <Settings className="icon-dim-20 mr-5" />}Configure
                            </button>
                        </div>
                    </div>
                    <CommandErrorBoundary toggleCommandBar={toggleCommandBar}>
                        <Command location={location}
                            match={match}
                            history={history}
                            isCommandBarActive={isCommandBarActive}
                            toggleCommandBar={toggleCommandBar}
                        />
                    </CommandErrorBoundary>
                </div>
                <div className="deployment-page__body">
                    {/* <div className="flex left w-100 p-16">
                    <EnvSelector
                        environments={[{ environmentId: params.envId, environmentName: appDetails?.environmentName }]}
                    />
                </div> */}
                    <Details key={params.appId}
                        appDetailsAPI={getInstalledAppDetail}
                        setAppDetailResultInParent={setAppDetails}
                        isPollingRequired={isPollingRequired}
                        environments={[{ environmentId: params.envId, environmentName: appDetails?.environmentName }]}
                    />
                </div>
            </div>
            <Route
                path={`${path}/update-chart`}
                render={(props) => {
                    return (
                        <OpaqueModal onHide={closeModal}>
                            {installedConfig && installedConfig.valuesOverrideYaml ? (
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