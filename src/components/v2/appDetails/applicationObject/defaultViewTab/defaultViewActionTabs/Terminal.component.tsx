import React, { useState } from 'react';
import Tippy from '@tippyjs/react';
import { ReactComponent as PlayButton } from '../../../../../../assets/icons/ic-play.svg';
import { ReactComponent as StopButton } from '../../../../../../assets/icons/ic-stop.svg';

function TerminalComponent() {

    const [logsPaused, toggleLogStream] = useState(false);

    function handleLogsPause(paused: boolean) {
        toggleLogStream(paused);
    }

    return (<>
        <div className="flex left">
            <div>
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
            </div>
        </div>

        <div className="bcy-2 loading-dots">
            Connecting
        </div>
        <div className="bcn-0 pl-20 pr-20" style={ {height: '400px'}}>
            
        </div>
    </>
    )
}

export default TerminalComponent
