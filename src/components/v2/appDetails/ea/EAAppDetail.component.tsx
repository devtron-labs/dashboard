import React, { useState, useEffect, useRef } from 'react'
import { showError, Progressing, ErrorScreenManager,  } from '../../../common';
import { getAppDetail, HelmAppDetailResponse, HelmAppDetail } from '../../../external-apps/ExternalAppService';
import { ServerErrors } from '../../../../modals/commonTypes';
import IndexStore from '../index.store';
import { AppDetails, AppType } from "../appDetails.type";
import AppDetailsComponent from '../AppDetails.component';
import moment from 'moment'
import '../../lib/bootstrap-grid.min.css';

function ExternalAppDetail({appId, appName}) {
    const [isLoading, setIsLoading] = useState(true);
    const [errorResponseCode, setErrorResponseCode] = useState(undefined);

    // component load
    useEffect(() => {
        getAppDetail(appId)
            .then((appDetailResponse: HelmAppDetailResponse) => {
                IndexStore.publishAppDetails(_convertToGenericAppDetailModel(appDetailResponse.result));
                setIsLoading(false);
            })
            .catch((errors: ServerErrors) => {
                showError(errors);
                setErrorResponseCode(errors.code);
                setIsLoading(false);
            });
    }, []);


    const _convertToGenericAppDetailModel = (helmAppDetail : HelmAppDetail) : AppDetails =>  {
        let genericAppDetail : AppDetails = {
            appType : AppType.EXTERNAL_HELM_CHART,
            appId : appId,
            appName : appName,
            environmentName: helmAppDetail.environmentDetails.clusterName + "/" + helmAppDetail.environmentDetails.namespace,
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
        }
        return genericAppDetail
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
                <AppDetailsComponent />
            }

        </>

    )
};

export default ExternalAppDetail
