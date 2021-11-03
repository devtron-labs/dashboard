import React from 'react'
import { iNode } from '../node.type'
import './nodeType.css'

const GenericServiceTablejSON = {
    tHead: [
        { value: "Name" },
        { value: "URL" },
    ],
    tBody: [
        [
            { value: "shivani-devtron-demo-service" },
            { value: "devtron-demo-service.devtron-demo:" },
        ],
        [
            { value: "material-t-24-oct-dev-574474ddf6-zvfzp" },
            { value: "1/5" },
        ],
        [
            { value: "material-t-24-oct-dev-574474ddf6-zvfzp" },
            { value: "1/1" },
        ]
    ]
}

function ServiceComponent(props) {
    return (
        <div>
            <div className="flex left column w-100 generic-info-header fw-6 cn-9 fs-14 pl-16">ServiceComponent(1)</div>
            <div className="container ">
                <div className="row pt-10 pb-10" style={{ height: '36px' }}>
                    <div className="col cn7 fw-6 ">
                        Name
                    </div>
                    <div className="col cn7 fw-6">
                        Url
                   </div>
                </div>
                {
                    GenericServiceTablejSON.tBody.map((table, index) => {
                        return <div className="row pt-10 pb-10" key={'gst_' + index}>
                            {table.map((cell, index) => {
                                return <div key={"gstc_" + index}>{cell.value}
                                    <div className="cg-5">HEALTHY</div>
                                </div>
                            })} </div>
                    })
                })
            </div>
        </div>
    )
}

export default ServiceComponent
