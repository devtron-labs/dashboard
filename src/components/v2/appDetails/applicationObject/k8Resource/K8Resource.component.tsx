import React, { useEffect, useState } from 'react';
import NodeTreeComponent from './NodeTree.component';
import FilterResource from './FilterResource';
import './k8resources.css';
import { Switch } from 'react-router-dom';
import { URLS } from '../../../../../config';
import ApplicationObjectStore from '../applicationObject.store';
import { NodeType } from '../../appDetail.type';
import NodeDetailComponent from './NodeDetailComponent';

export default function K8ResourceComponent() {

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
                    <div className="col-md-2 k8-resources-node-tree pt-8 ">
                        <NodeTreeComponent />
                    </div>
                    <div className="col-md-10 p-0">
                        <NodeDetailComponent />
                    </div>
                </div>
            </div>
        </div>
    )
}
