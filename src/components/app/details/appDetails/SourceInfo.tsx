import React from 'react'
import moment from 'moment';
import { Link } from 'react-router-dom';
import { URLS, getAppCDURL } from '../../../../config';
import { EnvSelector } from './AppDetails'
import { ReactComponent as ScaleDown } from '../../../../assets/icons/ic-scale-down.svg';
import { ReactComponent as CommitIcon } from '../../../../assets/icons/ic-code-commit.svg';
import { useParams } from 'react-router'
import { Nodes } from '../../types';

export function SourceInfo({ appDetails, isAppDeployment = false, toggleAppStatusModal = null, toggleDeploymentStatusModal = null, environments, showCommitInfo = null, showHibernateModal = null }) {
    const status = appDetails?.lastDeploymentStatus || ""
    const params = useParams<{ appId: string; envId?: string }>()
    const conditions = appDetails?.resourceTree?.conditions;
    let message = null;
    let Rollout = appDetails?.resourceTree?.nodes?.filter(({ kind }) => kind === Nodes.Rollout)
    if (
        ['progressing', 'degraded'].includes(status?.toLowerCase()) &&
        Array.isArray(conditions) &&
        conditions.length > 0 &&
        conditions[0].message
    ) {
        message = conditions[0].message;
    } else if (Array.isArray(Rollout) && Rollout.length > 0 && Rollout[0].health && Rollout[0].health.message) {
        message = Rollout[0].health.message;
    }

    return <div className="mb-16">
        <div className="flex left w-100 pl-24 pr-24 mb-16">
            <EnvSelector environments={environments} disabled={params.envId && !showCommitInfo} />
            <div style={{ marginLeft: 'auto' }} className="flex right">
                {appDetails?.appStoreChartId && (
                    <>
                        <span className="mr-8 fs-12 cn-7">Chart:</span>
                        <Link className="cb-5 fw-6"
                            to={`${URLS.CHARTS}/discover/chart/${appDetails.appStoreChartId}`}>
                            {appDetails.appStoreChartName}/{appDetails.appStoreAppName}(
                                {appDetails.appStoreAppVersion})
                        </Link>
                    </>
                )}
                {showCommitInfo && (
                    <button className="cta cta-with-img small cancel fs-12 fw-6 mr-6"
                        onClick={(e) => showCommitInfo(true)}>
                        <CommitIcon className="icon-dim-16 mr-6" />
                        commit info
                    </button>
                )}
                {showHibernateModal && (
                    <button className="cta cta-with-img small cancel fs-12 fw-6"
                        onClick={(e) =>
                            showHibernateModal(status.toLowerCase() === 'hibernating' ? 'resume' : 'hibernate')
                        }>
                        <ScaleDown className={`icon-dim-16 mr-6 rotate`}
                            style={{
                                ['--rotateBy' as any]: status.toLowerCase() === 'hibernating' ? '180deg' : '0deg',
                            }} />
                        {status.toLowerCase() === 'hibernating' ? 'Restore pod count' : 'Scale pods to 0'}
                    </button>
                )}
            </div>
        </div>
        <div className="w-100 pl-24 pr-24" style={{ display: "grid", gridTemplateColumns: '1fr 1fr', gap: "16px" }}>
            {isAppDeployment && (
                <div className="flex left top column bcn-0 pt-16 pb-16 pl-20 pr-20 br-8 en-1 bw-1" >
                    <div className="cn-9 fw-6">Deployment Status</div>
                    {appDetails?.deploymentStatus && (
                        <div style={{ maxWidth: '50%' }} onClick={(e) => toggleDeploymentStatusModal(true)} className="flex left">
                            <div className="flex left column" style={{ maxWidth: '100%' }}>
                                <div className="pointer">
                                    <span className={`app-summary__status-name text-uppercase fs-14 mr-8 fw-6 f-${status.toLowerCase()}`}>
                                        {status}
                                    </span>
                                    <span className={`fa fa-angle-right fw-6 fs-14 app-summary__status-name text-uppercase f-${status.toLowerCase()}`}></span>
                                </div>
                                {appDetails?.lastDeployedBy && appDetails?.lastDeployedTime && (
                                    <div style={{ marginLeft: 'auto' }} className="flex wrap left fs-12 cn-9">
                                        <span>Deployed</span>
                                        <div className="fw-6 ml-4 mr-4">
                                            {appDetails?.lastDeployedTime
                                                ? moment(appDetails.lastDeployedTime, 'YYYY-MM-DDTHH:mm:ssZ').fromNow()
                                                : ''}
                                        </div>
                                        <span className="mr-4">by</span>
                                        <span className="fw-6 mr-8">{appDetails?.lastDeployedBy}</span>
                                        {showCommitInfo && (
                                            <Link className=" pointer fs-12 fw-6 cb-5" to={getAppCDURL(params.appId, params.envId)}>
                                                Details
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
            {isAppDeployment && (
                <div className="flex left top column bcn-0 pt-16 pb-16 pl-20 pr-20 br-8 en-1 bw-1" >
                    <div className="cn-9 fw-6">Application Status</div>
                    {appDetails?.resourceTree && (
                        <div style={{ maxWidth: '50%' }} onClick={(e) => toggleAppStatusModal(true)} className="flex left">
                            <div className="flex left column" style={{ maxWidth: '100%' }}>
                                <div className="pointer">
                                    <span className={`app-summary__status-name text-uppercase fs-14 mr-8 fw-6 f-${status.toLowerCase()}`}>
                                        {status}
                                    </span>
                                    <span className={`fa fa-angle-right fw-6 fs-14 app-summary__status-name text-uppercase f-${status.toLowerCase()}`}></span>
                                </div>
                                {message && <span className="ellipsis-right w-100">{message}</span>}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
}
