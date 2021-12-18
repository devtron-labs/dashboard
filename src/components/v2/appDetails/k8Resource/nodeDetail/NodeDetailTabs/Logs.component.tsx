import Tippy from '@tippyjs/react';
import React, { useEffect, useRef, useState } from 'react'
import { ReactComponent as PlayButton } from '../../../../assets/icons/ic-play.svg';
import { ReactComponent as StopButton } from '../../../../assets/icons/ic-stop.svg';
import { ReactComponent as Abort } from '../../../../assets/icons/ic-abort.svg';
import { useParams, useRouteMatch, useLocation, useHistory } from 'react-router';
import { NodeDetailTab } from '../nodeDetail.type';
import { getLogsURL } from '../nodeDetail.api';
import IndexStore from '../../../index.store';
import WebWorker from '../../../../../app/WebWorker';
import sseWorker from '../../../../../app/grepSSEworker';
import { Host } from "../../../../../../config";
import { Subject } from '../../../../../../util/Subject';
import LogViewerComponent from './LogViewer.component';
import { useKeyDown } from '../../../../../common';
import './nodeDetailTab.scss';
import { toast } from 'react-toastify';
import Select, { components } from 'react-select'
import { multiSelectStyles } from '../../../../common/ReactSelectCustomization';

const subject: Subject<string> = new Subject()
const commandLineParser = require('command-line-parser')

function LogsComponent({ selectedTab }) {
    const location = useLocation()
    const history = useHistory()
    const key = useKeyDown()
    const { url } = useRouteMatch()
    const params = useParams<{ actionName: string, podName: string, nodeType: string }>()

    const [logsPaused, setLogsPaused] = useState(false);
    const [containers, setContainers] = useState([])
    const [selectedContainerName, setSelectedContainerName] = useState("");
    const [selectedPodNames, setSelectedPodNames] = useState([]);
    const [logSearchString, setLogSearchString] = useState('');
    const [grepTokens, setGrepTokens] = React.useState(null);
    const [highlightString, setHighlightString] = useState('');
    const [logsCleared, setLogsCleared] = useState(false);
    const [readyState, setReadyState] = React.useState(null);

    const logsPausedRef = useRef(false);
    const workerRef = useRef(null);

    const appDetails = IndexStore.getAppDetails()
    const pods = IndexStore.getAllPodNames()
    const isLogAnalyzer = !params.podName

    const additionalOptions = [{ label: "All pods", value: "All pods" }, { label: "All new pods", value: "All new pods" }, { label: "All old pods", value: "All old pods" }]
    let options = [];
    if (pods.length > 1) {
        options = additionalOptions.concat(pods.map((pod) => {
            return { value: pod, label: pod }
        }));
    } else {
        options = pods.map((pod) => {
            return { value: pod, label: pod }
        })
    }

    const handlePodChange = (selected) => {
        // setSelectedPodName((selected as any).value)
        const selectedOption = (selected as any).value

        switch (selectedOption) {
            case "All pods":
                setSelectedPodNames(pods)
                break;
            case "All new pods":
                setSelectedPodNames(IndexStore.getAllNewPodNames())
                break;
            case "All old pods":
                setSelectedPodNames(IndexStore.getAllOldPodNames())
                break;
            default:
                setSelectedPodNames([(selected as any).value])
                break;
        }
    }

    useEffect(() => {
        logsPausedRef.current = logsPaused;
    }, [logsPaused]);

    useEffect(() => {
        const combo = key.join()

        if (combo === "Control,c") {
            handleLogsPause()
        }
    }, [key.join()])

    const parsePipes = (expression) => {
        const pipes = expression.split(/[\|\s]*grep[\s]*/).filter(p => !!p)
        return pipes
    }

    const getGrepTokens = (expression) => {
        const options = commandLineParser({
            args: expression.replace(/[\s]+/, " ").replace('"', "").split(" "),
            booleanKeys: ['v'],
            allowEmbeddedValues: true
        })
        let { _args, A = 0, B = 0, C = 0, a = 0, b = 0, c = 0, v = false } = options
        if (C || c) {
            A = C || c;
            B = C || c;
        }
        if (_args) {
            return ({ _args: _args[0], a: Number(A || a), b: Number(B || b), v })
        }
        else return null
    }

    useEffect(() => {
        if (!logSearchString) {
            setGrepTokens(null);
            return;
        }
        const pipes = parsePipes(logSearchString);
        const tokens = pipes.map((p) => getGrepTokens(p));
        if (tokens.some((t) => !t)) {
            toast.warn('Expression is invalid.');
            return
        }
        setGrepTokens(tokens)
    }, [logSearchString]);

    const handleMessage = (event: any) => {
        if (!event || !event.data || !event.data.result) return;

        if (logsPausedRef.current) {
            return;
        }

        event.data.result.forEach((log: string) => subject.publish(log));

        if (event.data.readyState) {
            setReadyState(event.data.readyState);
        }
    }

    const stopWorker = () => {
        if (workerRef.current) {
            try {
                workerRef.current.postMessage({ type: 'stop' });
                workerRef.current.terminate();
            } catch (err) {

            }
        }
    }


    const handleLogsPause = () => {
        setLogsPaused(!logsPaused);
    }

    const onLogsCleared = () => {
        setLogsCleared(true);
        setTimeout(() => setLogsCleared(false), 1000);
    }

    const fetchLogs = () => {
        workerRef.current = new WebWorker(sseWorker);
        workerRef.current['addEventListener' as any]('message', handleMessage);

        const urls = containers.filter(container => container === selectedContainerName).map((container) => {
            return getLogsURL(appDetails, selectedPodNames, Host, container)
        })

        console.log("payload", { urls: urls, grepTokens: grepTokens, timeout: 300, pods: pods })

        workerRef.current['postMessage' as any]({
            type: 'start',
            payload: { urls: urls, grepTokens: grepTokens, timeout: 300, pods: pods },
        });

    }

    useEffect(() => {
        if (selectedTab) {
            selectedTab(NodeDetailTab.LOGS)
        }

        if (!isLogAnalyzer) {
            const _selectedContainerName = new URLSearchParams(location.search).get('container')

            if (_selectedContainerName) {
                setSelectedContainerName(_selectedContainerName)
            } else {
                setSelectedPodNames(pods)
            }

        } else {
            if (!selectedPodNames) {
                setSelectedPodNames(pods)
            }
        }

    }, [location.search])

    useEffect(() => {
        if (selectedContainerName) {
            stopWorker()
            fetchLogs()
        }

        return () => stopWorker

    }, [selectedContainerName, params.podName, grepTokens]);

    useEffect(() => {
        if (selectedPodNames && selectedPodNames.length > 0) {
            let _cs = []

            selectedPodNames.forEach(pod => {
                IndexStore.getMetaDataForPod(pod).containers.forEach(c => {
                    _cs.push(c)
                });
            });

            setContainers(_cs)

            setSelectedContainerName(_cs[0])
        }
    }, [selectedPodNames])


    const handleContainerNameChange = (containerName: string) => {
        let _url = `${url}?container=${containerName}`
        history.push(_url)
    }

    const handleLogsSearch = (e) => {
        if (e.key === 'Enter' || e.keyCode === 13) {
            setLogSearchString(e.target.value)
            const { length, [length - 1]: highlightString } = e.target.value.split(" ")
            setHighlightString(highlightString)
        }
    }

    return (
        <React.Fragment>

            <div className="container-fluid bcn-0">
                <div className='row pt-2 pb-2 pl-16 pr-16'>
                    <div className='col-6 d-flex align-items-center'>
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

                                {logsPaused ?
                                    <PlayButton className="icon-dim-16 cursor" /> : <StopButton className="icon-dim-16 cursor" />
                                }
                            </div>
                        </Tippy>
                        <Tippy className="default-tt"
                            arrow={false}
                            placement="bottom"
                            content={'Clear'} >
                            <Abort onClick={(e) => { onLogsCleared() }} className="icon-dim-20 ml-8 cursor" />
                        </Tippy>
                        <div className="cn-2 ml-8 mr-8 " style={{ width: '1px', height: '16px', background: '#0b0f22' }} > </div>
                        {isLogAnalyzer &&
                            <React.Fragment>
                                <div className="cn-6">Pods</div>
                                <div className="cn-6 flex left">

                                    {/* <select value={selectedPodName} className="bw-0 en-2  ml-8 w-200" onChange={(e) => {
                                        const value = e.target.value
                                        if (value) {
                                            setSelectedPodName(e.target.value)
                                            onLogsCleared();
                                        }
                                    }}>
                                        <option>Select</option>
                                        {pods.map((pod, index) => {
                                            return <option value={pod} key={`pod_${index}`}>{pod}</option>
                                        })}
                                    </select> */}

                                    <div style={{ minWidth: '200px' }}>
                                        <Select
                                            className="br-4 pl-8 bw-0"
                                            options={options}
                                            placeholder='All Pods'
                                            defaultValue={{ label: selectedPodNames, value: selectedPodNames }}
                                            onChange={(selected, meta) => handlePodChange(selected)}
                                            closeMenuOnSelect
                                            styles={{
                                                ...multiSelectStyles,
                                                menu: (base) => ({ ...base, zIndex: 9999, textAlign: 'left' }),
                                                control: (base, state) => ({ ...base, border: '0px', backgroundColor: 'transparent', minHeight: '24px !important' }),
                                                singleValue: (base, state) => ({ ...base, fontWeight: 600, color: '#06c' }),
                                                indicatorsContainer: (provided, state) => ({
                                                    ...provided,
                                                    height: '24px',
                                                }),
                                            }}
                                            components={{
                                                IndicatorSeparator: null,
                                            }}
                                            isSearchable={false}
                                        />
                                    </div>
                                </div>

                            </React.Fragment>
                        }

                        <div className="cn-6 ml-8">Container </div>

                        <div style={{ minWidth: '145px' }}>
                            <Select
                                placeholder="Select Containers"
                                options={Array.isArray(containers) ? containers.map(container => ({ label: container, value: container })) : []}
                                defaultValue={{ label: selectedContainerName, value: selectedContainerName }}
                                onChange={selected => {
                                    setSelectedContainerName((selected as any).value)
                                }}
                                styles={{
                                    ...multiSelectStyles,
                                    menu: (base) => ({ ...base, zIndex: 9999, textAlign: 'left' }),
                                    control: (base, state) => ({ ...base, border: '0px', backgroundColor: 'transparent', minHeight: '24px !important' }),
                                    singleValue: (base, state) => ({ ...base, fontWeight: 600, color: '#06c' }),
                                    indicatorsContainer: (provided, state) => ({
                                        ...provided,
                                        height: '24px',
                                    }),
                                }}
                                components={{
                                    IndicatorSeparator: null
                                }}
                            />

                        </div>

                    </div>
                    <div className='col-6'>
                        <input type="text" onKeyUp={handleLogsSearch}
                            className="w-100 bcn-1 en-2 bw-1 br-4 pl-12 pr-12 pt-4 pb-4"
                            placeholder="grep -A 10 -B 20 'Server Error'| grep 500 " name="log_search_input" />
                    </div>
                </div>
            </div>
            {!logsCleared && selectedContainerName &&
                <div style={{ gridColumn: '1 / span 2' }} className="flex column log-viewer-container">
                    {console.log(selectedContainerName)}

                    <div
                        className={`pod-readyState pod-readyState--top bcr-7 ${logsPaused || readyState === 2 ? 'pod-readyState--show' : ''
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
                            key={selectedPodNames + selectedContainerName + logSearchString}
                        />
                    </div>

                    <div className={`pod-readyState pod-readyState--bottom ${!logsPaused && [0, 1].includes(readyState) ? 'pod-readyState--show' : ''}`} >
                        {readyState === 0 && (
                            <div className="readyState loading-dots" style={{ color: 'orange' }}>
                                Connecting
                            </div>
                        )}
                        {readyState === 1 && <div className="readyState loading-dots cg-5">Connected</div>}
                    </div>
                </div>
            }

        </React.Fragment>
    )
}

export default LogsComponent
