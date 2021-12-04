import Tippy from '@tippyjs/react';
import React, { useEffect, useRef, useState } from 'react'
import { ReactComponent as PlayButton } from '../../../../assets/icons/ic-play.svg';
import { ReactComponent as StopButton } from '../../../../assets/icons/ic-stop.svg';
import { ReactComponent as Abort } from '../../../../assets/icons/ic-abort.svg';
import { useParams, useRouteMatch, useHistory } from 'react-router';
import AppDetailsStore from '../../../appDetails.store';
import { NodeDetailTab } from '../nodeDetail.type';
import { getLogsURLs } from '../nodeDetail.api';
import IndexStore from '../../../index.store';
import WebWorker from '../../../../../app/WebWorker';
import sseWorker from '../../../../../app/grepSSEworker';
import { Host } from "../../../../../../config";
import LogViewer from '../../../../../LogViewer/LogViewer';
import { Subject } from '../../../../../../util/Subject';


function LogsComponent({ selectedTab }) {
    const [logsPaused, toggleLogStream] = useState(false);
    const params = useParams<{ actionName: string, podName: string, nodeType: string }>()
    const appDetails = IndexStore.getAppDetails()

    const [logFormDTO, setLogFormDTO] = useState({
        pods: [params.podName],
        urls: getLogsURLs(appDetails, params.podName, Host),
        grepTokens: ""
    });

    const [terminalCleared, setTerminalCleared] = useState(false);
    const { path, url } = useRouteMatch()

    const workerRef = useRef(null);
    const subject: Subject<string> = new Subject()

    useEffect(() => {
        selectedTab(NodeDetailTab.LOGS)

        if (params.podName) {
            AppDetailsStore.addApplicationObjectTab(params.nodeType, params.podName, url)
        }

    }, [params.podName])

    const handleMessage = (event: any) => {
        console.log("processRealtimeLogData", event)

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
        e.stopPropagation()
        const formElements = e.currentTarget.elements

        setLogFormDTO({ ...logFormDTO, grepTokens: formElements.log_search_input.value })
    }
    return (
        <React.Fragment>
            <form onSubmit={handleLogsSearch}>
                <div className="flex bcn-0 pl-20 pt-8 content-space">
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

                        <div className="cn-6">
                            Container
                         <span className="cn-9">dashboard-devtron</span>
                        </div>

                        <span className="cn-2 ml-8 mr-8" style={{ width: '1px', height: '16px', background: '#0b0f22' }} />

                        <div className="cn-6">sh <span className="cn-9">dashboard-devtron</span></div>
                    </div>
                    <div className="pr-20" style={{minWidth: '700px'}}>
                        <input type="text" className="w-100 br-4" placeholder="grep token" name="log_search_input" />
                    </div>

                </div>
            </form>
            <div className="bcy-2 loading-dots pl-20 fs-13 pt-2 pb-2">
                Connecting
            </div>

            <div className="bcn-0 pl-20 pr-20" style={{ height: '460px' }}>
                <LogViewer subject={subject} />
            </div>
        </React.Fragment>
    )
}

export default LogsComponent
