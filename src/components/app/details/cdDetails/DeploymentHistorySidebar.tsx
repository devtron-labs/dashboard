import React from 'react'
const deploymentTemplatelisting = [
    'Pipeline configuration',
    'Deployment Template',
    'random-configmap',
    'dashboard-cm',
    'secret-dashboard',
]

function DeploymentHistorySidebar() {
    return (
        <div className='bcn-0'>
            {deploymentTemplatelisting.map((elm) => {
                return <div className={`fw-6 pt-12 pb-12 pl-16 pr-16 cursor`}>{elm}</div>
            })}
        </div>
    )
}

export default DeploymentHistorySidebar
