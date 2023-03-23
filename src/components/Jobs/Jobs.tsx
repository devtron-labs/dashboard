import React from 'react'
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom'
import { URLS } from '../../config'
import { ErrorBoundary } from '../common'
import JobDetails from './JobDetails/JobDetails'
import JobsList from './JobList/JobsList'

export default function Jobs() {
    const { path } = useRouteMatch()

    return (
        <ErrorBoundary>
            <Switch>
                <Route path={`${path}/${URLS.APP_LIST}`}>
                    <JobsList />
                </Route>
                <Route path={`${path}/:appId(\\d+)`}>
                    <JobDetails />
                </Route>
                <Redirect to={`${path}/${URLS.APP_LIST}`} />
            </Switch>
        </ErrorBoundary>
    )
}
