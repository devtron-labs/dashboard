import React, { useEffect } from 'react';
import NodeTreeComponent from './nodeType/NodeTree.component';
import FilterResource from './FilterResource';
import './k8resources.css';
import { useRouteMatch } from 'react-router';
import AppDetailsStore, { AppDetailsTabs } from '../appDetails.store';
import NodeComponent from './nodeType/Node.component';
import { useSharedState } from '../../utils/useSharedState';
import IndexStore from '../index.store';

export default function K8ResourceComponent() {
    const { url } = useRouteMatch();
    const [nodes] = useSharedState(IndexStore.getAppDetailsNodes(), IndexStore.getAppDetailsNodesObservable())

    useEffect(() => {
        AppDetailsStore.markAppDetailsTabActive(AppDetailsTabs.k8s_Resources, url)
    }, [])

    return (
        <div className="resource-node-wrapper bcn-0 ">
            <div className="pt-16 pl-20 pb-16">
                <FilterResource />
            </div>
            <div className="container-fluid">
                {nodes.length > 0 ?
                    <div className="row" >
                        <div className="col-md-2 k8-resources-node-tree pt-8 border-right">
                            <NodeTreeComponent />
                        </div>
                        <div className="col-md-10 p-0">
                            {/* <Switch>
                                <Route path={`${path}/:nodeType`} render={() => { return <NodeComponent /> }} />
                            </Switch> */}
                            <NodeComponent />
                        </div>
                    </div>
                    :
                    <div>Empty UI</div>
                }
            </div>
        </div>
    )
}
