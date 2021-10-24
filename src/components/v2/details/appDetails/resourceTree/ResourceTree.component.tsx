import React, { useState, useEffect } from 'react';
import K8ResourceComponent from '../k8Resource/K8Resource.component';
import ResourceTreeNodeObjects from './ResourceTreeNode';
import { iTab } from './tab.type';
import { ResourceTreeActions, useResourceTree } from './useResourceTree';

function ResourceTreeComponent() {

    const [{ resourceTreeTabs }, dispatch] = useResourceTree();
    const [selectedTab, setSelectedTab] = useState("")

    const addResourceTabClick = (tab: iTab) => {
        dispatch({
            type: ResourceTreeActions.AddTab,
            tab: tab
        })
    }

    const handleResourceTabClick = (_tabName: string) => {
        dispatch({
            type: ResourceTreeActions.MarkActive,
            tabName: _tabName
        })
        setSelectedTab(_tabName)
    }

    const resourceTabData = () => {
        switch (selectedTab) {
            case "K8 Resources":
                return <K8ResourceComponent />
                //  <ResourceTreeNodeObjects addResourceTabCallBack={addResourceTabClick} />
            
            default:
                return <div>{selectedTab}</div>
        }
    }

    useEffect(() => {
        handleResourceTabClick("K8 Resources")
    }, [])

    return (
        <div>
            <div className="flexbox pl-20 pr-20">
                {
                    resourceTreeTabs.map((resourceTreeTab: iTab, index) => {
                        return (
                            <div key={index + "resourceTreeTab"} className={`${resourceTreeTab.className} ${resourceTreeTab.isSelected ? 'bcn-0 cr-5' : ''}  pt-8 pb-8 pr-16`} >
                                <a className="fs-13 bcn-0 cn-9 fw-6" onClick={() => handleResourceTabClick(resourceTreeTab.name)}> {resourceTreeTab.icon} {resourceTreeTab.name} </a>
                            </div>
                        )
                    })
                }
            </div>
            {selectedTab && resourceTabData()}
        </div>
    )
}

export default ResourceTreeComponent
