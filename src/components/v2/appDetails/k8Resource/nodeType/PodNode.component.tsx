import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useRouteMatch } from 'react-router';
import { NodeDetailTabs } from '../../node.type';
import AppDetailsStore from '../../index.store';
import Tippy from '@tippyjs/react';
import { copyToClipboard } from '../../../../common';
import { ReactComponent as DropDown } from '../../../../../assets/icons/ic-dropdown-filled.svg';
import { ReactComponent as Clipboard } from '../../../../../assets/icons/ic-copy.svg';
import PodHeaderComponent from './PodHeader.component';

function PodNodeComponent({ selectedNodeType }) {
    const { path } = useRouteMatch();
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
        <div className="container-fluid generic-table ml-0 mr-0" style={{ paddingRight: 0, paddingLeft: 0 }}>
            <PodHeaderComponent />
            <div>
                <div className="row border-bottom fw-6 m-0 " style={{ paddingLeft: '40px' }}>
                    {
                        ["Pod (All)", "Ready", "Restarts", "Age", "Live sync status"].map((cell, index) => {
                            return <div key={'gpt_' + index} className={(index === 0 ? "col-6 pt-9 pb-9 pl-0" : "col pt-9 pb-9")}>{cell}</div>
                        })
                    }
                </div>

                <div className="generic-body">
                    {
                        appDetailsNodes.map((node, index) => {
                            if (node.kind === selectedNodeType) {
                                return (
                                    <div className="row m-0" key={'grt' + index} onClick={() => toggleServiceChildElement()}>

                                        <div className={"col-md-6 pt-9 pb-9 m-0 flex left pl-0"} >
                                            <div className=" flex left">
                                                <span className="mr-8">
                                                    <DropDown
                                                        className={`rotate icon-dim-24 pointer ${node.isSelected ? 'fcn-9' : 'fcn-5'}`}
                                                        style={{ ['--rotateBy' as any]: !node.isSelected ? '-90deg' : '0deg' }}
                                                    />
                                                </span>
                                                <div className="flexbox">
                                                    <div>
                                                        <div>{node.name}</div>
                                                        <div className="cg-5">HEALTHY</div>
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
                                                        <NavLink to={`${path}/${node.name}/${NodeDetailTabs.MANIFEST.toLowerCase()}`} className="fw-6  cb-5 ml-6 cursor">Manifest</NavLink>
                                                        <NavLink to={`${path}/${node.name}/${NodeDetailTabs.EVENTS.toLowerCase()}`} className="fw-6 cb-5 ml-6 cursor">Events</NavLink>
                                                    </div>
                                                </div>
                                            </div>
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
                                                            <NavLink to={`${path}/${node.name}/${NodeDetailTabs.MANIFEST.toLowerCase()}`} className="fw-6 cb-5 ml-6 cursor">Manifest</NavLink>
                                                            <NavLink to={`${path}/${node.name}/${NodeDetailTabs.EVENTS.toLowerCase()}`} className="fw-6 cb-5 ml-6 cursor">Events</NavLink>
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

export default PodNodeComponent
