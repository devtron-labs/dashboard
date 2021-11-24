import React from 'react'
import AppHeaderComponent from '../appHeader/AppHeader.component';
import ApplicationObjectComponent from './applicationObject/ApplicationObject.component';
import SourceInfoComponent from './sourceInfo/SourceInfo.component'

function AppDetailsComponent() {

    return (
        <div>
            <AppHeaderComponent />
            <SourceInfoComponent />
            <ApplicationObjectComponent />
        </div>
    )
}

export default AppDetailsComponent;
