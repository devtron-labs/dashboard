import React, { useEffect } from 'react';
import { useRouteMatch, useParams } from 'react-router';
import AppDetailsStore from '../../index.store';
import { NavLink } from 'react-router-dom';
import { NodeDetailTabs } from '../../node.type';
import Tippy from '@tippyjs/react';
import { copyToClipboard } from '../../../../common';
import { NodeType } from '../../appDetails.type';
import { ReactComponent as DropDown } from '../../../../../assets/icons/ic-dropdown-filled.svg';
import { ReactComponent as Clipboard } from '../../../../../assets/icons/ic-copy.svg';
import { useState } from 'react';


function GenericTableComponent() {
    const { path, url } = useRouteMatch();
    const [copied, setCopied] = useState(false);

    const params = useParams<{ nodeType?: NodeType }>()

    console.log("params.nodeType", params.nodeType)

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
        <div className="container-fluid generic-table">
            <div>
                <div className="cn-9 fs-14 fw-6 service-header border-bottom">
                    <div className="pt-12 pb-12 ">{params.nodeType}({appDetailsNodes.length})
                    <div className="fw-4  fs-12">2 healthy</div>
                    </div>
                </div>

                <div className="row border-bottom fw-6">
                    {
                        ["Name"].map((cell, index) => {
                            return <div key={'gpt_' + index} className={(index === 0 ? "col-6 pt-9 pb-9" : "col pt-9 pb-9")}>{cell}</div>
                        })
                    }
                </div>

                <div className="generic-body">
                    {
                        appDetailsNodes.map((node, index) => {
                            if (node.kind.toLowerCase() === params.nodeType.toLowerCase()) {
                                return (

                                    <div className="row" key={'grt' + index} onClick={() => toggleServiceChildElement()}>

                                        <div className={"col-md-6 pt-9 pb-9 flex left pl-0"} >
                                            <DropDown
                                                className={`rotate icon-dim-24 pointer ${node["isSelected"] ? 'fcn-9' : 'fcn-5'}`}
                                                style={{ ['--rotateBy' as any]: !node["isSelected"] ? '-90deg' : '0deg' }}
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
                                                {console.log('path', path)}
                                                {console.log('url', url)}

                                                <NavLink to={`${path}/${node.name}/${NodeDetailTabs.MANIFEST.toLowerCase()}`} className="learn-more-href ml-6 cursor">Manifest</NavLink>
                                                <NavLink to={`${path}/${node.name}/${NodeDetailTabs.EVENTS.toLowerCase()}`} className="learn-more-href ml-6 cursor">Events</NavLink>
                                            </span>
                                        </div>
                                    </div>
                                )
                            }

                            return node.parentRefs && node.parentRefs.map((parentNode, _index) => {
                                if (parentNode.kind.toLowerCase() === params.nodeType.toLowerCase()) {
                                    return (
                                        showServiceChildElement && <>
                                            <div className="row pt-10 pb-10 pl-24 indent-line" key={'grtp' + _index}>
                                                <div className="col-md-12 border-bottom pt-10 pb-10 "><b>{node.kind.toUpperCase()}</b></div>
                                                <div className="col-md-12 pt-10 pb-10">
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

                                        </>

                                    )
                                }
                            })
                        })
                    }
                </div>
            </div>
        </div>
    )
}

export default GenericTableComponent
