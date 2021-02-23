import React, { useEffect, useState, useMemo } from 'react';
import { fetchAppDetailsInTime } from '../../service';
import {
    Host,
    getAppDetailsURL,
    getAppTriggerURL,
    getAppCDURL,
} from '../../../../config';
import {
    NavigationArrow,
    Redirect as RedirectIcon,
    Branch,
    useEffectAfterMount,
    showError,
    Progressing,
    VisibleModal,
    createGitCommitUrl,
    ConfirmationDialog,
    useAppContext,
    noop,
    useEventSource,
    not,
    FragmentHOC,
    useSearchString,
    multiSelectStyles,
    useAsync,
    SingleSelectOption as Option,
    ScanDetailsModal,
} from '../../../common';
import { getAppConfigStatus, getAppOtherEnvironment, stopStartApp, getLastExecutionMinByAppAndEnv } from '../../../../services/service';
import { Link } from 'react-router-dom';
import ResourceTreeNodes from '../../ResourceTreeNodes';
import EventsLogs from '../../EventsLogs';
import ResponsiveDrawer from '../../ResponsiveDrawer';
import { toast } from 'react-toastify';
import { useParams, useHistory, useRouteMatch, generatePath, Route, useLocation } from 'react-router';
//@ts-check
import moment from 'moment';
import AppNotDeployedIcon from '../../../../assets/img/app-not-deployed.png';
import AppNotConfiguredIcon from '../../../../assets/img/app-not-configured.png';
import restoreIcon from '../../../../assets/icons/ic-restore.svg';
import warningIcon from '../../../../assets/icons/ic-warning.svg';
import { ReactComponent as PlayButton } from '../../../../assets/icons/ic-play.svg';
import { ReactComponent as Connect } from '../../../../assets/icons/ic-connected.svg';
import { ReactComponent as Disconnect } from '../../../../assets/icons/ic-disconnected.svg';
import { ReactComponent as Abort } from '../../../../assets/icons/ic-abort.svg';
import { ReactComponent as StopButton } from '../../../../assets/icons/ic-stop.svg';
import { ReactComponent as AlertTriangle } from '../../../../assets/icons/ic-alert-triangle.svg';
import { ReactComponent as DropDownIcon } from '../../../../assets/icons/appstatus/ic-dropdown.svg';
import { ReactComponent as ScaleDown } from '../../../../assets/icons/ic-scale-down.svg';
import { ReactComponent as CommitIcon } from '../../../../assets/icons/ic-code-commit.svg';
import Tippy from '@tippyjs/react';
import ReactGA from 'react-ga';
import Select, { components } from 'react-select';
import { SourceInfo } from './SourceInfo'
import {
    AppStreamData,
    Application,
    Nodes,
    NodeType,
    AggregatedNodes,
    NodeDetailTabs,
    NodeDetailTabsType,
    AppDetails,
} from '../../types';
import { aggregateNodes, SecurityVulnerabilitites } from './utils';
import { AppMetrics } from './AppMetrics';
export type SocketConnectionType = 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'DISCONNECTING';

export default function AppDetail() {
    const params = useParams<{ appId: string; envId?: string }>();
    const { push } = useHistory();
    const { url, path } = useRouteMatch();
    const { environmentId, setEnvironmentId } = useAppContext(); // global state for app to synchronise environments
    const [
        otherEnvsLoading,
        otherEnvsResult,
        otherEnvsError,
        reloadAppOtherEnv,
        setState,
        syncOtherEnvState,
    ] = useAsync(() => getAppOtherEnvironment(params.appId), [params.appId]);
    useEffect(() => {
        if (otherEnvsLoading) return;
        if (
            !params.envId &&
            environmentId &&
            otherEnvsResult?.result?.map((env) => env.environmentId).includes(environmentId)
        ) {
            const newUrl = getAppDetailsURL(params.appId, environmentId);
            push(newUrl);
        } else if (!otherEnvsResult?.result?.map((env) => env.environmentId).includes(+params.envId)) {
            setEnvironmentId(null);
            return;
        }
    }, [otherEnvsLoading]);

    useEffect(() => {
        if (!params.envId) return;
        setEnvironmentId(Number(params.envId));
    }, [params.envId]);
    return (
        <div style={{ overflowY: 'auto', height: '100%' }}>
            <div className="flex left column w-100" style={{ minHeight: '100%', justifyContent: 'flex-start' }}>
                {/* <div className="flex left w-100 p-16">
                    <EnvSelector environments={otherEnvsResult?.result} />
                </div> */}
                {!params.envId && otherEnvsResult?.result?.length > 0 && (
                    <div className="w-100 pt-16 pr-24 pb-20 pl-24">
                        <SourceInfo
                            appDetails={null}
                            environments={otherEnvsResult?.result}
                        />
                    </div>
                )}
                <Route path={`${path.replace(':envId(\\d+)?', ':envId(\\d+)')}`}>
                    <Details key={params.appId + "-" + params.envId}
                        appDetailsAPI={fetchAppDetailsInTime}
                        isAppDeployment
                        environment={otherEnvsResult?.result?.find((env) => env.environmentId === +params.envId)}
                        environments={otherEnvsResult?.result}
                    />
                </Route>
                {otherEnvsResult && !otherEnvsLoading &&
                    <>
                        {(!otherEnvsResult?.result || otherEnvsResult?.result?.length === 0) && <AppNotConfigured text="You have not finished configuring this app" />}
                        {(!params.envId && otherEnvsResult?.result?.length > 0) && <EnvironmentNotConfigured environments={otherEnvsResult?.result} />}
                    </>}
            </div>
        </div>
    );
}

export const Details: React.FC<{
    environment?: any;
    appDetailsAPI: (appId: string, envId: string, timeout: number) => Promise<any>;
    setAppDetailResultInParent?: (appDetails) => void;
    isAppDeployment?: boolean;
    environments: any;
    isPollingRequired?: boolean;
}> = ({ appDetailsAPI, setAppDetailResultInParent, environment, isAppDeployment = false, environments, isPollingRequired = true }) => {
    const params = useParams<{ appId: string; envId: string }>();
    const location = useLocation();
    const [streamData, setStreamData] = useState<AppStreamData>(null);
    const { url, path } = useRouteMatch();
    const [detailedNode, setDetailedNode] = useState<{ name: string; containerName?: string }>(null);
    const [detailedStatus, toggleDetailedStatus] = useState<boolean>(false);
    const [commitInfo, showCommitInfo] = useState<boolean>(false)
    const [hibernateConfirmationModal, setHibernateConfirmationModal] = useState<'' | 'resume' | 'hibernate'>('');
    const [hibernating, setHibernating] = useState<boolean>(false)
    const [showScanDetailsModal, toggleScanDetailsModal] = useState(false)
    const [lastExecutionDetail, setLastExecutionDetail] = useState({
        imageScanDeployInfoId: 0,
        severityCount: { critical: 0, moderate: 0, low: 0 },
        isError: false,
    })
    const [appDetailsLoading, setAppDetailsLoading] = useState(true);
    const [appDetailsError, setAppDetailsError] = useState(undefined);
    const [appDetailsResult, setAppDetailsResult] = useState(undefined);
    const [pollingIntervalID, setPollingIntervalID] = useState(null);
    let prefix = '';
    if (process.env.NODE_ENV === 'production') {
    //     //@ts-ignore
    //     prefix = `${location.protocol}//${location.host}`; 
    }
    
    const interval = 30000;
    const appDetails = appDetailsResult?.result;
    const syncSSE = useEventSource(
        `${Host}/api/v1/applications/stream?name=${appDetails?.appName}-${appDetails?.environmentName}`,
        [params.appId, params.envId],
        !!appDetails?.appName && !!appDetails?.environmentName,
        (event) => setStreamData(JSON.parse(event.data)),
    );

    const aggregatedNodes: AggregatedNodes = useMemo(() => {
        return aggregateNodes(appDetails?.resourceTree?.nodes || [], appDetails?.resourceTree?.podMetadata || []);
    }, [appDetails]);

    async function callAppDetailsAPI() {
        try {
            let response = await appDetailsAPI(params.appId, params.envId, 25000);
            setAppDetailsResult(response);
            setAppDetailsLoading(false);
        } catch (error) {
            if (!appDetailsResult) {
                setAppDetailsError(error);
            }
        }
    }

    function describeNode(name: string, containerName: string) {
        setDetailedNode({ name, containerName });
    }

    async function callLastExecutionMinAPI(appId, envId) {
        if (!appId || !envId) return;

        try {
            const { result } = await getLastExecutionMinByAppAndEnv(appId, envId);;
            setLastExecutionDetail({
                imageScanDeployInfoId: result.imageScanDeployInfoId,
                severityCount: result.severityCount,
                isError: false,
            });
        } catch (error) {
            setLastExecutionDetail({
                imageScanDeployInfoId: 0,
                severityCount: { critical: 0, moderate: 0, low: 0 },
                isError: true,
            });
        }
    }

    function clearPollingInterval() {
        if (pollingIntervalID) {
            clearInterval(pollingIntervalID);
        }
    }

    useEffect(() => {
        if (appDetailsResult && setAppDetailResultInParent) {
            setAppDetailResultInParent(appDetailsResult?.result);
        }

        if (!lastExecutionDetail.imageScanDeployInfoId && !lastExecutionDetail.isError) {
            callLastExecutionMinAPI(appDetailsResult?.result?.appId, appDetailsResult?.result?.environmentId)
        }
    }, [appDetailsResult]);


    useEffect(() => {
        if (appDetailsError) {
            showError(appDetailsError)
            return
        }
    }, [appDetailsError]);

    // useInterval(polling, interval);
    useEffect(() => {
        if (isPollingRequired) {
            callAppDetailsAPI();
            const intervalID = setInterval(callAppDetailsAPI, interval);
            setPollingIntervalID(intervalID);
        }
        else {
            clearPollingInterval();
        }
    }, [isPollingRequired])

    useEffect(() => {
        return () => {
            clearPollingInterval()
        }
    }, [pollingIntervalID])

    if (appDetailsLoading && !appDetails) {
        return <div className="w-100 flex" style={{ height: 'calc(100vh - 80px)' }}>
            <Progressing pageLoader />
        </div>
    }

    let message = null;
    const conditions = appDetails?.resourceTree?.conditions;
    const Rollout = aggregatedNodes?.nodes?.Rollout
    if (
        ['progressing', 'degraded'].includes(appDetails?.resourceTree?.status.toLowerCase()) &&
        Array.isArray(conditions) &&
        conditions?.length > 0 &&
        conditions[0].message
    ) {
        message = conditions[0].message;
    } else if (Array.isArray(Rollout) && Rollout.length > 0 && Rollout[0].health && Rollout[0].health.message) {
        message = Rollout[0]?.health?.message;
    }

    async function handleHibernate(e) {
        try {
            setHibernating(true);
            await stopStartApp(Number(params.appId), Number(params.envId), appDetails.resourceTree.status.toLowerCase() === 'hibernating' ? 'START' : 'STOP');
            toast.success('Deployment initiated.');
            setHibernateConfirmationModal('');
        } catch (err) {
            showError(err);
        } finally {
            setHibernating(false);
        }
    }

    return (
        <React.Fragment>
            {/* <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    width: '100%',
                    gridTemplateRows: '146px',
                    gridColumnGap:'12px',
                }}
                className="pl-16 pr-16 pb-16"
            >
                {appDetailsResult?.result && <MaterialCard
                    streamData={streamData}
                    appDetails={appDetailsResult?.result}
                    Rollout={aggregatedNodes.nodes?.Rollout}
                    nodes={aggregatedNodes}
                />}
                <AppSyncDetails streamData={streamData} />
            </div> */}
            <div className="w-100 pt-16 pr-24 pb-20 pl-24">
                <SourceInfo
                    appDetails={appDetails}
                    setDetailed={toggleDetailedStatus}
                    environments={environments}
                    showCommitInfo={isAppDeployment ? showCommitInfo : null}
                    showHibernateModal={isAppDeployment ? setHibernateConfirmationModal : null}
                />
            </div>
            <SyncError appStreamData={streamData} />
            <SecurityVulnerabilitites imageScanDeployInfoId={lastExecutionDetail.imageScanDeployInfoId}
                severityCount={lastExecutionDetail.severityCount}
                onClick={() => { toggleScanDetailsModal(true) }} />
            {environment && <AppMetrics appName={appDetails.appName} environment={environment} podMap={aggregatedNodes.nodes.Pod} />}
            <Route path={`${path}/:kind?/:tab?`}>
                <NodeDetails
                    nodes={aggregatedNodes}
                    describeNode={describeNode}
                    appDetails={appDetails}
                    nodeName={detailedNode?.name}
                    containerName={detailedNode?.containerName}
                    isAppDeployment={isAppDeployment}
                />
            </Route>

            {detailedStatus && (
                <ProgressStatus
                    message={message}
                    nodes={aggregatedNodes}
                    streamData={streamData}
                    status={appDetails?.resourceTree?.status}
                    close={(e) => toggleDetailedStatus(false)}
                    appName={appDetails.appName}
                    environmentName={appDetails.environmentName}
                />
            )}
            {showScanDetailsModal ? <ScanDetailsModal
                showAppInfo={false}
                uniqueId={{
                    imageScanDeployInfoId: lastExecutionDetail.imageScanDeployInfoId,
                    appId: params.appId,
                    envId: params.envId
                }}
                close={() => { toggleScanDetailsModal(false) }} /> : null}

            {commitInfo && (
                <VisibleModal className="app-status__material-modal">
                    <CommitInfo onHide={() => showCommitInfo(false)} material={appDetails?.materialInfo} />
                </VisibleModal>
            )}

            {hibernateConfirmationModal && (
                <ConfirmationDialog>
                    <ConfirmationDialog.Icon
                        src={hibernateConfirmationModal === 'hibernate' ? warningIcon : restoreIcon}
                    />
                    <ConfirmationDialog.Body
                        title={`${hibernateConfirmationModal === 'hibernate' ? 'Hibernate' : 'Restore'} '${appDetails.appName
                            }' on '${appDetails.environmentName}'`}
                        subtitle={
                            <p>
                                Pods for this application will be{' '}
                                <b>
                                    scaled{' '}
                                    {hibernateConfirmationModal === 'hibernate'
                                        ? 'down to 0'
                                        : ' upto its original count'}{' '}
                                    on {appDetails.environmentName}
                                </b>{' '}
                                environment.
                            </p>
                        }
                    >
                        <p style={{ marginTop: '16px' }}>Are you sure you want to continue?</p>
                    </ConfirmationDialog.Body>
                    <ConfirmationDialog.ButtonGroup>
                        <button className="cta cancel" onClick={(e) => setHibernateConfirmationModal('')}>
                            Cancel
                        </button>
                        <button className="cta" disabled={hibernating} onClick={handleHibernate}>
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
    );
};

const NodeDetails: React.FC<{
    nodes: AggregatedNodes;
    nodeName?: string;
    containerName?: string;
    appDetails: AppDetails;
    isAppDeployment: boolean;
    describeNode: (name: string, containerName?: string) => void;
}> = ({ nodes, describeNode, appDetails, nodeName, containerName, isAppDeployment }) => {
    const [selectedNode, selectNode] = useState<string>(null);
    const [selectedContainer, selectContainer] = useState(null);
    const { searchParams } = useSearchString()
    const [logsPaused, toggleLogStream] = useState(false);
    const [socketConnection, setSocketConnection] = useState<SocketConnectionType>("CONNECTING");
    const [terminalCleared, setTerminalCleared] = useState(false);
    const [isReconnection, setIsReconnection] = useState(false);
    const [shell, selectShell] = useState({ label: "sh", value: "sh" });
    const { url, path } = useRouteMatch();

    const params = useParams<{ appId: string; envId: string; kind?: NodeType; tab?: NodeDetailTabsType }>();

    useEffect(() => {
        if (nodeName && nodeName !== selectedNode) {
            selectNode(nodeName);
            if (containerName && containerName !== selectedContainer) {
                selectContainer(containerName);
            }
            else {
                selectContainer(null);
            }
        }
        else {
            selectContainer(null);
            selectNode(null);
        }
    }, [nodeName, containerName]);

    useEffect(() => {
        return () => {
            selectContainer(null);
            selectNode(null);
        };
    }, [])

    useEffect(() => {
        if (!params.tab || nodeName || selectedNode || selectedContainer || containerName) return;
        ReactGA.event({
            category: 'app-details',
            action: 'click',
            label: params.tab,
        });
        //select pod
        const kind: Nodes = searchParams.kind as Nodes || params.kind as Nodes
        const node = nodes.nodes[kind] ? Array.from(nodes.nodes[kind]).find(([name, nodeDetails]) => kind === Nodes.Pod ? nodeDetails.isNew : !!name) : null
        if (node && node.length && node[1].name) {
            selectNode(node[1].name);
        }
    }, [params.tab])

    useEffect(() => {
        if (!selectedNode) return
        if ((params.tab === NodeDetailTabs.LOGS || params.tab === NodeDetailTabs.TERMINAL) && (params.kind === Nodes.Pod || searchParams.kind === Nodes.Pod)) {
            const containers = nodes.nodes[Nodes.Pod].has(selectedNode) ? nodes.nodes[Nodes.Pod].get(selectedNode).containers : []
            const container = (containers || []).find(c => c !== 'envoy');
            if (container) {
                selectContainer(container);
            }
            else if (containers?.length) {
                selectContainer(containers[0]);
            }
            else {
                selectContainer(null)
            }
        }
    }, [selectedNode, params.tab])

    function handleLogsPause(paused: boolean) {
        toggleLogStream(paused);
    }
    return (
        <>
            <ResourceTreeNodes
                nodes={nodes}
                describeNode={describeNode}
                isAppDeployment={isAppDeployment}
                appName={appDetails?.appName}
                environmentName={appDetails?.environmentName}
            />
            <ResponsiveDrawer
                className="events-logs"
                isDetailedView={!!params.tab}
                onHeightChange={(height) => (document.getElementById('dummy-div').style.height = `${height}px`)}
                anchor={params.kind ? <EventsLogsTabSelector /> : null}
            >
                <Route path={`${path.replace('/:kind?', '/:kind').replace('/:tab?', '/:tab')}`}>
                    <NodeSelectors showOldOrNewSuffix={isAppDeployment}
                        logsPaused={logsPaused}
                        socketConnection={socketConnection}
                        containerName={selectedContainer}
                        nodeName={selectedNode}
                        nodes={nodes}
                        shell={shell}
                        isReconnection={isReconnection}
                        setIsReconnection={setIsReconnection}
                        selectShell={selectShell}
                        setSocketConnection={setSocketConnection}
                        setTerminalCleared={setTerminalCleared}
                        handleLogsPause={handleLogsPause}
                        selectNode={selectNode}
                        selectContainer={selectContainer}
                    />
                    <EventsLogs nodeName={selectedNode}
                        nodes={nodes}
                        appDetails={appDetails}
                        containerName={selectedContainer}
                        logsPaused={logsPaused}
                        socketConnection={socketConnection}
                        terminalCleared={terminalCleared}
                        shell={shell}
                        isReconnection={isReconnection}
                        setIsReconnection={setIsReconnection}
                        selectShell={selectShell}
                        setTerminalCleared={setTerminalCleared}
                        setSocketConnection={setSocketConnection}
                        handleLogPause={handleLogsPause}
                    />
                </Route>
            </ResponsiveDrawer>
            <div id="dummy-div" style={{ width: '100%', height: '32px' }}></div>
        </>
    );
};

export function EnvSelector({ environments, disabled }) {
    const { push } = useHistory();
    const { path } = useRouteMatch();
    const { appId, envId } = useParams<{ appId: string, envId?: string; }>();

    function selectEnvironment(newEnvId) {

        const newUrl = generatePath(path, { appId, envId: newEnvId });
        push(newUrl);
    }

    const environmentsMap = Array.isArray(environments)
        ? environments.reduce((agg, curr) => {
            agg[curr.environmentId] = curr.environmentName;
            return agg;
        }, {})
        : {};
    const environmentName = environmentsMap[+envId];

    return (
        <>
            <div style={{ width: 'clamp( 100px, 30%, 200px )', height: '100%', position: 'relative' }}>
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
            <div style={{ width: '200px' }}>
                <Select options={Array.isArray(environments) ?
                    environments.map(env => ({ label: env.environmentName, value: env.environmentId })) : []}
                    placeholder='Select Environment'
                    value={envId ? { value: +envId, label: environmentName } : null}
                    onChange={(selected, meta) => selectEnvironment((selected as any).value)}
                    closeMenuOnSelect
                    components={{ IndicatorSeparator: null, Option, DropdownIndicator: disabled ? null : components.DropdownIndicator }}
                    styles={{
                        ...multiSelectStyles,
                        control: (base, state) => ({ ...base, border: '1px solid #0066cc', backgroundColor: 'transparent' }),
                        singleValue: (base, state) => ({ ...base, fontWeight: 600, color: '#06c' })
                    }}
                    isDisabled={disabled}
                    isSearchable={false}
                />
            </div>
        </>
    );
}

function CommitInfo({ onHide, material }) {
    return (
        <section className="app-summary__source-info">
            <div className="app-summary__source-table">
                <div className="app-summary__source-row app-summary__source-row--header">
                    {['Date', 'Commit Msg', 'Author', 'Revision'].map((title, idx) => (
                        <span key={idx}>{title}</span>
                    ))}
                    <span>
                        <div className="flex">
                            <span>Branch / Tag</span>
                        </div>
                    </span>
                </div>
                {material?.map(({ author, branch, message, modifiedTime, revision, url }, idx) => (
                    <div className="app-summary__source-row" key={idx}>
                        <span>{modifiedTime}</span>
                        <span>{message}</span>
                        <span>{author}</span>
                        <div className="app-summary__commit-url-container">
                            <a rel="noreferrer noopener" target="_blank" href={createGitCommitUrl(url, revision)}>
                                <div className="app-summary__commit-url">{revision}</div>
                                <RedirectIcon style={{ width: '12px', height: '12px' }} />
                            </a>
                        </div>
                        <div className="flex tag-container">
                            <Branch style={{ width: '12px', height: '12px', marginRight: '4px' }} color="#06c" />
                            <div className="tag ellipsis-right">{branch}</div>
                        </div>
                    </div>
                ))}
                <div className=" fa fa-close" onClick={onHide}></div>
            </div>
        </section>
    );
}

const AppSyncDetails: React.FC<{ streamData: AppStreamData }> = ({ streamData }) => {
    const gitStatus = streamData?.result?.application?.status?.sync?.status || ''
    const operationState = streamData ? getOperationStateTitle(streamData?.result?.application) : ''
    return (
        <>
            <div className="material-sync-card bcn-0">
                <div className="flex left top w-100">
                    <div className="flex left column">
                        <span className="fs-12 cn-9">Git Status</span>
                        <div className={`fs-14 fw-6 app-summary__status-name f-${gitStatus.toLowerCase()}`}>
                            {gitStatus}
                        </div>
                    </div>
                    <figure
                        className={`icon-dim-20 app-status-icon ${gitStatus.toLowerCase()}`}
                        style={{ marginLeft: 'auto' }}
                    />
                </div>
                <div className="material-sync-card--message">
                    {streamData && SyncStatusMessage(streamData?.result?.application)}
                </div>
            </div>
            <div className="material-sync-card bcn-0">
                <div className="flex left top w-100">
                    <div className="flex left column">
                        <span className="fs-12 cn-9">Git Change Sync</span>
                        <div className={`fs-14 fw-6 app-summary__status-name f-${operationState.toLowerCase()}`}>
                            {operationState}
                        </div>
                    </div>
                    <figure
                        className={`icon-dim-20 app-status-icon ${operationState.toLowerCase()}`}
                        style={{ marginLeft: 'auto' }}
                    />
                </div>
            </div>
        </>
    );
};

export function EventsLogsTabSelector({ onMouseDown = null }) {
    const params = useParams<{ appId: string; envId: string; tab?: NodeDetailTabs; kind?: NodeDetailTabs }>();
    const { queryParams, searchParams } = useSearchString()
    const history = useHistory();
    const { path } = useRouteMatch();
    const location = useLocation()
    const kind = searchParams.kind || params.kind
    return (
        <FragmentHOC
            onMouseDown={onMouseDown || noop}
            style={{ background: '#2c3354', boxShadow: 'inset 0 -1px 0 0 #0b0f22' }}
            onClick={
                params.tab
                    ? () => { }
                    : (e) => {
                        history.push(
                            generatePath(path, { ...params, tab: NodeDetailTabs.MANIFEST }) + location.search,
                        );
                    }
            }
        >
            <div className={`pl-20 flex left tab-container ${!!params.tab ? 'cursor--ns-resize' : 'pointer'}`}>
                {[NodeDetailTabs.MANIFEST, NodeDetailTabs.EVENTS,
                ...(kind === Nodes.Pod ? [NodeDetailTabs.LOGS, NodeDetailTabs.TERMINAL] : []),
                ].map((title, idx) => (
                    <div key={idx}
                        className={`tab capitalize ${params.tab?.toLowerCase() === title.toLowerCase() ? 'active' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            history.push(generatePath(path, { ...params, tab: title }) + location.search);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}>
                        {title}
                    </div>
                ))}
            </div>
            <div className={`flex right pr-20 ${!!params.tab ? 'cursor--ns-resize' : 'pointer'}`}>
                <div className="flex pointer"
                    style={{ height: '36px', width: '36px' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        queryParams.delete('kind');
                        history.push(
                            generatePath(path, { ...params, tab: params.tab ? null : NodeDetailTabs.MANIFEST }) +
                            '?' +
                            queryParams.toString(),
                        );
                    }}>
                    <NavigationArrow
                        style={{ ['--rotateBy' as any]: !!params?.tab ? '0deg' : '180deg' }}
                        color="#fff"
                        className="icon-dim-20 rotate"
                    />
                </div>
            </div>
        </FragmentHOC>
    );
}

interface NodeSelectors {
    logsPaused: boolean;
    socketConnection: SocketConnectionType;
    nodeName?: string;
    containerName?: string;
    showOldOrNewSuffix?: boolean;
    nodes: AggregatedNodes;
    shell: { label: string; value: string };
    isReconnection: boolean;
    setIsReconnection: (flag) => void;
    selectShell: (shell: { label: string; value: string }) => void;
    setTerminalCleared: (flag: boolean) => void;
    handleLogsPause: (e: any) => void;
    selectNode: (nodeName: string) => void;
    selectContainer: (containerName: string) => void;
    setSocketConnection: (value: SocketConnectionType) => void;
    children?: any;
}
export const NodeSelectors: React.FC<NodeSelectors> = ({
    logsPaused = false,
    socketConnection = true,
    nodeName,
    nodes,
    containerName,
    showOldOrNewSuffix = false,
    shell,
    isReconnection,
    setIsReconnection,
    selectShell,
    setTerminalCleared,
    handleLogsPause = null,
    setSocketConnection,
    selectNode,
    selectContainer,
    children = null,
}) => {
    const params = useParams<{ appId: string; envId: string; kind: Nodes; tab: NodeDetailTabs, showOldOrNewSuffix }>();
    const { queryParams, searchParams } = useSearchString();
    const { url, path } = useRouteMatch()
    const history = useHistory()

    if (!searchParams?.kind) {
        queryParams.set('kind', params.kind)
        history.replace(url + '?' + queryParams.toString())
        return null
    }
    const kind: Nodes = searchParams.kind as Nodes

    const nodesMap = nodes.nodes[kind] || new Map();

    const containers =
        (kind === Nodes.Pod || searchParams.kind === Nodes.Pod) && nodesMap && nodesMap.has(nodeName) ? nodesMap.get(nodeName)?.containers : null;

    function getPodNameSuffix(nodeName: string) {
        if (Nodes.Pod !== kind || !showOldOrNewSuffix) return ''
        if (!nodesMap.has(nodeName)) return ''
        const pod = nodesMap.get(nodeName)
        return pod.isNew ? '(new)' : '(old)'
    }

    let isSocketConnecting = socketConnection === 'CONNECTING' || socketConnection === 'CONNECTED';
    return <div className="pl-20 flex left" style={{ background: '#2c3354' }}>
        {params.tab === NodeDetailTabs.TERMINAL && <>
            <div className={`flex mr-12`}>
                <Tippy className="default-tt"
                    arrow={false}
                    placement="bottom"
                    content={isSocketConnecting ? 'Disconnect' : 'Connect'} >
                    {isSocketConnecting ? <Disconnect className="icon-dim-20 mr-5" onClick={(e) => { setSocketConnection('DISCONNECTING'); setIsReconnection(true); }} /> : <Connect className="icon-dim-20 mr-5" onClick={(e) => { setSocketConnection('CONNECTING') }} />}
                </Tippy>

                <Tippy className="default-tt"
                    arrow={false}
                    placement="bottom"
                    content={'Clear'} >
                    <Abort className="icon-dim-20 mr-8 ml-8" onClick={(e) => { setTerminalCleared(true); }} />
                </Tippy>
            </div>
            <span style={{ width: '1px', height: '16px', background: '#0b0f22' }} />
        </>}
        {handleLogsPause && params.tab === NodeDetailTabs.LOGS && (
            <>
                <Tippy
                    className="default-tt"
                    arrow={false}
                    placement="bottom"
                    content={logsPaused ? 'Resume logs (Ctrl+C)' : 'Stop logs (Ctrl+C)'}
                >
                    <div
                        className={`toggle-logs mr-12 ${logsPaused ? 'play' : 'stop'}`}
                        onClick={(e) => handleLogsPause(!logsPaused)}
                    >
                        {logsPaused ? <PlayButton /> : <StopButton className="stop-btn fcr-5" />}
                    </div>
                </Tippy>
                <span style={{ width: '1px', height: '16px', background: '#0b0f22' }} />
            </>
        )}
        <div className="events-logs__dropdown-selector pods">
            <span className="events-logs__label">{kind}</span>
            <div style={{ width: '175px' }}>
                <Select
                    placeholder={`Select ${kind}`}
                    options={Array.from(nodesMap).map(([name, data]) => ({
                        label: name + getPodNameSuffix(name),
                        value: name,
                    }))}
                    value={nodeName ? { label: nodeName + getPodNameSuffix(nodeName), value: nodeName } : null}
                    onChange={(selected) => {
                        selectNode((selected as any).value);
                    }}
                    styles={{
                        ...multiSelectStyles,
                        menu: (base) => ({ ...base, zIndex: 12 }),
                        control: (base, state) => ({
                            ...base,
                            backgroundColor: 'transparent',
                            borderColor: 'transparent',
                        }),
                        singleValue: (base, state) => ({
                            ...base,
                            marginLeft: '0',
                            marginRight: '0',
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
                    components={{
                        IndicatorSeparator: null,
                        Option,
                    }}
                />
            </div>
        </div>
        {Array.isArray(containers) && (params.tab === NodeDetailTabs.LOGS || params.tab === NodeDetailTabs.TERMINAL) && (
            <>
                <span style={{ width: '1px', height: '16px', background: '#0b0f22' }} />
                <div className="events-logs__dropdown-selector">
                    <span className="events-logs__label">Containers</span>
                    <div style={{ width: '175px' }}>
                        <Select placeholder="Select Container"
                            options={containers.map((container) => ({ label: container, value: container }))}
                            value={containerName ? { label: containerName, value: containerName } : null}
                            onChange={(selected) => {
                                selectContainer((selected as any).value);
                            }}
                            styles={{
                                ...multiSelectStyles,
                                menu: (base) => ({ ...base, zIndex: 12 }),
                                control: (base, state) => ({
                                    ...base,
                                    backgroundColor: 'transparent',
                                    borderColor: 'transparent',
                                }),
                                singleValue: (base, state) => ({
                                    ...base,
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
                            components={{
                                IndicatorSeparator: null,
                                Option,
                            }}
                        />
                    </div>
                </div>
            </>
        )}
        {params.tab === NodeDetailTabs.TERMINAL && <>
            <span style={{ width: '1px', height: '16px', background: '#0b0f22' }} />
            <div style={{ width: '130px' }}>
                <Select placeholder="Select shell" className="pl-20"
                    options={[{ label: "bash", value: "bash" }, { label: "sh", value: "sh" }, { label: "powershell", value: "powershell" }, { label: "cmd", value: "cmd" }]}
                    value={shell}
                    onChange={(selected) => { selectShell(selected) }}
                    styles={{
                        menu: (base) => ({ ...base, zIndex: 12 }),
                        control: (base, state) => ({
                            ...base,
                            backgroundColor: 'transparent',
                            borderColor: 'transparent',
                        }),
                        singleValue: (base, state) => ({
                            ...base,
                            color: 'var(--N000)',
                        }),
                        input: (base, state) => ({ ...base, caretColor: 'var(--N000)', color: 'var(--N000)' }),
                        option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isFocused ? 'var(--N100)' : 'var(--N000)',
                            color: 'var(--N900)',
                        })
                    }}
                    components={{
                        IndicatorSeparator: null,
                        Option,
                    }}
                />
            </div>
        </>}
        {children}
    </div>
};

export function AppNotConfigured({ text = 'You have not finished configuring this app' }) {
    const { appId } = useParams<{ appId: string }>();
    const { push } = useHistory();
    function handleEditApp(e) {
        getAppConfigStatus(+appId).then((response) => {
            let url = `/app/${appId}/edit`;
            push(url);
        });
    }

    return (
        <section className="app-not-configured w-100">
            <img src={AppNotConfiguredIcon} />
            <p>{text}</p>
            {appId && push && (
                <button className="configure" onClick={handleEditApp}>
                    Configure
                </button>
            )}
        </section>
    );
}

export function EnvironmentNotConfigured({ environments, ...props }) {
    const environmentsMap = Array.isArray(environments)
        ? environments.reduce((agg, curr) => {
            agg[curr.environmentId] = curr.environmentName;
            return agg;
        }, {})
        : {};
    const { envId, appId } = useParams<{ appId, envId }>();

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
                    <Link className="cta no-decor" to={getAppTriggerURL(appId)}>
                        Go to Trigger
                    </Link>
                )}
            </div>
        </section>
    );
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
    prefix = "",
}) {
    const [selectedRange, selectRange] = React.useState<string>(value);

    useEffectAfterMount(() => {
        if (typeof onSelect === 'function') {
            if (selectedRange === value) {
                return;
            }
            const [quantity, unit] = selectedRange.split(' ');
            onSelect([quantity, unit]);
        }
    }, [selectedRange]);

    const ValueContainer = props => {
        const { children, ...rest } = props
        return (
            <components.ValueContainer {...rest}>
                {prefix + props.getValue()[0].value}
                {React.cloneElement(children[1])}
            </components.ValueContainer>
        )
    }
    return (
        <div style={{ width: '210px' }}>
            <Select
                options={options.map((time) => ({ label: time, value: time }))}
                value={{ label: selectedRange, value: selectedRange }}
                onChange={(selected) => selectRange((selected as any).value)}
                menuPortalTarget={document.body}
                components={{ IndicatorSeparator: null, ValueContainer, Option }}
                styles={{
                    ...multiSelectStyles,
                    valueContainer: (base, state) => ({ ...base, color: 'var(--N900)' })
                }}
                isSearchable={false}
            />
        </div>
    );
}

const MaterialCard: React.FC<{
    Rollout: any;
    nodes: AggregatedNodes;
    appDetails: AppDetails;
    streamData: AppStreamData;
}> = ({ Rollout, nodes, appDetails, streamData }) => {
    const status = appDetails.resourceTree.status;
    const lastDeployedBy = appDetails.lastDeployedBy;
    const lastDeployedTime = appDetails.lastDeployedTime;
    const conditions = appDetails.resourceTree.conditions;
    const [detailed, toggleDetailed] = React.useState(false);
    const [detailedStatus, toggleDetailedStatus] = useState(false);
    const [hibernating, setHibernating] = useState(false);
    const { appId, envId } = useParams<{ appId, envId }>();
    const [hiberbateConfirmationModal, setHibernateConfirmationModal] = useState('');
    async function handleHibernate(e) {
        try {
            setHibernating(true);
            await stopStartApp(Number(appId), Number(envId), status.toLowerCase() === 'hibernating' ? 'START' : 'STOP');
            toast.success('Deployment initiated.');
            setHibernateConfirmationModal('');
        } catch (err) {
            showError(err);
        } finally {
            setHibernating(false);
        }
    }
    let message = null;
    if (
        ['progressing', 'degraded'].includes(status.toLowerCase()) &&
        Array.isArray(conditions) &&
        conditions.length > 0 &&
        conditions[0].message
    ) {
        message = conditions[0].message;
    } else if (Array.isArray(Rollout) && Rollout.length > 0 && Rollout[0].health && Rollout[0].health.message) {
        message = Rollout[0].health.message;
    }
    return (
        <>
            <div className="material-sync-card bcn-0">
                <div className="flex left">
                    <figure className={`${status.toLocaleLowerCase()} app-status-icon icon-dim-40`}></figure>
                    <div className="flex left column">
                        <span className="fs-12 cn-9">Application Status</span>
                        <b
                            className={`fs-14 fw-6 pointer flex left app-summary__status-name f-${status.toLowerCase()}`}
                            onClick={status.toLowerCase() !== 'missing' ? (e) => toggleDetailedStatus(true) : (e) => { }}
                        >
                            {status}
                            {status.toLowerCase() !== 'missing' && <div className="fa fa-angle-right fw-6 ml-6"></div>}
                        </b>
                    </div>
                </div>
                <div className="w-100 flex left" style={{ flexWrap: 'wrap' }}>
                    <button
                        className="cta cta-with-img small cancel fs-12 fw-6 mr-6 mt-6"
                        onClick={(e) => toggleDetailed(true)}
                    >
                        <CommitIcon className="icon-dim-16" />
                        Commit(s)
                    </button>
                    <button
                        className="cta cta-with-img small cancel fs-12 fw-6 mt-6"
                        onClick={(e) =>
                            setHibernateConfirmationModal(
                                status.toLowerCase() === 'hibernating' ? 'resume' : 'hibernate',
                            )
                        }
                    >
                        <ScaleDown className="icon-dim-16" />
                        {status.toLowerCase() === 'hibernating' ? 'Restore pod count' : 'Scale pods to 0'}
                    </button>
                </div>
            </div>
            <div className="material-sync-card bcn-0">
                <div className="fs-14 fw-6 cn-9">Last deployed</div>

                <div className="material-sync-card--message">
                    <div className="ellipsis-right">
                        Deployed{' '}
                        <span className="fw-6 fs-12">{moment(lastDeployedTime, 'YYYY-MM-DDTHH:mm:ssZ').fromNow()}</span>{' '}
                        by <span className="fw-6 fs-12">{lastDeployedBy}</span>
                    </div>
                    <Link to={getAppCDURL(appId, envId)} type="button" className="anchor fs-12 fw-6 p-0">
                        Details
                    </Link>
                </div>
            </div>
            {detailed && (
                <VisibleModal className="app-status__material-modal">
                    <CommitInfo onHide={() => toggleDetailed(false)} material={appDetails?.materialInfo} />
                </VisibleModal>
            )}
            {detailedStatus && (
                <ProgressStatus
                    message={message}
                    nodes={nodes}
                    streamData={streamData}
                    status={status}
                    close={(e) => toggleDetailedStatus(false)}
                    appName={appDetails.appName}
                    environmentName={appDetails.environmentName}
                />
            )}
            {hiberbateConfirmationModal && (
                <ConfirmationDialog>
                    <ConfirmationDialog.Icon
                        src={hiberbateConfirmationModal === 'hibernate' ? warningIcon : restoreIcon}
                    />
                    <ConfirmationDialog.Body
                        title={`${hiberbateConfirmationModal === 'hibernate' ? 'Hibernate' : 'Restore'} '${appDetails.appName
                            }' on '${appDetails.environmentName}'`}
                        subtitle={
                            <p>
                                Pods for this application will be{' '}
                                <b>
                                    scaled{' '}
                                    {hiberbateConfirmationModal === 'hibernate'
                                        ? 'down to 0'
                                        : ' upto its original count'}{' '}
                                    on {appDetails.environmentName}
                                </b>{' '}
                                environment.
                            </p>
                        }
                    >
                        <p style={{ marginTop: '16px' }}>Are you sure you want to continue?</p>
                    </ConfirmationDialog.Body>
                    <ConfirmationDialog.ButtonGroup>
                        <button className="cta cancel" onClick={(e) => setHibernateConfirmationModal('')}>
                            Cancel
                        </button>
                        <button className="cta" disabled={hibernating} onClick={handleHibernate}>
                            {hibernating ? (
                                <Progressing />
                            ) : hiberbateConfirmationModal === 'hibernate' ? (
                                `Hibernate App`
                            ) : (
                                        'Restore App'
                                    )}
                        </button>
                    </ConfirmationDialog.ButtonGroup>
                </ConfirmationDialog>
            )}
        </>
    );
};

export const ProgressStatus: React.FC<{
    streamData: AppStreamData;
    nodes: AggregatedNodes;
    appName: string;
    environmentName: string;
    status: any;
    close: (...args) => void;
    message: string;
}> = ({ streamData, nodes, status, close, message, appName, environmentName }) => {
    const [nodeStatusMap, setNodeStatusMap] = useState(new Map());
    useEffect(() => {
        const stats = streamData?.result?.application?.status?.operationState?.syncResult?.resources?.reduce(
            (agg, curr) => {
                agg.set(`${curr.kind}/${curr.name}`, curr);
                return agg;
            },
            new Map(),
        );
        setNodeStatusMap(stats);
    }, [streamData]);

    function getNodeMessage(kind, name) {
        if (nodeStatusMap && nodeStatusMap.has(`${kind}/${name}`)) {
            const { status, message } = nodeStatusMap.get(`${kind}/${name}`);
            if (status === 'SyncFailed') return 'Unable to apply changes: ' + message;
        }
        return '';
    }

    return (
        <VisibleModal className="app-status__material-modal">
            <div className="app-status-detai">
                <div className="title flex left">
                    App status detail
                    <div className="fa fa-close" onClick={close} />
                </div>
                <div className="flex left">
                    <div className={`subtitle app-summary__status-name f-${status.toLowerCase()} mr-16`}>{status}</div>
                    {message && <div>{message}</div>}
                </div>
                {status.toLowerCase() !== 'missing' && (
                    <div>
                        <table>
                            <thead>
                                <tr>
                                    {['name', 'status', 'message'].map((n) => (
                                        <th>{n}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {nodes &&
                                    Object.keys(nodes.nodes)
                                        .filter((kind) => kind.toLowerCase() !== 'rollout')
                                        .map((kind) =>
                                            Array.from(nodes.nodes[kind] as Map<string, any>).map(([nodeName, nodeDetails]) => (
                                                <tr key={`${nodeDetails.kind}/${nodeDetails.name}`}>
                                                    <td valign="top">
                                                        <div className="kind-name">
                                                            <div>{nodeDetails.kind}/</div>
                                                            <div className="ellipsis-left">{nodeDetails.name}</div>
                                                        </div>
                                                    </td>
                                                    <td
                                                        valign="top"
                                                        className={`app-summary__status-name f-${nodeDetails.health && nodeDetails.health.status
                                                            ? nodeDetails.health.status.toLowerCase()
                                                            : ''
                                                            }`}
                                                    >
                                                        {nodeDetails.status
                                                            ? nodeDetails.status
                                                            : nodeDetails.health
                                                                ? nodeDetails.health.status
                                                                : ''}
                                                    </td>
                                                    <td valign="top">
                                                        <div
                                                            style={{
                                                                display: 'grid',
                                                                gridAutoColumns: '1fr',
                                                                gridRowGap: '8px',
                                                            }}
                                                        >
                                                            {getNodeMessage(kind, nodeDetails.name) && (
                                                                <div>{getNodeMessage(kind, nodeDetails.name)}</div>
                                                            )}
                                                            {nodeDetails.health && nodeDetails.health.message && (
                                                                <div>{nodeDetails.health.message}</div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )),
                                        )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </VisibleModal>
    );
};

const SyncError: React.FC<{ appStreamData: AppStreamData }> = ({ appStreamData }) => {
    const [collapsed, toggleCollapsed] = useState<boolean>(true);
    if (
        !appStreamData?.result?.application?.status?.conditions ||
        appStreamData?.result?.application?.status?.conditions?.length === 0
    )
        return null;
    return (
        <div className="top flex left column w-100 bcr-1 pl-25 pr-25">
            <div className="flex left w-100 " style={{ height: '56px' }}>
                <AlertTriangle className="icon-dim-20 mr-8" />
                <span className="cr-5 fs-14 fw-6">
                    {appStreamData?.result?.application?.status?.conditions?.length} Errors
                </span>
                {collapsed && (
                    <span className="fs-12 cn-9 ml-24">
                        {appStreamData?.result?.application?.status?.conditions
                            .map((condition) => condition.type)
                            .join(',')}
                    </span>
                )}
                <DropDownIcon
                    style={{ marginLeft: 'auto', ['--rotateBy' as any]: `${180 * Number(!collapsed)}deg` }}
                    className="icon-dim-24 rotate pointer"
                    onClick={(e) => toggleCollapsed(not)}
                />
            </div>
            {!collapsed && (
                <table className="mb-8">
                    <tbody>
                        {appStreamData?.result?.application?.status?.conditions.map((condition) => (
                            <tr>
                                <td className="pb-8" style={{ minWidth: '200px' }}>
                                    {condition.type}
                                </td>
                                <td className="pl-24 pb-8">{condition.message}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export function SyncStatusMessage(app: Application) {
    const rev = app.status.sync.revision || app.spec.source.targetRevision || 'HEAD';
    let message = app.spec.source.targetRevision || 'HEAD';
    if (app.status.sync.revision) {
        if (app.spec.source?.chart) {
            message += ' (' + app.status.sync.revision + ')';
        } else if (
            app.status.sync.revision.length >= 7 &&
            !app.status.sync.revision.startsWith(app.spec.source.targetRevision)
        ) {
            message += ' (' + app.status.sync.revision.substr(0, 7) + ')';
        }
    }
    switch (app.status.sync.status) {
        case 'Synced':
            return <span>To {message}</span>;
        case 'OutOfSync':
            return <span>From {message}</span>;
        default:
            return <span>{message}</span>;
    }
}

const getOperationStateTitle = (app: Application) => {
    const appOperationState = getAppOperationState(app);
    const operationType = getOperationType(app);
    switch (operationType) {
        case 'Delete':
            return 'Deleting';
        case 'Sync':
            switch (appOperationState.phase) {
                case 'Running':
                    return 'Syncing';
                case 'Error':
                    return 'Sync error';
                case 'Failed':
                    return 'Sync failed';
                case 'Succeeded':
                    return 'Sync OK';
                case 'Terminating':
                    return 'Terminated';
            }
    }
    return 'Unknown';
};

export const getAppOperationState = (app: Application) => {
    if (app.metadata.deletionTimestamp) {
        return {
            phase: 'Running',
            startedAt: app.metadata.deletionTimestamp,
        };
    } else if (app.operation) {
        return {
            phase: 'Running',
            startedAt: new Date().toISOString(),
            operation: {
                sync: {},
            },
        };
    } else {
        return app.status.operationState;
    }
};
export function getOperationType(application: Application) {
    if (application.metadata.deletionTimestamp) {
        return 'Delete';
    }
    const operation =
        application.operation || (application.status.operationState && application.status.operationState.operation);
    if (operation && operation.sync) {
        return 'Sync';
    }
    return 'Unknown';
}
