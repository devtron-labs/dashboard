//@ts-nocheck

import React from 'react'
import { Link } from 'react-router-dom'
import { URLS } from '../../../../config'
import { EnvSelector } from './AppDetails'
import { DeploymentAppTypeNameMapping } from '../../../../config/constantMessaging'
import { ReactComponent as ScaleDown } from '../../../../assets/icons/ic-scale-down.svg'
import { ReactComponent as CommitIcon } from '../../../../assets/icons/ic-code-commit.svg'
import { useParams } from 'react-router'
import { Nodes, SourceInfoType } from '../../types'
import Tippy from '@tippyjs/react'
import { ReactComponent as LinkIcon } from '../../../../assets/icons/ic-link.svg'
import { ReactComponent as Trash } from '../../../../assets/icons/ic-delete-dots.svg'
import { ConditionalWrap, DeploymentAppTypes } from '@devtron-labs/devtron-fe-common-lib'
import DeploymentStatusCard from './DeploymentStatusCard'
import { importComponentFromFELibrary } from '../../../common/helpers/Helpers'
import DeploymentTypeIcon from '../../../common/DeploymentTypeIcon/DeploymentTypeIcon'
import { ReactComponent as RotateIcon } from '../../../../assets/icons/ic-arrows_clockwise.svg'
import DeployedCommitCard from './DeployedCommitCard'
import IssuesCard from './IssuesCard'
import SecurityVulnerabilityCard from './SecurityVulnerabilityCard'
import AppStatusCard from './AppStatusCard'

const AppDetailsDownloadCard = importComponentFromFELibrary('AppDetailsDownloadCard')

export function SourceInfo({
    appDetails,
    appStreamData,
    setDetailed = null,
    environment,
    environments,
    showCommitInfo = null,
    showUrlInfo = null,
    showHibernateModal = null,
    deploymentStatusDetailsBreakdownData = null,
    loadingDetails = false,
    loadingResourceTree = false,
    isVirtualEnvironment,
    setRotateModal = null,
    refetchDeploymentStatus,
    severityCount,
    showVulnerabilitiesModal,
    toggleIssuesModal,
    envId,
    ciArtifactId,
    setErrorsList,
}: SourceInfoType) {
    const isdeploymentAppDeleting = appDetails?.deploymentAppDeleteRequest || false
    const isArgoCdApp = appDetails?.deploymentAppType === DeploymentAppTypes.GITOPS
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

    const onClickShowCommitInfo = (): void => {
        showCommitInfo(true)
    }

    const onClickShowUrlInfo = (): void => {
        showUrlInfo(true)
    }

    const onClickShowHibernateModal = (): void => {
        showHibernateModal(isHibernated ? 'resume' : 'hibernate')
    }

    const showApplicationDetailedModal = (): void => {
        toggleIssuesModal(false)
        setDetailed(true)
    }

    const conditionalScalePodsButton = (children) => {
        return (
            <Tippy
                className="default-tt w-200"
                arrow={false}
                placement="bottom-end"
                content="Application deployment requiring approval cannot be hibernated."
            >
                <div>{children}</div>
            </Tippy>
        )
    }

    const renderDevtronAppsEnvironmentSelector = (environment) => {
        return (
            <div className="flex left w-100 mb-16">
                <EnvSelector
                    environments={environments}
                    disabled={loadingDetails || loadingResourceTree || (params.envId && !showCommitInfo)}
                />
                {appDetails?.deploymentAppType && (
                    <Tippy
                        className="default-tt"
                        arrow={false}
                        placement="top"
                        content={`Deployed using ${
                            isArgoCdApp ? DeploymentAppTypeNameMapping.GitOps : DeploymentAppTypeNameMapping.Helm
                        }`}
                    >
                        <DeploymentTypeIcon deploymentAppType={appDetails?.deploymentAppType} />
                    </Tippy>
                )}
                {isdeploymentAppDeleting && (
                    <div data-testid="deleteing-argocd-pipeline">
                        <Trash className="icon-dim-16 mr-8 ml-12" />
                        <span className="cr-5 fw-6">Deleting deployment pipeline </span>
                        <span className="dc__loading-dots cr-5" />
                    </div>
                )}
                {!loadingResourceTree && environment && (
                    <>
                        {!isdeploymentAppDeleting && (
                            <div style={{ marginLeft: 'auto' }} className="flex right fs-12 cn-9">
                                {!isVirtualEnvironment && showUrlInfo && (
                                    <button
                                        className="cta cta-with-img small cancel fs-12 fw-6 mr-6"
                                        onClick={onClickShowUrlInfo}
                                        data-testid="app-details-urls"
                                    >
                                        <LinkIcon className="icon-dim-16 mr-6 icon-color-n7" />
                                        URLs
                                    </button>
                                )}
                                {appDetails?.dataSource !== 'EXTERNAL' && showCommitInfo && (
                                    <button
                                        className="cta cta-with-img small cancel fs-12 fw-6 mr-6"
                                        onClick={onClickShowCommitInfo}
                                        data-testid="app-details-commit-info"
                                    >
                                        <CommitIcon className="icon-dim-16 mr-6" />
                                        commit info
                                    </button>
                                )}
                                {!isVirtualEnvironment && showHibernateModal && (
                                    <ConditionalWrap
                                        condition={appDetails?.userApprovalConfig?.length > 0}
                                        wrap={conditionalScalePodsButton}
                                    >
                                        <button
                                            data-testid="app-details-hibernate-modal-button"
                                            className="cta cta-with-img small cancel fs-12 fw-6"
                                            onClick={onClickShowHibernateModal}
                                            disabled={appDetails?.userApprovalConfig?.length > 0}
                                        >
                                            <ScaleDown
                                                className={`icon-dim-16 mr-6 rotate`}
                                                style={{
                                                    ['--rotateBy' as any]: isHibernated ? '180deg' : '0deg',
                                                }}
                                            />
                                            {isHibernated ? 'Restore pod count' : 'Scale pods to 0'}
                                        </button>
                                    </ConditionalWrap>
                                )}
                                {window._env_.ENABLE_RESTART_WORKLOAD && !isVirtualEnvironment && setRotateModal && (
                                    <ConditionalWrap
                                        condition={appDetails?.userApprovalConfig?.length > 0}
                                        wrap={conditionalScalePodsButton}
                                    >
                                        <button
                                            data-testid="app-details-rotate-pods-modal-button"
                                            className="cta cta-with-img small cancel fs-12 fw-6 ml-6"
                                            onClick={setRotateModal}
                                            disabled={appDetails?.userApprovalConfig?.length > 0}
                                        >
                                            <RotateIcon className="icon-dim-16 mr-6 icon-color-n7 scn-9" />
                                            Restart workloads
                                        </button>
                                    </ConditionalWrap>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        )
    }

    const shimmerLoaderBlocks = () => {
        return (
            <div className="flex left mb-16">
                <div className="bcn-0 w-220 mh-92 mr-12 br-8 dc__position-rel">
                    <div className="flex left w-85 dc__place-abs-shimmer-center ml-16">
                        <div className="shimmer-loading icon-dim-48 br-4 mr-16" />
                        <div>
                            <div className="shimmer-loading w-120 h-16 br-2 mb-6" />
                            <div className="shimmer-loading w-64 h-12 br-2 mb-6" />
                        </div>
                    </div>
                </div>
                <div className="bcn-0 w-400 mh-92 mr-12 br-8 dc__position-rel">
                    <div className="flex left w-85 dc__place-abs-shimmer-center ml-16">
                        <div className="flex left">
                            <div className="shimmer-loading icon-dim-48 br-4 mr-16" />
                            <div>
                                <div className="shimmer-loading w-150 h-16 br-2 mb-6" />
                                <div className="shimmer-loading w-64 h-12 br-2 mb-6" />
                            </div>
                        </div>
                        <div className="dc__border-right-n1 ml-12 mr-12 h-60" />
                        <div>
                            <div className="shimmer-loading w-120 h-16 br-2 mb-6" />
                            <div className="shimmer-loading w-54 h-12 br-2 mb-6" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const isHibernated = ['hibernating', 'hibernated'].includes(status.toLowerCase())

    const renderGeneratedManifestDownloadCard = (): JSX.Element => {
        const paramsId = {
            appId: +params.appId,
            envId: +params.envId,
            appName: `${appDetails?.appName}-${appDetails?.environmentName}-${appDetails?.imageTag}`,
        }
        if (AppDetailsDownloadCard) {
            return <AppDetailsDownloadCard params={paramsId} />
        }
    }

    return (
        <div className="flex left w-100 column source-info-container">
            {renderDevtronAppsEnvironmentSelector(environment)}
            {loadingDetails ? (
                shimmerLoaderBlocks()
            ) : (
                <>
                    {!isdeploymentAppDeleting && environment && (
                        <div className="flex left w-100">
                            {!isVirtualEnvironment && (
                                <AppStatusCard
                                    appDetails={appDetails}
                                    status={status}
                                    loadingResourceTree={loadingResourceTree}
                                    setDetailed={setDetailed}
                                    message={message}
                                />
                            )}
                            {isVirtualEnvironment && renderGeneratedManifestDownloadCard()}
                            {!loadingResourceTree && (
                                <IssuesCard
                                    appStreamData={appStreamData}
                                    loadingResourceTree={loadingResourceTree}
                                    showIssuesListingModal={() => toggleIssuesModal(true)}
                                    setErrorsList={setErrorsList}
                                    showApplicationDetailedModal={showApplicationDetailedModal}
                                />
                            )}
                            <DeploymentStatusCard
                                deploymentStatusDetailsBreakdownData={deploymentStatusDetailsBreakdownData}
                                loadingResourceTree={loadingResourceTree}
                                hideDetails={appDetails?.deploymentAppType === DeploymentAppTypes.HELM}
                                isVirtualEnvironment={isVirtualEnvironment}
                                refetchDeploymentStatus={refetchDeploymentStatus}
                            />
                            <DeployedCommitCard
                                loadingResourceTree={loadingResourceTree}
                                showCommitInfoDrawer={onClickShowCommitInfo}
                                envId={envId}
                                ciArtifactId={ciArtifactId}
                            />
                            <SecurityVulnerabilityCard
                                loadingResourceTree={loadingResourceTree}
                                severityCount={severityCount}
                                showVulnerabilitiesModal={showVulnerabilitiesModal}
                            />
                            <div className="flex right ml-auto">
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
                    )}
                </>
            )}
        </div>
    )
}
