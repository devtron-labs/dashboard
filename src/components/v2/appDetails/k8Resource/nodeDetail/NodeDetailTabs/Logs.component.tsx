import Tippy from '@tippyjs/react';
import React, { useEffect, useRef, useState } from 'react';
import { ReactComponent as PlayButton } from '../../../../assets/icons/ic-play.svg';
import { ReactComponent as StopButton } from '../../../../assets/icons/ic-stop.svg';
import { ReactComponent as Abort } from '../../../../assets/icons/ic-abort.svg';
import { useParams, useRouteMatch, useLocation, useHistory } from 'react-router';
import { NodeDetailTab } from '../nodeDetail.type';
import { getLogsURL } from '../nodeDetail.api';
import IndexStore from '../../../index.store';
import WebWorker from '../../../../../app/WebWorker';
import sseWorker from '../../../../../app/grepSSEworker';
import { Host } from '../../../../../../config';
import { Subject } from '../../../../../../util/Subject';
import LogViewerComponent from './LogViewer.component';
import { useKeyDown } from '../../../../../common';
import './nodeDetailTab.scss';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { multiSelectStyles } from '../../../../common/ReactSelectCustomization';
import { EnvType, PodMetaData } from '../../../appDetails.type';
import { ReactComponent as Question } from '../../../../assets/icons/ic-question.svg';
import { ReactComponent as CloseImage } from '../../../../assets/icons/ic-cancelled.svg';
import MessageUI, { MsgUIType } from '../../../../common/message.ui';

const subject: Subject<string> = new Subject();
const commandLineParser = require('command-line-parser');

interface PodContainerOptions {
    podOptions: Array<{ name: string; selected: boolean }>;
    containerOptions: Array<{ name: string; selected: boolean }>;
}

interface LogState {
    selectedPods: Array<string>;
    selectedContainer: string;
    grepTokens?: any;
}

function LogsComponent({ selectedTab, isDeleted }) {
    const location = useLocation();
    const key = useKeyDown();
    const { url } = useRouteMatch();
    const params = useParams<{ actionName: string; podName: string; nodeType: string }>();

    const [logsPaused, setLogsPaused] = useState(false);
    // const [containers, setContainers] = useState([]);
    // const [selectedContainerName, setSelectedContainerName] = useState('');
    const [tempSearch, setTempSearch] = useState<string>('');
    const [logSearchString, setLogSearchString] = useState('');
    // const [grepTokens, setGrepTokens] = useState(null);
    const [highlightString, setHighlightString] = useState('');
    const [logsCleared, setLogsCleared] = useState(false);
    const [readyState, setReadyState] = useState(null);
    // const [selectedPods, setSelectedPods] = useState<Array<string>>([]);

    const logsPausedRef = useRef(false);
    const workerRef = useRef(null);

    const appDetails = IndexStore.getAppDetails();

    const isLogAnalyzer = !params.podName;

    const [logState, setLogState] = useState<LogState>(() => getInitialStateOfLogs(isLogAnalyzer, params, location));

    const [podContainerOptions, setPodContainerOptions] = useState(() =>
        getInitialPodContainerOptions(isLogAnalyzer, params),
    );

    const handlePodChange = (selectedOption: string) => {
        let pods: Array<PodMetaData>;
        onLogsCleared();
        switch (selectedOption) {
            case 'All pods':
                pods = IndexStore.getAllPods();
                break;
            case 'All new pods':
                pods = IndexStore.getAllNewPods();
                break;
            case 'All old pods':
                pods = IndexStore.getAllNewPods();
                break;
            default:
                pods = IndexStore.getAllPods().filter((_pod) => _pod.name == selectedOption);
                break;
        }
        if (pods.length == 0) {
            return;
        }
        updateStateForPodSelection(pods);
    };

    const updateStateForPodSelection = (pods: Array<PodMetaData>) => {
        let podNames = pods
            .filter((_pod) => _pod.containers.includes(logState.selectedContainer))
            .map((_pod) => _pod.name);
        if (podNames.length == 0) {
            let containerOptions = pods[0].containers.map((_containerName, index) => ({
                name: _containerName,
                selected: index == 0,
            }));
            setPodContainerOptions({
                podOptions: podContainerOptions.podOptions,
                containerOptions: containerOptions,
            });
            return;
        }
        setLogState({
            selectedPods: podNames,
            selectedContainer: logState.selectedContainer,
            grepTokens: logState.grepTokens,
        });
    };

    const handleContainerChange = (selectedContainer: string) => {
        setLogState({
            selectedPods: logState.selectedPods,
            selectedContainer: selectedContainer,
            grepTokens: logState.grepTokens,
        });
    };

    const handleSearchTextChange = (searchText: string) => {
        if (!searchText) {
            setLogState({
                selectedPods: logState.selectedPods,
                selectedContainer: logState.selectedContainer,
                grepTokens: undefined,
            });
            return;
        }
        const pipes = parsePipes(searchText);
        const tokens = pipes.map((p) => getGrepTokens(p));
        if (tokens.some((t) => !t)) {
            toast.warn('Expression is invalid.');
            return;
        }
        setLogState({
            selectedPods: logState.selectedPods,
            selectedContainer: logState.selectedContainer,
            grepTokens: tokens,
        });
    };

    const parsePipes = (expression: string): Array<string> => {
        const pipes = expression.split(/[\|\s]*grep[\s]*/).filter((p) => !!p);
        return pipes;
    };

    const getGrepTokens = (expression) => {
        const options = commandLineParser({
            args: expression.replace(/[\s]+/, ' ').replace('"', '').split(' '),
            booleanKeys: ['v'],
            allowEmbeddedValues: true,
        });
        let { _args, A = 0, B = 0, C = 0, a = 0, b = 0, c = 0, v = false } = options;
        if (C || c) {
            A = C || c;
            B = C || c;
        }
        if (_args) {
            return { _args: _args[0], a: Number(A || a), b: Number(B || b), v };
        } else return null;
    };

    const handleMessage = (event: any) => {
        if (!event || !event.data || !event.data.result) return;

        if (logsPausedRef.current) {
            return;
        }

        event.data.result.forEach((log: string) => subject.publish(log));

        if (event.data.readyState) {
            setReadyState(event.data.readyState);
        }
    };

    const stopWorker = () => {
        if (workerRef.current) {
            try {
                workerRef.current.postMessage({ type: 'stop' });
                workerRef.current.terminate();
            } catch (err) {}
        }
    };

    const handleLogsPause = () => {
        setLogsPaused(!logsPaused);
    };

    const onLogsCleared = () => {
        setLogsCleared(true);
        setTimeout(() => setLogsCleared(false), 100);
    };

    const fetchLogs = () => {
        workerRef.current = new WebWorker(sseWorker);
        workerRef.current['addEventListener' as any]('message', handleMessage);

        let urls = logState.selectedPods.map((_pod) => {
            return getLogsURL(appDetails, _pod, Host, logState.selectedContainer);
        });

        workerRef.current['postMessage' as any]({
            type: 'start',
            payload: { urls: urls, grepTokens: logState.grepTokens, timeout: 300, pods: logState.selectedPods },
        });
    };

    const handleLogsSearch = (e) => {
        if (e.key === 'Enter' || e.keyCode === 13) {
            handleSearchTextChange(e.target.value as string);
            const { length, [length - 1]: highlightString } = e.target.value.split(' ');
            setHighlightString(highlightString);
        }
    };

    useEffect(() => {
        logsPausedRef.current = logsPaused;
    }, [logsPaused]);

    useEffect(() => {
        const combo = key.join();
        if (combo === 'Control,c') {
            handleLogsPause();
        }
    }, [key.join()]);

    const handleLogSearchSubmit = (e) => {
        e.preventDefault();
        setLogSearchString(tempSearch);
    };

    useEffect(() => {
        if (selectedTab) {
            selectedTab(NodeDetailTab.LOGS, url);
        }
    }, []);

    useEffect(() => {
        //Values are already set once we reach here
        //selected pods, containers, searchText
        onLogsCleared()
        stopWorker();
        fetchLogs();

        return () => stopWorker;
    }, [logState]);

    return isDeleted ? (
        <div>
            <MessageUI msg="This resource no longer exists" size={32} />
        </div>
    ) : (
        <React.Fragment>
            <div className="container-fluid bcn-0">
                <div className="row pt-2 pb-2 pl-16 pr-16 border-top">
                    <div className="col-6 d-flex align-items-center">
                        <Tippy
                            className="default-tt"
                            arrow={false}
                            placement="bottom"
                            content={logsPaused ? 'Resume logs (Ctrl+C)' : 'Stop logs (Ctrl+C)'}
                        >
                            <div
                                className={`mr-8 ${logsPaused ? 'play' : 'stop'} flex`}
                                onClick={(e) => handleLogsPause()}
                            >
                                {logsPaused ? (
                                    <PlayButton className="icon-dim-16 cursor" />
                                ) : (
                                    <StopButton className="icon-dim-16 cursor" />
                                )}
                            </div>
                        </Tippy>
                        <Tippy className="default-tt" arrow={false} placement="bottom" content={'Clear'}>
                            <Abort
                                onClick={(e) => {
                                    onLogsCleared();
                                }}
                                className="icon-dim-20 ml-8 cursor"
                            />
                        </Tippy>
                        <div
                            className="cn-2 ml-8 mr-8 "
                            style={{ width: '1px', height: '16px', background: '#0b0f22' }}
                        >
                            {' '}
                        </div>
                        {isLogAnalyzer && podContainerOptions.podOptions.length > 0 && (
                            <React.Fragment>
                                <div className="cn-6">Pods</div>
                                <div className="cn-6 flex left">
                                    <div style={{ minWidth: '200px' }}>
                                        <Select
                                            placeholder="Select Pod"
                                            options={podContainerOptions.podOptions.map((_pod) => ({
                                                label: _pod.name,
                                                value: _pod.name,
                                            }))}
                                            defaultValue={
                                                podContainerOptions.podOptions
                                                    .filter((_pod) => _pod.selected)
                                                    .map((_pod) => ({ label: _pod.name, value: _pod.name }))[0]
                                            }
                                            onChange={(selected) => handlePodChange(selected.value)}
                                            styles={{
                                                ...multiSelectStyles,
                                                menu: (base) => ({ ...base, zIndex: 9999, textAlign: 'left' }),
                                                control: (base, state) => ({
                                                    ...base,
                                                    border: '0px',
                                                    backgroundColor: 'transparent',
                                                    minHeight: '24px !important',
                                                }),
                                                singleValue: (base, state) => ({
                                                    ...base,
                                                    fontWeight: 600,
                                                    color: '#06c',
                                                }),
                                                indicatorsContainer: (provided, state) => ({
                                                    ...provided,
                                                    height: '24px',
                                                }),
                                            }}
                                            components={{
                                                IndicatorSeparator: null,
                                            }}
                                        />
                                    </div>
                                </div>
                            </React.Fragment>
                        )}

                        {(podContainerOptions?.containerOptions ?? []).length > 0 && (
                            <React.Fragment>
                                <div className="cn-6 ml-8">Container </div>

                                <div style={{ minWidth: '145px' }}>
                                    <Select
                                        placeholder="Select Containers"
                                        options={podContainerOptions.containerOptions.map((_container) => ({
                                            label: _container.name,
                                            value: _container.name,
                                        }))}
                                        defaultValue={
                                            podContainerOptions.containerOptions
                                                .filter((_container) => _container.selected)
                                                .map((_container) => ({
                                                    label: _container.name,
                                                    value: _container.name,
                                                }))[0]
                                        }
                                        onChange={(selected) => {
                                            handleContainerChange((selected as any).value as string);
                                        }}
                                        styles={{
                                            ...multiSelectStyles,
                                            menu: (base) => ({ ...base, zIndex: 9999, textAlign: 'left' }),
                                            control: (base, state) => ({
                                                ...base,
                                                border: '0px',
                                                backgroundColor: 'transparent',
                                                minHeight: '24px !important',
                                            }),
                                            singleValue: (base, state) => ({ ...base, fontWeight: 600, color: '#06c' }),
                                            indicatorsContainer: (provided, state) => ({
                                                ...provided,
                                                height: '24px',
                                            }),
                                        }}
                                        components={{
                                            IndicatorSeparator: null,
                                        }}
                                    />
                                </div>
                            </React.Fragment>
                        )}
                    </div>
                    {/* <div > */}
                    {/* <input
                            type="text"
                            onKeyUp={handleLogsSearch}
                            className="w-100 bcn-1 en-2 bw-1 br-4 pl-12 pr-12 pt-4 pb-4"
                            placeholder="grep -A 10 -B 20 'Server Error'| grep 500 "
                            name="log_search_input"
                        /> */}

                    <form
                        className="col-6 flex flex-justify left w-100 bcn-1 en-2 bw-1 br-4 pl-12 pr-12"
                        onSubmit={handleLogSearchSubmit}
                    >
                        <input
                            value={tempSearch}
                            className="bw-0 w-100"
                            style={{ background: 'transparent', outline: 'none' }}
                            onKeyUp={handleLogsSearch}
                            onChange={(e) => setTempSearch(e.target.value as string)}
                            type="search"
                            name="log_search_input"
                            placeholder='grep -A 10 -B 20 "Server Error" | grep 500'
                        />
                        {logSearchString && (
                            <CloseImage
                                className="icon-dim-20 pointer"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleSearchTextChange('');
                                    setTempSearch('');
                                }}
                            />
                        )}
                        <Tippy
                            className="default-tt"
                            arrow={false}
                            placement="bottom"
                            content={
                                <div>
                                    <div className="flex column left">
                                        <h5>Supported grep commands</h5>
                                        <span>grep 500</span>
                                        <span>grep -A 2 -B 3 -C 5 error</span>
                                        <span>grep 500 | grep internal</span>
                                    </div>
                                </div>
                            }
                        >
                            <Question className="icon-dim-24" />
                        </Tippy>
                    </form>
                </div>
            </div>
            {logState.selectedContainer && logState.selectedPods.length > 0 && (
                <div
                    style={{ gridColumn: '1 / span 2', background: '#0b0f22' }}
                    className="flex column log-viewer-container"
                >
                    <div
                        className={`pod-readyState pod-readyState--top bcr-7 ${
                            logsPaused || readyState === 2 ? 'pod-readyState--show' : ''
                        }`}
                    >
                        {logsPaused && (
                            <div className="w-100 cn-0">
                                Stopped printing logs.{' '}
                                <span
                                    onClick={(e) => handleLogsPause()}
                                    className="pointer"
                                    style={{ textDecoration: 'underline' }}
                                >
                                    Resume ( Ctrl+c )
                                </span>
                            </div>
                        )}
                        {readyState === 2 && (
                            <div className="w-100 cn-0">
                                Disconnected.{' '}
                                <span
                                    onClick={(e) => fetchLogs()}
                                    className="pointer"
                                    style={{ textDecoration: 'underline' }}
                                >
                                    Reconnect
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="log-viewer" style={{ minHeight: '600px' }}>
                        <LogViewerComponent
                            subject={subject}
                            highlightString={highlightString}
                            rootClassName="event-logs__logs"
                            reset={logsCleared}
                        />
                    </div>

                    <div
                        className={`pod-readyState pod-readyState--bottom ${
                            !logsPaused && [0, 1].includes(readyState) ? 'pod-readyState--show' : ''
                        }`}
                    >
                        {readyState === 0 && (
                            <div className="readyState loading-dots" style={{ color: 'orange' }}>
                                Connecting
                            </div>
                        )}
                        {readyState === 1 && <div className="readyState loading-dots cg-5">Connected</div>}
                    </div>
                </div>
            )}

            {!logState.selectedContainer && (
                <div className="no-pod no-pod--container ">
                    <MessageUI
                        icon={MsgUIType.NO_CONTAINER}
                        msg={`${
                            (podContainerOptions?.containerOptions ?? []).length > 0
                                ? 'Select a container to view logs'
                                : 'No container'
                        }`}
                        size={32}
                    />
                </div>
            )}
        </React.Fragment>
    );
}

function getInitialStateOfLogs(
    isLogAnalyzer: boolean,
    params: { actionName: string; podName: string; nodeType: string },
    location: any,
): LogState {
    if (!isLogAnalyzer) {
        let _selectedContainerName: string = new URLSearchParams(location.search).get('container');
        const containers = IndexStore.getAllPods()
            .filter((_pod) => _pod.name == params.podName)
            .flatMap((_pod) => _pod.containers)
            .sort();

        if (containers.length == 0) {
            return;
        }

        if (!_selectedContainerName) {
            _selectedContainerName = containers[0] as string;
        }

        return {
            selectedPods: [params.podName],
            selectedContainer: _selectedContainerName,
        } as LogState;
    } else {
        //In case of log analyzer by default we select all Pods
        const pods = IndexStore.getAllPods().map((_pod) => _pod.name);
        if (pods.length == 0) {
            return;
        }
        const containers = IndexStore.getAllPods()[0].containers.sort();
        let _selectedContainerName: string = '';

        if (containers.length > 0) {
            _selectedContainerName = containers[0];
        }

        return {
            selectedPods: pods,
            selectedContainer: _selectedContainerName,
        } as LogState;
    }
}

function getInitialPodContainerOptions(
    isLogAnalyzer: boolean,
    params: { actionName: string; podName: string; nodeType: string },
): PodContainerOptions {
    if (!isLogAnalyzer) {
        let containerOptions = IndexStore.getAllPods()
            .filter((_pod) => _pod.name == params.podName)
            .flatMap((_pod) => _pod.containers)
            .map((_container, index) => {
                return { name: _container, selected: index == 0 };
            });
        let podOptions = [{ name: params.podName, selected: true }];
        return {
            containerOptions: containerOptions,
            podOptions: [],
        } as PodContainerOptions;
    } else {
        let additionalPodOptions = [{ name: 'All pods', selected: true }];
        if (IndexStore.getEnvDetails().envType === EnvType.APPLICATION) {
            additionalPodOptions.push({ name: 'All new pods', selected: false });
            additionalPodOptions.push({ name: 'All old pods', selected: false });
        }
        const podOptions = additionalPodOptions.concat(
            IndexStore.getAllPods().map((_pod) => {
                return { name: _pod.name, selected: false };
            }),
        );
        const containerOptions = IndexStore.getAllPods()[0]
            .containers.sort()
            .map((_container, index) => {
                return { name: _container, selected: index == 0 };
            });
        console.log(containerOptions);
        return {
            containerOptions: containerOptions,
            podOptions: podOptions,
        } as PodContainerOptions;
    }
}

export default LogsComponent;
