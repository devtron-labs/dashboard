import React from 'react'
import GenericRowComponent from './GenericRow.component'

function NestedTableComponent() {
    return (
        <div>
            <div className="nested-table-grid"></div>
            <GenericRowComponent />
        </div>
    )
}

export default NestedTableComponent
