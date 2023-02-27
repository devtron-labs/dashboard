import React, { useContext } from 'react'
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom'
import { URLS } from '../../config'
import { ErrorBoundary } from '../common'
import JobsList from './JobList/JobsList'
import './Jobs.scss'

export default function Jobs() {
    const { path } = useRouteMatch()

    return (
        <ErrorBoundary>
            <Switch>
                <Route path={`${path}/${URLS.APP_LIST}`}>
                    <JobsList />
                </Route>
                <Route path={`${path}/${URLS.EXTERNAL_APPS}/:jobId/:jobName`} />
                <Redirect to={`${path}/${URLS.APP_LIST}`} />
            </Switch>
        </ErrorBoundary>
    )
}
