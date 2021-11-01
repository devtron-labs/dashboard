import React from 'react';
import '../../../../lib/bootstrap-grid.min.css';
import { iNodeType, NodeDetailTabs } from '../node.type';

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
            { value: "material-t-24-oct-dev-574474ddf6-zvfzp" },
            { value: "1/1" },
            { value: "0" },
            { value: "4d 17h" },
            { value: "Synced" },
        ],
        [
            { value: "material-t-24-oct-dev-574474ddf6-zvfzp" },
            { value: "1/5" },
            { value: "0" },
            { value: "4d 7h" },
            { value: "Synced" },
        ],
        [
            { value: "material-t-24-oct-dev-574474ddf6-zvfzp" },
            { value: "1/1" },
            { value: "0" },
            { value: "17h" },
            { value: "UnSynced" },
        ]
    ]
}

function GenericRowComponent(props) {
    return (
        <div className="container generic-table">
            <div className="row border-bottom ">
                {
                    GenericPodsTablejSON.tHead.map((cell, index) => {
                        return <div className={(index === 0 ? "col-5 pt-9 pb-9" : "col pt-9 pb-9")}>{cell.value}</div>
                    })
                }
            </div>
            <div className="generic-body">
                {
                    GenericPodsTablejSON.tBody.map((tRow) => {
                        return (
                            <div className="row">
                                {tRow.map((cell, index) => {
                                    return (
                                        <div key={"grc" + index} className={index === 0 ? "col-5 pt-9 pb-9" : "col pt-9 pb-9"}>
                                            <span>{cell.value}</span>
                                            <span className="action-buttons ">
                                                {index === 0 ?
                                                    <React.Fragment>
                                                        <a className="learn-more-href ml-6 cursor" onClick={() => { props.addResourceTabClick(NodeDetailTabs.MANIFEST, cell) }} >Manifest</a>
                                                        <a className="learn-more-href ml-6 cursor" onClick={() => { props.addResourceTabClick(NodeDetailTabs.LOGS, cell) }} >Logs</a>
                                                        <a className="learn-more-href ml-6 cursor" onClick={() => { props.addResourceTabClick(NodeDetailTabs.SUMMARY, cell) }}>Summary</a>

                                                        {
                                                            props.selectedNode.type === iNodeType.AllPod ?
                                                                <React.Fragment>
                                                                    <a className="learn-more-href ml-6 cursor" onClick={() => { props.addResourceTabClick(NodeDetailTabs.EVENTS, cell) }}>Events</a>
                                                                    <a className="learn-more-href ml-6 cursor" onClick={() => { props.addResourceTabClick(NodeDetailTabs.TERMINAL, cell) }}>Terminal</a>
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
