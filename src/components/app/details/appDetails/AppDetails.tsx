import React, { useEffect, useState, useMemo, useRef } from 'react'
import {
    showError,
    Progressing,
    ConfirmationDialog,
    Host,
    stopPropagation,
    multiSelectStyles,
} from '@devtron-labs/devtron-fe-common-lib'
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
} from '../../../../config'
import {
    NavigationArrow,
    useEffectAfterMount,
    useAppContext,
    noop,
    useEventSource,
    FragmentHOC,
    useSearchString,
    useAsync,
    ScanDetailsModal,
} from '../../../common'
import { CustomValueContainer, Option } from './../../../v2/common/ReactSelect.utils'
import {
    getAppConfigStatus,
    getAppOtherEnvironmentMin,
    stopStartApp,
    getLastExecutionMinByAppAndEnv,
} from '../../../../services/service'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useParams, useHistory, useRouteMatch, generatePath, Route, useLocation } from 'react-router'
//@ts-check
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

import Tippy from '@tippyjs/react'
import Select, { components } from 'react-select'
import { SourceInfo } from './SourceInfo'
import { AppStreamData, Application, Nodes, AggregatedNodes, NodeDetailTabs } from '../../types'
import {
    aggregateNodes,
    SecurityVulnerabilitites,
    getSelectedNodeItems,
    getPodNameSuffix,
    processDeploymentStatusDetailsData,
    ValueContainer,
} from './utils'
import { AppMetrics } from './AppMetrics'
import IndexStore from '../../../v2/appDetails/index.store'
import { TriggerInfoModal } from '../../list/TriggerInfo'
import { sortObjectArrayAlphabetically, sortOptionsByValue } from '../../../common/helpers/Helpers'
import { AppLevelExternalLinks } from '../../../externalLinks/ExternalLinks.component'
import { getExternalLinks } from '../../../externalLinks/ExternalLinks.service'
import { ExternalLinkIdentifierType, ExternalLinksAndToolsType } from '../../../externalLinks/ExternalLinks.type'
import { sortByUpdatedOn } from '../../../externalLinks/ExternalLinks.utils'
import NodeTreeDetailTab from '../../../v2/appDetails/NodeTreeDetailTab'
import noGroups from '../../../../assets/img/ic-feature-deploymentgroups@3x.png'
import { AppType, DeploymentAppType, EnvType } from '../../../v2/appDetails/appDetails.type'
import DeploymentStatusDetailModal from './DeploymentStatusDetailModal'
import { getDeploymentStatusDetail } from './appDetails.service'
import {
    DeploymentStatusDetailsBreakdownDataType,
    DeploymentStatusDetailsType,
    DetailsType,
    NodeSelectorsType,
} from './appDetails.type'
import { TriggerUrlModal } from '../../list/TriggerUrl'
import AppStatusDetailModal from '../../../v2/appDetails/sourceInfo/environmentStatus/AppStatusDetailModal'
import SyncErrorComponent from '../../../v2/appDetails/SyncError.component'
import { AppDetailsEmptyState } from '../../../common/AppDetailsEmptyState'
import { APP_DETAILS, ERROR_EMPTY_SCREEN } from '../../../../config/constantMessaging'

export default function AppDetail() {
    const params = useParams<{ appId: string; envId?: string }>()
    const { push } = useHistory()
    const { path } = useRouteMatch()
    const { environmentId, setEnvironmentId } = useAppContext() // global state for app to synchronise environments
    const [isAppDeleted, setIsAppDeleted] = useState(false)
    const [otherEnvsLoading, otherEnvsResult] = useAsync(() => getAppOtherEnvironmentMin(params.appId), [params.appId])
    const [commitInfo, showCommitInfo] = useState<boolean>(false)

    useEffect(() => {
        if (otherEnvsLoading) return
        if (
            !params.envId &&
            environmentId &&
            otherEnvsResult?.result?.map((env) => env.environmentId).includes(environmentId)
        ) {
            const newUrl = getAppDetailsURL(params.appId, environmentId)
            push(newUrl)
        } else if (!otherEnvsResult?.result?.map((env) => env.environmentId).includes(+params.envId)) {
            setEnvironmentId(null)
            return
        }
    }, [otherEnvsLoading])

    useEffect(() => {
        if (!params.envId) return
        setEnvironmentId(Number(params.envId))
        setIsAppDeleted(false)
    }, [params.envId])

    const renderAppNotConfigured = () => {
        return (
            otherEnvsResult &&
            !otherEnvsLoading && (
                <>
                    {(!otherEnvsResult?.result || otherEnvsResult?.result?.length === 0) && !isAppDeleted && (
                        <AppNotConfigured />
                    )}
                    {!params.envId && otherEnvsResult?.result?.length > 0 && (
                        <EnvironmentNotConfigured environments={otherEnvsResult?.result} />
                    )}
                </>
            )
        )
    }

    const environment = otherEnvsResult?.result?.find((env) => env.environmentId === +params.envId)
    return (
        <div data-testid="app-details-wrapper" className="app-details-page-wrapper">
            {!params.envId && otherEnvsResult?.result?.length > 0 && (
                <div className="w-100 pt-16 pr-20 pb-20 pl-20">
                    <SourceInfo appDetails={null} environments={otherEnvsResult?.result} environment={environment} />
                </div>
            )}
            {!params.envId && otherEnvsLoading && <Progressing pageLoader fullHeight />}
            <Route path={`${path.replace(':envId(\\d+)?', ':envId(\\d+)')}`}>
                <Details
                    key={params.appId + '-' + params.envId}
                    appDetailsAPI={fetchAppDetailsInTime}
                    isAppDeployment
                    environment={environment}
                    environments={otherEnvsResult?.result}
                    setIsAppDeleted={setIsAppDeleted}
                    commitInfo={commitInfo}
                    showCommitInfo={showCommitInfo}
                    isAppDeleted={isAppDeleted}
                />
            </Route>
            {otherEnvsResult && !otherEnvsLoading && renderAppNotConfigured()}
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
}) => {
    const params = useParams<{ appId: string; envId: string }>()
    const location = useLocation()
    const [streamData, setStreamData] = useState<AppStreamData>(null)
    const [detailedStatus, toggleDetailedStatus] = useState<boolean>(false)
    const [urlInfo, setUrlInfo] = useState<boolean>(false)
    const [hibernateConfirmationModal, setHibernateConfirmationModal] = useState<'' | 'resume' | 'hibernate'>('')
    const [hibernating, setHibernating] = useState<boolean>(false)
    const [showScanDetailsModal, toggleScanDetailsModal] = useState(false)
    const [lastExecutionDetail, setLastExecutionDetail] = useState({
        imageScanDeployInfoId: 0,
        severityCount: { critical: 0, moderate: 0, low: 0 },
        isError: false,
    })
    const [appDetailsError, setAppDetailsError] = useState(undefined)
    const [appDetails, setAppDetails] = useState(undefined)
    const [pollingIntervalID, setPollingIntervalID] = useState(null)
    const [externalLinksAndTools, setExternalLinksAndTools] = useState<ExternalLinksAndToolsType>({
        externalLinks: [],
        monitoringTools: [],
    })
    const [loadingDetails, setLoadingDetails] = useState(true)
    const [loadingResourceTree, setLoadingResourceTree] = useState(true)
    const appDetailsRef = useRef(null)
    const appDetailsRequestRef = useRef(null)

    const [deploymentStatusDetailsBreakdownData, setDeploymentStatusDetailsBreakdownData] =
        useState<DeploymentStatusDetailsBreakdownDataType>({
            ...processDeploymentStatusDetailsData(),
            deploymentStatus: DEFAULT_STATUS,
            deploymentStatusText: DEFAULT_STATUS,
        })
    let deploymentStatusTimer = null
    const isExternalToolAvailable: boolean =
        externalLinksAndTools.externalLinks.length > 0 && externalLinksAndTools.monitoringTools.length > 0
    const interval = window._env_.DEVTRON_APP_DETAILS_POLLING_INTERVAL || 30000
    appDetailsRequestRef.current = appDetails?.deploymentAppDeleteRequest

    const syncSSE = useEventSource(
        `${Host}/api/v1/applications/stream?name=${appDetails?.appName}-${appDetails?.environmentName}`,
        [params.appId, params.envId],
        appDetails &&
            !!appDetails.appName &&
            !!appDetails.environmentName &&
            appDetails.deploymentAppType !== DeploymentAppType.helm,
        (event) => setStreamData(JSON.parse(event.data)),
    )

    const aggregatedNodes: AggregatedNodes = useMemo(() => {
        return aggregateNodes(appDetails?.resourceTree?.nodes || [], appDetails?.resourceTree?.podMetadata || [])
    }, [appDetails])

    const getDeploymentDetailStepsData = (): void => {
       // Deployments status details for Devtron apps
        getDeploymentStatusDetail(params.appId, params.envId).then((deploymentStatusDetailRes) => {
            processDeploymentStatusData(deploymentStatusDetailRes.result)
        })
    }

    const processDeploymentStatusData = (deploymentStatusDetailRes: DeploymentStatusDetailsType): void => {
        const processedDeploymentStatusDetailsData = processDeploymentStatusDetailsData(deploymentStatusDetailRes)
        clearDeploymentStatusTimer()
        if (processedDeploymentStatusDetailsData.deploymentStatus === 'inprogress') {
            deploymentStatusTimer = setTimeout(() => {
                getDeploymentDetailStepsData()
            }, 10000)
        }
        setDeploymentStatusDetailsBreakdownData(processedDeploymentStatusDetailsData)
    }

    const clearDeploymentStatusTimer = (): void => {
        if (deploymentStatusTimer) {
            clearTimeout(deploymentStatusTimer)
        }
    }

    useEffect(() => {
        return () => {
            clearDeploymentStatusTimer()
        }
    }, [])

    const handleAppDetailsCallError = (error) => {
        if (error['code'] === 404 || appDetailsRequestRef.current) {
            if (setIsAppDeleted) {
                setIsAppDeleted(true)
            }
            setAppDetails(null)
            clearPollingInterval()
        } else if (!appDetails) {
            setAppDetailsError(error)
        }
    }

    async function callAppDetailsAPI(fetchExternalLinks?: boolean) {
        appDetailsAPI(params.appId, params.envId, 25000)
            .then((response) => {
                appDetailsRef.current = {
                    ...appDetailsRef.current,
                    ...response.result,
                }
                IndexStore.publishAppDetails(appDetailsRef.current, AppType.DEVTRON_APP)
                setAppDetails(appDetailsRef.current)
                _getDeploymentStatusDetail(appDetailsRef.current.deploymentAppType)

                if (fetchExternalLinks && response.result?.clusterId) {
                    getExternalLinksAndTools(response.result.clusterId)
                }
            })
            .catch(handleAppDetailsCallError)
            .finally(() => {
                setLoadingDetails(false)
            })
        fetchResourceTreeInTime(params.appId, params.envId, 25000)
            .then((response) => {
                appDetailsRef.current = {
                    ...appDetailsRef.current,
                    resourceTree: response.result,
                }
                IndexStore.publishAppDetails(appDetailsRef.current, AppType.DEVTRON_APP)
                setAppDetails(appDetailsRef.current)
            })
            .catch(handleAppDetailsCallError)
            .finally(() => {
                setLoadingResourceTree(false)
            })
    }

    function _getDeploymentStatusDetail(deploymentAppType: DeploymentAppType) {
        getDeploymentStatusDetail(params.appId, params.envId)
            .then((deploymentStatusDetailRes) => {
                if (deploymentStatusDetailRes.result) {
                    if (deploymentAppType === DeploymentAppType.helm) {
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

    async function callLastExecutionMinAPI(appId, envId) {
        if (!appId || !envId) return

        try {
            const { result } = await getLastExecutionMinByAppAndEnv(appId, envId)
            setLastExecutionDetail({
                imageScanDeployInfoId: result.imageScanDeployInfoId,
                severityCount: result.severityCount,
                isError: false,
            })
        } catch (error) {
            setLastExecutionDetail({
                imageScanDeployInfoId: 0,
                severityCount: { critical: 0, moderate: 0, low: 0 },
                isError: true,
            })
        }
    }

    function clearPollingInterval() {
        if (pollingIntervalID) {
            clearInterval(pollingIntervalID)
        }
    }

    useEffect(() => {
        if (appDetails && setAppDetailResultInParent) {
            setAppDetailResultInParent(appDetails)
        }

        if (!lastExecutionDetail.imageScanDeployInfoId && !lastExecutionDetail.isError) {
            callLastExecutionMinAPI(appDetails?.appId, appDetails?.environmentId)
        }
    }, [appDetails])

    useEffect(() => {
        if (appDetailsError) {
            showError(appDetailsError)
            return
        }
    }, [appDetailsError])

    // useInterval(polling, interval);
    useEffect(() => {
        if (isPollingRequired) {
            callAppDetailsAPI(true)
            const intervalID = setInterval(callAppDetailsAPI, interval)
            setPollingIntervalID(intervalID)
        } else {
            clearPollingInterval()
        }
    }, [isPollingRequired])

    useEffect(() => {
        return () => {
            clearPollingInterval()
        }
    }, [pollingIntervalID])

    async function handleHibernate(e) {
        try {
            setHibernating(true)
            const isUnHibernateReq = ['hibernating', 'hibernated'].includes(
                appDetails.resourceTree.status.toLowerCase(),
            )
            await stopStartApp(Number(params.appId), Number(params.envId), isUnHibernateReq ? 'START' : 'STOP')
            await callAppDetailsAPI()
            toast.success(isUnHibernateReq ? 'Pods restore initiated' : 'Pods scale down initiated')
            setHibernateConfirmationModal('')
        } catch (err) {
            showError(err)
        } finally {
            setHibernating(false)
        }
    }

    const hideAppDetailsStatus = (): void => {
        toggleDetailedStatus(false)
    }

    if (!loadingResourceTree && (!appDetails?.resourceTree || appDetails?.resourceTree?.nodes?.length <= 0)) {
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
                    <AppDetailsEmptyState envType={EnvType.APPLICATION} />
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

    const showApplicationDetailedModal = (): void => {
        toggleDetailedStatus(true)
    }

    return (
        <React.Fragment>
            <div className="w-100 pt-16 pr-20 pb-16 pl-20">
                <SourceInfo
                    appDetails={appDetails}
                    setDetailed={toggleDetailedStatus}
                    environment={environment}
                    environments={environments}
                    showCommitInfo={isAppDeployment && appDetails?.dataSource !== 'EXTERNAL' ? showCommitInfo : null}
                    showUrlInfo={isAppDeployment ? setUrlInfo : null}
                    showHibernateModal={isAppDeployment ? setHibernateConfirmationModal : null}
                    deploymentStatusDetailsBreakdownData={deploymentStatusDetailsBreakdownData} />
            </div>
            <SyncErrorComponent
                showApplicationDetailedModal={showApplicationDetailedModal}
                appStreamData={streamData}
            />

            {!loadingDetails && !loadingResourceTree && !appDetails?.deploymentAppDeleteRequest && (
                <>
                    <SecurityVulnerabilitites
                        imageScanDeployInfoId={lastExecutionDetail.imageScanDeployInfoId}
                        severityCount={lastExecutionDetail.severityCount}
                        onClick={() => {
                            toggleScanDetailsModal(true)
                        }}
                    />
                    {environment && (
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
                <div className="bcn-0 dc__border-top h-100">
                    <Progressing pageLoader fullHeight size={32} fillColor="var(--N500)" />
                </div>
            ) : (
                <NodeTreeDetailTab
                    appDetails={appDetails}
                    externalLinks={externalLinksAndTools.externalLinks}
                    monitoringTools={externalLinksAndTools.monitoringTools}
                    isDevtronApp={true}
                />
            )}
            {detailedStatus && (
                <AppStatusDetailModal
                    close={hideAppDetailsStatus}
                    appStreamData={streamData}
                    showAppStatusMessage={false}
                />
            )}
            {location.search.includes(DEPLOYMENT_STATUS_QUERY_PARAM) && (
                <DeploymentStatusDetailModal
                    appName={appDetails?.appName}
                    environmentName={appDetails?.environmentName}
                    streamData={streamData}
                    deploymentStatusDetailsBreakdownData={deploymentStatusDetailsBreakdownData}
                />
            )}
            {showScanDetailsModal && (
                <ScanDetailsModal
                    showAppInfo={false}
                    uniqueId={{
                        imageScanDeployInfoId: lastExecutionDetail.imageScanDeployInfoId,
                        appId: params.appId,
                        envId: params.envId,
                    }}
                    close={() => {
                        toggleScanDetailsModal(false)
                    }}
                />
            )}
            {urlInfo && <TriggerUrlModal appId={params.appId} envId={params.envId} close={() => setUrlInfo(false)} />}
            {commitInfo && (
                <TriggerInfoModal
                    appId={appDetails?.appId}
                    ciArtifactId={appDetails?.ciArtifactId}
                    close={() => showCommitInfo(false)}
                />
            )}
            {hibernateConfirmationModal && (
                <ConfirmationDialog>
                    <ConfirmationDialog.Icon
                        src={hibernateConfirmationModal === 'hibernate' ? warningIcon : restoreIcon}
                    />
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
                            onClick={(e) => setHibernateConfirmationModal('')}
                        >
                            Cancel
                        </button>
                        <button
                            className="cta"
                            disabled={hibernating}
                            data-testid={`app-details-${
                                hibernateConfirmationModal === 'hibernate' ? 'hibernate' : 'restore'
                            }`}
                            onClick={handleHibernate}
                        >
                            {hibernating ? (
                                <Progressing />
                            ) : hibernateConfirmationModal === 'hibernate' ? (
                                `Hibernate App`
                            ) : (
                                'Restore App'
                            )}
                        </button>
                    </ConfirmationDialog.ButtonGroup>
                </ConfirmationDialog>
            )}
        </React.Fragment>
    )
}

export function EnvSelector({
    environments,
    disabled,
    controlStyleOverrides,
}: {
    environments: any
    disabled: boolean
    controlStyleOverrides?: React.CSSProperties
}) {
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
        menu: (base) => ({ ...base, width: '280px' }),
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
            <div data-testid="app-deployed-env-name" className="app-details__selector w-200">
                <Select
                    placeholder="Select Environment"
                    options={
                        Array.isArray(sortedEnvironments)
                            ? sortedEnvironments.map((env) => ({
                                  label: env.environmentName,
                                  value: env.environmentId,
                                  description: env.description,
                              }))
                            : []
                    }
                    value={envId ? { value: +envId, label: environmentName } : null}
                    onChange={(selected, meta) => selectEnvironment((selected as any).value)}
                    closeMenuOnSelect
                    components={{
                        IndicatorSeparator: null,
                        Option,
                        DropdownIndicator: disabled ? null : components.DropdownIndicator,
                        ValueContainer: (props) => <CustomValueContainer {...props} valClassName="env-select" />,
                    }}
                    styles={envSelectorStyle}
                    isDisabled={disabled}
                    isSearchable={false}
                    classNamePrefix="app-environment-select"
                    formatOptionLabel={formatOptionLabel}
                />
            </div>
        </>
    )
}

export function EventsLogsTabSelector({ onMouseDown = null }) {
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
            <div className={`pl-20 flex left tab-container ${!!params.tab ? 'dc__cursor--ns-resize ' : 'pointer'}`}>
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
            <div className={`flex right pr-20 ${!!params.tab ? 'dc__cursor--ns-resize ' : 'pointer'}`}>
                <div
                    className="flex pointer"
                    style={{ height: '36px', width: '36px' }}
                    onClick={(e) => {
                        e.stopPropagation()
                        queryParams.delete('kind')
                        history.push(
                            generatePath(path, { ...params, tab: params.tab ? null : NodeDetailTabs.MANIFEST }) +
                                '?' +
                                queryParams.toString(),
                        )
                    }}
                >
                    <NavigationArrow
                        style={{ ['--rotateBy' as any]: !!params?.tab ? '0deg' : '180deg' }}
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
        history.replace(url + '?' + queryParams.toString())
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

    if (params.tab === NodeDetailTabs.TERMINAL) initContainers = []

    let total = containers.concat(initContainers)
    let allContainers = total.filter((item) => !!item)

    allContainers.forEach((item) => {
        if (item?.length < 2) {
            let contAvailable = allContainers[0]
            if (contAvailable && !selectedContainer) {
                selectContainer(contAvailable[0])
            }
        } else {
            if (!selectedContainer) {
                selectContainer(null)
            }
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

    let isSocketConnecting = socketConnection === 'CONNECTING' || socketConnection === 'CONNECTED'
    let podItems = params.tab?.toLowerCase() == 'logs' ? selectedNodes : nodeName
    return (
        <div className="pl-20 flex left" style={{ background: '#2c3354' }}>
            {params.tab === NodeDetailTabs.TERMINAL && (
                <>
                    <div className={`flex mr-12`}>
                        <Tippy
                            className="default-tt"
                            arrow={false}
                            placement="bottom"
                            content={isSocketConnecting ? 'Disconnect' : 'Connect'}
                        >
                            {isSocketConnecting ? (
                                <Disconnect className="icon-dim-20 mr-5" onClick={onClickDisconnectTab} />
                            ) : (
                                <Connect className="icon-dim-20 mr-5" onClick={onClickConnectTab} />
                            )}
                        </Tippy>

                        <Tippy className="default-tt" arrow={false} placement="bottom" content={'Clear'}>
                            <Abort className="icon-dim-20 mr-8 ml-8" onClick={onClickAbort} />
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

                    <Tippy className="default-tt" arrow={false} placement="bottom" content={'Clear'}>
                        <Abort className="icon-dim-20 mr-16 ml-8" onClick={onLogsCleared} />
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

export function AppNotConfigured({
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
}) {
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
                {subtitle ? (
                    subtitle
                ) : (
                    <>
                        {APP_DETAILS.APP_FULLY_NOT_CONFIGURED}&nbsp;
                        <a href={DOCUMENTATION.APP_CREATE} target="_blank">
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

export function EnvironmentNotConfigured({ environments, ...props }) {
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

export function TimeRangeSelector({
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
}) {
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
                menuPortalTarget={document.body}
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

export function SyncStatusMessage(app: Application) {
    let message = app.spec.source.targetRevision || 'HEAD'
    if (app.status.sync.revision) {
        if (app.spec.source?.chart) {
            message += ' (' + app.status.sync.revision + ')'
        } else if (
            app.status.sync.revision.length >= 7 &&
            !app.status.sync.revision.startsWith(app.spec.source.targetRevision)
        ) {
            message += ' (' + app.status.sync.revision.substr(0, 7) + ')'
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

const getOperationStateTitle = (app: Application) => {
    const appOperationState = getAppOperationState(app)
    const operationType = getOperationType(app)
    switch (operationType) {
        case 'Delete':
            return 'Deleting'
        case 'Sync':
            switch (appOperationState.phase) {
                case 'Running':
                    return 'Syncing'
                case 'Error':
                    return 'Sync error'
                case 'Failed':
                    return 'Sync failed'
                case 'Succeeded':
                    return 'Sync OK'
                case 'Terminating':
                    return 'Terminated'
            }
    }
    return 'Unknown'
}

export const getAppOperationState = (app: Application) => {
    if (app.metadata.deletionTimestamp) {
        return {
            phase: 'Running',
            startedAt: app.metadata.deletionTimestamp,
        }
    } else if (app.operation) {
        return {
            phase: 'Running',
            startedAt: new Date().toISOString(),
            operation: {
                sync: {},
            },
        }
    } else {
        return app.status.operationState
    }
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
