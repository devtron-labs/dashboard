import React, { Suspense } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { useRouteMatch, useParams } from 'react-router'
import { Progressing } from '@devtron-labs/devtron-fe-common-lib'
import EAHeaderComponent from '../v2/headers/EAHeader.component'
import { AppListConstants, URLS } from '../../config'
import ExternalAppDetail from '../v2/appDetails/ea/EAAppDetail.component'
import ChartDeploymentHistory from '../v2/chartDeploymentHistory/ChartDeploymentHistory.component'
import ChartValuesView from '../v2/values/chartValuesDiff/ChartValuesView'

export default function ExternalApps() {
    const params = useParams<{ appId: string; appName: string }>()
    const { path } = useRouteMatch()
    return (
        <>
            <EAHeaderComponent
                title={AppListConstants.AppTabs.HELM_APPS}
                redirectURL={`${URLS.APP}/${URLS.APP_LIST}/${AppListConstants.AppType.HELM_APPS}`}
                appType={AppListConstants.AppType.HELM_APPS}
            />
            <Suspense fallback={<Progressing pageLoader />}>
                <Switch>
                    <Route path={`${path}/${URLS.APP_DETAILS}`}>
                        <ExternalAppDetail appId={params.appId} appName={params.appName} isExternalApp />
                    </Route>
                    <Route path={`${path}/${URLS.APP_VALUES}`}>
                        <ChartValuesView appId={params.appId} isExternalApp />
                    </Route>
                    <Route path={`${path}/${URLS.APP_DEPLOYMNENT_HISTORY}`}>
                        <ChartDeploymentHistory appId={params.appId} appName={params.appName} isExternal />
                    </Route>
                    <Redirect to={`${path}/${URLS.APP_DETAILS}`} />
                </Switch>
            </Suspense>
        </>
    )
}
