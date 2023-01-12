import React from 'react'

export default function AppStatus({ appStatus }: { appStatus: string }) {
    const color = appStatus?.toLocaleLowerCase() === 'notdeployed' ? 'not-deployed' : appStatus?.toLocaleLowerCase()
    return (
        <div className="flex left">
            <span className={`dc__app-summary__icon icon-dim-16 mr-6 ${color} ${color}--node`} />
            <p className={`dc__truncate-text  m-0`}>
                {appStatus === 'notdeployed' ? <span className="cn-6">Not deployed</span> : appStatus}
            </p>
        </div>
    )
}
