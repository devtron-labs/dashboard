import React, { useEffect, useState } from 'react';
import Tippy from '@tippyjs/react';
import { ReactComponent as Disconnect } from '../../../../assets/icons/ic-play.svg';
import { ReactComponent as Connect } from '../../../../assets/icons/ic-stop.svg';
import { ReactComponent as Abort } from '../../../../assets/icons/ic-abort.svg';
import { useParams, useRouteMatch } from 'react-router';
import AppDetailsStore from '../../../appDetails.store';
import { NodeDetailTab } from '../nodeDetail.type';
import './nodeDetailTab.css'
import IndexStore from '../../../index.store';
import { getTerminalData } from '../nodeDetail.api';
import { TerminalView } from './terminal/TerminalWrapper';

export type SocketConnectionType = 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'DISCONNECTING';

function TerminalComponent({ selectedTab }) {

    const [logsPaused, toggleLogStream] = useState(false);
    const [containerName, setContainerName] = useState('');
    const [selectedtTerminalType, setSelectedtTerminalType] = useState("sh");
    const [terminalCleared, setTerminalCleared] = useState(false);
    const [isReconnection, setIsReconnection] = useState(false);
    const [isSocketConnecting, setSocketConnection] = useState<'CONNECTING' | 'DISCONNECTING'>('CONNECTING')
    const { path, url } = useRouteMatch()
    const params = useParams<{ actionName: string, podName: string, nodeType: string }>()
    const appDetails = IndexStore.getAppDetails();

    useEffect(() => {
        selectedTab(NodeDetailTab.TERMINAL)

        if (params.podName) {
            AppDetailsStore.addAppDetailsTab(params.nodeType, params.podName, url)
        }
        getTerminalData(appDetails, params.podName, selectedtTerminalType).then((response) => {
            console.log("getTerminalData", response)
        }).catch((err) => {
            console.log("err", err)
        })

    }, [params.podName])


    

    // useEffect(() => {
    //     selectedTab(NodeDetailTabs.TERMINAL)
    // }, [])

    function handleLogsPause(paused: boolean) {
        toggleLogStream(paused);
    }

    return (<div>
        <div className="flex left bcn-0 pt-8 pl-20">
            <Tippy
                className="default-tt"
                arrow={false}
                placement="bottom"
                content={logsPaused ? 'Resume logs (Ctrl+C)' : 'Stop logs (Ctrl+C)'}
            >
                <div
                    className={`toggle-logs mr-12 flex ${logsPaused ? 'play' : 'stop'}`}
                    onClick={(e) => handleLogsPause(!logsPaused)}
                >
                    {isSocketConnecting ?
                        <span>
                            <Disconnect className="icon-dim-20 mr-5" onClick={(e) => { setSocketConnection('DISCONNECTING'); setIsReconnection(true); }} />
                        </span>
                        : <span>
                            <Connect className="icon-dim-20 mr-5" onClick={(e) => { setSocketConnection('CONNECTING') }} />
                        </span>
                    }
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

            <div className="cn-6">Container <span className="cn-9">dashboard-devtron</span></div>

            <span className="cn-2 ml-8 mr-8" style={{ width: '1px', height: '16px', background: '#0b0f22' }} />

            <div className="cn-6">sh <span className="cn-9">dashboard-devtron</span></div>

        </div>

        <div className="bcy-2 pl-20 loading-dots">
            Connecting
        </div>

        <div className="bcn-0 pl-20 pr-20" style={{ height: '460px' }}>
        {/* <TerminalView appDetails={appDetails}
                        nodeName={params.podName}
                        containerName={containerName}
                        socketConnection={`CONNECTED`}
                        terminalCleared={terminalCleared}
                        shell={'sh'}
                        isReconnection={isReconnection}
                        setIsReconnection={setIsReconnection}
                        setTerminalCleared={setTerminalCleared}
                        setSocketConnection={()=>setSocketConnection}
                    /> */}

        </div>
    </div>
    )
}

export default TerminalComponent
