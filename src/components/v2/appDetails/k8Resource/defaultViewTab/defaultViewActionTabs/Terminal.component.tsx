import React, { useState } from 'react';
import Tippy from '@tippyjs/react';
import { ReactComponent as Disconnect } from '../../../../assets/icons/ic-play.svg';
import { ReactComponent as Connect } from '../../../../assets/icons/ic-stop.svg';
import { ReactComponent as Abort } from '../../../../assets/icons/ic-abort.svg';

function TerminalComponent() {

    const [logsPaused, toggleLogStream] = useState(false);
    const [terminalCleared, setTerminalCleared] = useState(false);
    const [isReconnection, setIsReconnection] = useState(false);
    const [isSocketConnecting, setSocketConnection] = useState<'CONNECTING' | 'DISCONNECTING'>('CONNECTING')

    function handleLogsPause(paused: boolean) {
        toggleLogStream(paused);
    }

    return (<>
        <div className="flex left bcn-0">
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
                    {isSocketConnecting ?
                        <Disconnect className="icon-dim-20 mr-5" onClick={(e) => { setSocketConnection('DISCONNECTING'); setIsReconnection(true); }} />
                        : <Connect className="icon-dim-20 mr-5" onClick={(e) => { setSocketConnection('CONNECTING') }} />}
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

        <div className="bcy-2 loading-dots">
            Connecting
        </div>

        <div className="bcn-0 pl-20 pr-20" style={{ height: '460px' }}>

        </div>
    </>
    )
}

export default TerminalComponent
