import React from 'react';
import '../../../../lib/bootstrap-grid.min.css';
import { useRouteMatch } from 'react-router';
import AppDetailsStore from '../../../appDetail.store';
import { NavLink } from 'react-router-dom';
import { NodeDetailTabs } from '../../../node.type';

function GenericTableComponent({ selectedNodeType }) {
    const { path, url } = useRouteMatch();

    const appDetailsNodes = AppDetailsStore.getAppDetailsNodes()

    return (

        <div className="container-fluid generic-table">

            <React.Fragment>

                <div className="row border-bottom ">
                    {
                        ["Name"].map((cell, index) => {
                            return <div key={'gpt_' + index} className={(index === 0 ? "col-6 pt-9 pb-9" : "col pt-9 pb-9")}>{cell}</div>
                        })
                    }
                </div>

                <div className="generic-body">
                    {
                        appDetailsNodes.map((node, index) => {
                            if (node.kind === selectedNodeType) {
                                return (
                                    <div className="row" key={'grt' + index}>

                                        <div className={"col-6 pt-9 pb-9"} >
                                            <span>{node.name}</span>
                                            <span className="action-buttons ">
                                                <NavLink to={`${path}/${node.name}/${NodeDetailTabs.MANIFEST.toLowerCase()}`} className="learn-more-href ml-6 cursor">Manifest</NavLink>
                                                <NavLink to={`${path}/${node.name}/${NodeDetailTabs.EVENTS.toLowerCase()}`} className="learn-more-href ml-6 cursor">Events</NavLink>
                                            </span>
                                        </div>
                                       
                                    </div>
                                )
                            }
                        })
                    }
                </div>

            </React.Fragment>

        </div>
    )
}

export default GenericTableComponent
