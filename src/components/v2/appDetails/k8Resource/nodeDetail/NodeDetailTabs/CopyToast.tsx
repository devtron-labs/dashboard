import React from 'react';
import { copyToClipboard } from '../../../../../common';
import { ReactComponent as CheckIcon } from '../../../../assets/icons/ic-check.svg';
import {AutoSizer} from 'react-virtualized';
import '../../../../../../../node_modules/xterm/css/xterm.css';
import '../../../../../LogViewer/LogViewer.scss';
import  './nodeDetailTab.scss';


function CopyToast({ showCopyToast }) {
    
    return (
        <AutoSizer>
            {({ height, width }) => (
                <div id="xterm-logs" style={{ height, width }}>
                    <span
                        className={`br-8 bcn-0 cn-9 clipboard-toast ${showCopyToast ? 'clipboard-toast--show' : ''}`}
                        style={{ zIndex: 9 }}
                    >
                        <CheckIcon className="icon-dim-24 scn-9" />
                        <div className="">Copied!</div>
                    </span>
                </div>
            )}
        </AutoSizer>
    );
}

function handleSelectionChange(terminal, setPopupText) {
    console.log(terminal);
    terminal.onSelectionChange(() => {
        copyToClipboard(terminal.getSelection());
        if (terminal.getSelection()) {
            setPopupText(true);
        }
    });
}

export default CopyToast;
export {handleSelectionChange};
