import React from 'react'

function EnvironmentStatusComponent() {
    return (
        <div>
            <div className="pl-20 pr-20" style={{
                display: 'grid',
                gridTemplateColumns: '50% 50%',
                minHeight: '92px',
                gridGap: "16px"
            }}>
                <div className="bcn-0 br-8 p-16">
                    <div className="cn-9 fw-6">Config Apply</div>
                    <div className="cg-5 fw-6 fs-14 cursor">Success</div>
                    <div>Last update <span className="fw-6"> 12 mins ago </span> <span className="cb-5">Details</span></div>
                </div>
                <div className="bcn-0 br-8 pt-16 pl-16 pb-16 mr-16">
                    <div className="cn-9 fw-6">Application status</div>
                    <div className="cg-5 fw-6 fs-14 cursor">Healthy</div>
                    <div>The active service is serving traffic to the current pod spec</div>
                </div>
            </div>
        </div>
    )
}

export default EnvironmentStatusComponent
