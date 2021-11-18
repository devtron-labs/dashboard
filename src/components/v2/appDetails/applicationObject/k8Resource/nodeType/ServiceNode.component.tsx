import React from 'react';
import { NavLink } from 'react-router-dom';
import '../../../../lib/bootstrap-grid.min.css';
import { useRouteMatch } from 'react-router';
import { NodeDetailTabs } from '../../../node.type';
import { NodeType } from '../../../appDetail.type';
import AppDetailsStore from '../../../appDetail.store';

function ServiceNodeComponent() {
    const { path, url } = useRouteMatch();

    const appDetailsNodes = AppDetailsStore.getAppDetailsNodes()

    return (

        <div className="container-fluid generic-table">

            <React.Fragment>

                <div className="row border-bottom ">
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
                                    <div className="row" key={'grt' + index}>

                                        <div className={"col-md-6 pt-9 pb-9"} >
                                            <span>{node.name}</span>
                                            <span className="action-buttons ">
                                                <NavLink to={`${path}/${node.name}/${NodeDetailTabs.MANIFEST.toLowerCase()}`} className="learn-more-href ml-6 cursor">Manifest</NavLink>
                                                <NavLink to={`${path}/${node.name}/${NodeDetailTabs.EVENTS.toLowerCase()}`} className="learn-more-href ml-6 cursor">Events</NavLink>
                                            </span>
                                        </div>

                                        <div className={"col-md-6 pt-9 pb-9"} >
                                            {node.name + "." + node.namespace}  : portnumber
                                        </div>

                                    </div>
                                )
                            }
                           
                            return node.parentRefs && node.parentRefs.map((parentNode, _index) => {
                                if (parentNode.kind === NodeType.Service) {
                                    return (
                                        <div className="row" key={'grtp' + _index}>
                                            <div className="col-md-12"><b>{node.kind.toUpperCase()}</b></div>
                                            <div className="col-md-12">{node.name}</div>
                                        </div>
                                    )
                                }
                            })
                        })

                       
                    }
                </div>

            </React.Fragment>

        </div>
    )
}

export default ServiceNodeComponent
