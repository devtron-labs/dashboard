import React from 'react';
import { ResourceTreeActions, ResourceTreeTab } from './resourceTreeTab.type';
import { useResourceTree } from './useResourceTree';

function ResourceTreeComponent() {

    const [{ resourceTreeTabs }, dispatch] = useResourceTree();

    const addTab = (tabName: string) => {
        switch (tabName) {
            case "node1": {
                dispatch({
                    type: ResourceTreeActions.AddTab, tab: {
                        name: "Node 1",
                        icon: "",
                        className: ""
                    }
                })
                break;
            }
        }
    }

    return (
        <div>
            <div className="flexbox">
                {
                    resourceTreeTabs.map((resourceTreeTab: ResourceTreeTab) => {
                        return (
                            <div className="flexbox">
                                { resourceTreeTab.name}
                            </div>
                        )
                    })
                }
            </div>
            <div>
                <button onClick={() => addTab("node1")}>
                    Add Tab
                </button>
            </div>
        </div>
    )
}

export default ResourceTreeComponent
