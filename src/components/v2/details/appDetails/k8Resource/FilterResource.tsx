import React from 'react'

export default function FilterResource() {
    return (
        <div >
            <div className="bootstrap-wrapper">
                <div className="row">
                    <div className="col-md-9 "><input className="w-100" type="text" /></div>
                    <div className="col-md-1">All</div>
                    <div className="col-md-1">Failed</div>
                    <div className="col-md-1">Running</div>
                </div>
            </div>
            

        </div>
    )
}
