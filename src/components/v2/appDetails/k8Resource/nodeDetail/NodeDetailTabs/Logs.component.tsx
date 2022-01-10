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
import { EnvType } from '../../../appDetails.type';
import { ReactComponent as Question } from '../../../../assets/icons/ic-question.svg';
import { ReactComponent as CloseImage } from '../../../../assets/icons/ic-cancelled.svg';
import MessageUI, { MsgUIType } from '../../../../common/message.ui';

const subject: Subject<string> = new Subject();
const commandLineParser = require('command-line-parser');

interface PodContainer {
    podName: String
    containerNames: Array<String>
}

function LogsComponent({ selectedTab, isDeleted }) {
    const location = useLocation();
    const key = useKeyDown();
    const { url } = useRouteMatch();
    const params = useParams<{ actionName: string; podName: string; nodeType: string }>();

    const [logsPaused, setLogsPaused] = useState(false);
    const [containers, setContainers] = useState([]);
    const [podOptions, setPodOptions] = useState([]);
    const [selectedContainerName, setSelectedContainerName] = useState('');
    const [tempSearch, setTempSearch] = useState<string>('');
    const [logSearchString, setLogSearchString] = useState('');
    const [grepTokens, setGrepTokens] = useState(null);
    const [highlightString, setHighlightString] = useState('');
    const [logsCleared, setLogsCleared] = useState(false);
    const [readyState, setReadyState] = useState(null);
    const [selectedPods, setSelectedPods] = useState([]);
    const [selectedPodContainers, setSelectedPodContainers] = useState([] as Array<PodContainer>)

    const logsPausedRef = useRef(false);
    const workerRef = useRef(null);

    const appDetails = IndexStore.getAppDetails();

    const isLogAnalyzer = !params.podName;

    const handlePodSelection = (cs, selectedOption) => {
        setContainers(cs.containers);
        setSelectedPods(cs.pods);
        setSelectedContainerName(`${selectedOption}_${cs.containers[0]}`);
    };

    const handlePodChange = (selectedOption) => {
        onLogsCleared();
        switch (selectedOption) {
            case 'All pods':
                setSelectedPodContainers(IndexStore.getAllPods().map( _pod => {
                    return {
                        podName: _pod.name,
                        containerNames: _pod.containers
                    } as PodContainer
                }))
                handlePodSelection(IndexStore.getAllContainers(), selectedOption);
                break;
            case 'All new pods':
                setSelectedPodContainers(IndexStore.getAllNewPods().map( _pod => {
                    return {
                        podName: _pod.name,
                        containerNames: _pod.containers
                    } as PodContainer
                }))
                handlePodSelection(IndexStore.getAllNewContainers(), selectedOption);
                break;
            case 'All old pods':
                setSelectedPodContainers(IndexStore.getAllOldPods().map( _pod => {
                    return {
                        podName: _pod.name,
                        containerNames: _pod.containers
                    } as PodContainer
                }))
                handlePodSelection(IndexStore.getAllOldContainers(), selectedOption);
                break;
            default:
                setSelectedPodContainers(IndexStore.getAllPods().filter( _pod => _pod.name == selectedOption).map( _pod => {
                    return {
                        podName: _pod.name,
                        containerNames: _pod.containers
                    } as PodContainer
                }))
                const cs = IndexStore.getAllContainersForPod(selectedOption);
                setContainers(cs);
                setSelectedPods([selectedOption]);
                setSelectedContainerName(cs[0]);
                break;
        }
    };

    const parsePipes = (expression) => {
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
        setTimeout(() => setLogsCleared(false), 1000);
    };

    const fetchLogs = () => {
        workerRef.current = new WebWorker(sseWorker);
        workerRef.current['addEventListener' as any]('message', handleMessage);

        let urls = selectedPodContainers.flatMap( _podContainer => {
            _podContainer.containerNames.map(_containerName => getLogsURL(appDetails, _podContainer.podName, Host, _containerName))
        })

        // containers.forEach((c) => {
        //     let _url: String;

        //     if (isLogAnalyzer) {
        //         _url = getLogsURL(appDetails, IndexStore.getPodForAContainer(c), Host, c);
        //     } else {
        //         _url = getLogsURL(appDetails, params.podName, Host, c);
        //     }

        //     urls.push(_url);
        // });

        workerRef.current['postMessage' as any]({
            type: 'start',
            payload: { urls: urls, grepTokens: grepTokens, timeout: 300, pods: selectedPods },
        });
    };

    const handleLogsSearch = (e) => {
        if (e.key === 'Enter' || e.keyCode === 13) {
            setLogSearchString(e.target.value);
            const { length, [length - 1]: highlightString } = e.target.value.split(' ');
            setHighlightString(highlightString);
        }
    };

    useEffect(() => {
        if (selectedTab) {
            selectedTab(NodeDetailTab.LOGS, url);
        }

        if (!isLogAnalyzer) {
            const _selectedContainerName = new URLSearchParams(location.search).get('container');

            const containers = IndexStore.getAllContainersForPod(params.podName);

            setSelectedPods([params.podName]);

            setContainers(containers);

            setSelectedContainerName(_selectedContainerName || (containers && containers[0]));
        } else {
            let additionalPodOptions = [{ label: 'All pods', value: 'All pods' }];
            if (IndexStore.getEnvDetails().envType === EnvType.APPLICATION) {
                additionalPodOptions.push({ label: 'All new pods', value: 'All new pods' });
                additionalPodOptions.push({ label: 'All old pods', value: 'All old pods' });
            }

            let podOptions = [];

            const pods = IndexStore.getAllPodNames();

            if (pods.length > 1) {
                podOptions = additionalPodOptions.concat(
                    pods.map((pod) => {
                        return { value: pod, label: pod };
                    }),
                );
            } else {
                podOptions = pods.map((pod) => {
                    return { value: pod, label: pod };
                });
            }

            setPodOptions(podOptions);

            handlePodChange(podOptions[0].value);
        }
    }, []);

    useEffect(() => {
        if (selectedContainerName) {
            stopWorker();
            fetchLogs();
        }

        return () => stopWorker;
    }, [selectedContainerName, params.podName, grepTokens]);

    useEffect(() => {
        logsPausedRef.current = logsPaused;
    }, [logsPaused]);

    useEffect(() => {
        const combo = key.join();
        if (combo === 'Control,c') {
            handleLogsPause();
        }
    }, [key.join()]);

    useEffect(() => {
        if (!logSearchString) {
            setGrepTokens(null);
            return;
        }
        const pipes = parsePipes(logSearchString);
        const tokens = pipes.map((p) => getGrepTokens(p));
        if (tokens.some((t) => !t)) {
            toast.warn('Expression is invalid.');
            return;
        }
        setGrepTokens(tokens);
    }, [logSearchString]);

    const handleLogSearchSubmit = (e) => {
        e.preventDefault();
        setLogSearchString(tempSearch);
    };

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
                        {isLogAnalyzer && podOptions.length > 0 && (
                            <React.Fragment>
                                <div className="cn-6">Pods</div>
                                <div className="cn-6 flex left">
                                    <div style={{ minWidth: '200px' }}>
                                        <Select
                                            placeholder="Select Pod"
                                            options={podOptions}
                                            defaultValue={podOptions[0]}
                                            onChange={(selected, meta) => handlePodChange(selected.value)}
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

                        {containers && containers.length > 0 && (
                            <React.Fragment>
                                <div className="cn-6 ml-8">Container </div>

                                <div style={{ minWidth: '145px' }}>
                                    <Select
                                        placeholder="Select Containers"
                                        options={
                                            Array.isArray(containers)
                                                ? containers.map((container) => ({
                                                      label: container,
                                                      value: container,
                                                  }))
                                                : []
                                        }
                                        defaultValue={{ label: containers[0], value: containers[0] }}
                                        onChange={(selected) => {
                                            setSelectedContainerName((selected as any).value);
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
                            onChange={(e) => setTempSearch(e.target.value)}
                            type="search"
                            name="log_search_input"
                            placeholder='grep -A 10 -B 20 "Server Error" | grep 500'
                        />
                        {logSearchString && (
                            <CloseImage
                                className="icon-dim-20 pointer"
                                onClick={(e) => {
                                    setLogSearchString('');
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
            {!logsCleared && selectedContainerName && (
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

            {!selectedContainerName && (
                <div className="no-pod no-pod--container ">
                    <MessageUI
                        icon={MsgUIType.NO_CONTAINER}
                        msg={`${
                            containers && containers.length > 0 ? 'Select a container to view logs' : 'No container'
                        }`}
                        size={32}
                    />
                </div>
            )}
        </React.Fragment>
    );
}

export default LogsComponent;
