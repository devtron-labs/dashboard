import React from 'react'
import EnvironmentSelectorComponent from './EnvironmentSelector.component'
import EnvironmentStatusComponent from './environmentStatus/EnvironmentStatus.component'

function SourceInfoComponent() {
    return (
        <div>
            <EnvironmentSelectorComponent />
            <EnvironmentStatusComponent />
        </div>
    )
}

export default SourceInfoComponent
