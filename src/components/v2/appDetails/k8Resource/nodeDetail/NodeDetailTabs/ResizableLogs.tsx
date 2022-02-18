import React from 'react';
import { useThrottledEffect } from '../../../../../common';
import { ReactComponent as CheckIcon } from '../../../../assets/icons/ic-check.svg';
import { AutoSizer } from 'react-virtualized';
import '../../../../../../../node_modules/xterm/css/xterm.css';



interface resize{
    showCopyToast : boolean;
    fitAddon: any;
    fromPage? :string;
}

function ResizableLogs({showCopyToast,fitAddon,fromPage}:resize){
    
    return(
    <AutoSizer>
                {({ height, width }) => (
                    <Resizable  height={height} width={width} />
                )}
            </AutoSizer>
    )

    
    function Resizable({  height, width }) {
        
        useThrottledEffect(
            () => {

                if (fitAddon)
                {
                    if( fromPage === "terminal"){
                        fitAddon.fit();  
                    }  
                    else{
                        fitAddon.current.fit();  
                    }
                }     
            },
            100,
            [height, width],
        );
        
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