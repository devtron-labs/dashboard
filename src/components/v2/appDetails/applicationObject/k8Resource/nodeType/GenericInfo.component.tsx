import React from 'react'
import { iNode } from '../node.type'
import GenericRowComponent from './GenericRow.component'

function GenericInfoComponent(selectedNodeType) {
    return (
        <div>
            {/* <div className="fs-14 fs-6 cn-9">{prop.selectedTab}</div> */}
            <div>
                <GenericRowComponent selectedNodeType={selectedNodeType} />
            </div>
            
        </div>
    )
}

export default GenericInfoComponent
