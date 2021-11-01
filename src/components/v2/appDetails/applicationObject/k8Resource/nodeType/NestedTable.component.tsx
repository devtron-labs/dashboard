import React from 'react'
import GenericRowComponent from './GenericRow.component'

function NestedTableComponent(props) {
    return (
        <div>
            <div className="nested-table-grid"></div>
            <GenericRowComponent
                selectedNode={props.selectedNode}
                addResourceTabClick={props.addResourceTabClick}
            />
        </div>
    )
}

export default NestedTableComponent
