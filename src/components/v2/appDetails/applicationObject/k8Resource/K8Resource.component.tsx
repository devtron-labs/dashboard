import React, { useState } from 'react';
import { iNode, iNodeType } from './node.type';
import NodeTreeComponent from './NodeTree.component';
import ServiceComponent from './nodeType/Service.component';
import AllPodsComponent from './nodeType/AllPods.component';
import FilterResource from './FilterResource';
import GenericInfoComponent from './nodeType/GenericInfo.component';
import './k8resources.css';
import { Switch, Route } from 'react-router-dom';
import { URLS } from '../../../../../config';
import LogAnalyzerComponent from '../logAnalyzer/LogAnalyzer.component';
import { useRouteMatch } from 'react-router';

export default function K8ResourceComponent(props) {
    const [selectedNode, setSelectedNode] = useState<iNode | undefined>(undefined)
    const { path, url } = useRouteMatch();

    const updateNodeInfoCB = (node: iNode) => {
        setSelectedNode(node)
    }

    // const selectedNodeData = () => {
    // switch (selectedNode.type) {
    //     case iNodeType.Pods:
    //         return <AllPodsComponent
    //             selectedNode={selectedNode}
    //             addResourceTabClick={props.addResourceTabClick}
    //         />
    //     case iNodeType.Service:
    //         return <ServiceComponent
    //             selectedNode={selectedNode}
    //             addResourceTabClick={props.addResourceTabClick}

    //         />
    //     case iNodeType.GenericInfo:
    //         return <GenericInfoComponent
    //             selectedNode={selectedNode}
    //             addResourceTabClick={props.addResourceTabClick}

    //         />
    //     default:
    //         return (
    //             <GenericInfoComponent
    //             selectedNode={selectedNode}
    //             addResourceTabClick={props.addResourceTabClick}
    //         />
    //         )
    // }

    // }
    const selectedNodeData = () => {
        switch (selectedNode?.name) {
            case iNodeType.Pods:
                return <AllPodsComponent selectedNode={selectedNode} />
            case iNodeType.Service:
                return <ServiceComponent selectedNode={selectedNode} />
            case iNodeType.GenericInfo:
                return <GenericInfoComponent selectedNode={selectedNode} />
        }
    }

    return (
        <div className="bcn-0">
            <div className="pt-16 pl-20 pb-16"><FilterResource /></div>
            <div className="container-fluid">
                <div className="row" >
                    <div className="col-2 k8-resources-node-tree"> <NodeTreeComponent updateNodeInfo={updateNodeInfoCB} /></div>
                    {/* <div className="col"> {selectedNode && selectedNodeData()}</div> */}
                    <div className="col">
                        <Switch>
                            <Route exact path={`${url}/${iNodeType.Pods}`} component={AllPodsComponent} />
                            <Route exact path={`${url}/${iNodeType.Service}`} component={ServiceComponent} />
                            <Route exact path={`${url}/${iNodeType.GenericInfo}`} component={GenericInfoComponent} />
                        </Switch>
                    </div>
                </div>
            </div>
        </div>
    )
}
