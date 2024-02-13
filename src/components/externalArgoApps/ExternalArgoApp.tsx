import React, { Suspense } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { useRouteMatch, useParams } from 'react-router'
import { Progressing } from '@devtron-labs/devtron-fe-common-lib'
import EAHeaderComponent from '../v2/headers/EAHeader.component'
import { AppListConstants, URLS } from '../../config'
import ExternalArgoAppDetail from './ExternalArgoAppDetail'

export default function ExternalArgoApp() {
    const params = useParams<{ clusterId: string; appName: string; namespace: string }>()
    const { path } = useRouteMatch()

    return (
        <>
            <EAHeaderComponent
                title={AppListConstants.AppTabs.ARGO_APPS}
                redirectURL={`${URLS.APP}/${URLS.APP_LIST}/${AppListConstants.AppType.ARGO_APPS}`}
                appType={AppListConstants.AppType.ARGO_APPS}
            />
            <Suspense fallback={<Progressing pageLoader />}>
                <Switch>
                    <Route path={`${path}/${URLS.APP_DETAILS}`}>
                        <ExternalArgoAppDetail
                            clusterId={params.clusterId}
                            appName={params.appName}
                            namespace={params.namespace}
                            isExternalApp
                        />
                    </Route>
                    <Redirect to={`${path}/${URLS.APP_DETAILS}`} />
                </Switch>
            </Suspense>
        </>
    )
}
