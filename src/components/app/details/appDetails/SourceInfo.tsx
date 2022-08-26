//@ts-nocheck

import React from 'react'
import moment from 'moment'
import { Link } from 'react-router-dom'
import { URLS, getAppCDURL } from '../../../../config'
import { EnvSelector } from './AppDetails'
import { ReactComponent as ScaleDown } from '../../../../assets/icons/ic-scale-down.svg'
import { ReactComponent as CommitIcon } from '../../../../assets/icons/ic-code-commit.svg'
import { ReactComponent as Question } from '../../../../assets/icons/ic-help-outline.svg'
import { ReactComponent as Timer } from '../../../../assets/icons/ic-timer.svg'
import { ReactComponent as CD } from '../../../../assets/icons/ic-CD.svg'
import { useParams } from 'react-router'
import { Nodes } from '../../types'
import Tippy from '@tippyjs/react'

export function SourceInfo({
    appDetails,
    setDetailed = null,
    environments,
    showCommitInfo = null,
    showHibernateModal = null,
    toggleDeploymentDetailedStatus = null,
    deploymentStatus = null,
    deploymentStatusText = null,
    deploymentTriggerTime = null,
}) {
    const status = appDetails?.resourceTree?.status || ''
    const params = useParams<{ appId: string; envId?: string }>()
    const conditions = appDetails?.resourceTree?.conditions
    let message = null
    let Rollout = appDetails?.resourceTree?.nodes?.filter(({ kind }) => kind === Nodes.Rollout)
    if (
        ['progressing', 'degraded'].includes(status?.toLowerCase()) &&
        Array.isArray(conditions) &&
        conditions.length > 0 &&
        conditions[0].message
    ) {
        message = conditions[0].message
    } else if (Array.isArray(Rollout) && Rollout.length > 0 && Rollout[0].health && Rollout[0].health.message) {
        message = Rollout[0].health.message
    }
    message = message + message + message
    const showApplicationDetailedModal = (): void => {
        setDetailed && setDetailed(true)
    }
    const showDeploymentDetailedStatus = (): void => {
        toggleDeploymentDetailedStatus && toggleDeploymentDetailedStatus(true)
    }
    return (
        <div className="flex left w-100 column w-100 source-info-container">
            <div className="flex left w-100 mb-16">
                <EnvSelector environments={environments} disabled={params.envId && !showCommitInfo} />
                <div style={{ marginLeft: 'auto' }} className="flex right fs-12 cn-9">
                    {showCommitInfo && (
                        <button
                            className="cta cta-with-img small cancel fs-12 fw-6 mr-6"
                            onClick={(e) => showCommitInfo(true)}
                        >
                            <CommitIcon className="icon-dim-16 mr-6" />
                            commit info
                        </button>
                    )}
                    {showHibernateModal && (
                        <button
                            className="cta cta-with-img small cancel fs-12 fw-6"
                            onClick={(e) =>
                                showHibernateModal(status.toLowerCase() === 'hibernating' ? 'resume' : 'hibernate')
                            }
                        >
                            <ScaleDown
                                className={`icon-dim-16 mr-6 rotate`}
                                style={{
                                    ['--rotateBy' as any]: status.toLowerCase() === 'hibernating' ? '180deg' : '0deg',
                                }}
                            />
                            {status.toLowerCase() === 'hibernating' ? 'Restore pod count' : 'Scale pods to 0'}
                        </button>
                    )}
                </div>
            </div>
            <div className="flex left w-100">
                {appDetails?.resourceTree && (
                    <>
                        <div
                            onClick={showApplicationDetailedModal()}
                            className="pointer flex left bcn-0 p-16 br-4 mw-340 mr-12 en-2 bw-1"
                        >
                            <div className="mw-48 mh-48 bcn-1 flex br-4 mr-16">
                                <figure
                                    className={`${status.toLowerCase()} app-summary__icon mr-8 h-32 w-32`}
                                    style={{ margin: 'auto' }}
                                ></figure>
                            </div>
                            <div className="flex left column">
                                <div className="flexbox">
                                    <span className="fs-12 mr-5 fw-4 cn-9">Application status</span>

                                    <Tippy
                                        className="default-tt"
                                        arrow={false}
                                        placement="top"
                                        content="The health status of your app"
                                    >
                                        <Question className="icon-dim-16 mt-2" />
                                    </Tippy>
                                </div>
                                <div>
                                    <span
                                        className={`app-summary__status-name fs-14 mr-8 fw-6 f-${status.toLowerCase()}`}
                                    >
                                        {status}
                                    </span>
                                </div>
                                <div className="flex left">
                                    {message && <span className="select-material-message">{message.slice(0, 30)}</span>}
                                    {message?.length > 30 && <span className="more-message cb-5 fw-6">Details</span>}
                                </div>
                            </div>
                        </div>
                        <div
                            onClick={showDeploymentDetailedStatus()}
                            className="pointer flex left bcn-0 p-16 br-4 mw-382 en-2 bw-1"
                        >
                            <div className="mw-48 mh-48 bcn-1 flex br-4 mr-16">
                                <CD className="icon-dim-32" />
                            </div>
                            <div className="flex left column pr-16 border-right-n1 mr-16">
                                <div className="flexbox">
                                    <span className="fs-12 mr-5 fw-4 cn-9">Deployment status</span>

                                    <Tippy
                                        className="default-tt"
                                        arrow={false}
                                        placement="top"
                                        content="Status of last triggered deployment"
                                    >
                                        <Question className="icon-dim-16 mt-2" />
                                    </Tippy>
                                </div>
                                <div className="flexbox">
                                    <span
                                        className={`app-summary__status-name fs-14 mr-8 fw-6 f-${deploymentStatus} ${
                                            deploymentStatus === 'inprogress' ? 'loading-dots' : ''
                                        }`}
                                    >
                                        {deploymentStatusText}
                                    </span>
                                    <div className={`${deploymentStatus} icon-dim-20 mt-2`}></div>
                                </div>
                                <div>
                                    <span className="cb-5 fw-6 pointer">Details</span>
                                </div>
                            </div>
                            <div className="flex left column mw-140">
                                <div className="fs-12 fw-4 cn-9">Deployment triggered</div>
                                <div className="flexbox">
                                    <span className="fs-13 mr-5 fw-6 cn-9">
                                        {deploymentTriggerTime
                                            ? moment(deploymentTriggerTime, 'YYYY-MM-DDTHH:mm:ssZ').fromNow()
                                            : ''}
                                    </span>
                                    {deploymentStatus === 'inprogress' && <Timer className="icon-dim-16 mt-4" />}
                                </div>
                                <div className="fw-4 fs-12 cn-9 ellipsis-right" style={{ maxWidth: 'inherit' }}>
                                    by {appDetails?.lastDeployedBy}
                                </div>
                            </div>
                        </div>
                    </>
                )}
                <div style={{ marginLeft: 'auto' }} className="flex right">
                    {appDetails?.appStoreChartId && (
                        <>
                            <span className="mr-8 fs-12 cn-7">Chart:</span>
                            <Link
                                className="cb-5 fw-6"
                                to={`${URLS.CHARTS}/discover/chart/${appDetails.appStoreChartId}`}
                            >
                                {appDetails.appStoreChartName}/{appDetails.appStoreAppName}(
                                {appDetails.appStoreAppVersion})
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
