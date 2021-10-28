import React, { useState } from 'react'
import { iNode, iNodeType } from './node.type'
import NodeTreeComponent from './NodeTree.component'
import ServiceComponent from './nodeType/Service.component'
import GenericNodeComponent from './nodeType/GenericRow.component'
import PodsComponent from './nodeType/AllPods.component'
import AllPodsComponent from './nodeType/AllPods.component'
import FilterResource from './FilterResource'

export default function K8ResourceComponent() {


    const [selectedNode, setSelectedNode] = useState({})


    const updateNodeInfoCB = (node: iNode) => {
        console.log("selected node is", node)
        setSelectedNode(node)
    }

    const selectedNodeData = () => {
        console.log(selectedNode["type"])
        switch (selectedNode["type"]) {
            case "Pod":
                return <AllPodsComponent />
            case "Service":
                return <ServiceComponent />
            case "GenericInfo":
                return <GenericNodeComponent />
            default:
                return <div>
                    {selectedNode["name"]}
                </div>
        }

    }

    return (
        <div className="bcn-0">
            <div className="pt-16 pl-20 pb-16"><FilterResource /></div>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-2"> <NodeTreeComponent updateNodeInfo={updateNodeInfoCB} /></div>
                    <div className="col"> {selectedNode && selectedNodeData()}</div>
                </div>
            </div>
        </div>
    )
}
