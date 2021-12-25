import React, { useState } from 'react';
import AppStatusDetailModal from './AppStatusDetailModal';
import './environmentStatus.scss';
import { ReactComponent as Question } from '../../../assets/icons/ic-question.svg';
import { ReactComponent as Alert } from '../../../assets/icons/ic-alert-triangle.svg';
import ConfigStatusModalComponent from './ConfigStatusModal.component';
import IndexStore from '../../index.store';
import moment from 'moment';
import { URLS } from '../../../../../config';
import { Link } from 'react-router-dom';

function EnvironmentStatusComponent() {
    const appDetails = IndexStore.getAppDetails();
    const [showAppStatusDetail, setShowAppStatusDetail] = useState(false);
    const [showConfigStatusModal, setShowConfigStatusModal] = useState(false);
    const status = appDetails.resourceTree?.status || '';

    return (
        <div>
            <div className="flex left ml-20">
                {status && <div className="app-status-card bcn-0 mr-12 br-8 p-16">
                    <div className="lh-1-33 cn-9 flex left">
                        <span>Application status</span>
                        <Question className="icon-dim-16 ml-4" />
                    </div>

                    <div className={`f-${status.toLowerCase()} text-capitalize fw-6 fs-14 flex left`}>
                        <span>{status}</span>
                        <figure className={`${status.toLowerCase()} app-summary__icon ml-8 icon-dim-20`}></figure>
                    </div>
                    <div onClick={() => setShowAppStatusDetail(true)}>
                        <span className="cursor cb-5">Details</span>
                    </div>
                </div>}

                {appDetails?.lastDeployedTime && (
                    <div className="app-status-card bcn-0 br-8 pt-16 pl-16 pb-16 pr-16 mr-12">
                        <div className="cn-9 lh-1-33 flex left">
                            <span>Last updated</span>
                            <Question className="icon-dim-16 ml-4" />
                        </div>
                        <div className=" fw-6 fs-14 text-capitalize">
                            {moment(appDetails?.lastDeployedTime, 'YYYY-MM-DDTHH:mm:ssZ').fromNow()}
                        </div>
                        {appDetails?.lastDeployedBy && appDetails?.lastDeployedBy}
                    </div>
                )}

                {appDetails?.appStoreChartName && (
                    <div className="app-status-card bcn-0 br-8 pt-16 pl-16 pb-16 pr-16 mr-12">
                        <div className="cn-9 lh-1-33 flex left">
                            <span>Chart used</span>
                            <Question className="icon-dim-16 ml-4" />
                        </div>
                        <div className=" fw-6 fs-14">
                            {appDetails.appStoreChartName}/{appDetails.appStoreAppName}({appDetails.appStoreAppVersion})
                        </div>
                        <div>
                            <Link
                                className="cb-5 fw-6"
                                to={`${URLS.CHARTS}/discover/chart/${appDetails.appStoreChartId}`}
                            >
                                View Chart
                            </Link>
                        </div>
                    </div>
                )}

                {appDetails?.deprecated && (
                    <div className="app-status-card er-2 bw-1 bcr-1 br-8 pt-16 pl-16 pb-16 pr-16 mr-12">
                        <div className="cn-9 lh-1-33 flex left">
                            <span>Chart deprecated</span>
                            <Alert className="icon-dim-16 ml-4" />
                        </div>
                        <div className=" fw-6 fs-14">Upgrade required</div>
                        <a href={URLS.APP_VALUES} className="cb-5 fw-6">
                            Upgrade chart
                        </a>
                    </div>
                )}
            </div>

            {showAppStatusDetail && (
                <AppStatusDetailModal
                    close={() => {
                        setShowAppStatusDetail(false);
                    }}
                />
            )}
        </div>
    );
}

export default EnvironmentStatusComponent;
