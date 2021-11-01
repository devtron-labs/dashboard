import React from 'react'
import { iNode } from '../node.type'
import GenericRowComponent from './GenericRow.component'

function GenericInfoComponent(props) {
    return (
        <div>
            <div className="fs-14 fs-6 cn-9">{props.selectedTab}</div>
            <div>
                <GenericRowComponent />
            </div>
            
        </div>
    )
}

export default GenericInfoComponent
