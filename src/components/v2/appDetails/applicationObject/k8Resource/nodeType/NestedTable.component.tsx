import React from 'react'
import GenericRowComponent from './GenericRow.component'

function NestedTableComponent({selectedNodeType}) {
    return (
        <div>
            <div className="nested-table-grid"></div>
            <GenericRowComponent  selectedNodeType={selectedNodeType}/>
        </div>
    )
}

export default NestedTableComponent
