//@ts-nocheck

import React from 'react'
import { Link } from 'react-router-dom'
import { URLS } from '../../../../config'
import { EnvSelector } from './AppDetails'
import { DeploymentAppTypeNameMapping } from '../../../../config/constantMessaging'
import { ReactComponent as ScaleDown } from '../../../../assets/icons/ic-scale-down.svg'
import { ReactComponent as CommitIcon } from '../../../../assets/icons/ic-code-commit.svg'
import { ReactComponent as Question } from '../../../../assets/icons/ic-help-outline.svg'
import { ReactComponent as ArgoCD } from '../../../../assets/icons/argo-cd-app.svg'
import { ReactComponent as Helm } from '../../../../assets/icons/helm-app.svg'
import { useParams } from 'react-router'
import { Nodes, SourceInfoType } from '../../types'
import Tippy from '@tippyjs/react'
import ReactGA from 'react-ga4'
import { DeploymentAppType } from '../../../v2/appDetails/appDetails.type'
import { ReactComponent as LinkIcon } from '../../../../assets/icons/ic-link.svg'
import { ReactComponent as Trash } from '../../../../assets/icons/ic-delete-dots.svg'
import { ConditionalWrap, noop } from '@devtron-labs/devtron-fe-common-lib'
import DeploymentStatusCard from './DeploymentStatusCard'
import { ReactComponent as VirtualCluster } from '../../../../assets/icons/ic-virtual-cluster.svg'
import { importComponentFromFELibrary} from '../../../common/helpers/Helpers'

const AppDetailsDownloadCard = importComponentFromFELibrary('AppDetailsDownloadCard')

export function SourceInfo({
    appDetails,
    setDetailed = null,
    environment,
    environments,
    showCommitInfo = null,
    showUrlInfo = null,
    showHibernateModal = null,
    deploymentStatusDetailsBreakdownData = null,
    loadingDetails = false,
    loadingResourceTree = false,
    isVirtualEnvironment
}: SourceInfoType) {
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
    const showApplicationDetailedModal = (): void => {
        setDetailed && setDetailed(true)
        ReactGA.event({
            category: 'App Details',
            action: 'App Status clicked',
        })
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

    const renderDeploymentTypeIcon = (): void => {
      if (appDetails?.deploymentAppType === DeploymentAppType.manifest_download || isVirtualEnvironment) {
          return <VirtualCluster data-testid="helm-app-logo" className="icon-dim-32 fcb-5 ml-16" />
      } else if (appDetails?.deploymentAppType === DeploymentAppType.argo_cd) {
          return <ArgoCD data-testid="argo-cd-app-logo" className="icon-dim-32 ml-16" />
      } else if (appDetails?.deploymentAppType === DeploymentAppType.helm) {
          return <Helm data-testid="helm-app-logo" className="icon-dim-32 ml-16" />
      }
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
                            appDetails?.deploymentAppType === DeploymentAppType.argo_cd
                                ? DeploymentAppTypeNameMapping.GitOps
                                : DeploymentAppTypeNameMapping.Helm
                        }`}
                    >
                        {renderDeploymentTypeIcon()}
                    </Tippy>
                )}
                {appDetails?.deploymentAppDeleteRequest && (
                    <div data-testid="deleteing-argocd-pipeline">
                        <Trash className="icon-dim-16 mr-8 ml-12" />
                        <span className="cr-5 fw-6">Deleting deployment pipeline </span>
                        <span className="dc__loading-dots cr-5" />
                    </div>
                )}
                {!loadingResourceTree && environment && (
                    <>
                        {!appDetails?.deploymentAppDeleteRequest && (
                            <div style={{ marginLeft: 'auto' }} className="flex right fs-12 cn-9">
                                {(!isVirtualEnvironment && showUrlInfo) && (
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
                                {(!isVirtualEnvironment && showHibernateModal) && (
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
            appName: appDetails?.appName,
        }
        if ( AppDetailsDownloadCard) {
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
                    {!appDetails?.deploymentAppDeleteRequest && environment && (
                        <div className="flex left w-100">
                            {!isVirtualEnvironment && (
                                <div
                                    data-testid="app-status-card"
                                    onClick={loadingResourceTree ? noop : showApplicationDetailedModal}
                                    className="pointer flex left bcn-0 p-16 br-8 mw-340 mr-12 lh-20"
                                >
                                    <div className="mw-48 mh-48 bcn-1 flex br-4 mr-16">
                                        {loadingResourceTree ? (
                                            <div className="icon-dim-32 shimmer-loading" />
                                        ) : (
                                            <figure
                                                className={`${status.toLowerCase()} dc__app-summary__icon mr-8 h-32 w-32`}
                                                style={{ margin: 'auto', backgroundSize: 'contain, contain' }}
                                            ></figure>
                                        )}
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
                                        {loadingResourceTree ? (
                                            <div className="flex left column mt-6">
                                                <div className="shimmer-loading w-120 h-16 br-2 mb-6" />
                                                <div className="shimmer-loading w-54 h-12 br-2" />
                                            </div>
                                        ) : (
                                            <>
                                                <div
                                                    data-testid="app-status-name"
                                                    className={`app-summary__status-name fs-14 mr-8 fw-6 f-${status.toLowerCase()}`}
                                                >
                                                    {isHibernated ? 'Hibernating' : status}
                                                </div>
                                                <div className="flex left">
                                                    {appDetails?.deploymentAppType === DeploymentAppType.helm ? (
                                                        <span
                                                            data-testid="app-status-card-details"
                                                            className="cb-5 fw-6"
                                                        >
                                                            Details
                                                        </span>
                                                    ) : (
                                                        <>
                                                            {message && (
                                                                <span className="select-material-message">
                                                                    {message.slice(0, 30)}
                                                                </span>
                                                            )}
                                                            <span
                                                                data-testid="app-status-card-details"
                                                                className={`${
                                                                    message?.length > 30 ? 'more-message' : ''
                                                                } cb-5 fw-6`}
                                                            >
                                                                Details
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                            {
                              isVirtualEnvironment && renderGeneratedManifestDownloadCard()
                            }
                            <DeploymentStatusCard
                                deploymentStatusDetailsBreakdownData={deploymentStatusDetailsBreakdownData}
                                loadingResourceTree={loadingResourceTree}
                                hideDetails={appDetails?.deploymentAppType === DeploymentAppType.helm}
                                isVirtualEnvironment={isVirtualEnvironment}
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
