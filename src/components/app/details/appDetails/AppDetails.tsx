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

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import {
    showError,
    Progressing,
    ConfirmationDialog,
    noop,
    stopPropagation,
    multiSelectStyles,
    useEffectAfterMount,
    DeploymentAppTypes,
    useSearchString,
    useAsync,
    MODAL_TYPE,
    ACTION_STATE,
    processDeploymentStatusDetailsData,
    aggregateNodes,
    ArtifactInfoModal,
    ReleaseMode,
    ToastVariantType,
    ToastManager,
    SelectPicker,
} from '@devtron-labs/devtron-fe-common-lib'
import { Link, useParams, useHistory, useRouteMatch, generatePath, Route, useLocation } from 'react-router-dom'
import Tippy from '@tippyjs/react'
import Select from 'react-select'
import { fetchAppDetailsInTime, fetchResourceTreeInTime } from '../../service'
import {
    URLS,
    getAppDetailsURL,
    getAppTriggerURL,
    DOCUMENTATION,
    DEFAULT_STATUS,
    DEPLOYMENT_STATUS_QUERY_PARAM,
    DEPLOYMENT_STATUS,
    HELM_DEPLOYMENT_STATUS_TEXT,
    RESOURCES_NOT_FOUND,
    DEFAULT_STATUS_TEXT,
} from '../../../../config'
import { NavigationArrow, useAppContext, FragmentHOC } from '../../../common'
import { CustomValueContainer, groupHeaderStyle, GroupHeading, Option } from '../../../v2/common/ReactSelect.utils'
import { getAppConfigStatus, getAppOtherEnvironmentMin, stopStartApp } from '../../../../services/service'
// @ts-check
import AppNotDeployedIcon from '../../../../assets/img/app-not-deployed.png'
import AppNotConfiguredIcon from '../../../../assets/img/app-not-configured.png'
import restoreIcon from '../../../../assets/icons/ic-restore.svg'
import warningIcon from '../../../../assets/icons/ic-warning.svg'
import { ReactComponent as PlayButton } from '../../../../assets/icons/ic-play.svg'
import { ReactComponent as Connect } from '../../../../assets/icons/ic-connected.svg'
import { ReactComponent as Disconnect } from '../../../../assets/icons/ic-disconnected.svg'
import { ReactComponent as Abort } from '../../../../assets/icons/ic-abort.svg'
import { ReactComponent as StopButton } from '../../../../assets/icons/ic-stop.svg'
import { ReactComponent as ForwardArrow } from '../../../../assets/icons/ic-arrow-forward.svg'

import { SourceInfo } from './SourceInfo'
import { Application, Nodes, AggregatedNodes, NodeDetailTabs } from '../../types'
import {
    getSelectedNodeItems,
    getPodNameSuffix,
    ValueContainer,
    NoParamsNoEnvContext,
    NoParamsWithEnvContext,
    ParamsNoEnvContext,
    ParamsAndEnvContext,
} from './utils'
import { AppMetrics } from './AppMetrics'
import IndexStore from '../../../v2/appDetails/index.store'
import {
    importComponentFromFELibrary,
    sortObjectArrayAlphabetically,
    sortOptionsByValue,
} from '../../../common/helpers/Helpers'
import { AppLevelExternalLinks } from '../../../externalLinks/ExternalLinks.component'
import { getExternalLinks } from '../../../externalLinks/ExternalLinks.service'
import { ExternalLinkIdentifierType, ExternalLinksAndToolsType } from '../../../externalLinks/ExternalLinks.type'
import { sortByUpdatedOn } from '../../../externalLinks/ExternalLinks.utils'
import NodeTreeDetailTab from '../../../v2/appDetails/NodeTreeDetailTab'
import noGroups from '../../../../assets/img/ic-feature-deploymentgroups@3x.png'
import { AppType, EnvType } from '../../../v2/appDetails/appDetails.type'
import DeploymentStatusDetailModal from './DeploymentStatusDetailModal'
import { getDeploymentStatusDetail } from './appDetails.service'
import {
    DeletedAppComponentType,
    DeploymentStatusDetailsBreakdownDataType,
    DeploymentStatusDetailsType,
    DetailsType,
    ErrorItem,
    NodeSelectorsType,
} from './appDetails.type'
import { TriggerUrlModal } from '../../list/TriggerUrl'
import AppStatusDetailModal from '../../../v2/appDetails/sourceInfo/environmentStatus/AppStatusDetailModal'
import SyncErrorComponent from '../../../v2/appDetails/SyncError.component'
import { AppDetailsEmptyState } from '../../../common/AppDetailsEmptyState'
import { APP_DETAILS, ERROR_EMPTY_SCREEN } from '../../../../config/constantMessaging'
import { EmptyK8sResourceComponent } from '../../../v2/appDetails/k8Resource/K8Resource.component'
import RotatePodsModal from '../../../v2/appDetails/sourceInfo/rotatePods/RotatePodsModal.component'
import IssuesListingModal from './IssuesListingModal'
import { ClusterMetaDataBar } from '../../../common/ClusterMetaDataBar/ClusterMetaDataBar'
import { renderCIListHeader } from '../cdDetails/utils'

const VirtualAppDetailsEmptyState = importComponentFromFELibrary('VirtualAppDetailsEmptyState')
const DeploymentWindowStatusModal = importComponentFromFELibrary('DeploymentWindowStatusModal')
const DeploymentWindowConfirmationDialog = importComponentFromFELibrary('DeploymentWindowConfirmationDialog')
const ConfigDriftModalRoute = importComponentFromFELibrary('ConfigDriftModalRoute', null, 'function')
const processVirtualEnvironmentDeploymentData = importComponentFromFELibrary(
    'processVirtualEnvironmentDeploymentData',
    null,
    'function',
)
let deploymentStatusTimer = null
let appDetailsIntervalID = null
const getDeploymentWindowProfileMetaData = importComponentFromFELibrary(
    'getDeploymentWindowProfileMetaData',
    null,
    'function',
)

export default function AppDetail({ filteredEnvIds }: { filteredEnvIds?: string }) {
    const params = useParams<{ appId: string; envId?: string }>()
    const { push } = useHistory()
    const { path } = useRouteMatch()
    const { environmentId, setEnvironmentId } = useAppContext() // global state for app to synchronise environments
    const [isAppDeleted, setIsAppDeleted] = useState(false)
    const [otherEnvsLoading, otherEnvsResult] = useAsync(() => getAppOtherEnvironmentMin(params.appId), [params.appId])
    const [commitInfo, showCommitInfo] = useState<boolean>(false)
    const [deploymentUserActionState, setDeploymentUserActionState] = useState<ACTION_STATE>(ACTION_STATE.ALLOWED)
    const isVirtualEnvRef = useRef(false)
    const [showDeploymentWindowConfirmation, setShowDeploymentWindowConfirmation] = useState(false)

    const envList = useMemo(() => {
        if (otherEnvsResult?.result?.length > 0) {
            const filteredEnvMap = filteredEnvIds?.split(',').reduce((agg, curr) => agg.set(+curr, true), new Map())
            const _envList =
                otherEnvsResult.result
                    .filter((env) => !filteredEnvMap || filteredEnvMap.get(env.environmentId))
                    ?.sort((a, b) => (a.environmentName > b.environmentName ? 1 : -1)) || []

            if (_envList.length > 0) {
                let selector
                if (!params.envId && !environmentId) {
                    selector = new NoParamsNoEnvContext()
                } else if (!params.envId && environmentId) {
                    selector = new NoParamsWithEnvContext()
                } else if (params.envId && !environmentId) {
                    selector = new ParamsNoEnvContext()
                } else if (params.envId && environmentId) {
                    selector = new ParamsAndEnvContext()
                }

                const selectedEnvId = selector.resolveEnvironmentId(params, environmentId, _envList, setEnvironmentId)

                // Set the URL and push to navigation stack
                if (selectedEnvId) {
                    if (String(selectedEnvId) !== String(params.envId)) {
                        const newUrl = getAppDetailsURL(params.appId, selectedEnvId)
                        push(newUrl)
                    }
                } else {
                    setEnvironmentId(null)
                }
            } else {
                setEnvironmentId(null)
            }
            // Return the filtered and sorted environment list
            return _envList
        }
        return []
    }, [filteredEnvIds, otherEnvsResult])

    useEffect(() => {
        if (!params.envId) {
            return
        }
        setEnvironmentId(Number(params.envId))
        setIsAppDeleted(false)
        if (getDeploymentWindowProfileMetaData) {
            getDeploymentWindowProfileMetaData(params.appId, params.envId).then(({ userActionState }) => {
                setDeploymentUserActionState(userActionState)
                if (userActionState && userActionState !== ACTION_STATE.ALLOWED) {
                    setShowDeploymentWindowConfirmation(true)
                } else {
                    setShowDeploymentWindowConfirmation(false)
                }
            })
        }
    }, [params.envId])

    const renderAppNotConfigured = () => {
        return (
            otherEnvsResult &&
            !otherEnvsLoading && (
                <>
                    {envList.length === 0 && !isAppDeleted && !isVirtualEnvRef.current && <AppNotConfigured />}
                    {!params.envId && envList.length > 0 && !isVirtualEnvRef.current && (
                        <EnvironmentNotConfigured environments={envList} />
                    )}
                </>
            )
        )
    }

    const environment = useMemo(() => {
        return envList.find((env) => env.environmentId === +params.envId)
    }, [envList, params.envId])

    return (
        <div data-testid="app-details-wrapper" className="app-details-page-wrapper">
            {!params.envId && envList.length > 0 && (
                <div className="w-100 pt-16 pr-20 pb-20 pl-20">
                    <SourceInfo
                        appDetails={null}
                        environments={envList}
                        environment={environment}
                        refetchDeploymentStatus={noop}
                    />
                </div>
            )}
            {!params.envId && otherEnvsLoading && <Progressing pageLoader fullHeight />}
            <Route path={`${path.replace(':envId(\\d+)?', ':envId(\\d+)')}`}>
                <Details
                    key={`${params.appId}-${params.envId}`}
                    appDetailsAPI={fetchAppDetailsInTime}
                    isAppDeployment
                    environment={environment}
                    environments={envList}
                    setIsAppDeleted={setIsAppDeleted}
                    commitInfo={commitInfo}
                    showCommitInfo={showCommitInfo}
                    isAppDeleted={isAppDeleted}
                    isVirtualEnvRef={isVirtualEnvRef}
                    isDeploymentBlocked={showDeploymentWindowConfirmation}
                    filteredEnvIds={filteredEnvIds}
                    deploymentUserActionState={deploymentUserActionState}
                />
            </Route>
            {otherEnvsResult && !otherEnvsLoading && !isVirtualEnvRef.current && renderAppNotConfigured()}
        </div>
    )
}

export const Details: React.FC<DetailsType> = ({
    appDetailsAPI,
    setAppDetailResultInParent,
    environment,
    isAppDeployment = false,
    environments,
    isPollingRequired = true,
    setIsAppDeleted,
    commitInfo,
    showCommitInfo,
    isAppDeleted,
    isVirtualEnvRef,
    isDeploymentBlocked,
    deploymentUserActionState,
}) => {
    const params = useParams<{ appId: string; envId: string }>()
    const { path } = useRouteMatch()
    const location = useLocation()
    // fixme: the state is not being set anywhere and just being drilled down
    const [detailedStatus, toggleDetailedStatus] = useState<boolean>(false)
    const [resourceTreeFetchTimeOut, setResourceTreeFetchTimeOut] = useState<boolean>(false)
    const [urlInfo, setUrlInfo] = useState<boolean>(false)
    const [hibernateConfirmationModal, setHibernateConfirmationModal] = useState<'' | 'resume' | 'hibernate'>('')
    const [rotateModal, setRotateModal] = useState<boolean>(false)
    const [hibernating, setHibernating] = useState<boolean>(false)
    const [showIssuesModal, toggleIssuesModal] = useState<boolean>(false)
    const [appDetailsError, setAppDetailsError] = useState(undefined)
    const [appDetails, setAppDetails] = useState(undefined)
    const [externalLinksAndTools, setExternalLinksAndTools] = useState<ExternalLinksAndToolsType>({
        externalLinks: [],
        monitoringTools: [],
    })
    const [loadingDetails, setLoadingDetails] = useState(true)
    const [loadingResourceTree, setLoadingResourceTree] = useState(true)
    // State to track the loading state for the timeline data when the detailed status modal opens
    const [isInitialTimelineDataLoading, setIsInitialTimelineDataLoading] = useState(true)
    const [errorsList, setErrorsList] = useState<ErrorItem[]>([])
    const appDetailsRef = useRef(null)
    const appDetailsRequestRef = useRef(null)
    const { envId } = useParams<{ appId: string; envId?: string }>()
    const pollResourceTreeRef = useRef(true)
    const appDetailsAbortRef = useRef(null)
    const shouldFetchTimelineRef = useRef(false)

    const [deploymentStatusDetailsBreakdownData, setDeploymentStatusDetailsBreakdownData] =
        useState<DeploymentStatusDetailsBreakdownDataType>({
            ...(isVirtualEnvRef.current && processVirtualEnvironmentDeploymentData
                ? processVirtualEnvironmentDeploymentData()
                : processDeploymentStatusDetailsData()),
            deploymentStatus: DEFAULT_STATUS,
            deploymentStatusText: DEFAULT_STATUS_TEXT,
        })
    const isExternalToolAvailable: boolean =
        externalLinksAndTools.externalLinks.length > 0 && externalLinksAndTools.monitoringTools.length > 0
    const interval = Number(window._env_.DEVTRON_APP_DETAILS_POLLING_INTERVAL) || 30000
    appDetailsRequestRef.current = appDetails?.deploymentAppDeleteRequest

    const aggregatedNodes: AggregatedNodes = useMemo(() => {
        return aggregateNodes(appDetails?.resourceTree?.nodes || [], appDetails?.resourceTree?.podMetadata || [])
    }, [appDetails])

    useEffect(() => {
        const isModalOpen = location.search.includes(DEPLOYMENT_STATUS_QUERY_PARAM)
        // Reset the loading state when the modal is closed
        if (shouldFetchTimelineRef.current && !isModalOpen) {
            setIsInitialTimelineDataLoading(true)
        }
        // The timeline should be fetched by default if the modal is open
        shouldFetchTimelineRef.current = isModalOpen
    }, [location.search])

    const clearDeploymentStatusTimer = useCallback((): void => {
        if (deploymentStatusTimer) {
            clearTimeout(deploymentStatusTimer)
        }
    }, [deploymentStatusTimer])

    const processDeploymentStatusData = useCallback(
        (deploymentStatusDetailRes: DeploymentStatusDetailsType): void => {
            const processedDeploymentStatusDetailsData =
                isVirtualEnvRef.current && processVirtualEnvironmentDeploymentData
                    ? processVirtualEnvironmentDeploymentData(deploymentStatusDetailRes)
                    : processDeploymentStatusDetailsData(deploymentStatusDetailRes)

            clearDeploymentStatusTimer()

            if (processedDeploymentStatusDetailsData.deploymentStatus === DEPLOYMENT_STATUS.INPROGRESS) {
                deploymentStatusTimer = setTimeout(() => {
                    getDeploymentDetailStepsData()
                }, 10000)
            }

            setDeploymentStatusDetailsBreakdownData(processedDeploymentStatusDetailsData)
        },
        [
            isVirtualEnvRef,
            processVirtualEnvironmentDeploymentData,
            processDeploymentStatusDetailsData,
            clearDeploymentStatusTimer,
            DEPLOYMENT_STATUS,
            setDeploymentStatusDetailsBreakdownData,
        ],
    )

    // This is called only when timeline modal is open
    const getDeploymentDetailStepsData = useCallback(
        (showTimeline?: boolean): void => {
            const shouldFetchTimeline = showTimeline ?? shouldFetchTimelineRef.current

            // Deployments status details for Devtron apps
            getDeploymentStatusDetail(params.appId, params.envId, shouldFetchTimeline).then(
                (deploymentStatusDetailRes) => {
                    processDeploymentStatusData(deploymentStatusDetailRes.result)
                    // Update the loading status if the modal is open
                    if (shouldFetchTimeline) {
                        setIsInitialTimelineDataLoading(false)
                    }
                },
            )
        },
        [
            params.appId,
            params.envId,
            shouldFetchTimelineRef.current,
            getDeploymentStatusDetail,
            processDeploymentStatusData,
        ],
    )

    useEffect(() => {
        appDetailsAbortRef.current = new AbortController()
        return () => {
            appDetailsAbortRef.current.abort()
        }
    }, [params.envId])

    const handleAppDetailsCallError = (error) => {
        if (error['code'] === 404 || appDetailsRequestRef.current) {
            if (setIsAppDeleted) {
                setIsAppDeleted(true)
            }
            if (error['code'] === 408) {
                setResourceTreeFetchTimeOut(true)
            } else {
                setResourceTreeFetchTimeOut(false)
                setAppDetails(null)
            }
            clearPollingInterval()
        } else if (!appDetails) {
            setAppDetailsError(error)
        }
    }

    async function callAppDetailsAPI(fetchExternalLinks?: boolean) {
        appDetailsAPI(params.appId, params.envId, interval - 5000, appDetailsAbortRef.current.signal)
            .then(async (response) => {
                isVirtualEnvRef.current = response.result?.isVirtualEnvironment
                // This means the CD is not triggered and the app is not helm migrated i.e. Empty State
                if (
                    !response.result.isPipelineTriggered &&
                    response.result.releaseMode === ReleaseMode.NEW_DEPLOYMENT
                ) {
                    setResourceTreeFetchTimeOut(false)
                    setLoadingResourceTree(false)
                    setAppDetails(null)
                    pollResourceTreeRef.current = false
                    return
                }
                appDetailsRef.current = {
                    ...appDetailsRef.current,
                    ...response.result,
                }
                IndexStore.publishAppDetails(appDetailsRef.current, AppType.DEVTRON_APP)
                setAppDetails(appDetailsRef.current)

                if (fetchExternalLinks && response.result?.clusterId) {
                    getExternalLinksAndTools(response.result.clusterId)
                }
                pollResourceTreeRef.current = true

                if (pollResourceTreeRef.current) {
                    // Need to wait for the resource tree to check if the env is isolated or not
                    await fetchResourceTree()
                }

                const isIsolatedEnv = isVirtualEnvRef.current && !!appDetailsRef.current.resourceTree

                _getDeploymentStatusDetail(
                    appDetailsRef.current.deploymentAppType,
                    isIsolatedEnv,
                    isIsolatedEnv ? appDetailsRef.current?.resourceTree?.wfrId : null,
                )
            })
            .catch(handleAppDetailsCallError)
            .finally(() => {
                setLoadingDetails(false)
            })
    }

    const fetchResourceTree = () =>
        fetchResourceTreeInTime(params.appId, params.envId, interval - 5000, appDetailsAbortRef.current.signal)
            .then((response) => {
                if (
                    response.errors &&
                    response.errors.length === 1 &&
                    response.errors[0].code === '7000' &&
                    appDetailsRequestRef.current
                ) {
                    if (setIsAppDeleted) {
                        setIsAppDeleted(true)
                    }
                    setResourceTreeFetchTimeOut(true)
                    clearPollingInterval()
                } else {
                    appDetailsRef.current = {
                        ...appDetailsRef.current,
                        resourceTree: response.result,
                    }
                    IndexStore.publishAppDetails(appDetailsRef.current, AppType.DEVTRON_APP)
                    setAppDetails(appDetailsRef.current)
                }
            })
            .catch(handleAppDetailsCallError)
            .finally(() => {
                setLoadingResourceTree(false)
            })

    function _getDeploymentStatusDetail(
        deploymentAppType: DeploymentAppTypes,
        isIsolatedEnv: boolean,
        triggerIdToFetch?: number,
    ) {
        const shouldFetchTimeline = shouldFetchTimelineRef.current

        // triggerIdToFetch represents the wfrId to fetch for any specific deployment
        getDeploymentStatusDetail(params.appId, params.envId, shouldFetchTimeline, triggerIdToFetch?.toString())
            .then((deploymentStatusDetailRes) => {
                if (deploymentStatusDetailRes.result) {
                    // Timelines are not applicable for helm deployments and air gapped envs
                    if (deploymentAppType === DeploymentAppTypes.HELM || isIsolatedEnv) {
                        setDeploymentStatusDetailsBreakdownData({
                            ...deploymentStatusDetailsBreakdownData,
                            deploymentStatus:
                                DEPLOYMENT_STATUS[deploymentStatusDetailRes.result.wfrStatus?.toUpperCase()],
                            deploymentStatusText:
                                deploymentStatusDetailRes.result.wfrStatus === HELM_DEPLOYMENT_STATUS_TEXT.PROGRESSING
                                    ? HELM_DEPLOYMENT_STATUS_TEXT.INPROGRESS
                                    : deploymentStatusDetailRes.result.wfrStatus,
                            deploymentTriggerTime: deploymentStatusDetailRes.result.deploymentStartedOn,
                            deploymentEndTime: deploymentStatusDetailRes.result.deploymentFinishedOn,
                            triggeredBy: deploymentStatusDetailRes.result.triggeredBy,
                        })
                    } else {
                        processDeploymentStatusData(deploymentStatusDetailRes.result)
                    }
                    if (shouldFetchTimeline) {
                        setIsInitialTimelineDataLoading(false)
                    }
                }
            })
            .catch(noop)
    }

    function getExternalLinksAndTools(clusterId) {
        getExternalLinks(clusterId, params.appId, ExternalLinkIdentifierType.DevtronApp)
            .then((externalLinksRes) => {
                setExternalLinksAndTools({
                    externalLinks: externalLinksRes.result?.ExternalLinks?.sort(sortByUpdatedOn) || [],
                    monitoringTools:
                        externalLinksRes.result?.Tools?.map((tool) => ({
                            label: tool.name,
                            value: tool.id,
                            icon: tool.icon,
                        })).sort(sortOptionsByValue) || [],
                })
            })
            .catch((e) => {
                setExternalLinksAndTools(externalLinksAndTools)
            })
    }

    function clearPollingInterval() {
        if (appDetailsIntervalID) {
            clearInterval(appDetailsIntervalID)
            appDetailsIntervalID = null
        }
    }

    useEffect(() => {
        if (appDetails && setAppDetailResultInParent) {
            setAppDetailResultInParent(appDetails)
        }
    }, [appDetails])

    useEffect(() => {
        if (appDetailsError) {
            showError(appDetailsError)
        }
    }, [appDetailsError])

    useEffect(() => {
        clearPollingInterval()
        if (isPollingRequired) {
            appDetailsIntervalID = setInterval(callAppDetailsAPI, interval)
            callAppDetailsAPI(true)
        }
    }, [isPollingRequired])

    async function handleHibernate(e) {
        try {
            setHibernating(true)
            const isUnHibernateReq = ['hibernating', 'hibernated'].includes(
                appDetails.resourceTree.status.toLowerCase(),
            )
            await stopStartApp(Number(params.appId), Number(params.envId), isUnHibernateReq ? 'START' : 'STOP')
            await callAppDetailsAPI()
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: isUnHibernateReq ? 'Pods restore initiated' : 'Pods scale down initiated',
            })
        } catch (err) {
            showError(err)
        } finally {
            setHibernating(false)
            setHibernateConfirmationModal('')
        }
    }

    const hideAppDetailsStatus = (): void => {
        toggleDetailedStatus(false)
    }

    const showApplicationDetailedModal = (): void => {
        toggleDetailedStatus(true)
    }

    if (
        !loadingResourceTree &&
        (!appDetails?.resourceTree || !appDetails.resourceTree.nodes?.length) &&
        !appDetails?.isPipelineTriggered
    ) {
        return (
            <>
                {environments?.length > 0 && (
                    <div className="flex left ml-20 mt-16">
                        <EnvSelector
                            environments={environments}
                            disabled={params.envId && !showCommitInfo}
                            controlStyleOverrides={{ backgroundColor: 'white' }}
                        />
                    </div>
                )}
                {isAppDeleted ? (
                    <DeletedAppComponent
                        resourceTreeFetchTimeOut={resourceTreeFetchTimeOut}
                        showApplicationDetailedModal={showApplicationDetailedModal}
                    />
                ) : (
                    <AppNotConfigured
                        style={{ height: 'calc(100vh - 150px)' }}
                        image={noGroups}
                        title={ERROR_EMPTY_SCREEN.ALL_SET_GO_CONFIGURE}
                        subtitle={ERROR_EMPTY_SCREEN.DEPLOYEMENT_WILL_BE_HERE}
                        buttonTitle={ERROR_EMPTY_SCREEN.GO_TO_DEPLOY}
                        appConfigTabs={URLS.APP_TRIGGER}
                    />
                )}
            </>
        )
    }

    const environmentsMap = Array.isArray(environments)
        ? environments.reduce((agg, curr) => {
              agg[curr.environmentId] = curr.environmentName
              return agg
          }, {})
        : {}
    const environmentName = environmentsMap[+envId]

    const renderAppDetails = (): JSX.Element => {
        if (!appDetails.resourceTree && isVirtualEnvRef.current && VirtualAppDetailsEmptyState) {
            return <VirtualAppDetailsEmptyState environmentName={environmentName} />
        }
        return (
            <NodeTreeDetailTab
                appDetails={appDetails}
                externalLinks={externalLinksAndTools.externalLinks}
                monitoringTools={externalLinksAndTools.monitoringTools}
                isDevtronApp
                isDeploymentBlocked={isDeploymentBlocked}
                isVirtualEnvironment={isVirtualEnvRef.current}
            />
        )
    }

    const getHibernateText = () => {
        if (hibernateConfirmationModal === 'hibernate') {
            return `Hibernate App`
        }
        return 'Restore App'
    }

    const handleHibernateConfirmationModalClose = (e) => {
        e.stopPropagation()
        setHibernateConfirmationModal('')
    }

    const renderHibernateModal = (): JSX.Element => {
        if (isDeploymentBlocked && DeploymentWindowConfirmationDialog) {
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
            <ConfirmationDialog>
                <ConfirmationDialog.Icon src={hibernateConfirmationModal === 'hibernate' ? warningIcon : restoreIcon} />
                <ConfirmationDialog.Body
                    title={`${hibernateConfirmationModal === 'hibernate' ? 'Hibernate' : 'Restore'} '${
                        appDetails.appName
                    }' on '${appDetails.environmentName}'`}
                    subtitle={
                        <p>
                            Pods for this application will be
                            <b className="mr-4 ml-4">
                                scaled
                                {hibernateConfirmationModal === 'hibernate'
                                    ? ' down to 0 '
                                    : ' up to its original count '}
                                on {appDetails.environmentName}
                            </b>
                            environment.
                        </p>
                    }
                >
                    <p className="mt-16">Are you sure you want to continue?</p>
                </ConfirmationDialog.Body>
                <ConfirmationDialog.ButtonGroup>
                    <button
                        className="cta cancel"
                        disabled={hibernating}
                        onClick={handleHibernateConfirmationModalClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="cta"
                        disabled={hibernating}
                        data-testid={`app-details-${hibernateConfirmationModal === 'hibernate' ? 'hibernate' : 'restore'}`}
                        onClick={handleHibernate}
                    >
                        {hibernating ? <Progressing /> : getHibernateText()}
                    </button>
                </ConfirmationDialog.ButtonGroup>
            </ConfirmationDialog>
        )
    }

    const renderRestartWorkload = () => {
        return (
            <RotatePodsModal
                onClose={() => setRotateModal(false)}
                callAppDetailsAPI={callAppDetailsAPI}
                isDeploymentBlocked={isDeploymentBlocked}
            />
        )
    }
    const isdeploymentAppDeleting = appDetails?.deploymentAppDeleteRequest || false
    return (
        <>
            <div
                className={`w-100 pt-16 pr-20 pb-16 pl-20 dc__gap-16 ${isdeploymentAppDeleting ? 'app-info-bg' : 'app-info-bg-gradient'}`}
            >
                <SourceInfo
                    appDetails={appDetails}
                    setDetailed={toggleDetailedStatus}
                    environment={environment}
                    environments={environments}
                    showCommitInfo={isAppDeployment ? showCommitInfo : null}
                    showUrlInfo={isAppDeployment ? setUrlInfo : null}
                    showHibernateModal={isAppDeployment ? setHibernateConfirmationModal : null}
                    deploymentStatusDetailsBreakdownData={deploymentStatusDetailsBreakdownData}
                    isVirtualEnvironment={isVirtualEnvRef.current}
                    setRotateModal={isAppDeployment ? setRotateModal : null}
                    loadingDetails={loadingDetails}
                    loadingResourceTree={loadingResourceTree}
                    refetchDeploymentStatus={getDeploymentDetailStepsData}
                    toggleIssuesModal={toggleIssuesModal}
                    envId={appDetails?.environmentId}
                    ciArtifactId={appDetails?.ciArtifactId}
                    setErrorsList={setErrorsList}
                    deploymentUserActionState={deploymentUserActionState}
                />
            </div>
            {!loadingDetails && !loadingResourceTree && !appDetails?.deploymentAppDeleteRequest && (
                <>
                    {environment && !isVirtualEnvRef.current && (
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
            {loadingResourceTree ? (
                <div className="bcn-0 h-100">
                    <Progressing pageLoader fullHeight size={32} fillColor="var(--N500)" />
                </div>
            ) : (
                renderAppDetails()
            )}
            {detailedStatus && (
                <AppStatusDetailModal
                    close={hideAppDetailsStatus}
                    showAppStatusMessage={false}
                    showConfigDriftInfo={!!ConfigDriftModalRoute}
                />
            )}
            {location.search.includes(DEPLOYMENT_STATUS_QUERY_PARAM) && (
                <DeploymentStatusDetailModal
                    appName={appDetails?.appName}
                    environmentName={appDetails?.environmentName}
                    deploymentStatusDetailsBreakdownData={deploymentStatusDetailsBreakdownData}
                    isVirtualEnvironment={isVirtualEnvRef.current}
                    isLoading={isInitialTimelineDataLoading}
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
            {commitInfo && (
                <ArtifactInfoModal
                    envId={appDetails?.environmentId}
                    ciArtifactId={appDetails?.ciArtifactId}
                    handleClose={() => showCommitInfo(false)}
                    renderCIListHeader={renderCIListHeader}
                />
            )}
            {hibernateConfirmationModal && renderHibernateModal()}
            {rotateModal && renderRestartWorkload()}
            {
                <ClusterMetaDataBar
                    clusterName={appDetails?.clusterName}
                    namespace={appDetails?.namespace}
                    clusterId={appDetails?.clusterId}
                    isVirtualEnvironment={isVirtualEnvRef.current}
                />
            }
            {ConfigDriftModalRoute && !isVirtualEnvRef.current && <ConfigDriftModalRoute path={path} />}
        </>
    )
}

const DeletedAppComponent: React.FC<DeletedAppComponentType> = ({
    resourceTreeFetchTimeOut,
    showApplicationDetailedModal,
}) => {
    if (resourceTreeFetchTimeOut) {
        return (
            <>
                <div className="mt-16 mb-9">
                    <SyncErrorComponent showApplicationDetailedModal={showApplicationDetailedModal} />
                </div>
                <EmptyK8sResourceComponent emptyStateMessage={RESOURCES_NOT_FOUND} />
            </>
        )
    }
    return <AppDetailsEmptyState envType={EnvType.APPLICATION} />
}

export const EnvSelector = ({
    environments,
    disabled,
    controlStyleOverrides,
}: {
    environments: any
    disabled: boolean
    controlStyleOverrides?: React.CSSProperties
}) => {
    const { push } = useHistory()
    const { path } = useRouteMatch()
    const { appId, envId } = useParams<{ appId: string; envId?: string }>()
    function selectEnvironment(newEnvId) {
        const newUrl = generatePath(path, { appId, envId: newEnvId })
        push(newUrl)
    }

    const environmentsMap = Array.isArray(environments)
        ? environments.reduce((agg, curr) => {
              agg[curr.environmentId] = curr.environmentName
              return agg
          }, {})
        : {}
    const environmentName = environmentsMap[+envId]
    const envSelectorStyle = {
        ...multiSelectStyles,
        ...groupHeaderStyle,
        control: (base, state) => ({
            ...base,
            border: '1px solid var(--B500)',
            backgroundColor: 'white',
            minHeight: '32px',
            height: '32px',
            cursor: state.isDisabled ? 'not-allowed' : 'pointer',
            ...controlStyleOverrides,
        }),
        singleValue: (base, state) => ({ ...base, textAlign: 'left', fontWeight: 600, color: 'var(--B500)' }),
        indicatorsContainer: (base, state) => ({ ...base, height: '32px' }),
        menu: (base) => ({ ...base, width: '280px', zIndex: 12 }),
    }

    const sortedEnvironments =
        environments && !environments.deploymentAppDeleteRequest
            ? sortObjectArrayAlphabetically(environments, 'environmentName')
            : environments

    const formatOptionLabel = (option): JSX.Element => {
        return (
            <div>
                <div className="w-100 dc__ellipsis-right">{option.label}</div>
                {option.description && (
                    <small className="dc__word-break-all dc__white-space-normal fs-12 cn-7">{option.description}</small>
                )}
            </div>
        )
    }

    const groupList =
        sortedEnvironments?.reduce((acc, env) => {
            const Option = {
                label: env.environmentName,
                value: env.environmentId,
                description: env.description,
            }
            const key = env.isVirtualEnvironment ? 'Isolated environments' : ''
            const found = acc.find((item) => item.label === key)

            if (found) {
                found.options.push(Option)
            } else {
                acc.push({
                    label: key,
                    options: [Option],
                })
            }

            return acc
        }, []) || []

    // Pushing the virtual environment group to the end of the list
    if (groupList[0]?.label === 'Isolated environments' && groupList.length === 2) {
        groupList.reverse()
    }

    return (
        <>
            <div style={{ width: 'clamp( 100px, 30%, 100px )', height: '100%', position: 'relative' }}>
                <svg
                    viewBox="0 0 200 40"
                    preserveAspectRatio="none"
                    style={{ width: '100%', height: '100%', display: 'flex' }}
                >
                    <path d="M0 20 L200 20 Z" strokeWidth="1" stroke="#0066cc" />
                    <path d="M0 10 L0, 30" strokeWidth="2" stroke="#0066cc" />
                </svg>
                <div
                    className="bcb-5 br-10 cn-0 pl-8 pr-8"
                    style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                >
                    ENV
                </div>
            </div>
            <div data-testid="app-deployed-env-name" className="app-details__selector w-200 dc__zi-11">
                <SelectPicker
                    inputId="app-environment-select"
                    placeholder="Select Environment"
                    options={groupList}
                    value={envId ? { value: +envId, label: environmentName } : null}
                    onChange={(selected, meta) => selectEnvironment((selected as any).value)}
                    closeMenuOnSelect
                    isSearchable
                    classNamePrefix="app-environment-select"
                />
            </div>
        </>
    )
}

export const EventsLogsTabSelector = ({ onMouseDown = null }) => {
    const params = useParams<{ appId: string; envId: string; tab?: NodeDetailTabs; kind?: NodeDetailTabs }>()
    const { queryParams, searchParams } = useSearchString()
    const history = useHistory()
    const { path } = useRouteMatch()
    const location = useLocation()
    const kind = searchParams.kind || params.kind
    return (
        <FragmentHOC
            onMouseDown={onMouseDown || noop}
            style={{ background: '#2c3354', boxShadow: 'inset 0 -1px 0 0 #0b0f22' }}
            onClick={
                params.tab
                    ? () => {}
                    : (e) => {
                          history.push(
                              generatePath(path, { ...params, tab: NodeDetailTabs.MANIFEST }) + location.search,
                          )
                      }
            }
        >
            <div className={`pl-20 flex left tab-container ${params.tab ? 'dc__cursor--ns-resize ' : 'pointer'}`}>
                {[
                    NodeDetailTabs.MANIFEST,
                    NodeDetailTabs.EVENTS,
                    ...(kind === Nodes.Pod ? [NodeDetailTabs.LOGS, NodeDetailTabs.TERMINAL] : []),
                ].map((title, idx) => (
                    <div
                        key={`kind-${idx}`}
                        className={`tab dc__first-letter-capitalize ${
                            params.tab?.toUpperCase() === title ? 'active' : ''
                        }`}
                        onClick={(e) => {
                            e.stopPropagation()
                            history.push(generatePath(path, { ...params, tab: title }) + location.search)
                        }}
                        onMouseDown={stopPropagation}
                    >
                        {title}
                    </div>
                ))}
            </div>
            <div className={`flex right pr-20 ${params.tab ? 'dc__cursor--ns-resize ' : 'pointer'}`}>
                <div
                    className="flex pointer"
                    style={{ height: '36px', width: '36px' }}
                    onClick={(e) => {
                        e.stopPropagation()
                        queryParams.delete('kind')
                        history.push(
                            `${generatePath(path, {
                                ...params,
                                tab: params.tab ? null : NodeDetailTabs.MANIFEST,
                            })}?${queryParams.toString()}`,
                        )
                    }}
                >
                    <NavigationArrow
                        style={{ ['--rotateBy' as any]: params?.tab ? '0deg' : '180deg' }}
                        color="#fff"
                        className="icon-dim-20 rotate"
                    />
                </div>
            </div>
        </FragmentHOC>
    )
}

export const NodeSelectors: React.FC<NodeSelectorsType> = ({
    logsPaused = false,
    socketConnection = true,
    nodeName,
    selectedNodes,
    nodes,
    containerName,
    selectedContainer,
    shell,
    isReconnection,
    nodeItems,
    logsCleared,
    isAppDeployment,
    setIsReconnection,
    selectShell,
    setTerminalCleared,
    handleLogsPause = null,
    setSocketConnection,
    selectNode,
    setSelectNode,
    selectContainer,
    setLogsCleared,
    children = null,
}) => {
    const params = useParams<{ appId: string; envId: string; kind: Nodes; tab: NodeDetailTabs; showOldOrNewSuffix }>()
    const { queryParams, searchParams } = useSearchString()
    const { url, path } = useRouteMatch()
    const history = useHistory()

    if (!searchParams?.kind) {
        queryParams.set('kind', params.kind)
        history.replace(`${url}?${queryParams.toString()}`)
        return null
    }
    const kind: Nodes = searchParams.kind as Nodes

    const nodesMap = nodes.nodes[kind] || new Map()

    let containers = []
    let initContainers = []
    let selectedNodesItem = []
    if (selectedNodes) {
        selectedNodesItem = getSelectedNodeItems(selectedNodes, nodeItems, isAppDeployment, nodesMap, kind)
    }

    if (selectedNodesItem) {
        selectedNodesItem.forEach((item) => {
            if ((kind === Nodes.Pod || searchParams.kind === Nodes.Pod) && nodesMap && nodesMap.has(item.value)) {
                containers.push(nodesMap.get(item.value)?.containers)
                initContainers.push(nodesMap.get(item.value)?.initContainers)
            } else {
                containers.push(null)
                initContainers.push(null)
            }
        })
    }

    const additionalOptions = [
        { label: 'All pods', value: 'All pods' },
        { label: 'All new pods', value: 'All new pods' },
        { label: 'All old pods', value: 'All old pods' },
    ]
    let options = []
    if (nodeItems?.length > 1) {
        options = additionalOptions.concat(nodeItems)
    } else {
        options = nodeItems
    }

    if (!containers) {
        containers = []
    }
    if (!initContainers) {
        initContainers = []
    }

    if (params.tab === NodeDetailTabs.TERMINAL) {
        initContainers = []
    }

    const total = containers.concat(initContainers)
    const allContainers = total.filter((item) => !!item)

    allContainers.forEach((item) => {
        if (item?.length < 2) {
            const contAvailable = allContainers[0]
            if (contAvailable && !selectedContainer) {
                selectContainer(contAvailable[0])
            }
        } else if (!selectedContainer) {
            selectContainer(null)
        }
    })

    function selectPod(selected) {
        setSelectNode(selected.value)
        onLogsCleared()
    }

    function onLogsCleared() {
        setLogsCleared(true)
        setTimeout(() => setLogsCleared(false), 1000)
    }

    const onClickDisconnectTab = () => {
        setSocketConnection('DISCONNECTING')
        setIsReconnection(true)
    }

    const onClickConnectTab = () => {
        setSocketConnection('CONNECTING')
    }

    const onClickAbort = () => {
        setTerminalCleared(true)
    }

    const onClickPlayStop = () => {
        handleLogsPause(!logsPaused)
    }

    const isSocketConnecting = socketConnection === 'CONNECTING' || socketConnection === 'CONNECTED'
    const podItems = params.tab?.toLowerCase() == 'logs' ? selectedNodes : nodeName
    return (
        <div className="pl-20 flex left" style={{ background: '#2c3354' }}>
            {params.tab === NodeDetailTabs.TERMINAL && (
                <>
                    <div className="flex mr-12">
                        <Tippy
                            className="default-tt"
                            arrow={false}
                            placement="bottom"
                            content={isSocketConnecting ? 'Disconnect' : 'Connect'}
                        >
                            <div className="flex">
                                {isSocketConnecting ? (
                                    <Disconnect className="icon-dim-20 mr-5" onClick={onClickDisconnectTab} />
                                ) : (
                                    <Connect className="icon-dim-20 mr-5" onClick={onClickConnectTab} />
                                )}
                            </div>
                        </Tippy>

                        <Tippy className="default-tt" arrow={false} placement="bottom" content="Clear">
                            <div className="flex">
                                <Abort className="icon-dim-20 mr-8 ml-8" onClick={onClickAbort} />
                            </div>
                        </Tippy>
                    </div>
                    <span style={{ width: '1px', height: '16px', background: '#0b0f22' }} />
                </>
            )}
            {handleLogsPause && params.tab === NodeDetailTabs.LOGS && (
                <>
                    <Tippy
                        className="default-tt"
                        arrow={false}
                        placement="bottom"
                        content={logsPaused ? 'Resume logs (Ctrl+C)' : 'Stop logs (Ctrl+C)'}
                    >
                        <div className={`toggle-logs mr-8 ${logsPaused ? 'play' : 'stop'}`} onClick={onClickPlayStop}>
                            {logsPaused ? (
                                <PlayButton className="icon-dim-20" />
                            ) : (
                                <StopButton className="stop-btn fcr-5" />
                            )}
                        </div>
                    </Tippy>

                    <Tippy className="default-tt" arrow={false} placement="bottom" content="Clear">
                        <div className="flex">
                            <Abort className="icon-dim-20 mr-16 ml-8" onClick={onLogsCleared} />
                        </div>
                    </Tippy>
                    <span style={{ width: '1px', height: '16px', background: '#0b0f22' }} />
                </>
            )}
            <div className="events-logs__dropdown-selector pods">
                <span className="events-logs__label">{kind}</span>
                <div style={{ width: '175px', zIndex: 1000 }}>
                    <Select
                        placeholder={`Select ${kind}`}
                        name="pods"
                        value={
                            podItems
                                ? {
                                      label: podItems + getPodNameSuffix(podItems, isAppDeployment, nodesMap, kind),
                                      value: podItems,
                                  }
                                : null
                        }
                        options={
                            params.tab?.toLowerCase() == 'logs'
                                ? options
                                : Array.from(nodesMap).map(([name, data]) => ({
                                      label: name + getPodNameSuffix(selectedNodes, isAppDeployment, nodesMap, kind),
                                      value: name,
                                  }))
                        }
                        closeMenuOnSelect={false}
                        onChange={(selected) => {
                            params.tab?.toLowerCase() == 'logs' ? selectPod(selected) : selectNode(selected.value)
                        }}
                        components={{
                            IndicatorSeparator: null,
                            Option,
                        }}
                        styles={{
                            ...multiSelectStyles,
                            menu: (base) => ({ ...base, zIndex: 12, textAlign: 'left' }),
                            control: (base, state) => ({
                                ...base,
                                backgroundColor: 'transparent',
                                borderColor: 'transparent',
                            }),
                            singleValue: (base, state) => ({
                                ...base,
                                marginLeft: '0',
                                marginRight: '0',
                                textAlign: 'left',
                                direction: 'rtl',
                                color: 'var(--N000)',
                            }),
                            input: (base, state) => ({ ...base, caretColor: 'var(--N000)', color: 'var(--N000)' }),
                            option: (base, state) => ({
                                ...base,
                                backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
                                color: 'var(--N900)',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                direction: 'rtl',
                            }),
                        }}
                    />
                </div>
            </div>
            {Array.isArray(allContainers) &&
                (params.tab === NodeDetailTabs.LOGS || params.tab === NodeDetailTabs.TERMINAL) && (
                    <>
                        <span style={{ width: '1px', height: '16px', background: '#0b0f22' }} />
                        <div className="events-logs__dropdown-selector">
                            <span className="events-logs__label">Containers</span>
                            <div style={{ width: '175px' }}>
                                <Select
                                    placeholder="Select Container"
                                    options={
                                        allContainers[0] &&
                                        allContainers[0].map((container) => ({ label: container, value: container }))
                                    }
                                    value={containerName ? { label: containerName, value: containerName } : null}
                                    onChange={(selected) => {
                                        selectContainer(selected.value)
                                        onLogsCleared()
                                    }}
                                    styles={{
                                        ...multiSelectStyles,
                                        menu: (base) => ({ ...base, zIndex: 12, textAlign: 'left' }),
                                        control: (base, state) => ({
                                            ...base,
                                            backgroundColor: 'transparent',
                                            borderColor: 'transparent',
                                        }),
                                        singleValue: (base, state) => ({
                                            ...base,
                                            direction: 'rtl',
                                            textAlign: 'left',
                                            color: 'var(--N000)',
                                        }),
                                        input: (base, state) => ({
                                            ...base,
                                            caretColor: 'var(--N000)',
                                            color: 'var(--N000)',
                                        }),
                                        option: (base, state) => ({
                                            ...base,
                                            backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
                                            color: 'var(--N900)',
                                            textOverflow: 'ellipsis',
                                            overflow: 'hidden',
                                            whiteSpace: 'nowrap',
                                            direction: 'rtl',
                                        }),
                                    }}
                                    components={{
                                        IndicatorSeparator: null,
                                        Option,
                                    }}
                                />
                            </div>
                        </div>
                    </>
                )}
            {params.tab === NodeDetailTabs.TERMINAL && (
                <>
                    <span style={{ width: '1px', height: '16px', background: '#0b0f22' }} />
                    <div style={{ width: '130px' }} data-testid="terminal-select-dropdown">
                        <Select
                            placeholder="Select shell"
                            className="pl-20"
                            options={[
                                { label: 'bash', value: 'bash' },
                                { label: 'sh', value: 'sh' },
                                { label: 'powershell', value: 'powershell' },
                                { label: 'cmd', value: 'cmd' },
                            ]}
                            value={shell}
                            onChange={(selected) => {
                                selectShell(selected)
                            }}
                            styles={{
                                menu: (base) => ({ ...base, zIndex: 12 }),
                                control: (base, state) => ({
                                    ...base,
                                    backgroundColor: 'transparent',
                                    borderColor: 'transparent',
                                }),
                                singleValue: (base, state) => ({
                                    ...base,
                                    textAlign: 'left',
                                    color: 'var(--N000)',
                                }),
                                input: (base, state) => ({ ...base, caretColor: 'var(--N000)', color: 'var(--N000)' }),
                                option: (base, state) => ({
                                    ...base,
                                    backgroundColor: state.isFocused ? 'var(--N100)' : 'var(--N000)',
                                    color: 'var(--N900)',
                                }),
                            }}
                            components={{
                                IndicatorSeparator: null,
                                Option,
                            }}
                        />
                    </div>
                </>
            )}
            {children}
        </div>
    )
}

export const AppNotConfigured = ({
    image,
    title,
    subtitle,
    buttonTitle,
    appConfigTabs = '',
    style,
    isJobView,
}: {
    image?: any
    title?: string
    subtitle?: React.ReactNode
    buttonTitle?: string
    appConfigTabs?: string
    style?: React.CSSProperties
    isJobView?: boolean
}) => {
    const { appId } = useParams<{ appId: string }>()
    const { push } = useHistory()
    function handleEditApp(e) {
        getAppConfigStatus(+appId).then((response) => {
            const _urlPrefix = `/${isJobView ? 'job' : 'app'}/${appId}`
            let url = `${_urlPrefix}/edit`
            if (appConfigTabs) {
                url = `${_urlPrefix}/${appConfigTabs}`
            }
            push(url)
        })
    }

    return (
        <section className="app-not-configured w-100" style={style}>
            <img src={image || AppNotConfiguredIcon} />
            <h3 className="mb-8 mt-20 fs-16 fw-600 w-300">{title || 'Finish configuring this application'}</h3>
            <p className="mb-20 fs-13 w-300">
                {subtitle || (
                    <>
                        {APP_DETAILS.APP_FULLY_NOT_CONFIGURED}&nbsp;
                        <a href={DOCUMENTATION.APP_CREATE} target="_blank" rel="noreferrer">
                            {APP_DETAILS.NEED_HELP}
                        </a>
                    </>
                )}
            </p>
            {appId && push && (
                <button className="cta flex" onClick={handleEditApp}>
                    {buttonTitle || 'Go to app configurations'}
                    <ForwardArrow className="ml-5" />
                </button>
            )}
        </section>
    )
}

export const EnvironmentNotConfigured = ({ environments, ...props }) => {
    const environmentsMap = Array.isArray(environments)
        ? environments.reduce((agg, curr) => {
              agg[curr.environmentId] = curr.environmentName
              return agg
          }, {})
        : {}
    const { envId, appId } = useParams<{ appId; envId }>()

    return (
        <section className="env-not-configured w-100 flex">
            <div className="env-not-configured__instructions">
                <img
                    className="no-configuration"
                    src={environmentsMap[+envId] ? AppNotDeployedIcon : AppNotConfiguredIcon}
                />
                <p>
                    {environmentsMap[+envId]
                        ? `This app is not deployed on ${environmentsMap[+envId]}`
                        : `Please select an environment to view app details`}
                </p>
                {environmentsMap[+envId] && (
                    <Link className="cta dc__no-decor" to={getAppTriggerURL(appId)}>
                        Go to Trigger
                    </Link>
                )}
            </div>
        </section>
    )
}

export const TimeRangeSelector = ({
    value = '',
    onSelect = null,
    options = [
        '5 minutes',
        '15 minutes',
        '30 minutes',
        '1 hour',
        '3 hours',
        '6 hours',
        '12 hours',
        '24 hours',
        '2 days',
        '7 days',
    ],
    prefix = '',
}) => {
    const [selectedRange, selectRange] = React.useState<string>(value)

    useEffectAfterMount(() => {
        if (typeof onSelect === 'function') {
            if (selectedRange === value) {
                return
            }
            const [quantity, unit] = selectedRange.split(' ')
            onSelect([quantity, unit])
        }
    }, [selectedRange])

    return (
        <div style={{ width: '210px' }}>
            <Select
                options={options.map((time) => ({ label: time, value: time }))}
                value={{ label: selectedRange, value: selectedRange }}
                onChange={(selected) => selectRange(selected.value)}
                menuPosition="fixed"
                components={{ IndicatorSeparator: null, ValueContainer, Option }}
                styles={{
                    ...multiSelectStyles,
                    valueContainer: (base, state) => ({ ...base, color: 'var(--N900)' }),
                }}
                isSearchable={false}
            />
        </div>
    )
}

export const SyncStatusMessage = (app: Application) => {
    let message = app.spec.source.targetRevision || 'HEAD'
    if (app.status.sync.revision) {
        if (app.spec.source?.chart) {
            message += ` (${app.status.sync.revision})`
        } else if (
            app.status.sync.revision.length >= 7 &&
            !app.status.sync.revision.startsWith(app.spec.source.targetRevision)
        ) {
            message += ` (${app.status.sync.revision.substr(0, 7)})`
        }
    }
    switch (app.status.sync.status) {
        case 'Synced':
            return <span>To {message}</span>
        case 'OutOfSync':
            return <span>From {message}</span>
        default:
            return <span>{message}</span>
    }
}

export const getAppOperationState = (app: Application) => {
    if (app.metadata.deletionTimestamp) {
        return {
            phase: 'Running',
            startedAt: app.metadata.deletionTimestamp,
        }
    }
    if (app.operation) {
        return {
            phase: 'Running',
            startedAt: new Date().toISOString(),
            operation: {
                sync: {},
            },
        }
    }
    return app.status.operationState
}
export function getOperationType(application: Application) {
    if (application.metadata.deletionTimestamp) {
        return 'Delete'
    }
    const operation =
        application.operation || (application.status.operationState && application.status.operationState.operation)
    if (operation && operation.sync) {
        return 'Sync'
    }
    return 'Unknown'
}
