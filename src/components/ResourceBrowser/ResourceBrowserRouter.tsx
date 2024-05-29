import React from 'react'
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom'
import ResourceBrowser from './ResourceBrowser'
import ResourceList from './ResourceList'
import './ResourceBrowser.scss'

const ResourceBrowserRouter: React.FC = () => {
    const { path } = useRouteMatch()

    return (
        <Switch>
            <Route path={`${path}/:clusterId/:namespace/:nodeType/:group/:node?`}>
                <ResourceList />
            </Route>

            <Route path={path} exact>
                <ResourceBrowser />
            </Route>

            <Redirect to={path} />
        </Switch>
    )
}

export default ResourceBrowserRouter
