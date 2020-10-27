import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { useRouteMatch } from 'react-router';
import DeploymentGroupList from './DeploymentGroupList'
import BulkActionEdit from './BulkActionEdit'
import BulkActionDetails from './BulkActionDetails'
import './BulkActions.scss';

export default function BulkActions({ ...props }) {
    const { path } = useRouteMatch();
    return <Switch>
        <Route path={`${path}/:id/details`} component={BulkActionDetails} />
        <Route exact path={`${path}/:id/edit`} component={BulkActionEdit} />
        <Route exact path={`${path}`} component={DeploymentGroupList} />
        <Redirect to={`${path}`} />
    </Switch>

}