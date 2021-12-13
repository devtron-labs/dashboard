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
import ReactSelect from 'react-select';
import LogViewerComponent from './LogViewer.component';
import { multiSelectStyles } from '../../../../common/ReactSelectCustomization'
import { NodeType } from '../../../appDetails.type';
import * as queryString from 'query-string';

function LogsComponent({ selectedTab }) {
    const location = useLocation()
    const history = useHistory()
    const { url } = useRouteMatch()

    const [logsPaused, toggleLogStream] = useState(false);
    //const [pods, setPods] = useState([])
    const [containers, setContainers] = useState([])
    const params = useParams<{ actionName: string, podName: string, nodeType: string }>()
    const [selectedContainerName, setSelectedContainerName] = useState("");
    const [selectedPodName, setSelectedPodName] = useState(params.podName);
    const [grepTokens, setGrepTokens] = useState('');
    const appDetails = IndexStore.getAppDetails()
    const pods = IndexStore.getAppDetailsPodNodes()
    const isLogAnalyzer = pods.length > 0

    const workerRef = useRef(null);
    const subject: Subject<string> = new Subject()


    useEffect(() => {
        if (selectedTab) {
            selectedTab(NodeDetailTab.LOGS)
        }

        const _selectedContainerName = new URLSearchParams(location.search).get('container')
        if (_selectedContainerName) {
            setSelectedContainerName(_selectedContainerName)
        }
    }, [location.search])



    const handleMessage = (event: any) => {
        event.data.result.forEach((log: string) => subject.publish(log));
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

    useEffect(() => {
        if (selectedContainerName) {

            stopWorker()

            workerRef.current = new WebWorker(sseWorker);
            workerRef.current['addEventListener' as any]('message', handleMessage);

            const _urls = containers.filter(container => container === selectedContainerName).map((container) => {
                return getLogsURL(appDetails, selectedPodName, Host, container)
            })

            workerRef.current['postMessage' as any]({
                type: 'start',
                payload: { urls: _urls, grepTokens: grepTokens, timeout: 300, pods: containers },
            });
        }


        return () => stopWorker

    }, [selectedContainerName, params.podName, grepTokens]);

    useEffect(() => {
        if (selectedPodName) {
            const _pod = IndexStore.getMetaDataForPod(selectedPodName)
            setContainers(_pod.containers)
        }
    }, [selectedPodName])


    const handleContainerNameChange = (containerName: string) => {
        let _url = `${url}?container=${containerName}`
        history.push(_url)
    }


    const handleLogsPause = (paused: boolean) => {
        toggleLogStream(paused);
    }

    const handleLogsSearch = (e) => {
        if (e.key === 'Enter' || e.keyCode === 13) {
            setGrepTokens(e.target.value)
        }
    }

    return (
        <React.Fragment>

            <div className="container-fluid">
                <div className='row pt-2 pb-2 pl-16 pr-16'>
                    <div className='col-6 d-flex align-items-center'>
                        <Tippy
                            className="default-tt"
                            arrow={false}
                            placement="bottom"
                            content={logsPaused ? 'Resume logs (Ctrl+C)' : 'Stop logs (Ctrl+C)'}
                        >

                            {logsPaused ?
                                <PlayButton onClick={(e) => handleLogsPause(!logsPaused)} className="icon-dim-16 cursor" />
                                :
                                <StopButton onClick={(e) => handleLogsPause(!logsPaused)} className="icon-dim-16 br-4 cursor" />}
                        </Tippy>
                        <Tippy className="default-tt"
                            arrow={false}
                            placement="bottom"
                            content={'Clear'} >
                            <Abort onClick={(e) => { stopWorker(); }} className="icon-dim-20 ml-8 cursor" />
                        </Tippy>
                        <div className="cn-2 ml-8 mr-8 " style={{ width: '1px', height: '16px', background: '#0b0f22' }} > </div>
                        {isLogAnalyzer &&
                            <React.Fragment>
                                <div className="cn-6">Pods</div>
                                <div className="cn-6 flex left">

                                    <select onChange={(e) => {
                                        const value = e.target.value
                                        if (value) {
                                            setSelectedPodName(e.target.value)
                                        }

                                    }}>
                                        <option>Select</option>
                                        {pods.map((pod, index) => {

                                            return <option selected={selectedPodName == pod.name} value={pod.name} key={`pod_${index}`}>{pod.name}</option>
                                        })}
                                    </select>

                                    {/* <div style={{ minWidth: '200px' }}>
                                        <ReactSelect
                                            className="br-4 pl-8 bw-0"
                                            // options={logFormDTO.pods.map(pod => ({ label: pod.name, value: pod.name }))}
                                            placeholder='All Pods'
                                            // value={{ label: selectedPodName, value: selectedPodName }}
                                            onChange={(selected, meta) => setSelectedPodName((selected as any).value)}
                                            closeMenuOnSelect
                                            styles={{
                                                ...multiSelectStyles,
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
                                    </div> */}
                                </div>

                            </React.Fragment>
                        }

                        <div className="cn-6">Container </div>

                        <select onChange={(e) => {
                            const value = e.target.value
                            if (value) { handleContainerNameChange(e.target.value) }
                        }}>
                            <option>Select</option>
                            {containers.map((container, index) => {
                                return <option selected={selectedContainerName == container} value={container} key={`c_${index}`}>{container}</option>
                            })}
                        </select>

                        {/* <div style={{ minWidth: '200px' }}>
                            
                            <ReactSelect
                                value={{ label: selectedContainerName, value: selectedContainerName }}
                                defaultValue={{ label: selectedContainerName, value: selectedContainerName }}
                                className="br-4 pl-8 bw-0"
                                options={Array.isArray(containers) ? containers.map(container => ({ label: container, value: container })) : []}
                                placeholder='All Containers'
                                onChange={(selected) => {
                                    console.log('test')
                                    handleContainerNameChange((selected as any).value)
                                }}
                                styles={{
                                    ...multiSelectStyles,
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
                        </div> */}
                    </div>
                    <div className='col-6'>
                        <input type="text" onKeyUp={handleLogsSearch}
                            className="w-100 bcn-1 en-2 bw-1 br-4 pl-12 pr-12 pt-4 pb-4"
                            placeholder="grep -A 10 -B 20 'Server Error'| grep 500 " name="log_search_input" />
                    </div>
                </div>
            </div>

            <div style={{ minHeight: '600px' }}>
                <LogViewerComponent subject={subject} />
            </div>

        </React.Fragment>
    )
}

export default LogsComponent
