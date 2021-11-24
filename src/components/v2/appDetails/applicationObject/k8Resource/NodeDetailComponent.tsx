import React, { useEffect, useState } from 'react'
import { NodeType } from '../../appDetail.type';
import GenericTableComponent from './nodeType/GenericTable.component';
import PodNodeComponent from './nodeType/PodNode.component';
import ServiceNodeComponent from './nodeType/ServiceNode.component';
import { useRouteMatch, useHistory, useParams } from 'react-router';
import { Progressing, showError } from '../../../../common';

function NodeDetailComponent() {

    const [nodeKind, setNodeKind] = useState("")

    const params = useParams<{ kind?: NodeType }>()

    useEffect(() => {
        console.log(params)
        if (params.kind) {
            setNodeKind(params.kind)
        }
    }, [params.kind])

    return (
        <div>
            {((_nodeKind) => {
                if (_nodeKind === NodeType.Pod) {
                    return <PodNodeComponent selectedNodeType={_nodeKind} />
                } else if (_nodeKind === NodeType.Service) {
                    return <ServiceNodeComponent selectedNodeType={_nodeKind} />
                } else if (_nodeKind) {
                    return <GenericTableComponent selectedNodeType={_nodeKind} />
                } else {
                   return <div style={{ height: '120px'}}>
                        <Progressing pageLoader />
                    </div>
                }
            })(nodeKind)}
        </div>
    )
}

export default NodeDetailComponent
