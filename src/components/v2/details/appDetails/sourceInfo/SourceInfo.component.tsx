import React from 'react'
import EnvironmentSelectorComponent from './EnvironmentSelector.component'
import EnvironmentStatusComponent from './EnvironmentStatus.component'

function SourceInfoComponent() {
    return (
        <React.Fragment>
            <EnvironmentSelectorComponent/>
            <EnvironmentStatusComponent />
        </React.Fragment>
    )
}

export default SourceInfoComponent
