import React, { useState, useEffect } from 'react'
import {useLocation, useHistory} from 'react-router';
import { sortOptionsByValue,  } from '../../../common';
import { showError, Progressing, ErrorScreenManager, ServerErrors } from '@devtron-labs/devtron-fe-common-lib'
import {
    getAppDetail,
    HelmAppDetailResponse,
    HelmAppDetailAndInstalledAppInfo,
} from '../../../external-apps/ExternalAppService'
import IndexStore from '../index.store';
import { AppDetails, AppType } from "../appDetails.type";
import AppDetailsComponent from '../AppDetails.component';
import moment from 'moment'
import { checkIfToRefetchData, deleteRefetchDataFromUrl } from '../../../util/URLUtil';
import { getExternalLinks, getMonitoringTools } from '../../../externalLinks/ExternalLinks.service';
import { ExternalLinkIdentifierType, ExternalLinksAndToolsType } from '../../../externalLinks/ExternalLinks.type';
import { sortByUpdatedOn } from '../../../externalLinks/ExternalLinks.utils';

function ExternalAppDetail({appId, appName, isExternalApp}) {
    const location = useLocation();
    const history = useHistory();
    const [isLoading, setIsLoading] = useState(true);
    const [errorResponseCode, setErrorResponseCode] = useState(undefined);
    const [externalLinksAndTools, setExternalLinksAndTools] = useState<ExternalLinksAndToolsType>({
        externalLinks: [],
        monitoringTools: [],
    })

    let initTimer = null;
    let isAPICallInProgress = false;

    // component load
    useEffect(() => {
        _init();
        return (): void => {
            if (initTimer) {
                clearTimeout(initTimer);
            }
        };
    }, []);

    useEffect(() => {
        if(checkIfToRefetchData(location)){
            setTimeout(() => {
                _getAndSetAppDetail();
                deleteRefetchDataFromUrl(history, location);
            } , 2000);
        }
    }, [location.search]);

    const _init = () => {
        if(!isAPICallInProgress){
            _getAndSetAppDetail();
        }
        initTimer = setTimeout(() => {
            _init();
        }, window._env_.EA_APP_DETAILS_POLLING_INTERVAL ||30000);
    }

    const _convertToGenericAppDetailModel = (helmAppDetailAndInstalledAppInfo : HelmAppDetailAndInstalledAppInfo) : AppDetails =>  {
        let helmAppDetail = helmAppDetailAndInstalledAppInfo.appDetail;
        let installedAppInfo = helmAppDetailAndInstalledAppInfo.installedAppInfo;
        let genericAppDetail : AppDetails = {
            appType : AppType.EXTERNAL_HELM_CHART,
            appId : appId,
            appName : appName,
            environmentName: helmAppDetail.environmentDetails.clusterName + "__" + helmAppDetail.environmentDetails.namespace,
            namespace: helmAppDetail.environmentDetails.namespace,
            lastDeployedTime : moment(new Date(helmAppDetail.lastDeployed.seconds * 1000), 'YYYY-MM-DDTHH:mm:ssZ').format('YYYY-MM-DDTHH:mm:ssZ'),
            resourceTree :  {
                ... helmAppDetail.resourceTreeResponse,
                status : helmAppDetail.applicationStatus
            },
            appStoreAppName : helmAppDetail.chartMetadata.chartName,
            appStoreAppVersion : helmAppDetail.chartMetadata.chartVersion,
            additionalData : helmAppDetail.releaseStatus,
            clusterId: helmAppDetail.environmentDetails.clusterId,
            notes: helmAppDetail.chartMetadata.notes,
        }

        if (installedAppInfo) {
            genericAppDetail.appStoreChartId = installedAppInfo.appStoreChartId;
            genericAppDetail.environmentName = installedAppInfo.environmentName;
            genericAppDetail.environmentId = installedAppInfo.environmentId;
        }

        return genericAppDetail
    }

    const _getAndSetAppDetail = async () => {
        isAPICallInProgress = true;
        getAppDetail(appId)
            .then((appDetailResponse: HelmAppDetailResponse) => {
                IndexStore.publishAppDetails(_convertToGenericAppDetailModel(appDetailResponse.result), AppType.EXTERNAL_HELM_CHART);

                if (appDetailResponse.result?.appDetail.environmentDetails.clusterId) {
                    Promise.all([
                        getMonitoringTools(),
                        getExternalLinks(
                            appDetailResponse.result.appDetail.environmentDetails.clusterId,
                            appName,
                            ExternalLinkIdentifierType.ExternalHelmApp,
                        ),
                    ])
                        .then(([monitoringToolsRes, externalLinksRes]) => {
                            setExternalLinksAndTools({
                                externalLinks: externalLinksRes.result?.sort(sortByUpdatedOn) || [],
                                monitoringTools:
                                    monitoringToolsRes.result
                                        ?.map((tool) => ({
                                            label: tool.name,
                                            value: tool.id,
                                            icon: tool.icon,
                                        }))
                                        .sort(sortOptionsByValue) || [],
                            })
                            setIsLoading(false)
                            isAPICallInProgress = false
                        })
                        .catch((e) => {
                            setExternalLinksAndTools(externalLinksAndTools)
                            setIsLoading(false)
                            isAPICallInProgress = false
                        })
                } else {
                    setIsLoading(false)
                    isAPICallInProgress = false
                }

                setErrorResponseCode(undefined);
            })
            .catch((errors: ServerErrors) => {
                showError(errors);
                setErrorResponseCode(errors.code);
                setIsLoading(false);
                isAPICallInProgress = false;
            });
    }

    return (
        <>
            { isLoading &&
                <div className="dc__loading-wrapper">
                    <Progressing pageLoader />
                </div>
            }

            { !isLoading && errorResponseCode &&
                <div className="dc__loading-wrapper">
                    <ErrorScreenManager code={errorResponseCode} />
                </div>
            }

            { !isLoading && !errorResponseCode &&
                 <AppDetailsComponent
                    externalLinks={externalLinksAndTools.externalLinks}
                    monitoringTools={externalLinksAndTools.monitoringTools}
                    isExternalApp={isExternalApp}
                />
            }

        </>

    )
};

export default ExternalAppDetail
