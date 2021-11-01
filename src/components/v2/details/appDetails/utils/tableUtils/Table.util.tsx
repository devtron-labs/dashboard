import React from 'react';
import './table.css';

function TableUtil(props) {
    return (
        <div className="container-fluid generic-table">
            <div className="row border-bottom">
                {
                    props.table.tHead.map((cell, index) => {
                        return (
                            <div key={"th_" + index} className={`${cell.className} fw-6 cn-9 col pt-9 pb-9`}>{cell.value}</div>
                        )
                    })
                }
            </div>
            <div className="generic-body fs-13 cn-9" style={{ fontFamily: props.bodyFont }}>
                {
                    props.table.tBody.map((tRow, index) => {
                        return (
                            <div className="row" key={"tr_" + index}>
                                {tRow.map((cell, index) => {
                                    return (
                                        <div key={"tr_cell_" + index} className={`${cell.className} col pt-9 pb-9`}> {cell.value} </div>
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
