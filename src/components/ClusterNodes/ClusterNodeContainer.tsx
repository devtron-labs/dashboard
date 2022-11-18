import React, { useEffect, useState } from 'react'
import { URLS } from '../../config'
import { Redirect, Route, Switch } from 'react-router-dom'
import ClusterList from './ClusterList'
import NodeDetails from './NodeDetails'
import NodeList from './NodeList'
import { getHostURLConfiguration } from '../../services/service'

export default function ClusterNodeContainer() {
    const [imageList,setImageList] = useState<string[]>(null)
    
    useEffect(() => {
        getHostURLConfiguration('DEFAULT_TERMINAL_IMAGE_LIST').then((response) => {
            if(response.result) {
                const imageValue: string = response.result.value
                setImageList(imageValue.split(','))
            }
        } )
    },[])
    return (
        <Switch>
            <Route path={URLS.CLUSTER_LIST} exact>
                <ClusterList imageList={imageList}/>
            </Route>
            <Route path={`${URLS.CLUSTER_LIST}/:clusterId`} exact>
                <NodeList imageList={imageList}/>
            </Route>
            <Route path={`${URLS.CLUSTER_LIST}/:clusterId/:nodeName`} exact>
                <NodeDetails imageList={imageList}/>
            </Route>
            <Redirect to={URLS.CLUSTER_LIST} />
        </Switch>
    )
}
