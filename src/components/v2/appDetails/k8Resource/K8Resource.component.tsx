import React, { useEffect } from 'react';
import NodeTreeComponent from './NodeTree.component';
import FilterResource from './FilterResource';
import './k8resources.css';
import { useRouteMatch } from 'react-router';
import { URLS } from '../../../../config';
import AppDetailsStore from '../appDetails.store';
import { Switch, Route } from 'react-router-dom';
import NodeComponent from './nodeType/Node.component';

export default function K8ResourceComponent() {
    const { path, url } = useRouteMatch();

    useEffect(() => {
        AppDetailsStore.markApplicationObjectTabActive(URLS.APP_DETAILS_K8)
    }, [])

    return (
        <div className="bcn-0">
            <div className="pt-16 pl-20 pb-16">
                <FilterResource />
            </div>
            <div className="container-fluid">
                <div className="row" >
                    <div className="col-md-2 k8-resources-node-tree pt-8 border-right">
                        <NodeTreeComponent />
                    </div>
                    <div className="col-md-10 p-0">
                        <Switch>
                            <Route path={`${path}/:nodeType`} render={() => { return <NodeComponent  /> }} />
                        </Switch>
                    </div>
                </div>
            </div>
        </div>
    )
}
