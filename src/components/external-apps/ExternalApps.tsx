import React, { Suspense } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { useRouteMatch, useParams } from 'react-router'
import EAHeaderComponent from '../v2/headers/EAHeader.component'
import { Progressing } from '../common'
import { URLS } from '../../config'
import ExternalAppDetail from '../v2/appDetails/ea/EAAppDetail.component'
import ChartDeploymentHistory from '../v2/chartDeploymentHistory/ChartDeploymentHistory.component'
import ChartValuesView from '../v2/values/chartValuesDiff/ChartValuesView'

export default function ExternalApps() {
    const params = useParams<{ appId: string; appName: string }>()
    const { path } = useRouteMatch()

    return (
        <React.Fragment>
            <EAHeaderComponent />
            <Suspense fallback={<Progressing pageLoader />}>
                <Switch>
                    <Route path={`${path}/${URLS.APP_DETAILS}`}>
                        <ExternalAppDetail appId={params.appId} appName={params.appName} />
                    </Route>
                    <Route path={`${path}/${URLS.APP_VALUES}`}>
                        <ChartValuesView appId={params.appId} isExternalApp={true} />
                    </Route>
                    <Route path={`${path}/${URLS.APP_DEPLOYMNENT_HISTORY}`}>
                        <ChartDeploymentHistory appId={params.appId} appName={params.appName} isExternal={true} />
                    </Route>
                    <Redirect to={`${path}/${URLS.APP_DETAILS}`} />
                </Switch>
            </Suspense>
        </React.Fragment>
    )
}
