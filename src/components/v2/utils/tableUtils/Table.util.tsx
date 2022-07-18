import React from 'react';
import './table.css';

function TableUtil({table, bodyFont="",}) {
    return (
        <div className="node-container-fluid generic-table" style={{minHeight: '600px'}}>
            <div className="row border-bottom">
                {
                    table.tHead.map((cell, index) => {
                        return (
                            <div key={"th_" + index} className={`${cell.className} fw-6 cn-9 col pt-8 pb-8`}>{cell.value}</div>
                        )
                    })
                }
            </div>
            <div className="generic-body fs-13 cn-9" style={{ fontFamily: bodyFont }}>
                {
                    table.tBody.map((tRow, index) => {
                        return (
                            <div className="row" key={"tr_" + index}>
                                {tRow.map((cell, index) => {
                                    return (
                                        <div key={"tr_cell_" + index} className={`${cell.className} col pt-8 pb-8`} > {cell.value} </div>
                                    )
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

export default TableUtil
