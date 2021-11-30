import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useRouteMatch, useParams } from 'react-router';
import { NodeDetailTab } from '../nodeDetail/nodeDetail.type';
import IndexStore from '../../index.store';
import Tippy from '@tippyjs/react';
import { copyToClipboard } from '../../../../common';
import { ReactComponent as DropDown } from '../../../../../assets/icons/ic-dropdown-filled.svg';
import { ReactComponent as Clipboard } from '../../../../../assets/icons/ic-copy.svg';
import PodHeaderComponent from './PodHeader.component';
import { NodeType } from '../../appDetails.type';
import { useSharedState } from '../../../utils/useSharedState';

import './nodeType.css'
import { getNodeDetailTabs } from '../nodeDetail/nodeDetail.util';

function NodeComponent() {

    const { path, url } = useRouteMatch();
    const [copied, setCopied] = useState(false);
    const [tableHeader, setTableHeader] = useState([]);
    const [nodes] = useSharedState(IndexStore.getAppDetailsNodes(), IndexStore.getAppDetailsNodesObservable())

    const params = useParams<{ nodeType: NodeType }>()

    const [tabs, setTabs] = useState([])

    //const appDetailsNodes = IndexStore.getAppDetailsNodes()
    const [showServiceChildElement, hideServiceChildElement] = useState(false)

    useEffect(() => {
        if (!copied) return
        setTimeout(() => setCopied(false), 2000)
    }, [copied])

    useEffect(() => {

        if(params.nodeType){
            const _tabs = getNodeDetailTabs(params.nodeType as NodeType)
            setTabs(_tabs)
        }

        let tableHeader;
        switch (params.nodeType) {
            case NodeType.Pod.toLowerCase():
                tableHeader = ["Pod (All)", "Ready", "Restarts", "Age", "Live sync status"]
                break;
            case NodeType.Service.toLowerCase():
                tableHeader = ["Name", "URL"]
                break;
            default:
                tableHeader = ["Name"]
                break;
        }

        setTableHeader(tableHeader)
    }, [params.nodeType])


    const toggleServiceChildElement = () => {
        hideServiceChildElement(!showServiceChildElement)
    }

    return (
        <div className="container-fluid generic-table ml-0 mr-0" style={{ paddingRight: 0, paddingLeft: 0 }}>

            {(params.nodeType === NodeType.Pod.toLowerCase()) && <PodHeaderComponent />}

            <div>
                <div className="row border-bottom fw-6 m-0 " style={{ paddingLeft: '40px' }}>
                    {
                        tableHeader.map((cell, index) => {
                            return <div key={'gpt_' + index} className={(index === 0 ? "col-6 pt-9 pb-9 pl-0" : "col pt-9 pb-9")}>{cell}</div>
                        })
                    }
                </div>

                <div className="generic-body">
                    {
                        nodes.map((node, index) => {
                            if (node.kind.toLowerCase() === params.nodeType) {
                                return (
                                    <div className="row m-0" key={'grt' + index} onClick={() => toggleServiceChildElement()}>

                                        <div className={"col-md-6 pt-9 pb-9 flex left pl-0"} >
                                            <DropDown
                                                className={`rotate icon-dim-24 pointer ${node["isSelected"] ? 'fcn-9' : 'fcn-5'}`}
                                                style={{ ['--rotateBy' as any]: !node["isSelected"] ? '-90deg' : '0deg' }}
                                            />
                                            <div className="flexbox">
                                                <div>
                                                    <div>{node.name}</div>
                                                    <div className="cg-5">{node.health?.status}</div>
                                                </div>
                                                <div className="">
                                                    <Tippy
                                                        className="default-tt"
                                                        arrow={false}
                                                        placement="bottom"
                                                        content={copied ? 'Copied!' : 'Copy to clipboard.'}
                                                        trigger='mouseenter click'
                                                    >
                                                        <Clipboard
                                                            className="hover-only icon-dim-12 pointer ml-8 mr-8"
                                                            onClick={(e) => copyToClipboard(node?.name, () => setCopied(true))}
                                                        />
                                                    </Tippy>

                                                </div>
                                            </div>

                                            {tabs && tabs.map((tab, index) => {
                                                return <NavLink key={"tab__" + index} to={`${url}/${node.name}/${tab.toLowerCase()}`} className="fw-6  cb-5 ml-6 cursor">{tab}</NavLink>
                                            })}

                                            {/* {params.nodeType === NodeType.Pod.toLowerCase() &&
                                                <React.Fragment>
                                                    <NavLink to={`${url}/${node.name}/${NodeDetailTab.MANIFEST.toLowerCase()}`} className="fw-6  cb-5 ml-6 cursor">Manifest</NavLink>
                                                    <NavLink to={`${url}/${node.name}/${NodeDetailTab.EVENTS.toLowerCase()}`} className="fw-6 cb-5 ml-6 cursor">Events</NavLink>
                                                    <NavLink to={`${url}/${node.name}/${NodeDetailTab.TERMINAL.toLowerCase()}`} className="learn-more-href ml-6 cursor">Terminal</NavLink>
                                                    <NavLink to={`${url}/${node.name}/${NodeDetailTab.LOGS.toLowerCase()}`} className="learn-more-href ml-6 cursor">Logs</NavLink>
                                                    <NavLink to={`${url}/${node.name}/${NodeDetailTab.SUMMARY.toLowerCase()}`} className="learn-more-href ml-6 cursor">Summary</NavLink>
                                                </React.Fragment>
                                            } */}
                                        </div>

                                        {(params.nodeType === NodeType.Service.toLowerCase()) && <div className={"col-md-6 pt-9 pb-9 flex left"} >
                                            {node.name + "." + node.namespace}  : portnumber
                                            <Tippy
                                                className="default-tt"
                                                arrow={false}
                                                placement="bottom"
                                                content={copied ? 'Copied!' : 'Copy to clipboard.'}
                                                trigger='mouseenter click'
                                            >
                                                <Clipboard
                                                    className="hover-only icon-dim-18 pointer"
                                                    onClick={(e) => copyToClipboard(node?.name, () => setCopied(true))}
                                                />
                                            </Tippy>
                                        </div>}

                                        {params.nodeType === NodeType.Pod.toLowerCase() &&
                                            <React.Fragment>
                                                <div className={"col-md-2 pt-9 pb-9"} > ... </div>
                                                <div className={"col-md-1 pt-9 pb-9"} > ... </div>
                                                <div className={"col-md-2 pt-9 pb-9"} > ... </div>
                                                <div className={"col-md-1 pt-9 pb-9"} > ... </div>
                                            </React.Fragment>
                                        }
                                    </div>
                                )
                            }

                            return node.parentRefs && node.parentRefs.map((parentNode, _index) => {
                                if (parentNode.kind.toLowerCase() === params.nodeType) {
                                    return (
                                        showServiceChildElement && (
                                            <div key={'grtp' + _index} className="border-left pl-24">
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
                                                                    className="hover-only icon-dim-12 pointer ml-8 mr-8"
                                                                    onClick={(e) => copyToClipboard(node?.name, () => setCopied(true))}
                                                                />
                                                            </Tippy>
                                                            <NavLink to={`${path}/${node.name}/${NodeDetailTab.MANIFEST.toLowerCase()}`} className="fw-6 cb-5 ml-6 cursor">Manifest</NavLink>
                                                            <NavLink to={`${path}/${node.name}/${NodeDetailTab.EVENTS.toLowerCase()}`} className="fw-6 cb-5 ml-6 cursor">Events</NavLink>
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
    )
}

export default NodeComponent

