import React, { useEffect, useState } from 'react'
import { URLS } from '../../config'
import { Redirect, Route, Switch } from 'react-router-dom'
import ClusterList from './ClusterList'
import NodeDetails from './NodeDetails'
import NodeList from './NodeList'
import { getHostURLConfiguration } from '../../services/service'
import { getUserRole } from '../userGroups/userGroup.service'
import { showError } from '../common'

export default function ClusterNodeContainer() {
    const [imageList,setImageList] = useState<string[]>(null)
    const [isSuperAdmin, setSuperAdmin] = useState<boolean>()
    
    useEffect(() => {
        Promise.all([getHostURLConfiguration('DEFAULT_TERMINAL_IMAGE_LIST'),getUserRole()]).then(([hostUrlConfig, userRole]) => {
            if(hostUrlConfig.result) {
                const imageValue: string = hostUrlConfig.result.value
                setImageList(imageValue.split(','))
            }
            if(userRole?.result) {
                setSuperAdmin(userRole.result?.superAdmin)
            }
        }).catch((error) => {
            showError(error)
        })
    },[])

    return (
        <Switch>
            <Route path={URLS.CLUSTER_LIST} exact>
                <ClusterList imageList={imageList} isSuperAdmin={isSuperAdmin}/>
            </Route>
            <Route path={`${URLS.CLUSTER_LIST}/:clusterId`} exact>
                <NodeList imageList={imageList} isSuperAdmin={isSuperAdmin}/>
            </Route>
            <Route path={`${URLS.CLUSTER_LIST}/:clusterId/:nodeName`} exact>
                <NodeDetails imageList={imageList} isSuperAdmin={isSuperAdmin}/>
            </Route>
            <Redirect to={URLS.CLUSTER_LIST} />
        </Switch>
    )
}
