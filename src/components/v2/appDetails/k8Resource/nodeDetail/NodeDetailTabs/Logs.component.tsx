import Tippy from '@tippyjs/react';
import React, { useEffect, useRef, useState } from 'react'
import { ReactComponent as PlayButton } from '../../../../assets/icons/ic-play.svg';
import { ReactComponent as StopButton } from '../../../../assets/icons/ic-stop.svg';
import { ReactComponent as Abort } from '../../../../assets/icons/ic-abort.svg';
import { useParams, useRouteMatch } from 'react-router';
import { NodeDetailTab } from '../nodeDetail.type';
import { getLogsURLs } from '../nodeDetail.api';
import IndexStore from '../../../index.store';
import WebWorker from '../../../../../app/WebWorker';
import sseWorker from '../../../../../app/grepSSEworker';
import { Host } from "../../../../../../config";
import { Subject } from '../../../../../../util/Subject';
import ReactSelect from 'react-select';
import LogViewerComponent from './LogViewer.component';
import { multiSelectStyles } from '../../../../common/ReactSelectCustomization'

function LogsComponent({ selectedTab }) {
    const [logsPaused, toggleLogStream] = useState(false);
    const params = useParams<{ actionName: string, podName: string, nodeType: string }>()
    const containers = IndexStore.getMetaDataForPod(params.podName).containers
    const [selectedContainerName, setSelectedContainerName] = useState(containers[0]);
    const appDetails = IndexStore.getAppDetails()
    const [logFormDTO, setLogFormDTO] = useState({
        pods: [params.podName],
        urls: getLogsURLs(appDetails, params.podName, Host),
        grepTokens: ""
    });

    const [terminalCleared, setTerminalCleared] = useState(false);

    const workerRef = useRef(null);
    const subject: Subject<string> = new Subject()

    useEffect(() => {
        selectedTab(NodeDetailTab.LOGS)

    }, [params.podName])

    const handleMessage = (event: any) => {
        event.data.result.forEach((log: string) => subject.publish(log));
    }

    useEffect(() => {
        workerRef.current = new WebWorker(sseWorker);
        workerRef.current['addEventListener' as any]('message', handleMessage);
        workerRef.current['postMessage' as any]({
            type: 'start',
            payload: { urls: logFormDTO.urls, grepTokens: logFormDTO.grepTokens, timeout: 300, pods: logFormDTO.pods },
        });
    }, [logFormDTO]);

    useEffect(() => {
        return () => {
            try {
                workerRef.current.postMessage({ type: 'stop' });
                workerRef.current.terminate();
            } catch (err) {
            }
        };
    }, [])


    const handleLogsPause = (paused: boolean) => {
        toggleLogStream(paused);
    }

    const handleLogsSearch = (e) => {
        if (e.key === 'Enter' || e.keyCode === 13) {
            setLogFormDTO({ ...logFormDTO, grepTokens: e.target.value })
        }
    }

    return (
        <React.Fragment>
            <div className="flex bcn-0 pl-28 pt-2 pb-2 content-space">
                <div className="flex left">
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
                            {logsPaused ? <PlayButton className="icon-dim-16" /> : <StopButton className="stop-btn icon-dim-16 br-4 fcr-5" />}
                        </div>
                    </Tippy>

                    <Tippy className="default-tt"
                        arrow={false}
                        placement="bottom"
                        content={'Clear'} >
                        <div>
                            <Abort className="icon-dim-20" onClick={(e) => { setTerminalCleared(true); }} />
                        </div>
                    </Tippy>

                    <span className="cn-2 mr-8 ml-8" style={{ width: '1px', height: '16px', background: '#0b0f22' }} />
                    <div className="cn-6">Container </div>
                    <div className="cn-6 flex left">
                        <div style={{ minWidth: '145px' }}>
                            <ReactSelect
                                className="br-4 pl-8 bw-0"
                                options={Array.isArray(containers) ? containers.map(container => ({ label: container, value: container })) : []}
                                placeholder='All Containers'
                                value={{ label: selectedContainerName, value: selectedContainerName }}
                                onChange={(selected, meta) => setSelectedContainerName((selected as any).value)}
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
                                isSearchable={false}
                            />
                        </div>
                        <span className="cn-2 ml-8 mr-8" style={{ width: '1px', height: '16px', background: '#0b0f22' }} />
                    </div>
                </div>

                <div className="pr-20" style={{ minWidth: '700px' }}>
                    {/* <form name="log_form" onSubmit={handleLogsSearch}> */}

                    <input type="text" onKeyUp={handleLogsSearch}
                        className="w-100 bcn-1 en-2 bw-1 br-4 pl-12 pr-12 pt-4 pb-4"
                        placeholder="grep -A 10 -B 20 'Server Error'| grep 500 " name="log_search_input" />
                    {/* </form> */}
                </div>

            </div>
            {/* <div className="bcy-2 loading-dots pl-20 fs-13 pt-2 pb-2">
                Connecting
            </div> */}

            <div className=" pl-20 pr-20" style={{ height: '460px', background: 'black' }}>
                <LogViewerComponent subject={subject} />
            </div>
        </React.Fragment>
    )
}

export default LogsComponent
