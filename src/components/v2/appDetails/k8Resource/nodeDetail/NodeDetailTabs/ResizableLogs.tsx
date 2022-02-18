import React from 'react';
import { useThrottledEffect } from '../../../../../common';
import { ReactComponent as CheckIcon } from '../../../../assets/icons/ic-check.svg';
import { AutoSizer } from 'react-virtualized';
import '../../../../../../../node_modules/xterm/css/xterm.css';

interface Resize {
    showCopyToast: boolean;
}

function ResizableLogs({ showCopyToast }: Resize) {
    return <Resizable />;
    function Resizable() {
        return (
            <div id="xterm-logs">
                <span
                    className={`br-8 bcn-0 cn-9 clipboard-toast ${showCopyToast ? 'clipboard-toast--show' : ''}`}
                    style={{ zIndex: 9 }}
                >
                    <CheckIcon className="icon-dim-24 scn-9" />
                    <div className="">Copied!</div>
                </span>
            </div>
        );
    }
}

export default ResizableLogs;
