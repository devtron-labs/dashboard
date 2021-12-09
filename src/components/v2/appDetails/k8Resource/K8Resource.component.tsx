import React, { useEffect } from 'react';
import NodeTreeComponent from './nodeType/NodeTree.component';
import FilterResource from './FilterResource';
import './k8resources.css';
import { useRouteMatch } from 'react-router';
import { URLS } from '../../../../config';
import AppDetailsStore from '../appDetails.store';
import { Switch, Route } from 'react-router-dom';
import NodeComponent from './nodeType/Node.component';
import { useSharedState } from '../../utils/useSharedState';
import IndexStore from '../index.store';

export default function K8ResourceComponent() {
    const { path, url } = useRouteMatch();

    const [nodes] = useSharedState(IndexStore.getAppDetailsNodes(), IndexStore.getAppDetailsNodesObservable())

    useEffect(() => {
        AppDetailsStore.markAppDetailsTabActive(URLS.APP_DETAILS_K8)
    }, [])

    return (
        <div className="k8-resource-wrapper bcn-0 ">
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
                            <Switch>
                                <Route path={`${path}/:nodeType`} render={() => { return <NodeComponent /> }} />
                            </Switch>
                        </div>
                    </div>
                    : 
                    <div>Empty UI</div>
                }
            </div>
        </div>
    )
}
