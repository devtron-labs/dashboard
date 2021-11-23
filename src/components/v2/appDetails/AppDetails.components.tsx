import React from 'react'
import ApplicationObjectComponent from './applicationObject/ApplicationObject.component';
import SourceInfoComponent from './sourceInfo/SourceInfo.component'

function AppDetailsComponent() {

    return (
        <div>
            <SourceInfoComponent />
            <ApplicationObjectComponent />
        </div>
    )
}



export default AppDetailsComponent;
