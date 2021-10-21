import React from 'react';
import ResourceTreeNodeObjects from './ResourceTreeNode';
import { ResourceTreeActions, ResourceTreeTab } from './resourceTreeTab.type';
import { useResourceTree } from './useResourceTree';

function ResourceTreeComponent() {

    const [{ resourceTreeTabs }, dispatch] = useResourceTree();

    const addResourceTab = (tabName: string) => {
        switch (tabName) {
            case "node1": {
                dispatch({
                    type: ResourceTreeActions.AddTab, tab: {
                        name: "Node 1",
                        icon: "",
                        className: "flexbox fs-13 cn-9 fw-6 br-8 pt-8 pb-8 pr-16 cursor mr-8"
                    }
                })
                break;
            }
        }
    }

    function resourceTreeMainTabs() {
        return <div className="flexbox pl-20 pr-20 pt-16">
            {
                resourceTreeTabs.map((resourceTreeTab: ResourceTreeTab) => {
                    return (
                        <div className={`${resourceTreeTab.className} flexbox fs-13 cn-9 fw-6 br-8 pt-8 pb-8 pr-16 cursor mr-8`}>
                            {resourceTreeTab.icon} { resourceTreeTab.name}
                        </div>
                    )
                })
            }
        </div>
    }

    return (
        <div>
           {resourceTreeMainTabs()}
           <ResourceTreeNodeObjects
           addResourceTab={addResourceTab}
           />
           
            {/* <div>
                <button onClick={() => addTab("node1")}>
                    Add Tab
                </button>
            </div> */}
        </div>
    )
}

export default ResourceTreeComponent
