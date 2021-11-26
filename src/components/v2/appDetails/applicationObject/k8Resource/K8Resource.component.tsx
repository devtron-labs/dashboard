import React, { useEffect, useState } from 'react';
import NodeTreeComponent from './NodeTree.component';
import FilterResource from './FilterResource';
import './k8resources.css';
import { useRouteMatch, Redirect } from 'react-router';
import { URLS } from '../../../../../config';
import ApplicationObjectStore from '../applicationObject.store';
import { NodeType } from '../../appDetail.type';
import { Switch, Route } from 'react-router-dom';
import GenericTableComponent from './nodeType/GenericTable.component';
import PodNodeComponent from './nodeType/PodNode.component';
import ServiceNodeComponent from './nodeType/ServiceNode.component';

export default function K8ResourceComponent() {
    const { path, url } = useRouteMatch();

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
                    <div className="col-md-2 k8-resources-node-tree pt-8 border-right">
                        <NodeTreeComponent />
                    </div>
                    <div className="col-md-10 p-0">
                        <Switch>
                            <Route path={`${path}/pod`} render={() => { return <PodNodeComponent selectedNodeType={NodeType.Pod} /> }} />
                            <Route path={`${path}/service`} render={() => { return <ServiceNodeComponent selectedNodeType={NodeType.Service} /> }} />
                            <Route path={`${path}/:nodeType`} render={() => { return <GenericTableComponent  /> }} />
                        </Switch>
                    </div>
                </div>
            </div>
        </div>
    )
}
