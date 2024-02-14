// @ts-nocheck - @TODO: Remove this by fixing the type issues
import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useParams } from 'react-router'
import Tippy from '@tippyjs/react'
import { ConditionalWrap, DeploymentAppTypes, showError } from '@devtron-labs/devtron-fe-common-lib'
import { URLS } from '../../../../config'
import { EnvSelector } from './AppDetails'
import { DeploymentAppTypeNameMapping } from '../../../../config/constantMessaging'
import { ReactComponent as ScaleDown } from '../../../../assets/icons/ic-scale-down.svg'
import { Nodes, SourceInfoType } from '../../types'
import { ReactComponent as LinkIcon } from '../../../../assets/icons/ic-link.svg'
import { ReactComponent as Trash } from '../../../../assets/icons/ic-delete-dots.svg'
import DeploymentStatusCard from './DeploymentStatusCard'
import { importComponentFromFELibrary } from '../../../common/helpers/Helpers'
import DeploymentTypeIcon from '../../../common/DeploymentTypeIcon/DeploymentTypeIcon'
import { ReactComponent as RotateIcon } from '../../../../assets/icons/ic-arrows_clockwise.svg'
import DeployedCommitCard from './DeployedCommitCard'
import IssuesCard from './IssuesCard'
import SecurityVulnerabilityCard from './SecurityVulnerabilityCard'
import AppStatusCard from './AppStatusCard'
import { getLastExecutionByArtifactId } from '../../../../services/service'

const AppDetailsDownloadCard = importComponentFromFELibrary('AppDetailsDownloadCard')

export const SourceInfo = ({
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
    errorList,
}: SourceInfoType) => {
    const [showVulnerabilitiesCard, setShowVulnerabilitiesCard] = useState<boolean>(false)
    const isdeploymentAppDeleting = appDetails?.deploymentAppDeleteRequest || false
    const isArgoCdApp = appDetails?.deploymentAppType === DeploymentAppTypes.GITOPS
    const status = appDetails?.resourceTree?.status || ''
    const params = useParams<{ appId: string; envId?: string }>()
    const conditions = appDetails?.resourceTree?.conditions
    let message = null
    const Rollout = appDetails?.resourceTree?.nodes?.filter(({ kind }) => kind === Nodes.Rollout)
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

    const getScannedStatus = async () => {
        const { appId, ciArtifactId } = appDetails
        try {
            const {
                result: { scanEnabled, scanned },
            } = await getLastExecutionByArtifactId(appId, ciArtifactId)
            if (scanEnabled && scanned) {
                // If scanEnabled and scanned is true, then show the vulnerabilities card
                setShowVulnerabilitiesCard(true)
            } else {
                setShowVulnerabilitiesCard(false)
            }
        } catch (error) {
            setShowVulnerabilitiesCard(false)
            showError(error)
        }
    }

    useEffect(() => {
        if (appDetails?.ciArtifactId && appDetails?.appId) {
            getScannedStatus()
        }
    }, [appDetails?.ciArtifactId, appDetails?.appId])

    const onClickShowCommitInfo = (): void => {
        showCommitInfo(true)
    }

    const onClickShowUrlInfo = (): void => {
        showUrlInfo(true)
    }

    const onClickShowHibernateModal = (): void => {
        showHibernateModal(isHibernated ? 'resume' : 'hibernate')
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
                        <div className="flex">
                            <DeploymentTypeIcon deploymentAppType={appDetails?.deploymentAppType} />
                        </div>
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
                                                className="icon-dim-16 mr-6 rotate"
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
                                            <RotateIcon className="icon-dim-16 mr-6 icon-color-n7 scn-4" />
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

    const isHibernated = ['hibernating', 'hibernated'].includes(status.toLowerCase())
    const cardLoading = useMemo(() => loadingDetails || loadingResourceTree, [loadingDetails, loadingResourceTree])

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
            {!isdeploymentAppDeleting && environment && (
                <div className="flex left w-100">
                    {!isVirtualEnvironment && (
                        <AppStatusCard
                            appDetails={appDetails}
                            status={status}
                            cardLoading={cardLoading}
                            setDetailed={setDetailed}
                            message={message}
                        />
                    )}
                    {isVirtualEnvironment && renderGeneratedManifestDownloadCard()}
                    {!loadingResourceTree && (
                        <IssuesCard
                            appStreamData={appStreamData}
                            cardLoading={cardLoading}
                            toggleIssuesModal={toggleIssuesModal}
                            setErrorsList={setErrorsList}
                            setDetailed={setDetailed}
                            releaseStatus={appDetails.resourceTree?.releaseStatus}
                            errorList={errorList}
                        />
                    )}
                    <DeploymentStatusCard
                        deploymentStatusDetailsBreakdownData={deploymentStatusDetailsBreakdownData}
                        cardLoading={cardLoading}
                        hideDetails={appDetails?.deploymentAppType === DeploymentAppTypes.HELM}
                        isVirtualEnvironment={isVirtualEnvironment}
                        refetchDeploymentStatus={refetchDeploymentStatus}
                    />
                    {appDetails?.dataSource !== 'EXTERNAL' && (
                        <DeployedCommitCard
                            cardLoading={cardLoading}
                            showCommitInfoDrawer={onClickShowCommitInfo}
                            envId={envId}
                            ciArtifactId={ciArtifactId}
                        />
                    )}
                    {!appDetails?.deploymentAppDeleteRequest && showVulnerabilitiesCard && (
                        <SecurityVulnerabilityCard
                            cardLoading={cardLoading}
                            severityCount={severityCount}
                            showVulnerabilitiesModal={showVulnerabilitiesModal}
                        />
                    )}
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
        </div>
    )
}
