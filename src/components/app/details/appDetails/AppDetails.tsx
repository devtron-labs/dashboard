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

import React, { SyntheticEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { generatePath, Route, useHistory, useLocation, useParams, useRouteMatch } from 'react-router-dom'

import {
    ACTION_STATE,
    aggregateNodes,
    AppStatusModal,
    ArtifactInfoModal,
    Button,
    ButtonComponentType,
    DeploymentAppTypes,
    GenericEmptyState,
    getAppStatusModalTitle,
    getIsRequestAborted,
    MODAL_TYPE,
    noop,
    processDeploymentStatusDetailsData,
    Progressing,
    ReleaseMode,
    SelectPicker,
    ServerErrors,
    showError,
    ToastManager,
    ToastVariantType,
    useAsync,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ForwardArrow } from '@Icons/ic-arrow-forward.svg'
import AppNotConfiguredIcon from '@Images/app-not-configured.png'
import AppNotDeployedIcon from '@Images/app-not-deployed.svg'

import { ReactComponent as Trash } from '../../../../assets/icons/ic-delete-dots.svg'
import noGroups from '../../../../assets/img/ic-feature-deploymentgroups@3x.png'
import {
    DEFAULT_STATUS,
    DEFAULT_STATUS_TEXT,
    DEPLOYMENT_STATUS,
    DEPLOYMENT_STATUS_QUERY_PARAM,
    DOCUMENTATION,
    getAppDetailsURL,
    getAppTriggerURL,
    HELM_DEPLOYMENT_STATUS_TEXT,
    RESOURCES_NOT_FOUND,
    URLS,
} from '../../../../config'
import { APP_DETAILS, ERROR_EMPTY_SCREEN } from '../../../../config/constantMessaging'
import { getAppConfigStatus, getAppOtherEnvironmentMin, stopStartApp } from '../../../../services/service'
import { useAppContext } from '../../../common'
import { AppDetailsEmptyState } from '../../../common/AppDetailsEmptyState'
import { ClusterMetaDataBar } from '../../../common/ClusterMetaDataBar/ClusterMetaDataBar'
import {
    importComponentFromFELibrary,
    sortObjectArrayAlphabetically,
    sortOptionsByValue,
} from '../../../common/helpers/Helpers'
import { AppLevelExternalLinks } from '../../../externalLinks/ExternalLinks.component'
import { getExternalLinks } from '../../../externalLinks/ExternalLinks.service'
import { ExternalLinkIdentifierType, ExternalLinksAndToolsType } from '../../../externalLinks/ExternalLinks.type'
import { sortByUpdatedOn } from '../../../externalLinks/ExternalLinks.utils'
import { AppType, EnvType } from '../../../v2/appDetails/appDetails.type'
import IndexStore from '../../../v2/appDetails/index.store'
import { EmptyK8sResourceComponent } from '../../../v2/appDetails/k8Resource/K8Resource.component'
import NodeTreeDetailTab from '../../../v2/appDetails/NodeTreeDetailTab'
import RotatePodsModal from '../../../v2/appDetails/sourceInfo/rotatePods/RotatePodsModal.component'
import SyncErrorComponent from '../../../v2/appDetails/SyncError.component'
import { TriggerUrlModal } from '../../list/TriggerUrl'
import { fetchAppDetailsInTime, fetchResourceTreeInTime } from '../../service'
import { AggregatedNodes, Application } from '../../types'
import { renderCIListHeader } from '../cdDetails/utils'
import { getDeploymentStatusDetail } from './appDetails.service'
import {
    DeletedAppComponentType,
    DeploymentStatusDetailsBreakdownDataType,
    DeploymentStatusDetailsType,
    DetailsType,
    ErrorItem,
    HibernationModalTypes,
} from './appDetails.type'
import { AppMetrics } from './AppMetrics'
import DeploymentStatusDetailModal from './DeploymentStatusDetailModal'
import HibernateModal from './HibernateModal'
import IssuesListingModal from './IssuesListingModal'
import { SourceInfo } from './SourceInfo'
import { NoParamsNoEnvContext, NoParamsWithEnvContext, ParamsAndEnvContext, ParamsNoEnvContext } from './utils'

const VirtualAppDetailsEmptyState = importComponentFromFELibrary('VirtualAppDetailsEmptyState')
const DeploymentWindowStatusModal = importComponentFromFELibrary('DeploymentWindowStatusModal')
const DeploymentWindowConfirmationDialog = importComponentFromFELibrary('DeploymentWindowConfirmationDialog')
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

const ConfigDriftModal = importComponentFromFELibrary('ConfigDriftModal', null, 'function')

export const AppNotConfigured = ({
    image,
    title,
    subtitle,
    buttonTitle,
    appConfigTabs = '',
    isJobView,
}: {
    image?: any
    title?: string
    subtitle?: React.ReactNode
    buttonTitle?: string
    appConfigTabs?: string
    isJobView?: boolean
}) => {
    const { appId } = useParams<{ appId: string }>()
    const { push } = useHistory()

    const handleEditApp = () => {
        getAppConfigStatus(+appId, isJobView, false)
            .then(() => {
                const _urlPrefix = `/${isJobView ? 'job' : 'app'}/${appId}`
                let url = `${_urlPrefix}/edit`
                if (appConfigTabs) {
                    url = `${_urlPrefix}/${appConfigTabs}`
                }
                push(url)
            })
            .catch(noop)
    }

    const renderButton = () =>
        appId &&
        push && (
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
                        <a href={DOCUMENTATION.APP_CREATE} target="_blank" rel="noreferrer">
                            {APP_DETAILS.NEED_HELP}
                        </a>
                    </>
                )
            }
            isButtonAvailable
            renderButton={renderButton}
        />
    )
}

const EnvironmentNotConfigured = ({ environments }: Record<string, any>) => {
    const environmentsMap = Array.isArray(environments)
        ? environments.reduce((agg, curr) => {
              // eslint-disable-next-line no-param-reassign
              agg[curr.environmentId] = curr.environmentName
              return agg
          }, {})
        : {}
    const { envId, appId } = useParams<{ appId; envId }>()

    const renderButton = () => (
        <Button
            dataTestId="go-to-trigger"
            component={ButtonComponentType.link}
            text="Go to Trigger"
            linkProps={{
                to: getAppTriggerURL(appId),
            }}
        />
    )

    return (
        <GenericEmptyState
            image={environmentsMap[+envId] ? AppNotDeployedIcon : AppNotConfiguredIcon}
            title={
                environmentsMap[+envId]
                    ? `This app is not deployed on ${environmentsMap[+envId]}`
                    : `Please select an environment to view app details`
            }
            isButtonAvailable={environmentsMap[+envId]}
            renderButton={renderButton}
        />
    )
}

export const EnvSelector = ({ environments }: { environments: any }) => {
    const { push } = useHistory()
    const { path } = useRouteMatch()
    const { appId, envId } = useParams<{ appId: string; envId?: string }>()
    function selectEnvironment(newEnvId) {
        const newUrl = generatePath(path, { appId, envId: newEnvId })
        push(newUrl)
    }

    const environmentsMap = Array.isArray(environments)
        ? environments.reduce((agg, curr) => {
              // eslint-disable-next-line no-param-reassign
              agg[curr.environmentId] = curr.environmentName
              return agg
          }, {})
        : {}
    const environmentName = environmentsMap[+envId]

    const sortedEnvironments =
        environments && !environments.deploymentAppDeleteRequest
            ? sortObjectArrayAlphabetically(environments, 'environmentName')
            : environments

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
                    <path d="M0 20 L200 20 Z" strokeWidth="1" stroke="var(--B500)" />
                    <path d="M0 10 L0, 30" strokeWidth="2" stroke="var(--B500)" />
                </svg>
                <div
                    className="bcb-5 br-10 cn-0 pl-8 pr-8"
                    style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                >
                    ENV
                </div>
            </div>
            <div data-testid="app-deployed-env-name" className="app-details__selector w-200 dc__zi-12">
                <SelectPicker
                    inputId="app-environment-select"
                    placeholder="Select Environment"
                    options={groupList}
                    value={envId ? { value: +envId, label: environmentName } : null}
                    onChange={(selected) => selectEnvironment((selected as any).value)}
                    closeMenuOnSelect
                    isSearchable
                    classNamePrefix="app-environment-select"
                />
            </div>
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

export const Details: React.FC<DetailsType> = ({
    appDetailsAPI,
    setAppDetailResultInParent,
    environment,
    environments,
    isPollingRequired = true,
    setIsAppDeleted,
    commitInfo,
    showCommitInfo,
    isAppDeleted,
    isVirtualEnvRef,
    isDeploymentBlocked,
    deploymentUserActionState,
    appDetails,
    setAppDetails,
}) => {
    const params = useParams<{ appId: string; envId: string }>()
    const location = useLocation()

    const appDetailsFromIndexStore = IndexStore.getAppDetails()

    // fixme: the state is not being set anywhere and just being drilled down
    const [detailedStatus, toggleDetailedStatus] = useState<boolean>(false)
    const [resourceTreeFetchTimeOut, setResourceTreeFetchTimeOut] = useState<boolean>(false)
    const [urlInfo, setUrlInfo] = useState<boolean>(false)
    const [hibernateConfirmationModal, setHibernateConfirmationModal] = useState<HibernationModalTypes>(null)
    const [rotateModal, setRotateModal] = useState<boolean>(false)
    const [hibernating, setHibernating] = useState<boolean>(false)
    const [showIssuesModal, toggleIssuesModal] = useState<boolean>(false)
    const [appDetailsError, setAppDetailsError] = useState(undefined)

    const [hibernationPatchChartName, setHibernationPatchChartName] = useState<string>('')
    const [externalLinksAndTools, setExternalLinksAndTools] = useState<ExternalLinksAndToolsType>({
        externalLinks: [],
        monitoringTools: [],
    })

    // NOTE: this might seem like a duplicate of loadingResourceTree
    // but its not since loadingResourceTree runs a loader on the whole page
    const [isReloadResourceTreeInProgress, setIsReloadResourceTreeInProgress] = useState(false)

    const [loadingDetails, setLoadingDetails] = useState(true)
    const [loadingResourceTree, setLoadingResourceTree] = useState(true)
    // State to track the loading state for the timeline data when the detailed status modal opens
    const [isInitialTimelineDataLoading, setIsInitialTimelineDataLoading] = useState(true)
    const [errorsList, setErrorsList] = useState<ErrorItem[]>([])
    const appDetailsRef = useRef(null)
    const appDetailsRequestRef = useRef(null)
    const { envId } = useParams<{ appId: string; envId?: string }>()
    const pollResourceTreeRef = useRef(true)
    const appDetailsAbortRef = useRef<AbortController>(null)
    const shouldFetchTimelineRef = useRef(false)

    const [deploymentStatusDetailsBreakdownData, setDeploymentStatusDetailsBreakdownData] =
        useState<DeploymentStatusDetailsBreakdownDataType>({
            ...(isVirtualEnvRef.current && processVirtualEnvironmentDeploymentData
                ? processVirtualEnvironmentDeploymentData()
                : processDeploymentStatusDetailsData()),
            deploymentStatus: DEFAULT_STATUS,
            deploymentStatusText: DEFAULT_STATUS_TEXT,
        })
    const isConfigDriftEnabled: boolean = window._env_.FEATURE_CONFIG_DRIFT_ENABLE && !!ConfigDriftModal
    const isExternalToolAvailable: boolean =
        externalLinksAndTools.externalLinks.length > 0 && externalLinksAndTools.monitoringTools.length > 0
    const interval = Number(window._env_.DEVTRON_APP_DETAILS_POLLING_INTERVAL) || 30000
    appDetailsRequestRef.current = appDetails?.deploymentAppDeleteRequest

    const aggregatedNodes: AggregatedNodes = useMemo(
        () => aggregateNodes(appDetails?.resourceTree?.nodes || [], appDetails?.resourceTree?.podMetadata || []),
        [appDetails],
    )

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
                    // !NOTE: cyclic dependency
                    // eslint-disable-next-line @typescript-eslint/no-use-before-define
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
            getDeploymentStatusDetail(params.appId, params.envId, shouldFetchTimeline)
                .then((deploymentStatusDetailRes) => {
                    processDeploymentStatusData(deploymentStatusDetailRes.result)
                    // Update the loading status if the modal is open
                    if (shouldFetchTimeline) {
                        setIsInitialTimelineDataLoading(false)
                    }
                })
                .catch(noop)
        },
        [
            params.appId,
            params.envId,
            shouldFetchTimelineRef.current,
            getDeploymentStatusDetail,
            processDeploymentStatusData,
        ],
    )

    function clearPollingInterval() {
        if (appDetailsIntervalID) {
            clearInterval(appDetailsIntervalID)
            appDetailsIntervalID = null
        }
    }

    useEffect(
        () => () => {
            clearPollingInterval()
            clearDeploymentStatusTimer()
            IndexStore.clearAppDetails()
        },
        [],
    )

    useEffect(() => {
        appDetailsAbortRef.current = new AbortController()
        return () => {
            appDetailsAbortRef.current.abort()
        }
    }, [params.envId])

    const handleAppDetailsCallError = (error) => {
        if (error.code === 404 || appDetailsRequestRef.current) {
            if (setIsAppDeleted) {
                setIsAppDeleted(true)
            }
            // NOTE: BE sends  string representation of 7000 instead of number 7000
            if (
                getIsRequestAborted(error) ||
                (error instanceof ServerErrors && String(error.errors?.[0]?.code ?? '') === '7000')
            ) {
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

    const fetchResourceTree = () => {
        if (appDetailsAbortRef.current) {
            appDetailsAbortRef.current.abort()
        }

        appDetailsAbortRef.current = new AbortController()

        setIsReloadResourceTreeInProgress(true)
        fetchResourceTreeInTime(params.appId, params.envId, interval - 5000, appDetailsAbortRef)
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
                setIsReloadResourceTreeInProgress(false)
            })
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
            .catch(() => {
                setExternalLinksAndTools(externalLinksAndTools)
            })
    }

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

    const callAppDetailsAPI = async (fetchExternalLinks?: boolean) => {
        try {
            const response = await appDetailsAPI(params.appId, params.envId, interval - 5000, appDetailsAbortRef)
            // eslint-disable-next-line no-param-reassign
            isVirtualEnvRef.current = response.result?.isVirtualEnvironment
            // This means the CD is not triggered and the app is not helm migrated i.e. Empty State
            if (!response.result.isPipelineTriggered && response.result.releaseMode === ReleaseMode.NEW_DEPLOYMENT) {
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
        } catch (err) {
            handleAppDetailsCallError(err)
        } finally {
            setLoadingDetails(false)
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
            callAppDetailsAPI(true).catch(noop)
        }
    }, [isPollingRequired])

    const handleHibernate = async () => {
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
            setHibernateConfirmationModal(null)
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
        (!appDetails?.isPipelineTriggered || isAppDeleted)
    ) {
        return (
            <>
                {environments?.length > 0 && (
                    <div className="flex left ml-20 mt-16">
                        <EnvSelector environments={environments} />
                        {isAppDeleted && appDetails?.deploymentAppDeleteRequest && (
                            <div data-testid="deleteing-argocd-pipeline" className="flex left">
                                <Trash className="icon-dim-16 mr-8 ml-12" />
                                <span className="cr-5 fw-6">Deleting deployment pipeline </span>
                                <span className="dc__loading-dots cr-5" />
                            </div>
                        )}
                    </div>
                )}
                {isAppDeleted ? (
                    <DeletedAppComponent
                        resourceTreeFetchTimeOut={resourceTreeFetchTimeOut}
                        showApplicationDetailedModal={showApplicationDetailedModal}
                    />
                ) : (
                    <AppNotConfigured
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
              // eslint-disable-next-line no-param-reassign
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
                handleReloadResourceTree={fetchResourceTree}
                isReloadResourceTreeInProgress={isReloadResourceTreeInProgress}
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

    const onClickRotatePodClose = () => setRotateModal(false)

    const renderRestartWorkload = () => (
        <RotatePodsModal
            onClose={onClickRotatePodClose}
            callAppDetailsAPI={callAppDetailsAPI}
            isDeploymentBlocked={isDeploymentBlocked}
        />
    )
    const isDeploymentAppDeleting = appDetails?.deploymentAppDeleteRequest || false
    return (
        <>
            <div
                className={`w-100 pt-16 pr-20 pb-16 pl-20 dc__gap-16 ${isDeploymentAppDeleting ? 'app-info-bg' : 'app-info-bg-gradient'}`}
            >
                <SourceInfo
                    appDetails={appDetails}
                    setDetailed={toggleDetailedStatus}
                    environment={environment}
                    environments={environments}
                    showCommitInfo={showCommitInfo}
                    showUrlInfo={setUrlInfo}
                    showHibernateModal={setHibernateConfirmationModal}
                    deploymentStatusDetailsBreakdownData={deploymentStatusDetailsBreakdownData}
                    isVirtualEnvironment={isVirtualEnvRef.current}
                    setRotateModal={setRotateModal}
                    loadingDetails={loadingDetails}
                    loadingResourceTree={loadingResourceTree}
                    refetchDeploymentStatus={getDeploymentDetailStepsData}
                    toggleIssuesModal={toggleIssuesModal}
                    envId={appDetails?.environmentId}
                    ciArtifactId={appDetails?.ciArtifactId}
                    setErrorsList={setErrorsList}
                    deploymentUserActionState={deploymentUserActionState}
                    setHibernationPatchChartName={setHibernationPatchChartName}
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
                <div className="bg__primary h-100">
                    <Progressing pageLoader fullHeight size={32} fillColor="var(--N500)" />
                </div>
            ) : (
                renderAppDetails()
            )}
            {detailedStatus && (
                <AppStatusModal
                    title={getAppStatusModalTitle([
                        appDetailsFromIndexStore.appName,
                        appDetailsFromIndexStore.environmentName,
                    ])}
                    handleClose={hideAppDetailsStatus}
                    type="devtron-app"
                    appDetails={appDetailsFromIndexStore}
                    isConfigDriftEnabled={isConfigDriftEnabled}
                    configDriftModal={ConfigDriftModal}
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
            {appDetails && !!hibernateConfirmationModal && renderHibernateModal()}
            {rotateModal && renderRestartWorkload()}
        </>
    )
}

const AppDetail = ({ filteredEnvIds }: { filteredEnvIds?: string }) => {
    const params = useParams<{ appId: string; envId?: string }>()
    const { push } = useHistory()
    const { path } = useRouteMatch()
    const { environmentId, setEnvironmentId } = useAppContext() // global state for app to synchronise environments
    const [isAppDeleted, setIsAppDeleted] = useState(false)
    const [otherEnvsLoading, otherEnvsResult] = useAsync(
        () => getAppOtherEnvironmentMin(params.appId, false),
        [params.appId],
    )
    const [commitInfo, showCommitInfo] = useState<boolean>(false)
    const [deploymentUserActionState, setDeploymentUserActionState] = useState<ACTION_STATE>(ACTION_STATE.ALLOWED)
    const isVirtualEnvRef = useRef(false)
    const [showDeploymentWindowConfirmation, setShowDeploymentWindowConfirmation] = useState(false)
    const [appDetails, setAppDetails] = useState(undefined)

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

    const renderAppNotConfigured = () => (
        <>
            {envList.length === 0 && !isAppDeleted && <AppNotConfigured />}
            {!params.envId && envList.length > 0 && <EnvironmentNotConfigured environments={envList} />}
        </>
    )

    const environment = useMemo(
        () => envList.find((env) => env.environmentId === +params.envId),
        [envList, params.envId],
    )

    return (
        <>
            <div className="dc__overflow-hidden flex-grow-1 flexbox-col dc__position-rel">
                <div
                    data-testid="app-details-wrapper"
                    className="app-details-page-wrapper flex-grow-1 dc__overflow-auto mw-none"
                >
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
                            appDetails={appDetails}
                            setAppDetails={setAppDetails}
                        />
                    </Route>
                    {otherEnvsResult && !otherEnvsLoading && !isVirtualEnvRef.current && renderAppNotConfigured()}
                </div>
            </div>
            <ClusterMetaDataBar
                clusterName={appDetails?.clusterName}
                namespace={appDetails?.namespace}
                clusterId={appDetails?.clusterId}
                isVirtualEnvironment={isVirtualEnvRef.current}
            />
        </>
    )
}

export const SyncStatusMessage = (app: Application) => {
    const { spec, status } = app
    let message = spec.source.targetRevision || 'HEAD'
    if (status.sync.revision) {
        if (spec.source?.chart) {
            message += ` (${status.sync.revision})`
        } else if (status.sync.revision.length >= 7 && !status.sync.revision.startsWith(spec.source.targetRevision)) {
            message += ` (${status.sync.revision.substr(0, 7)})`
        }
    }
    switch (status.sync.status) {
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

export const getOperationType = (application: Application) => {
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

export default AppDetail
