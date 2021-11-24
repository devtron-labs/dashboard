import React, { useEffect, useState } from 'react'
import AppDetailsStore from '../../appDetail.store';
import { NodeType } from '../../appDetail.type';
import GenericTableComponent from './nodeType/GenericTable.component';
import PodNodeComponent from './nodeType/PodNode.component';
import ServiceNodeComponent from './nodeType/ServiceNode.component';

function NodeDetailComponent({ nodeKind }) {
    return (
        <div>
            {(() => {
                if (nodeKind === NodeType.Pod) {
                    return <PodNodeComponent selectedNodeType={nodeKind} />
                } else if (nodeKind === NodeType.Service) {
                    // return <ServiceNodeComponent />
                    return <PodNodeComponent selectedNodeType={nodeKind} />
                } else {
                    return <PodNodeComponent selectedNodeType={nodeKind} />
                    // return  <GenericTableComponent selectedNodeType={nodeKind}/>
                }
            })()}
        </div>
    )
}

export default NodeDetailComponent
