import React, { useState } from 'react'
import { URLS } from '../../config'
import { Redirect, Route, Switch } from 'react-router-dom'
import ClusterList from './ClusterList'
import NodeDetails from './NodeDetails'
import NodeList from './NodeList'
import { MultiValue } from 'react-select'
import { columnMetadataType } from './types'

export default function ClusterNodeContainer() {
    const [appliedColumns, setAppliedColumns] = useState<MultiValue<columnMetadataType>>([])
    return (
        <>
            <Switch>
                <Route path={URLS.CLUSTER_LIST} exact>
                    <ClusterList />
                </Route>
                <Route path={`${URLS.CLUSTER_LIST}/:clusterId`} exact>
                    <NodeList appliedColumns={appliedColumns} setAppliedColumns={setAppliedColumns} />
                </Route>
                <Route path={`${URLS.CLUSTER_LIST}/:clusterId/:nodeName`} exact>
                    <NodeDetails />
                </Route>
                <Redirect to={URLS.CLUSTER_LIST} />
            </Switch>
        </>
    )
}
