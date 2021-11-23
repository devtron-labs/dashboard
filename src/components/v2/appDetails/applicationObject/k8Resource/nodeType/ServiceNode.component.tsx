import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useRouteMatch } from 'react-router';
import { NodeDetailTabs } from '../../../node.type';
import { NodeType } from '../../../appDetail.type';
import AppDetailsStore from '../../../appDetail.store';
import { ReactComponent as DropDown } from '../../../../../../assets/icons/ic-dropdown-filled.svg';
import { ReactComponent as Clipboard } from '../../../../../../assets/icons/ic-copy.svg';
import { copyToClipboard } from '../../../../../common';
import Tippy from '@tippyjs/react';
import './nodeType.css'

function ServiceNodeComponent() {
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

        <div className="container-fluid generic-table">
            <div>
                <div className="cn-9 fs-14 fw-6 service-header border-bottom">
                    <div className="pt-12 pb-12 ">Service({appDetailsNodes.length})
                    <div className="fw-4  fs-12">2 healthy</div>
                    </div>
                </div>

                <div className="row border-bottom fw-6">
                    {
                        ["Name", "URL"].map((cell, index) => {
                            return <div key={'gpt_' + index} className={(index === 0 ? "col-6 pt-9 pb-9" : "col pt-9 pb-9")}>{cell}</div>
                        })
                    }
                </div>

                <div className="generic-body">
                    {
                        appDetailsNodes.map((node, index) => {
                            if (node.kind === NodeType.Service) {
                                return (

                                    <div className="row" key={'grt' + index} onClick={() => toggleServiceChildElement()}>

                                        <div className={"col-md-6 pt-9 pb-9 flex left pl-0"} >
                                            <DropDown
                                                className={`rotate icon-dim-24 pointer ${node.isSelected ? 'fcn-9' : 'fcn-5'}`}
                                                style={{ ['--rotateBy' as any]: !node.isSelected ? '-90deg' : '0deg' }}
                                            /> <span>{node.name}</span>
                                             <div>healthy</div>
                                            <span className="action-buttons ">
                                                <NavLink to={`${path}/${node.name}/${NodeDetailTabs.MANIFEST.toLowerCase()}`} className="learn-more-href ml-6 cursor">Manifest</NavLink>
                                                <NavLink to={`${path}/${node.name}/${NodeDetailTabs.EVENTS.toLowerCase()}`} className="learn-more-href ml-6 cursor">Events</NavLink>
                                            </span>
                                        </div>
                                       


                                        <div className={"col-md-6 pt-9 pb-9"} >
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
                                        </div>
                                    </div>
                                )
                            }

                            return node.parentRefs && node.parentRefs.map((parentNode, _index) => {
                                if (parentNode.kind === NodeType.Service) {
                                    return (
                                        showServiceChildElement && <>
                                            <div className="row pt-10 pb-10 pl-24 indent-line" key={'grtp' + _index}>
                                                <div className="col-md-12 border-bottom pt-10 pb-10 "><b>{node.kind.toUpperCase()}</b></div>
                                                <div className="col-md-12 pt-10 pb-10">{node.name}</div>
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

export default ServiceNodeComponent
