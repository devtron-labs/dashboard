import React, { useState, useEffect, useRef } from 'react'
import {useLocation, useHistory} from 'react-router';
import { showError, Progressing, ErrorScreenManager, sortOptionsByValue,  } from '../../../common';
import { getAppDetail, HelmAppDetailResponse, HelmAppDetail, HelmAppDetailAndInstalledAppInfo } from '../../../external-apps/ExternalAppService';
import { ServerErrors } from '../../../../modals/commonTypes';
import IndexStore from '../index.store';
import { AppDetails, AppType } from "../appDetails.type";
import AppDetailsComponent from '../AppDetails.component';
import moment from 'moment'
import * as queryString from 'query-string';
import '../../lib/bootstrap-grid.min.css';
import { checkIfToRefetchData, deleteRefetchDataFromUrl } from '../../../util/URLUtil';
import { getExternalLinks, getMonitoringTools } from '../../../externalLinks/ExternalLinks.service';
import { ExternalLink, OptionTypeWithIcon } from '../../../externalLinks/ExternalLinks.type';

function ExternalAppDetail({appId, appName}) {
    const location = useLocation();
    const history = useHistory();
    const [isLoading, setIsLoading] = useState(true);
    const [errorResponseCode, setErrorResponseCode] = useState(undefined);
    const [externalLinksAndTools, setExternalLinksAndTools] = useState<
        Record<string, ExternalLink[] | OptionTypeWithIcon[]>
    >({
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
        }, 30000);
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

        if(installedAppInfo){
            genericAppDetail.appStoreChartId = installedAppInfo.appStoreChartId;
            genericAppDetail.environmentName = installedAppInfo.environmentName;
        }

        return genericAppDetail
    }

    const _getAndSetAppDetail = async () => {
        isAPICallInProgress = true;
        getAppDetail(appId)
            .then((appDetailResponse: HelmAppDetailResponse) => {
                IndexStore.publishAppDetails(_convertToGenericAppDetailModel(appDetailResponse.result));

                Promise.all([getMonitoringTools(), getExternalLinks(appDetailResponse.result.appDetail.environmentDetails.clusterId)])
                .then(([monitoringToolsRes, externalLinksRes]) => {
                    setExternalLinksAndTools({
                        externalLinks:  externalLinksRes.result || [],
                        monitoringTools:
                            monitoringToolsRes.result
                                ?.map((tool) => ({
                                    label: tool.name,
                                    value: tool.id,
                                    icon: tool.icon,
                                }))
                                .sort(sortOptionsByValue) || [],
                    })
                    setIsLoading(false);
                    isAPICallInProgress = false;
                })
                .catch((e) => {
                    setExternalLinksAndTools(externalLinksAndTools)
                    setIsLoading(false);
                    isAPICallInProgress = false;
                })

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
                <div className="loading-wrapper">
                    <Progressing pageLoader />
                </div>
            }

            { !isLoading && errorResponseCode &&
                <div className="loading-wrapper">
                    <ErrorScreenManager code={errorResponseCode} />
                </div>
            }

            { !isLoading && !errorResponseCode &&
                 <AppDetailsComponent
                    externalLinks={externalLinksAndTools.externalLinks as ExternalLink[]}
                    monitoringTools={externalLinksAndTools.monitoringTools as OptionTypeWithIcon[]}
                />
            }

        </>

    )
};

export default ExternalAppDetail
