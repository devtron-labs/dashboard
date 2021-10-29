import React, { useState, useEffect } from 'react';
import K8ResourceComponent from '../k8Resource/K8Resource.component';
import { iTab } from './tab.type';
import { ResourceTreeActions, useResourceTree } from './useResourceTree';
import './resourceTree.css'
import { ReactComponent as K8Resource } from '../../../../../assets/icons/ic-object.svg';
import { ReactComponent as LogAnalyser } from '../../../../../assets/icons/ic-logs.svg';


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
            default:
                return <div>{selectedTab}</div>
        }
    }

    const getTabIcon = (icon: string) => {
        switch (icon) {
            case "K8Resource": return <K8Resource />
            case "LogAnalyser": return <LogAnalyser />
        }
    }

    useEffect(() => {
        handleResourceTabClick("K8 Resources")
    }, [])

    return (
        <div>
            <div className="resource-tree-wrapper flexbox pl-20 pr-20 mt-16">
                {
                    resourceTreeTabs.map((resourceTreeTab: iTab, index) => {
                        return (
                            <div key={index + "resourceTreeTab"} className={`${resourceTreeTab.className} ${resourceTreeTab.isSelected ? 'resource-tree-tab bcn-0' : ''} cursor pl-12 pt-8 pb-8 pr-12`}>
                                <a className="cn-9 fw-6 no-decor flex left" onClick={() => handleResourceTabClick(resourceTreeTab.name)}>
                                    <span className="icon-dim-16 mr-4">{getTabIcon(resourceTreeTab.icon)}  </span>{resourceTreeTab.name}
                                </a>
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
