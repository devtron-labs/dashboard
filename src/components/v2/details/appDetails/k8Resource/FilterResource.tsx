import React from 'react'

export default function FilterResource() {
    return (
        <div className="row pr-20 pl-20">
            <div className="col "><input className="w-100" placeholder="Search objects" type="text" /></div>
            <div className="col-1">
                <div className="flex br-4 en-2 bw-1 ">
                    <div className="border-right pl-6 ">All</div>
                    <div className="border-right pl-6 pr-6">Failed</div>
                    <div className="pr-6">Running</div>
                </div>
            </div>
        </div>
    )
}
