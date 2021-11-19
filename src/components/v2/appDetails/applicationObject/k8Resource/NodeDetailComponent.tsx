import React, { useEffect, useState } from 'react'
import AppDetailsStore from '../../appDetail.store';
import { NodeType } from '../../appDetail.type';
import GenericTableComponent from './nodeType/GenericTable.component';
import PodNodeComponent from './nodeType/PodNode.component';
import ServiceNodeComponent from './nodeType/ServiceNode.component';

function NodeDetailComponent({ nodeKind }) {
    return (
        <div>
            {console.log('node',nodeKind)}
            {(() => {
                if (nodeKind === NodeType.Pod) {
                    return <PodNodeComponent selectedNodeType={nodeKind} />
                } else if (nodeKind === NodeType.Service) {
                    return <ServiceNodeComponent />
                } else {
                    // return <PodNodeComponent selectedNodeType={nodeType} />
                    return  <GenericTableComponent selectedNodeType={nodeKind}/>
                }
            })()}
        </div>
    )
}

export default NodeDetailComponent
