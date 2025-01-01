/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import moment from 'moment'
import {
    Button,
    ButtonComponentType,
    ButtonStyleType,
    ButtonVariantType,
    ComponentSizeType,
    DATE_TIME_FORMATS,
    DeploymentAppTypes,
    handleUTCTime,
    ReleaseMode,
    Tooltip,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICCamera } from '@Icons/ic-camera.svg'
import { URLS } from '../../../../config'
import { EnvSelector } from './AppDetails'
import { DeploymentAppTypeNameMapping } from '../../../../config/constantMessaging'
import { Nodes, SourceInfoType } from '../../types'
import DeploymentStatusCard from './DeploymentStatusCard'
import { importComponentFromFELibrary } from '../../../common/helpers/Helpers'
import DeploymentTypeIcon from '../../../common/DeploymentTypeIcon/DeploymentTypeIcon'
import DeployedCommitCard from './DeployedCommitCard'
import IssuesCard from './IssuesCard'
import SecurityVulnerabilityCard from './SecurityVulnerabilityCard'
import AppStatusCard from './AppStatusCard'
import LoadingCard from './LoadingCard'
import AppDetailsCDButton from './AppDetailsCDButton'
import { ReactComponent as RotateIcon } from '../../../../assets/icons/ic-arrows_clockwise.svg'
import { ReactComponent as LinkIcon } from '../../../../assets/icons/ic-link.svg'
import { ReactComponent as Trash } from '../../../../assets/icons/ic-delete-dots.svg'
import { ReactComponent as ScaleDown } from '../../../../assets/icons/ic-scale-down.svg'
import HelmAppConfigApplyStatusCard from '@Components/v2/appDetails/sourceInfo/environmentStatus/HelmAppConfigApplyStatusCard'

const AppDetailsDownloadCard = importComponentFromFELibrary('AppDetailsDownloadCard')
const DeploymentWindowStatusCard = importComponentFromFELibrary('DeploymentWindowStatusCard')
const ConfigSyncStatusButton = importComponentFromFELibrary('ConfigSyncStatusButton', null, 'function')

export const SourceInfo = ({
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
    isVirtualEnvironment,
    setRotateModal = null,
    refetchDeploymentStatus,
    toggleIssuesModal,
    envId,
    ciArtifactId,
    setErrorsList,
    filteredEnvIds,
    deploymentUserActionState,
}: SourceInfoType) => {
    const isdeploymentAppDeleting = appDetails?.deploymentAppDeleteRequest || false
    const isArgoCdApp = appDetails?.deploymentAppType === DeploymentAppTypes.GITOPS
    const status = appDetails?.resourceTree?.status || ''
    const params = useParams<{ appId: string; envId?: string }>()
    const conditions = appDetails?.resourceTree?.conditions
    let message = null
    const Rollout = appDetails?.resourceTree?.nodes?.filter(({ kind }) => kind === Nodes.Rollout)
    const isExternalCI = appDetails?.dataSource === 'EXTERNAL'
    // helmMigratedAppNotTriggered means the app is migrated from a helm release and has not been deployed yet i.e. CD Pipeline has not been triggered
    const helmMigratedAppNotTriggered =
        appDetails?.releaseMode === ReleaseMode.MIGRATE_HELM && !appDetails?.isPipelineTriggered
    const isIsolatedEnv = isVirtualEnvironment && !!appDetails?.resourceTree

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

    const onClickShowCommitInfo = (e): void => {
        e.stopPropagation()
        showCommitInfo(true)
    }

    const onClickShowUrlInfo = (): void => {
        showUrlInfo(true)
    }

    const onClickShowHibernateModal = (): void => {
        showHibernateModal(isHibernated ? 'resume' : 'hibernate')
    }

    const shimmerLoaderBlocks = () => {
        const loadingCards = []
        for (let i = 0; i < 4; i++) {
            loadingCards.push(<LoadingCard key={i} />)
        }

        return <div className="flex left mb-16">{loadingCards}</div>
    }

    const renderDevtronAppsEnvironmentSelector = (environment) => {
        // If moving to a component then move getIsApprovalConfigured with it as well with memoization.
        const isApprovalConfigured = appDetails?.isApprovalPolicyApplicable ?? false
        const relativeSnapshotTime = appDetails?.resourceTree?.lastSnapshotTime
            ? handleUTCTime(appDetails.resourceTree.lastSnapshotTime, true)
            : ''

        return (
            <div className="flex left w-100">
                <EnvSelector
                    environments={environments}
                    disabled={loadingDetails || loadingResourceTree || (params.envId && !showCommitInfo)}
                />
                {appDetails?.deploymentAppType && (
                    <Tooltip
                        placement="top"
                        alwaysShowTippyOnHover={!appDetails.isVirtualEnvironment}
                        content={`Deployed using ${
                            isArgoCdApp ? DeploymentAppTypeNameMapping.GitOps : DeploymentAppTypeNameMapping.Helm
                        }`}
                    >
                        <div className={`flex ${!appDetails.isVirtualEnvironment ? 'ml-16' : ''}`}>
                            {/* TODO: verify what appType needs to be passed */}
                            <DeploymentTypeIcon deploymentAppType={appDetails?.deploymentAppType} appType={null} />
                        </div>
                    </Tooltip>
                )}
                {appDetails?.resourceTree &&
                    !isIsolatedEnv &&
                    window._env_.FEATURE_CONFIG_DRIFT_ENABLE &&
                    ConfigSyncStatusButton && (
                        <div className="pl-8">
                            <ConfigSyncStatusButton
                                areConfigurationsDrifted={appDetails.resourceTree.hasDrift}
                                appId={appDetails.appId}
                                envId={envId}
                            />
                        </div>
                    )}
                {isdeploymentAppDeleting && (
                    <div data-testid="deleteing-argocd-pipeline" className="flex left">
                        <Trash className="icon-dim-16 mr-8 ml-12" />
                        <span className="cr-5 fw-6">Deleting deployment pipeline </span>
                        <span className="dc__loading-dots cr-5" />
                    </div>
                )}
                {/* Last snapshot time */}
                {isIsolatedEnv && relativeSnapshotTime && (
                    <Tooltip
                        content={
                            <div className="fw-4 lh-18 flexbox-col dc__ga-2">
                                <h6 className="fs-12 fw-6 cn-0 m-0">Last snapshot received</h6>
                                <p className="m-0 fs-12 cn-50">
                                    {moment(appDetails.resourceTree.lastSnapshotTime).format(
                                        DATE_TIME_FORMATS.TWELVE_HOURS_FORMAT,
                                    )}
                                </p>
                            </div>
                        }
                        alwaysShowTippyOnHover
                    >
                        <div className="flex left">
                            <div className="dc__divider h-20 mr-8 ml-8" />
                            <div className="flex left dc__gap-6 px-8 py-4">
                                <ICCamera className="scn-9 dc__no-shrink icon-dim-16" />
                                <p className="m-0 fs-13 fw-4 lh-20 cn-9 dc__truncate">{relativeSnapshotTime}</p>
                            </div>
                        </div>
                    </Tooltip>
                )}
                {!loadingResourceTree && environment && (
                    <>
                        {!isdeploymentAppDeleting && (
                            <div style={{ marginLeft: 'auto' }} className="flexbox dc__gap-6">
                                {!isVirtualEnvironment && showUrlInfo && (
                                    <Button
                                        dataTestId="app-details-urls"
                                        size={ComponentSizeType.small}
                                        variant={ButtonVariantType.secondary}
                                        text="URLs"
                                        startIcon={<LinkIcon />}
                                        onClick={onClickShowUrlInfo}
                                        component={ButtonComponentType.button}
                                        style={ButtonStyleType.neutral}
                                    />
                                )}
                                {!isVirtualEnvironment && showHibernateModal && (
                                    <Button
                                        dataTestId="app-details-hibernate-modal-button"
                                        size={ComponentSizeType.small}
                                        variant={ButtonVariantType.secondary}
                                        text={isHibernated ? 'Restore pod count' : 'Scale pods to 0'}
                                        startIcon={
                                            <ScaleDown
                                                className={`${isHibernated ? 'dc__flip-180' : ''} dc__transition--transform`}
                                            />
                                        }
                                        onClick={onClickShowHibernateModal}
                                        component={ButtonComponentType.button}
                                        disabled={isApprovalConfigured}
                                        style={ButtonStyleType.neutral}
                                        showTooltip={isApprovalConfigured}
                                        tooltipProps={{
                                            content: 'Application deployment requiring approval cannot be hibernated.',
                                            placement: 'bottom-end',
                                        }}
                                    />
                                )}
                                {window._env_.ENABLE_RESTART_WORKLOAD && !isVirtualEnvironment && setRotateModal && (
                                    <Button
                                        dataTestId="app-details-rotate-pods-modal-button"
                                        size={ComponentSizeType.small}
                                        variant={ButtonVariantType.secondary}
                                        onClick={() => setRotateModal(true)}
                                        disabled={isApprovalConfigured}
                                        startIcon={<RotateIcon />}
                                        text="Restart workloads"
                                        component={ButtonComponentType.button}
                                        style={ButtonStyleType.neutral}
                                        showTooltip={isApprovalConfigured}
                                        tooltipProps={{
                                            content: 'Application deployment requiring approval cannot be hibernated.',
                                            placement: 'bottom-end',
                                        }}
                                    />
                                )}
                                <AppDetailsCDButton
                                    appId={appDetails.appId}
                                    environmentId={appDetails.environmentId}
                                    environmentName={appDetails.environmentName}
                                    isVirtualEnvironment={appDetails.isVirtualEnvironment}
                                    deploymentAppType={appDetails.deploymentAppType}
                                    loadingDetails={loadingDetails}
                                    cdModal={{
                                        cdPipelineId: appDetails.cdPipelineId,
                                        ciPipelineId: appDetails.ciPipelineId,
                                        parentEnvironmentName: appDetails.parentEnvironmentName,
                                        deploymentUserActionState: deploymentUserActionState,
                                        triggerType: appDetails.triggerType,
                                        isRedirectedFromAppDetails: true,
                                    }}
                                />
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
        <div className="flex left w-100 column source-info-container dc__gap-16">
            {renderDevtronAppsEnvironmentSelector(environment)}
            {loadingDetails
                ? shimmerLoaderBlocks()
                : !isdeploymentAppDeleting &&
                  environment && (
                      <div className="flex left w-100">
                          {status && (
                              <AppStatusCard
                                  // TODO: Fix and remove
                                  // @ts-ignore
                                  appDetails={appDetails}
                                  status={status}
                                  cardLoading={cardLoading}
                                  setDetailed={setDetailed}
                                  message={message}
                              />
                          )}
                          {!helmMigratedAppNotTriggered && (
                              <>
                                  {!loadingResourceTree && (
                                      <IssuesCard
                                          cardLoading={cardLoading}
                                          toggleIssuesModal={toggleIssuesModal}
                                          setErrorsList={setErrorsList}
                                          setDetailed={setDetailed}
                                      />
                                  )}
                                  {isIsolatedEnv && (
                                      <HelmAppConfigApplyStatusCard
                                          cardLoading={cardLoading}
                                          releaseStatus={appDetails.resourceTree.releaseStatus}
                                      />
                                  )}
                              </>
                          )}
                          {isVirtualEnvironment && !isIsolatedEnv && renderGeneratedManifestDownloadCard()}
                          {!helmMigratedAppNotTriggered && (
                              <>
                                  <DeploymentStatusCard
                                      deploymentStatusDetailsBreakdownData={deploymentStatusDetailsBreakdownData}
                                      cardLoading={cardLoading}
                                      hideDetails={
                                          appDetails?.deploymentAppType === DeploymentAppTypes.HELM || isIsolatedEnv
                                      }
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
                              </>
                          )}
                          {DeploymentWindowStatusCard && (
                              <DeploymentWindowStatusCard
                                  cardLoading={cardLoading}
                                  appId={params.appId}
                                  envId={params.envId}
                                  filteredEnvIds={filteredEnvIds}
                              />
                          )}
                          {!appDetails?.deploymentAppDeleteRequest && !helmMigratedAppNotTriggered && (
                              <SecurityVulnerabilityCard
                                  cardLoading={cardLoading}
                                  appId={params.appId}
                                  envId={params.envId}
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
