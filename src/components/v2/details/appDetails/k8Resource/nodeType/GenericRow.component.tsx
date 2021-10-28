import React from 'react';
import '../../../appDetails/bootstrap-grid.min.css';

const GenericTablejSON = {
    tHead: [
        { value: "Pod (All)" },
        { value: "Ready" },
        { value: "Restarts" },
        { value: "Age" },
        { value: "Live sync status" }
    ],
    tBody: [
        [
            { value: "material-t-24-oct-dev-574474ddf6-zvfzp" },
            { value: "1/1" },
            { value: "0" },
            { value: "4d 17h" },
            { value: "Synced" },
        ],
        [
            { value: "material-t-24-oct-dev-574474ddf6-zvfzp" },
            { value: "1/5" },
            { value: "0" },
            { value: "4d 7h" },
            { value: "Synced" },
        ],
        [
            { value: "material-t-24-oct-dev-574474ddf6-zvfzp" },
            { value: "1/1" },
            { value: "0" },
            { value: "17h" },
            { value: "UnSynced" },
        ]
    ]
}

function GenericRowComponent() {
    return (
        <div className="bootstrap-wrapper">
            <div className="container">
                <div className="row border-bottom ">
                    {
                        GenericTablejSON.tHead.map((cell, index) => {
                            return <div className={(index === 0 ? "col-5 pt-9 pb-9" : "col pt-9 pb-9")}>{cell.value}</div>
                        })
                    }
                </div>
                {
                    GenericTablejSON.tBody.map((tRow) => {
                        return (
                            <div className="row">
                                {tRow.map((cell, index) => {
                                    return <div className={index === 0 ? "col-5 pt-9 pb-9" : "col pt-9 pb-9"}>{cell.value}</div>
                                })
                                }
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default GenericRowComponent
