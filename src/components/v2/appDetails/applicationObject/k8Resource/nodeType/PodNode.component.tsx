import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useRouteMatch } from 'react-router';
import { NodeDetailTabs } from '../../../node.type';
import AppDetailsStore from '../../../appDetail.store';
import Tippy from '@tippyjs/react';
import { copyToClipboard } from '../../../../../common';
import { ReactComponent as DropDown } from '../../../../../../assets/icons/ic-dropdown-filled.svg';
import { ReactComponent as Clipboard } from '../../../../../../assets/icons/ic-copy.svg';
import PodHeaderComponent from './PodHeader.component';

function PodNodeComponent({ selectedNodeType }) {
    const { path, url } = useRouteMatch();
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return
        setTimeout(() => setCopied(false), 2000)
    }, [copied])

    const appDetailsNodes = AppDetailsStore.getAppDetailsNodes()
    const [showServiceChildElement, hideServiceChildElement] = useState(false)

    const toggleServiceChildElement = () => {
        hideServiceChildElement(!showServiceChildElement)
    }

    return (
        <div className="container-fluid generic-table ml-0 mr-0" style={{paddingRight: 0, paddingLeft: 0 }}>
                <PodHeaderComponent />
            <div>
                <div className="row border-bottom fw-6 " style={{paddingLeft: '40px'}}>
                    {
                        ["Pod (All)", "Ready", "Restarts", "Age", "Live sync status"].map((cell, index) => {
                            return <div key={'gpt_' + index} className={(index === 0 ? "col-6 pt-9 pb-9" : "col pt-9 pb-9")}>{cell}</div>
                        })
                    }
                </div>

                <div className="generic-body">
                    {
                        appDetailsNodes.map((node, index) => {
                            if (node.kind === selectedNodeType) {
                                return (
                                    <div className="row" key={'grt' + index} onClick={() => toggleServiceChildElement()}>

                                        <div className={"col-md-6 pt-9 pb-9 flex left pl-0"} >
                                            <DropDown
                                                className={`rotate icon-dim-24 pointer ${node.isSelected ? 'fcn-9' : 'fcn-5'}`}
                                                style={{ ['--rotateBy' as any]: !node.isSelected ? '-90deg' : '0deg' }}
                                            /> <span>{node.name}</span>
                                            <div>healthy</div>
                                            <span className="action-buttons">
                                                <Tippy
                                                    className="default-tt"
                                                    arrow={false}
                                                    placement="bottom"
                                                    content={copied ? 'Copied!' : 'Copy to clipboard.'}
                                                    trigger='mouseenter click'
                                                >
                                                    <Clipboard
                                                        className="hover-only icon-dim-18 pointer ml-8 mr-8"
                                                        onClick={(e) => copyToClipboard(node?.name, () => setCopied(true))}
                                                    />
                                                </Tippy>
                                                <NavLink to={`${path}/${node.name}/${NodeDetailTabs.MANIFEST.toLowerCase()}`} className="learn-more-href ml-6 cursor">Manifest</NavLink>
                                                <NavLink to={`${path}/${node.name}/${NodeDetailTabs.EVENTS.toLowerCase()}`} className="learn-more-href ml-6 cursor">Events</NavLink>
                                            </span>
                                        </div>
                                        <div className={"col-md-2 pt-9 pb-9"} > . </div>
                                        <div className={"col-md-1 pt-9 pb-9"} > ... </div>
                                        <div className={"col-md-2 pt-9 pb-9"} > ... </div>
                                        <div className={"col-md-1 pt-9 pb-9"} > ... </div>
                                    </div>
                                )
                            }

                            return node.parentRefs && node.parentRefs.map((parentNode, _index) => {
                                if (parentNode.kind === selectedNodeType) {
                                    return (
                                        showServiceChildElement && (
                                            <div key={'grtp' + _index}>
                                                <div className="row pt-10 pb-10 pl-24 indent-line" >
                                                    <div className="col-md-12 border-bottom pt-10 pb-10 "><b>{node.kind.toUpperCase()}</b></div>
                                                </div>
                                                <div className="row pt-10 pb-10 pl-24 indent-line" >
                                                    <div className="col-md-6 pt-10 pb-10">
                                                        <span>{node.name}</span>
                                                        <span className="action-buttons">
                                                            <Tippy
                                                                className="default-tt"
                                                                arrow={false}
                                                                placement="bottom"
                                                                content={copied ? 'Copied!' : 'Copy to clipboard.'}
                                                                trigger='mouseenter click'
                                                            >
                                                                <Clipboard
                                                                    className="hover-only icon-dim-18 pointer ml-8 mr-8"
                                                                    onClick={(e) => copyToClipboard(node?.name, () => setCopied(true))}
                                                                />
                                                            </Tippy>
                                                            <NavLink to={`${path}/${node.name}/${NodeDetailTabs.MANIFEST.toLowerCase()}`} className="learn-more-href ml-6 cursor">Manifest</NavLink>
                                                            <NavLink to={`${path}/${node.name}/${NodeDetailTabs.EVENTS.toLowerCase()}`} className="learn-more-href ml-6 cursor">Events</NavLink>
                                                        </span>
                                                    </div>

                                                </div>
                                            </div>
                                        )
                                    )
                                }
                            })
                        })
                    }
                </div>
            </div>
        </div >

        // <div className="container-fluid generic-table">

        //     <React.Fragment>

        //         <div className="row border-bottom ">
        //             {
        //                 ["Pod (All)", "Ready", "Restarts", "Age", "Live sync status"].map((cell, index) => {
        //                     return <div key={'gpt_' + index} className={(index === 0 ? "col-6 pt-9 pb-9" : "col pt-9 pb-9")}>{cell}</div>
        //                 })
        //             }
        //         </div>

        //         <div className="generic-body">
        //             {
        //                 appDetailsNodes.map((node, index) => {
        //                         return (
        //                             <div className="row" key={'grt' + index}>

        //                                 <div className={"col-6 pt-9 pb-9"} >
        //                                     <span>{node.name}</span>
        //                                     <span className="action-buttons ">
        //                                         <NavLink to={`${path}/${node.name}/${NodeDetailTabs.MANIFEST.toLowerCase()}`} className="learn-more-href ml-6 cursor">Manifest</NavLink>
        //                                         <NavLink to={`${path}/${node.name}/${NodeDetailTabs.LOGS.toLowerCase()}`} className="learn-more-href ml-6 cursor" >Logs</NavLink>
        //                                         <NavLink to={`${path}/${node.name}/${NodeDetailTabs.SUMMARY.toLowerCase()}`} className="learn-more-href ml-6 cursor" >Summary</NavLink>
        //                                         <NavLink to={`${path}/${node.name}/${NodeDetailTabs.EVENTS.toLowerCase()}`} className="learn-more-href ml-6 cursor">Events</NavLink>
        //                                         <NavLink to={`${path}/${node.name}/${NodeDetailTabs.TERMINAL.toLowerCase()}`} className="learn-more-href ml-6 cursor">Terminal</NavLink>
        //                                     </span>
        //                                 </div>

        //                                 <div className={"col pt-9 pb-9"} >
        //                                     ...
        //                                 </div>

        //                                 <div className={"col pt-9 pb-9"} >
        //                                     ...
        //                                 </div>

        //                                 <div className={"col pt-9 pb-9"} >
        //                                     ...
        //                                 </div>

        //                                 <div className={"col pt-9 pb-9"} >
        //                                     ...
        //                                 </div>
        //                             </div>
        //                         )
        //                 })
        //             }
        //         </div>

        //     </React.Fragment>

        // </div>
    )
}

export default PodNodeComponent
