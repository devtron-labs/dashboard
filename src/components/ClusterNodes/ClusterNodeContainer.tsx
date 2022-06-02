import React from 'react'
import { URLS } from '../../config'
import { Redirect, Route, Switch, useHistory } from 'react-router-dom'
import ClusterList from './ClusterList'
import NodeDetails from './NodeDetails'
import NodeList from './NodeList'
import PageHeader from '../common/header/PageHeader'

export default function ClusterNodeContainer() {
    const history = useHistory()

    const handleRedirectToModule = (detailsMode) => {
        let url =
            detailsMode === 'discover' ? URLS.STACK_MANAGER_DISCOVER_MODULES : URLS.STACK_MANAGER_INSTALLED_MODULES
        history.push(url)
    }

    const renderBreadcrumbs = (headerTitleName, detailsMode) => {
        return (
            <div className="m-0 flex left ">
                <div onClick={() => handleRedirectToModule(detailsMode)} className="devtron-breadcrumb__item">
                    <span className="cb-5 fs-16 cursor">{headerTitleName} </span>
                </div>
                <span className="fs-16 cn-9 ml-4 mr-4"> / </span>
                <span className="fs-16 cn-9">{'test Title'}</span>
            </div>
        )
    }
    return (
        <>
            <PageHeader
                isBreadcrumbs={true}
                breadCrumbs={() => renderBreadcrumbs('Discover integrations', 'discover')}
            />
            <Switch>
                <Route path={URLS.CLUSTER_LIST} exact>
                    <ClusterList />
                </Route>
                <Route path={`${URLS.CLUSTER_LIST}/:clusterId${URLS.NODES_LIST}`} exact>
                    <NodeList />
                </Route>
                <Route path={`${URLS.CLUSTER_LIST}/:clusterId${URLS.NODES_LIST}/:nodeId${URLS.NODE_DETAILS}`} exact>
                    <NodeDetails />
                </Route>
                <Redirect to={URLS.CLUSTER_LIST} />
            </Switch>
        </>
    )
}
