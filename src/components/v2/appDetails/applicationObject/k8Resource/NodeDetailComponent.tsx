import React from 'react'
import { NodeType } from '../../appDetail.type';
import GenericTableComponent from './nodeType/GenericTable.component';
import PodNodeComponent from './nodeType/PodNode.component';
import ServiceNodeComponent from './nodeType/ServiceNode.component';

function NodeDetailComponent({ selectedNode }) {

    return (
        <div>
            {(() => {
                if (selectedNode?.name === NodeType.Pod) {
                    return <PodNodeComponent></PodNodeComponent>
                } else if (selectedNode?.name === NodeType.Service) {
                    return <ServiceNodeComponent></ServiceNodeComponent>
                } else {
                    return <GenericTableComponent selectedNodeType={selectedNode?.name}></GenericTableComponent>
                }

            })()}
        </div>
    )
}

export default NodeDetailComponent
