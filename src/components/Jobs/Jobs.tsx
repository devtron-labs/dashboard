import React, { useContext } from 'react'
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom'
import { ModuleNameMap, URLS } from '../../config'
import { ErrorBoundary, useAsync } from '../common'
import { getModuleInfo } from '../v2/devtronStackManager/DevtronStackManager.service'
import { ModuleStatus } from '../v2/devtronStackManager/DevtronStackManager.type'
import JobDetails from './JobDetails/JobDetails'
import JobsList from './JobList/JobsList'

export default function Jobs() {
    const { path } = useRouteMatch()
    const [, argoInfoData] = useAsync(() => getModuleInfo(ModuleNameMap.ARGO_CD))
    const isArgoInstalled: boolean = argoInfoData?.result.status === ModuleStatus.INSTALLED

    return (
        <ErrorBoundary>
            <Switch>
                <Route path={`${path}/${URLS.APP_LIST}`}>
                    <JobsList isArgoInstalled={isArgoInstalled} />
                </Route>
                <Route path={`${path}/:appId(\\d+)`}>
                    <JobDetails />
                </Route>
                <Redirect to={`${path}/${URLS.APP_LIST}`} />
            </Switch>
        </ErrorBoundary>
    )
}

