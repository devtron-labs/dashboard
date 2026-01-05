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

import { useMemo, useState } from 'react'
import ReactGA from 'react-ga4'
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
    Icon,
    LoadingCard,
    logExceptionToSentry,
    ReleaseMode,
    showError,
    Tooltip,
    URLS as CommonURLS,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICCamera } from '@Icons/ic-camera.svg'
import { ReactComponent as Trash } from '@Icons/ic-delete-dots.svg'
import { ReactComponent as LinkIcon } from '@Icons/ic-link.svg'
import { ReactComponent as ICRollback } from '@Icons/ic-rollback.svg'
import HelmAppConfigApplyStatusCard from '@Components/v2/appDetails/sourceInfo/environmentStatus/HelmAppConfigApplyStatusCard'

import { APP_COMPOSE_STAGE, getAppComposeURL, URLS } from '../../../../config'
import DeploymentTypeIcon from '../../../common/DeploymentTypeIcon/DeploymentTypeIcon'
import { importComponentFromFELibrary } from '../../../common/helpers/Helpers'
import { Nodes, SourceInfoType } from '../../types'
import AppEnvSelector from './AppDetails.components'
import { HibernationModalTypes } from './appDetails.type'
import AppStatusCard from './AppStatusCard'
import { ACTION_DISABLED_TEXT, AG_APP_DETAILS_GA_EVENTS, DA_APP_DETAILS_GA_EVENTS } from './constants'
import DeployedCommitCard from './DeployedCommitCard'
import DeploymentStatusCard from './DeploymentStatusCard'
import IssuesCard from './IssuesCard'
import SecurityVulnerabilityCard from './SecurityVulnerabilityCard'
import { getDeployButtonConfig } from './utils'
import { useGetDTAppDeploymentStatusDetail } from '@Components/app/service'

const AppDetailsDownloadCard = importComponentFromFELibrary('AppDetailsDownloadCard')
const DeploymentWindowStatusCard = importComponentFromFELibrary('DeploymentWindowStatusCard')
const ConfigSyncStatusButton = importComponentFromFELibrary('ConfigSyncStatusButton', null, 'function')
const SwapTraffic = importComponentFromFELibrary('SwapTraffic', null, 'function')
const getHibernationPatchConfig = importComponentFromFELibrary('getHibernationPatchConfig', null, 'function')
const DeploymentStrategyCard = importComponentFromFELibrary('DeploymentStrategyCard', null, 'function')

export const SourceInfo = ({
    appDetails,
    setDetailed = null,
    environment,
    environments,
    setShowCommitInfo = null,
    showUrlInfo = null,
    showHibernateModal = null,
    loadingDetails = false,
    loadingResourceTree = false,
    setRotateModal = null,
    toggleIssuesModal,
    envId,
    ciArtifactId,
    setErrorsList,
    filteredEnvIds,
    deploymentUserActionState,
    setHibernationPatchChartName,
    applications,
    isAppView,
    handleOpenCDModal,
}: SourceInfoType) => {
    const params = useParams<{ appId: string; envId?: string }>()

    const [hibernationPatchResponseLoading, setHibernationPatchResponseLoading] = useState<boolean>(false)

    const isPipelineTriggered = appDetails?.isPipelineTriggered || false
    const isExternalLinkedApp = appDetails?.releaseMode === ReleaseMode.MIGRATE_EXTERNAL_APPS
    const isdeploymentAppDeleting = appDetails?.deploymentAppDeleteRequest || false
    const status = appDetails?.resourceTree?.status || ''
    const conditions = appDetails?.resourceTree?.conditions
    const Rollout = appDetails?.resourceTree?.nodes?.filter(({ kind }) => kind === Nodes.Rollout)
    // appMigratedFromExternalSourceAndIsNotTriggered means the app is migrated from a helm/argo release and has not been deployed yet i.e. CD Pipeline has not been triggered
    const appMigratedFromExternalSourceAndIsNotTriggered = isExternalLinkedApp && !isPipelineTriggered
    const isVirtualEnvironment = appDetails?.isVirtualEnvironment
    const isIsolatedEnv = isVirtualEnvironment && !!appDetails?.resourceTree
    const wfrId = isIsolatedEnv ? appDetails?.resourceTree?.wfrId : null

    const { data: deploymentStatusDetailsBreakdownData } = useGetDTAppDeploymentStatusDetail(
        params.appId,
        params.envId,
        !!appDetails?.resourceTree,
        wfrId ? String(wfrId) : null,
    )

    const appStatusCardMessage = useMemo(() => {
        const conditionsMessage = conditions?.[0]?.message || ''
        if (['progressing', 'degraded'].includes(status?.toLowerCase()) && conditionsMessage) {
            return conditionsMessage
        }

        const rolloutMessage = Rollout?.[0]?.health?.message || ''
        return rolloutMessage
    }, [status, conditions, Rollout])

    const onClickShowCommitInfo = (e): void => {
        e.stopPropagation()
        setShowCommitInfo(true)
    }

    const onClickShowUrlInfo = (): void => {
        showUrlInfo(true)
    }

    const onClickShowHibernateModal = async (): Promise<void> => {
        if (isHibernated) {
            showHibernateModal(HibernationModalTypes.RESUME)
            return
        }
        if (getHibernationPatchConfig) {
            try {
                setHibernationPatchResponseLoading(true)
                const result = await getHibernationPatchConfig({
                    appId: appDetails.appId ?? +params.appId,
                    envId: appDetails.environmentId ?? +envId,
                })
                const { isHibernationPatchConfigured, chartName } = result
                if (isHibernationPatchConfigured) {
                    showHibernateModal(HibernationModalTypes.HIBERNATE)
                } else {
                    showHibernateModal(HibernationModalTypes.CONFIGURE_PATCH)
                    setHibernationPatchChartName(chartName)
                }
            } catch (error) {
                showError(error)
            } finally {
                setHibernationPatchResponseLoading(false)
            }
            return
        }
        showHibernateModal(HibernationModalTypes.HIBERNATE)
    }

    const shimmerLoaderBlocks = () => {
        const loadingCards = []
        for (let i = 0; i < 4; i++) {
            loadingCards.push(<LoadingCard key={i} />)
        }

        return <div className="flex left dc__gap-12 mb-16 ml-20">{loadingCards}</div>
    }

    const onClickSliderVerticalButton = () => {
        ReactGA.event(
            isAppView
                ? DA_APP_DETAILS_GA_EVENTS.GoToEnvironmentConfiguration
                : AG_APP_DETAILS_GA_EVENTS.GoToEnvironmentConfiguration,
        )
    }

    const renderAppDetailsCDButton = () => {
        const { buttonStyle, iconName } = getDeployButtonConfig(deploymentUserActionState)

        return (
            <Button
                dataTestId="deploy-button"
                size={ComponentSizeType.medium}
                text="Deploy"
                startIcon={<Icon name={iconName} color={null} />}
                style={buttonStyle}
                onClick={handleOpenCDModal()}
            />
        )
    }

    const renderRollbackButton = (isIcon?: boolean) => (
        <Button
            dataTestId="rollback-button"
            size={isIcon ? ComponentSizeType.medium : ComponentSizeType.small}
            variant={isIcon ? ButtonVariantType.secondary : ButtonVariantType.text}
            {...(isIcon
                ? {
                      icon: <ICRollback />,
                      ariaLabel: 'Rollback',
                      style: ButtonStyleType.neutral,
                  }
                : { text: 'Rollback' })}
            onClick={handleOpenCDModal(true)}
        />
    )

    const renderDevtronAppsEnvironmentSelector = () => {
        // If moving to a component then move getIsApprovalConfigured with it as well with memoization.
        const isApprovalConfigured = appDetails?.isApprovalPolicyApplicable ?? false
        const relativeSnapshotTime = appDetails?.resourceTree?.lastSnapshotTime
            ? handleUTCTime(appDetails.resourceTree.lastSnapshotTime, true)
            : ''

        return (
            <div className="flex left w-100 pt-16 px-20">
                <AppEnvSelector {...(isAppView ? { isAppView, environments } : { isAppView: false, applications })} />

                {(isPipelineTriggered || isExternalLinkedApp) && (
                    <>
                        {appDetails?.deploymentAppType && (
                            <div className={`flex ${!appDetails.isVirtualEnvironment ? 'pl-16' : ''}`}>
                                <DeploymentTypeIcon deploymentAppType={appDetails.deploymentAppType} />
                            </div>
                        )}
                        {appDetails?.resourceTree &&
                            !isIsolatedEnv &&
                            window._env_.FEATURE_CONFIG_DRIFT_ENABLE &&
                            ConfigSyncStatusButton && (
                                <div className="pl-8">
                                    <ConfigSyncStatusButton
                                        areConfigurationsDrifted={appDetails.resourceTree.hasDrift}
                                        appName={appDetails.appName}
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
                                        <h6 className="fs-12 fw-6 m-0">Last snapshot received</h6>
                                        <p className="m-0 fs-12">
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
                                    <div style={{ marginLeft: 'auto' }} className="flex dc__gap-8">
                                        <div className="app-details-action-buttons flexbox border__primary br-6 dc__overflow-hidden">
                                            {!isVirtualEnvironment && showUrlInfo && (
                                                <>
                                                    <Button
                                                        dataTestId="app-details-urls"
                                                        size={ComponentSizeType.medium}
                                                        variant={ButtonVariantType.secondary}
                                                        icon={<LinkIcon />}
                                                        onClick={onClickShowUrlInfo}
                                                        style={ButtonStyleType.neutral}
                                                        ariaLabel="URLs"
                                                    />
                                                    <div className="divider__secondary" />
                                                </>
                                            )}

                                            {!isVirtualEnvironment && showHibernateModal && (
                                                <>
                                                    <Button
                                                        dataTestId="app-details-hibernate-modal-button"
                                                        size={ComponentSizeType.medium}
                                                        variant={ButtonVariantType.secondary}
                                                        isLoading={hibernationPatchResponseLoading}
                                                        icon={
                                                            <Icon
                                                                name={isHibernated ? 'ic-sun' : 'ic-hibernate-circle'}
                                                                color={null}
                                                            />
                                                        }
                                                        onClick={onClickShowHibernateModal}
                                                        disabled={
                                                            isApprovalConfigured || hibernationPatchResponseLoading
                                                        }
                                                        style={ButtonStyleType.neutral}
                                                        showTooltip={isApprovalConfigured}
                                                        tooltipProps={{
                                                            content: (
                                                                <div className="flexbox-col">
                                                                    <span className="fw-6">
                                                                        Cannot&nbsp;
                                                                        {isHibernated ? 'unhibernate' : 'hibernate'}
                                                                    </span>
                                                                    <span className="fw-4 dc__word-break">
                                                                        {ACTION_DISABLED_TEXT}
                                                                    </span>
                                                                </div>
                                                            ),
                                                            placement: 'bottom',
                                                        }}
                                                        ariaLabel={isHibernated ? 'Unhibernate' : 'Hibernate'}
                                                    />
                                                    <div className="divider__secondary" />
                                                </>
                                            )}

                                            {window._env_.ENABLE_RESTART_WORKLOAD &&
                                                !isVirtualEnvironment &&
                                                setRotateModal && (
                                                    <>
                                                        <Button
                                                            dataTestId="app-details-rotate-pods-modal-button"
                                                            size={ComponentSizeType.medium}
                                                            variant={ButtonVariantType.secondary}
                                                            onClick={() => setRotateModal(true)}
                                                            disabled={isApprovalConfigured}
                                                            icon={<Icon name="ic-arrows-clockwise" color={null} />}
                                                            style={ButtonStyleType.neutral}
                                                            showTooltip
                                                            tooltipProps={{
                                                                content: isApprovalConfigured ? (
                                                                    <div className="flexbox-col">
                                                                        <span className="fw-6">
                                                                            Cannot restart workloads
                                                                        </span>
                                                                        <span className="fw-4 dc__word-break">
                                                                            {ACTION_DISABLED_TEXT}
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    'Restart workloads'
                                                                ),
                                                                placement: 'top',
                                                            }}
                                                            ariaLabel="restart workloads"
                                                        />
                                                        <div className="divider__secondary" />
                                                    </>
                                                )}

                                            {renderRollbackButton(true)}
                                        </div>

                                        {window._env_.FEATURE_SWAP_TRAFFIC_ENABLE &&
                                            SwapTraffic &&
                                            !!appDetails.pcoId &&
                                            !appDetails.trafficSwitched && (
                                                <SwapTraffic
                                                    appName={appDetails.appName}
                                                    envName={appDetails.environmentName}
                                                    appId={appDetails.appId}
                                                    envId={appDetails.environmentId}
                                                    pcoId={appDetails.pcoId}
                                                />
                                            )}

                                        <div className="border__primary--left w-1 h-16" />

                                        {renderAppDetailsCDButton()}

                                        <Button
                                            dataTestId="app-details-env-config-button"
                                            size={ComponentSizeType.medium}
                                            icon={<Icon name="ic-sliders-vertical" color={null} />}
                                            variant={ButtonVariantType.secondary}
                                            onClick={onClickSliderVerticalButton}
                                            component={ButtonComponentType.link}
                                            style={ButtonStyleType.neutral}
                                            ariaLabel="Go to Environment Config"
                                            linkProps={{
                                                to: isAppView
                                                    ? `${getAppComposeURL(params.appId, APP_COMPOSE_STAGE.ENV_OVERRIDE, false, false)}/${params.envId}`
                                                    : `${URLS.APPLICATION_MANAGEMENT_APPLICATION_GROUP}/${envId}/${CommonURLS.APP_CONFIG}/${appDetails?.appId}`,
                                            }}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        )
    }

    const isHibernated = ['hibernating', 'hibernated'].includes(status.toLowerCase())
    const cardLoading = useMemo(() => loadingDetails || loadingResourceTree, [loadingDetails, loadingResourceTree])

    const renderGeneratedManifestDownloadCard = (): JSX.Element => {
        if (!appDetails?.helmPackageName) {
            logExceptionToSentry(new Error('Cannot find helm package name in appDetails while downloading'))
        }

        const paramsId = {
            appId: +params.appId,
            envId: +params.envId,
            appName: appDetails?.helmPackageName || 'helm-package',
        }
        if (AppDetailsDownloadCard) {
            return <AppDetailsDownloadCard params={paramsId} />
        }
    }

    return (
        <div className="flex left w-100 column source-info-container dc__gap-16">
            {renderDevtronAppsEnvironmentSelector()}
            {loadingDetails
                ? shimmerLoaderBlocks()
                : !isdeploymentAppDeleting &&
                  environment && (
                      <div className="app-details-info-card-container flex left w-100 dc__gap-12 pb-16 dc__overflow-auto">
                          {status && (
                              <AppStatusCard
                                  // TODO: Fix and remove
                                  // @ts-ignore
                                  appDetails={appDetails}
                                  status={status}
                                  cardLoading={cardLoading}
                                  setDetailed={setDetailed}
                                  message={appStatusCardMessage}
                              />
                          )}
                          {!appMigratedFromExternalSourceAndIsNotTriggered && !loadingResourceTree && (
                              <>
                                  <IssuesCard
                                      cardLoading={cardLoading}
                                      toggleIssuesModal={toggleIssuesModal}
                                      setErrorsList={setErrorsList}
                                      setDetailed={setDetailed}
                                  />
                                  {isIsolatedEnv && (
                                      <HelmAppConfigApplyStatusCard
                                          cardLoading={cardLoading}
                                          releaseStatus={appDetails.resourceTree.releaseStatus}
                                      />
                                  )}
                              </>
                          )}
                          {isVirtualEnvironment && !isIsolatedEnv && renderGeneratedManifestDownloadCard()}
                          {!appMigratedFromExternalSourceAndIsNotTriggered && (
                              <>
                                  <DeploymentStatusCard
                                      deploymentStatusDetailsBreakdownData={deploymentStatusDetailsBreakdownData}
                                      cardLoading={cardLoading}
                                      hideDetails={
                                          appDetails?.deploymentAppType === DeploymentAppTypes.HELM || isIsolatedEnv
                                      }
                                      isVirtualEnvironment={isVirtualEnvironment}
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
                          {window._env_.FEATURE_MANAGE_TRAFFIC_ENABLE &&
                              appDetails &&
                              !isVirtualEnvironment &&
                              DeploymentStrategyCard && (
                                  <DeploymentStrategyCard
                                      appId={appDetails.appId}
                                      envId={appDetails.environmentId}
                                      appName={appDetails.appName}
                                      envName={appDetails.environmentName}
                                      renderRollbackButton={renderRollbackButton}
                                  />
                              )}
                          {!appDetails?.deploymentAppDeleteRequest &&
                              !appMigratedFromExternalSourceAndIsNotTriggered && (
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
                                          to={`${URLS.INFRASTRUCTURE_MANAGEMENT_CHART_STORE_DISCOVER}/chart/${appDetails.appStoreChartId}`}
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
