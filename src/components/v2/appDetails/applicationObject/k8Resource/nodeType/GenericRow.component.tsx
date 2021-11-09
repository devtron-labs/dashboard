import React, { useEffect, useState } from 'react';
import { NavLink, Route, Switch } from 'react-router-dom';
import '../../../../lib/bootstrap-grid.min.css';
import { iNodeType, NodeDetailTabs } from '../node.type';
import { useRouteMatch } from 'react-router';
import ApplicationObjectStore from '../../applicationObject.store';
import { URLS } from '../../../../../../config';
import LogAnalyzerComponent from '../../logAnalyzer/LogAnalyzer.component';
import K8ResourceComponent from '../K8Resource.component';
import { DefaultViewTabsJSON } from '../../../../utils/tabUtils/tab.json';
import DefaultViewTabComponent from '../../defaultViewTab/DefaultViewTab.component';

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


function GenericRowComponent(props: any) {
    const { path, url } = useRouteMatch();
    const [ displayGenericRow, setDisplayGenericRow] = useState(false)

    const handlePodSelection = (_uri: string, event: any) => {
        event.stopPropagation()
        setDisplayGenericRow(false)
        const url = ApplicationObjectStore.getBaseURL() + URLS.APP_DETAILS_K8 + "/" + _uri
        ApplicationObjectStore.addApplicationObjectTab(_uri, url.toLowerCase())
    }

    const handleNodeChange = () => {
        props.handleNodeChange()
        // setDisplayGenericRow(false)
    }

    useEffect(() => {
       if(!ApplicationObjectStore.getCurrentTab){
           setDisplayGenericRow(true)
       }
    }, [])

    return (<React.Fragment>
        {displayGenericRow ? 
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
                                        <div key={"grc" + index} onClick={(event) => handlePodSelection(cell.value, event)} className={index === 0 ? "col-6 pt-9 pb-9" : "col pt-9 pb-9"} >
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
        </div> :
        <DefaultViewTabComponent handleNodeChange={handleNodeChange} />
    //      <Switch>
    //          {
    //              DefaultViewTabsJSON.map((tab)=>{
    //                  return <Route path={`${path}/${tab.name.toLowerCase()}`} render={() => { return <K8ResourceComponent handleNodeChange={fetchApplicationObjectTabs} /> }} />

    //              })
    //          }
    //      {/* <Route path={`${path}/${URLS.APP_DETAILS_K8}`} render={() => { return <K8ResourceComponent handleNodeChange={fetchApplicationObjectTabs} /> }} />
    //      <Route exact path={`${path}/${URLS.APP_DETAILS_LOG}`} render={() => { return <LogAnalyzerComponent handleNodeChange={fetchApplicationObjectTabs} /> }} /> */}
    //  </Switch>
}
        </React.Fragment>
    )
}

export default GenericRowComponent
