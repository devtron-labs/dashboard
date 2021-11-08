import React from 'react';
import { NavLink } from 'react-router-dom';
import '../../../../lib/bootstrap-grid.min.css';
import { iNodeType, NodeDetailTabs } from '../node.type';
import { useRouteMatch } from 'react-router';
import { URLS } from '../../../../../../config';
import ApplicationObjectStore from '../../applicationObject.store';

const GenericPodsTablejSON = {
    tHead: [
        { value: "Pod (All)" },
        { value: "Ready" },
        { value: "Restarts" },
        { value: "Age" },
        { value: "Live sync status" }
    ],
    tBody: [
        [
            { value: "material--oct-dev-574474ddf6-zvfzp" },
            { value: "1/1" },
            { value: "0" },
            { value: "4d 17h" },
            { value: "Synced" },
        ],
        [
            { value: "material-t-24-oct-dev-5774ddf6-zvfzp" },
            { value: "1/5" },
            { value: "0" },
            { value: "4d 7h" },
            { value: "Synced" },
        ],
        [
            { value: "matial-t-24-oct-dev-4ddf6-zvfzp" },
            { value: "1/1" },
            { value: "0" },
            { value: "17h" },
            { value: "UnSynced" },
        ]
    ]
}

const handlePodSelection = (cell) => {
        ApplicationObjectStore.addApplicationObjectTab(cell.value, cell.url)
}

function GenericRowComponent(props: any) {
    const { path, url } = useRouteMatch();

    return (
        <div className="container generic-table">
            <div className="row border-bottom ">
                {
                    GenericPodsTablejSON.tHead.map((cell, index) => {
                        return <div key={'gpt_' + index} className={(index === 0 ? "col-5 pt-9 pb-9" : "col pt-9 pb-9")}>{cell.value}</div>
                    })
                }
            </div>
            <div className="generic-body">
                {
                    GenericPodsTablejSON.tBody.map((tRow, index) => {
                        return (
                            <div className="row" key={'grt' + index}>
                                {tRow.map((cell, index) => {
                                    return (
                                        <div key={"grc" + index} onClick={()=>handlePodSelection(cell)} className={index === 0 ? "col-5 pt-9 pb-9" : "col pt-9 pb-9"} >
                                            <span>{cell.value}</span>
                                            <span className="action-buttons ">
                                                {index === 0 ?
                                                    <React.Fragment>
                                                        <NavLink to={`${path}/${NodeDetailTabs.MANIFEST.toLowerCase()}`} className="learn-more-href ml-6 cursor">Manifest</NavLink>
                                                        <NavLink to={`${path}/${NodeDetailTabs.LOGS.toLowerCase()}`} className="learn-more-href ml-6 cursor" >Logs</NavLink>
                                                        <NavLink to={`${path}/${NodeDetailTabs.SUMMARY.toLowerCase()}`} className="learn-more-href ml-6 cursor" >Summary</NavLink>
                                                        {
                                                            props.selectedNodeType === iNodeType.Pods ?
                                                                <React.Fragment>
                                                                    <NavLink to={`${path}/${NodeDetailTabs.EVENTS.toLowerCase()}`} className="learn-more-href ml-6 cursor">Events</NavLink>
                                                                    <NavLink to={`${path}/${NodeDetailTabs.TERMINAL.toLowerCase()}`} className="learn-more-href ml-6 cursor">Terminal</NavLink>
                                                                </React.Fragment>
                                                                : ""
                                                        }
                                                    </React.Fragment>
                                                    : ""
                                                }
                                            </span>
                                        </div>
                                    )
                                })
                                }
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default GenericRowComponent
