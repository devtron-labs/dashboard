import React from 'react';
import { ReactComponent as CheckIcon } from '../../../../assets/icons/ic-check.svg';
import '../../../../../../../node_modules/xterm/css/xterm.css';
import '../../../../../LogViewer/LogViewer.scss';
import  './nodeDetailTab.scss';

interface Resize {
    showCopyToast: boolean;
    height:number;
    width:number;
}

function ResizableLogs({ showCopyToast ,height,width}: Resize) {
    return <Resizable />;
    function Resizable() {
        return (
            <div id="xterm-logs" style={{ height, width }}>
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
