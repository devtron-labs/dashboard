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
    const { url } = useRouteMatch();

    const updateNodeInfoCB = (node: iNode) => {
        setSelectedNode(node)
    }

    return (
        <div className="bcn-0">
            <div className="pt-16 pl-20 pb-16"><FilterResource /></div>
            <div className="container-fluid">
                <div className="row" >
                    <div className="col-2 k8-resources-node-tree"> <NodeTreeComponent updateNodeInfo={updateNodeInfoCB} /></div>
                    <div className="col">
                        <Switch>
                            <Route exact path={`${url}/${iNodeType.Pods}`} render={() => { return <AllPodsComponent selectedNodeType={iNodeType.Pods} /> }} />
                            <Route exact path={`${url}/${iNodeType.Service}`} render={() => { return <ServiceComponent selectedNodeType={iNodeType.Service} /> }} />
                            <Route exact path={`${url}/${iNodeType.GenericInfo}`} render={() => { return <GenericInfoComponent selectedNodeType={iNodeType.GenericInfo} /> }} />
                        </Switch>
                    </div>
                </div>
            </div>
        </div>
    )
}
