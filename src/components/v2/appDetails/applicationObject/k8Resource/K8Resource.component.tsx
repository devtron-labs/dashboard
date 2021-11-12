import React, { useEffect, useState } from 'react';
import { iNode, iNodeType } from './node.type';
import ResourceTreeComponent from './ResourceTree.component';
import ServiceComponent from './nodeType/Service.component';
import FilterResource from './FilterResource';
import GenericInfoComponent from './nodeType/GenericInfo.component';
import './k8resources.css';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useRouteMatch, useHistory } from 'react-router';
import AllPodsComponent from './nodeType/AllPods.component';
import { URLS } from '../../../../../config';
import ApplicationObjectStore from '../applicationObject.store';
import { useSharedState } from '../../../utils/useSharedState';
import AppDetailsStore from '../../appDetail.store';

export default function K8ResourceComponent() {
    const [nodes] = useSharedState(AppDetailsStore.getAppDetailsNodes(), AppDetailsStore.getAppDetailsNodesObservable())

    //const [selectedNode, setSelectedNode] = useState<iNode | undefined>(undefined)

    const { path, url } = useRouteMatch();

    const history = useHistory();

    //const params = useParams<{ node: string; kind: string; appId: string; envId: string }>();

    // const updateNodeInfoCB = (node: iNode) => {
    //     setSelectedNode(node)
    // }

    const handleCallback = (_node: iNode) => {
        //setSelectedNode(_node)
        let link = `${url.split(URLS.APP_DETAILS_K8)[0]}${URLS.APP_DETAILS_K8}/${_node.name.toLowerCase()}`;
        history.push(link);
    }

    useEffect(() => {
        ApplicationObjectStore.markApplicationObjectTabActive(URLS.APP_DETAILS_K8)
    }, [])

    return (
        <div className="bcn-0">
            <div className="pt-16 pl-20 pb-16">
                <FilterResource />
            </div>
            <div className="container-fluid">
                <div className="row" >
                    <div className="col-2 k8-resources-node-tree">
                        {nodes.length > 0 && <ResourceTreeComponent nodes={nodes} callback={handleCallback} />}
                    </div>
                    <div className="col">
                        <Switch>
                            <Route exact path={`${url}/${iNodeType.Pods}`} render={() => { return <AllPodsComponent selectedNodeType={iNodeType.Pods} /> }} />
                            <Route exact path={`${url}/${iNodeType.Service}`} render={() => { return <ServiceComponent selectedNodeType={iNodeType.Service} /> }} />
                            <Route exact path={`${url}/${iNodeType.GenericInfo}`} render={() => { return <GenericInfoComponent selectedNodeType={iNodeType.GenericInfo} /> }} />
                            <Redirect to={`${url}/${iNodeType.Pods}`} />
                        </Switch>
                    </div>
                </div>
            </div>
        </div>
    )
}
