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

import React, { SyntheticEvent, useEffect, useMemo, useState } from 'react'
import { generatePath, Route, useHistory, useLocation, useParams, useRouteMatch } from 'react-router-dom'

import {
    ACTION_STATE,
    aggregateNodes,
    AppStatusModal,
    AppStatusModalTabType,
    ArtifactInfoModal,
    Button,
    DocLink,
    ErrorScreenManager,
    GenericEmptyState,
    GenericSectionErrorState,
    getAppDetailsURL,
    getAppsInfoForEnv,
    handleAnalyticsEvent,
    Icon,
    MODAL_TYPE,
    noop,
    Progressing,
    showError,
    stringComparatorBySortOrder,
    ToastManager,
    ToastVariantType,
    useAsync,
    useMainContext,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ForwardArrow } from '@Icons/ic-arrow-forward.svg'
import AppNotConfiguredIcon from '@Images/app-not-configured.png'
import noGroups from '@Images/ic-feature-deploymentgroups@3x.png'
import { URL_PARAM_MODE_TYPE } from '@Components/common/helpers/types'

import { DEPLOYMENT_STATUS_QUERY_PARAM, RESOURCES_NOT_FOUND } from '../../../../config'
import { APP_DETAILS, ERROR_EMPTY_SCREEN } from '../../../../config/constantMessaging'
import { getAppConfigStatus, getAppOtherEnvironmentMin, stopStartApp } from '../../../../services/service'
import { useAppContext } from '../../../common'
import { ClusterMetaDataBar } from '../../../common/ClusterMetaDataBar/ClusterMetaDataBar'
import { importComponentFromFELibrary } from '../../../common/helpers/Helpers'
import { AppLevelExternalLinks } from '../../../externalLinks/ExternalLinks.component'
import IndexStore from '../../../v2/appDetails/index.store'
import { EmptyK8sResourceComponent } from '../../../v2/appDetails/k8Resource/K8Resource.component'
import NodeTreeDetailTab from '../../../v2/appDetails/NodeTreeDetailTab'
import RotatePodsModal from '../../../v2/appDetails/sourceInfo/rotatePods/RotatePodsModal.component'
import SyncErrorComponent from '../../../v2/appDetails/SyncError.component'
import { TriggerUrlModal } from '../../list/TriggerUrl'
import { useGetDeploymentWindowProfileMetaData, useGetDTAppDetails, useGetExternalLinksAndTools } from '../../service'
import { AggregatedNodes, AppDetailsCDModalType } from '../../types'
import { renderCIListHeader } from '../cdDetails/utils'
import { MATERIAL_TYPE } from '../triggerView/types'
import { AppDetailProps, DetailsType, ErrorItem, HibernationModalTypes } from './appDetails.type'
import AppDetailsCDModal from './AppDetailsCDModal'
import { AppMetrics } from './AppMetrics'
import { AG_APP_DETAILS_GA_EVENTS, DA_APP_DETAILS_GA_EVENTS } from './constants'
import HibernateModal from './HibernateModal'
import IssuesListingModal from './IssuesListingModal'
import { SourceInfo } from './SourceInfo'

const VirtualAppDetailsEmptyState = importComponentFromFELibrary('VirtualAppDetailsEmptyState')
const DeploymentWindowStatusModal = importComponentFromFELibrary('DeploymentWindowStatusModal')
const DeploymentWindowConfirmationDialog = importComponentFromFELibrary('DeploymentWindowConfirmationDialog')
const processVirtualEnvironmentDeploymentData = importComponentFromFELibrary(
    'processVirtualEnvironmentDeploymentData',
    null,
    'function',
)

const ConfigDriftModal = importComponentFromFELibrary('ConfigDriftModal', null, 'function')
const ExplainWithAIButton = importComponentFromFELibrary('ExplainWithAIButton', null, 'function')

export const AppNotConfigured = ({
    image,
    title,
    subtitle,
    buttonTitle,
    isJobView,
    renderCustomButton,
}: {
    image?: any
    title?: string
    subtitle?: React.ReactNode
    buttonTitle?: string
    isJobView?: boolean
    renderCustomButton?: () => JSX.Element
}) => {
    const { appId } = useParams<{ appId: string }>()
    const { push } = useHistory()

    const handleEditApp = () => {
        getAppConfigStatus(+appId, isJobView, false)
            .then(() => {
                const url = `/${isJobView ? 'job' : 'app'}/${appId}/edit`

                push(url)
            })
            .catch(noop)
    }

    const renderButton = () =>
        appId && (
            <Button
                dataTestId="app-details-empty"
                text={buttonTitle || 'Go to app configurations'}
                onClick={handleEditApp}
                endIcon={<ForwardArrow />}
            />
        )

    return (
        <GenericEmptyState
            image={image || AppNotConfiguredIcon}
            title={title || 'Finish configuring this application'}
            subTitle={
                subtitle || (
                    <>
                        {APP_DETAILS.APP_FULLY_NOT_CONFIGURED}&nbsp;
                        <DocLink
                            fullWidth
                            text={APP_DETAILS.NEED_HELP}
                            docLinkKey="APP_CREATE"
                            dataTestId="app-details-empty"
                        />
                    </>
                )
            }
            isButtonAvailable
            renderButton={renderCustomButton ?? renderButton}
        />
    )
}

const Details: React.FC<DetailsType> = ({
    environment,
    environments,
    isAppView,
    applications,
    appDetailsQueryData,
}) => {
    const params = useParams<{ appId: string; envId: string }>()
    const location = useLocation()
    const { replace, push } = useHistory()
    const { path, url } = useRouteMatch()

    const { setAIAgentContext } = useMainContext()

    const {
        appDetails,
        isFetchingAppDetails,
        isFetchingResourceTree,
        appDetailsQueryStatus,
        resourceTreeQueryStatus,
        refetchAppDetails,
        refetchResourceTree,
        appDetailsError,
        resourceTreeError,
    } = appDetailsQueryData

    useEffect(() => {
        setAIAgentContext({
            path,
            context: {
                ...params,
                environmentName: appDetails?.environmentName ?? '',
                appName: appDetails?.appName ?? '',
            },
        })
    }, [appDetails?.environmentName, appDetails?.appName, url])

    const [showCommitInfo, setShowCommitInfo] = useState<boolean>(false)
    const [showAppStatusModal, setShowAppStatusModal] = useState<boolean>(false)
    const [urlInfo, setUrlInfo] = useState<boolean>(false)
    const [hibernateConfirmationModal, setHibernateConfirmationModal] = useState<HibernationModalTypes>(null)
    const [rotateModal, setRotateModal] = useState<boolean>(false)
    const [hibernating, setHibernating] = useState<boolean>(false)
    const [showIssuesModal, toggleIssuesModal] = useState<boolean>(false)
    const [errorsList, setErrorsList] = useState<ErrorItem[]>([])
    const [CDModalMaterialType, setCDModalMaterialType] = useState<AppDetailsCDModalType['materialType']>(null)
    const [hibernationPatchChartName, setHibernationPatchChartName] = useState<string>('')

    const { data: externalLinksAndTools = { externalLinks: [], monitoringTools: [] } } = useGetExternalLinksAndTools(
        params.appId,
        appDetails?.clusterId,
    )

    const {
        data: deploymentWindowProfileMetaData = {
            isDeploymentBlocked: false,
            userActionState: ACTION_STATE.ALLOWED,
        },
    } = useGetDeploymentWindowProfileMetaData(params.appId, params.envId)

    const { userActionState, isDeploymentBlocked } = deploymentWindowProfileMetaData

    const isVirtualEnvironment = appDetails?.isVirtualEnvironment || false
    const isDeploymentAppDeleting = appDetails?.deploymentAppDeleteRequest || false
    const isConfigDriftEnabled: boolean = window._env_.FEATURE_CONFIG_DRIFT_ENABLE && !!ConfigDriftModal
    const isExternalToolAvailable: boolean =
        externalLinksAndTools.externalLinks.length > 0 && externalLinksAndTools.monitoringTools.length > 0
    const aggregatedNodes: AggregatedNodes = useMemo(
        () => aggregateNodes(appDetails?.resourceTree?.nodes || [], appDetails?.resourceTree?.podMetadata || []),
        [appDetails],
    )

    const showAppDetailsLoading =
        appDetailsQueryStatus === 'loading' ||
        (appDetailsQueryStatus === 'error' && !appDetails && isFetchingAppDetails)

    const showLoadingResourceTree =
        showAppDetailsLoading ||
        (appDetails?.isPipelineTriggered
            ? resourceTreeQueryStatus === 'loading' ||
              (resourceTreeQueryStatus === 'error' && !appDetails?.resourceTree && isFetchingResourceTree)
            : false)

    useEffect(
        () => () => {
            IndexStore.clearAppDetails()
        },
        [],
    )

    const handleHibernate = async () => {
        try {
            setHibernating(true)
            const isUnHibernateReq = ['hibernating', 'hibernated'].includes(
                appDetails.resourceTree.status.toLowerCase(),
            )
            await stopStartApp(Number(params.appId), Number(params.envId), isUnHibernateReq ? 'START' : 'STOP')
            refetchAppDetails()
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: isUnHibernateReq ? 'Pods restore initiated' : 'Pods scale down initiated',
            })
        } catch (err) {
            showError(err)
        } finally {
            setHibernating(false)
            setHibernateConfirmationModal(null)
        }
    }

    const handleCloseAppStatusModal = (): void => {
        if (showAppStatusModal) {
            setShowAppStatusModal(false)
        }

        if (location.search.includes(DEPLOYMENT_STATUS_QUERY_PARAM)) {
            replace({
                search: '',
            })
        }
    }

    const showApplicationDetailedModal = (): void => {
        setShowAppStatusModal(true)
    }

    const handleOpenCDModal = (isForRollback?: boolean) => () => {
        push({
            search: new URLSearchParams({
                mode: URL_PARAM_MODE_TYPE.LIST,
            }).toString(),
        })
        setCDModalMaterialType(isForRollback ? MATERIAL_TYPE.rollbackMaterialList : MATERIAL_TYPE.inputMaterialList)

        if (isForRollback) {
            handleAnalyticsEvent(
                isAppView
                    ? DA_APP_DETAILS_GA_EVENTS.RollbackButtonClicked
                    : AG_APP_DETAILS_GA_EVENTS.RollbackButtonClicked,
            )
            return
        }
        handleAnalyticsEvent(
            isAppView ? DA_APP_DETAILS_GA_EVENTS.DeployButtonClicked : AG_APP_DETAILS_GA_EVENTS.DeployButtonClicked,
        )
    }

    const handleCloseCDModal = () => {
        setCDModalMaterialType(null)
        push({ search: '' })
    }

    const renderSelectImageButton = () => (
        <Button
            dataTestId="select-image-to-deploy"
            startIcon={<Icon name="ic-hand-pointing" color={null} />}
            text="Select Image to deploy"
            onClick={handleOpenCDModal()}
        />
    )

    const renderCDModal = () =>
        appDetails &&
        CDModalMaterialType && (
            <AppDetailsCDModal
                appId={appDetails.appId}
                environmentId={appDetails.environmentId}
                environmentName={appDetails.environmentName}
                isVirtualEnvironment={isVirtualEnvironment}
                appName={appDetails.appName}
                deploymentAppType={appDetails.deploymentAppType}
                cdModal={{
                    cdPipelineId: appDetails?.cdPipelineId,
                    ciPipelineId: appDetails?.ciPipelineId,
                    parentEnvironmentName: appDetails?.parentEnvironmentName,
                    deploymentUserActionState: userActionState,
                    triggerType: appDetails?.triggerType,
                }}
                handleSuccess={refetchAppDetails}
                materialType={CDModalMaterialType}
                closeCDModal={handleCloseCDModal}
            />
        )

    const renderResourceTree = (): JSX.Element => {
        if (appDetails && !appDetails.isPipelineTriggered) {
            return null
        }

        if (showLoadingResourceTree) {
            return (
                <div className="bg__primary h-100">
                    <Progressing pageLoader fullHeight size={32} fillColor="var(--N500)" />
                </div>
            )
        }

        if (String(resourceTreeError?.errors?.[0]?.code) === '7000')
            return (
                <>
                    <div className="mt-16 mb-9">
                        <SyncErrorComponent showApplicationDetailedModal={showApplicationDetailedModal} />
                    </div>
                    <EmptyK8sResourceComponent emptyStateMessage={RESOURCES_NOT_FOUND} />
                </>
            )

        const showResourceTreeError = resourceTreeQueryStatus === 'error' && !appDetails?.resourceTree
        if (showResourceTreeError) {
            return <GenericSectionErrorState title="Unable to fetch" reload={refetchResourceTree} />
        }

        if (!appDetails.resourceTree && appDetails.isVirtualEnvironment && VirtualAppDetailsEmptyState) {
            return <VirtualAppDetailsEmptyState environmentName={appDetails.environmentName} />
        }
        return (
            <NodeTreeDetailTab
                appDetails={appDetails}
                externalLinks={externalLinksAndTools.externalLinks}
                monitoringTools={externalLinksAndTools.monitoringTools}
                isDevtronApp
                isDeploymentBlocked={isDeploymentBlocked}
                isVirtualEnvironment={appDetails.isVirtualEnvironment}
                handleReloadResourceTree={refetchResourceTree}
                isReloadResourceTreeInProgress={isFetchingResourceTree}
            />
        )
    }

    const handleHibernateConfirmationModalClose = (e?: SyntheticEvent) => {
        e?.stopPropagation()
        setHibernateConfirmationModal(null)
    }

    const renderHibernateModal = (): JSX.Element => {
        if (hibernateConfirmationModal && isDeploymentBlocked && DeploymentWindowConfirmationDialog) {
            return (
                <DeploymentWindowConfirmationDialog
                    onClose={handleHibernateConfirmationModalClose}
                    isLoading={hibernating}
                    type={hibernateConfirmationModal === 'hibernate' ? MODAL_TYPE.HIBERNATE : MODAL_TYPE.UNHIBERNATE}
                    onClickActionButton={handleHibernate}
                    appName={appDetails.appName}
                    envName={appDetails.environmentName}
                    appId={params.appId}
                    envId={params.envId}
                />
            )
        }

        return (
            <HibernateModal
                appName={appDetails.appName}
                envName={appDetails.environmentName}
                hibernating={hibernating}
                handleHibernate={handleHibernate}
                chartName={hibernationPatchChartName}
                hibernateConfirmationModal={hibernateConfirmationModal}
                handleHibernateConfirmationModalClose={handleHibernateConfirmationModalClose}
            />
        )
    }

    const onClickRotatePodClose = () => {
        setRotateModal(false)
    }

    const renderRestartWorkload = () => (
        <RotatePodsModal
            onClose={onClickRotatePodClose}
            callAppDetailsAPI={refetchAppDetails}
            isDeploymentBlocked={isDeploymentBlocked}
        />
    )

    const renderSelectImageState = () => (
        <AppNotConfigured
            image={noGroups}
            title={ERROR_EMPTY_SCREEN.ALL_SET_GO_CONFIGURE}
            subtitle={ERROR_EMPTY_SCREEN.DEPLOYEMENT_WILL_BE_HERE}
            renderCustomButton={renderSelectImageButton}
        />
    )

    if (appDetailsQueryStatus === 'error' && !appDetails) {
        return <ErrorScreenManager code={appDetailsError?.code} reload={refetchAppDetails} />
    }

    return (
        <>
            <div className={`w-100 dc__gap-16 ${isDeploymentAppDeleting ? 'app-info-bg' : 'app-info-bg-gradient'}`}>
                <SourceInfo
                    appDetails={appDetails}
                    setDetailed={setShowAppStatusModal}
                    environment={environment}
                    isAppView={isAppView}
                    environments={environments}
                    showCommitInfo={setShowCommitInfo}
                    showUrlInfo={setUrlInfo}
                    showHibernateModal={setHibernateConfirmationModal}
                    isVirtualEnvironment={appDetails?.isVirtualEnvironment || false}
                    setRotateModal={setRotateModal}
                    loadingDetails={showAppDetailsLoading}
                    loadingResourceTree={showLoadingResourceTree}
                    toggleIssuesModal={toggleIssuesModal}
                    envId={appDetails?.environmentId}
                    ciArtifactId={appDetails?.ciArtifactId}
                    setErrorsList={setErrorsList}
                    deploymentUserActionState={userActionState}
                    setHibernationPatchChartName={setHibernationPatchChartName}
                    applications={applications}
                    handleOpenCDModal={handleOpenCDModal}
                />
            </div>
            {!showAppDetailsLoading && appDetails && !appDetails.isPipelineTriggered ? (
                renderSelectImageState()
            ) : (
                <>
                    {!showAppDetailsLoading && !showLoadingResourceTree && !appDetails?.deploymentAppDeleteRequest && (
                        <>
                            {environment && !isVirtualEnvironment && (
                                <AppMetrics
                                    appName={appDetails.appName}
                                    addExtraSpace={!isExternalToolAvailable}
                                    environment={environment}
                                    podMap={aggregatedNodes.nodes.Pod}
                                    k8sVersion={appDetails.k8sVersion}
                                />
                            )}
                            {isExternalToolAvailable && (
                                <AppLevelExternalLinks
                                    appDetails={appDetails}
                                    externalLinks={externalLinksAndTools.externalLinks}
                                    monitoringTools={externalLinksAndTools.monitoringTools}
                                />
                            )}
                        </>
                    )}
                    {renderResourceTree()}
                </>
            )}
            {(showAppStatusModal || (appDetails && location.search.includes(DEPLOYMENT_STATUS_QUERY_PARAM))) && (
                <AppStatusModal
                    titleSegments={[appDetails.appName, appDetails.environmentName]}
                    handleClose={handleCloseAppStatusModal}
                    type="devtron-app"
                    appDetails={appDetails}
                    isConfigDriftEnabled={isConfigDriftEnabled}
                    configDriftModal={ConfigDriftModal}
                    initialTab={
                        showAppStatusModal ? AppStatusModalTabType.APP_STATUS : AppStatusModalTabType.DEPLOYMENT_STATUS
                    }
                    processVirtualEnvironmentDeploymentData={processVirtualEnvironmentDeploymentData}
                    updateDeploymentStatusDetailsBreakdownData={noop}
                    debugWithAIButton={ExplainWithAIButton}
                />
            )}
            {location.search.includes('deployment-window-status') && DeploymentWindowStatusModal && (
                <DeploymentWindowStatusModal envId={params.envId} appId={params.appId} />
            )}
            {showIssuesModal && (
                <IssuesListingModal errorsList={errorsList} closeIssuesListingModal={() => toggleIssuesModal(false)} />
            )}
            {urlInfo && (
                <TriggerUrlModal
                    appId={params.appId}
                    envId={params.envId}
                    appType={appDetails.appType}
                    close={() => setUrlInfo(false)}
                />
            )}
            {showCommitInfo && (
                <ArtifactInfoModal
                    envId={appDetails?.environmentId}
                    ciArtifactId={appDetails?.ciArtifactId}
                    handleClose={() => setShowCommitInfo(false)}
                    renderCIListHeader={renderCIListHeader}
                />
            )}
            {appDetails && !!hibernateConfirmationModal && renderHibernateModal()}
            {rotateModal && renderRestartWorkload()}
            {renderCDModal()}
        </>
    )
}

const AppDetail = ({ detailsType, filteredResourceIds, resourceList, setSelectedResourceList }: AppDetailProps) => {
    const params = useParams<{ appId: string; envId: string }>()
    const { replace } = useHistory()
    const { path } = useRouteMatch()
    const { environmentId, setEnvironmentId } = useAppContext() // global state for app to synchronise environments

    const isAppView = detailsType === 'app'

    const [otherEnvsLoading, otherEnvsResult] = useAsync(
        () => getAppOtherEnvironmentMin(params.appId, false),
        [params.appId],
        !!params.appId,
    )

    const [otherAppsLoading, otherAppsResult] = useAsync(
        () => getAppsInfoForEnv({ envId: +params.envId }),
        [params.envId],
        !!params.envId && !isAppView,
    )

    const filteredEntityMap = filteredResourceIds?.split(',').reduce((agg, curr) => agg.set(+curr, true), new Map())

    const envList = useMemo(
        () =>
            (otherEnvsResult?.result ?? [])
                .filter((env) => !isAppView || !filteredEntityMap || filteredEntityMap.get(env.environmentId))
                .sort((a, b) => stringComparatorBySortOrder(a.environmentName, b.environmentName)),
        [filteredResourceIds, otherEnvsResult],
    )

    const appList = useMemo(
        () =>
            (otherAppsResult?.apps ?? [])
                .filter((app) => !filteredEntityMap || filteredEntityMap.get(app.appId))
                .sort((a, b) => stringComparatorBySortOrder(a.appName, b.appName)),
        [filteredResourceIds, otherAppsResult],
    )

    const environment = useMemo(
        () => envList.find((env) => env.environmentId === +params.envId),
        [envList, params.envId],
    )

    useEffect(() => {
        if (isAppView) {
            if (!otherEnvsResult) {
                return
            }
            const userDefinedEnvId = +params.envId || environmentId
            const selectedEnvId =
                userDefinedEnvId && envList.some((env) => env.environmentId === userDefinedEnvId)
                    ? userDefinedEnvId
                    : envList[0]?.environmentId

            if (envList.length && selectedEnvId && selectedEnvId !== +params.envId) {
                const newUrl = getAppDetailsURL(params.appId, selectedEnvId)
                replace(newUrl)
                return
            }
            return
        }

        if (!otherAppsResult) {
            return
        }

        const selectedAppId =
            +params.appId && appList.some((app) => app.appId === +params.appId) ? +params.appId : appList[0]?.appId

        if (appList.length && selectedAppId !== +params.appId) {
            const newUrl = generatePath(path, { appId: selectedAppId, envId: params.envId })
            replace(newUrl)
        }
    }, [filteredResourceIds, otherEnvsResult, otherAppsResult])

    const appDetailsQueryData = useGetDTAppDetails({ appId: params.appId, envId: params.envId })
    const { appDetails } = appDetailsQueryData

    const isVirtualEnvironment = appDetails?.isVirtualEnvironment || false

    useEffect(() => {
        if (!params.envId || !params.appId) {
            return
        }
        // Setting environmentId in app context only in case of app details and not env details
        if (isAppView) {
            setEnvironmentId(Number(params.envId))
        }

        // Add option in selected filters temporarilty without adding to local storage, if not already present
        if (resourceList?.length) {
            const secondaryResourceId = isAppView ? Number(params.envId) : Number(params.appId)
            const optionToAdd = resourceList.find((resource) => resource.value === String(secondaryResourceId))
            if (optionToAdd && filteredEntityMap && !filteredEntityMap.get(secondaryResourceId)) {
                setSelectedResourceList((prev) => [...prev, optionToAdd])
            }
        }
    }, [params.appId, params.envId, resourceList])

    const renderSelectEnvState = () => (
        <>
            <SourceInfo appDetails={null} environments={envList} environment={environment} isAppView />
            <GenericEmptyState image={AppNotConfiguredIcon} title="Please select an environment to view app details" />
        </>
    )

    const renderDetails = () => {
        if (isAppView && !params.envId) {
            if (otherEnvsLoading) {
                return <Progressing pageLoader />
            }

            const otherEnvsExist = otherEnvsResult && envList.length > 0

            return otherEnvsExist ? renderSelectEnvState() : <AppNotConfigured />
        }

        if (!isAppView && !params.appId && otherAppsLoading) {
            return <Progressing pageLoader />
        }

        return (
            <Route path={`${path.replace(':envId(\\d+)?', ':envId(\\d+)')}`}>
                <Details
                    key={`${params.appId}-${params.envId}`}
                    environment={environment}
                    environments={envList}
                    applications={appList}
                    isAppView={isAppView}
                    appDetailsQueryData={appDetailsQueryData}
                />
            </Route>
        )
    }

    return (
        <>
            <div className="dc__overflow-hidden flex-grow-1 flexbox-col dc__position-rel">
                <div
                    data-testid="app-details-wrapper"
                    className="app-details-page-wrapper flex-grow-1 dc__overflow-auto mw-none"
                >
                    {renderDetails()}
                </div>
            </div>
            <ClusterMetaDataBar
                clusterName={appDetails?.clusterName}
                namespace={appDetails?.namespace}
                clusterId={appDetails?.clusterId}
                isVirtualEnvironment={isVirtualEnvironment}
            />
        </>
    )
}

export default AppDetail
