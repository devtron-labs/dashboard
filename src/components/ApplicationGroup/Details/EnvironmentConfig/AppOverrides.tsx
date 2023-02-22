import React, { Suspense } from 'react'
import { Route, Switch, useRouteMatch } from 'react-router-dom'
import { ErrorBoundary, Progressing } from '../../../common'
import EnvironmentOverride from '../../../EnvironmentOverride/EnvironmentOverride'
import { AppOverridesType } from '../../Environments.types'

export default function AppOverrides({ appList, environments, setEnvironments }: AppOverridesType) {
    const { path } = useRouteMatch()
    return (
        <ErrorBoundary>
            <Suspense fallback={<Progressing pageLoader />}>
                <Switch>
                    <Route path={`${path}/:appId(\\d+)?`}>
                        <EnvironmentOverride appList={appList} environments={environments} setEnvironments={setEnvironments} />
                    </Route>
                </Switch>
            </Suspense>
        </ErrorBoundary>
    )
}
