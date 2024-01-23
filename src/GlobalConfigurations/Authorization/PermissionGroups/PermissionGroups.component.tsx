import React, { lazy } from 'react'
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom'

const PermissionGroupList = lazy(() => import('./List'))
const PermissionGroupAddEdit = lazy(() => import('./AddEdit'))

const PermissionGroups = () => {
    const { path } = useRouteMatch()

    return (
        <Switch>
            <Route path={path} component={PermissionGroupList} exact />
            <Route
                path={`${path}/:groupId`}
                render={({ match }) => (
                    <section className="flexbox-col flex-grow-1 h-100" key={match.params.groupId}>
                        <PermissionGroupAddEdit />
                    </section>
                )}
            />
            <Redirect to={path} />
        </Switch>
    )
}

export default PermissionGroups
