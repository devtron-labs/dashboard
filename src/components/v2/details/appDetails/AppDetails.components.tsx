import React from 'react'
import ResourceTreeComponent from './resourceTree/ResourceTree.component';
import SourceInfoComponent from './sourceInfo/SourceInfo.component'

function AppDetailsComponent() {
    return (
        <React.Fragment>
            <div>
                <SourceInfoComponent />
                <ResourceTreeComponent />
            </div>
        </React.Fragment>
    )
}

export default AppDetailsComponent;
