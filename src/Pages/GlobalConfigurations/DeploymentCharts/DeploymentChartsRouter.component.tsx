import { Redirect, Route, Switch } from 'react-router-dom'
import { ERROR_STATUS_CODE, ErrorScreenManager, useMainContext, URLS } from '@devtron-labs/devtron-fe-common-lib'
import { importComponentFromFELibrary } from '@Components/common'
import { DeploymentChartsList } from './List'

const DeploymentChartDetailRouter = importComponentFromFELibrary('DeploymentChartDetailRouter', null, 'function')

const DeploymentChartsRouter = () => {
    const { isSuperAdmin } = useMainContext()

    if (!isSuperAdmin) {
        return <ErrorScreenManager code={ERROR_STATUS_CODE.PERMISSION_DENIED} />
    }

    return (
        // NOTE: need to give fixed height here for resizable code editor height
        <div className="flexbox-col dc__window-bg dc__overflow-hidden h-100">
            <Switch>
                <Route exact path={URLS.GLOBAL_CONFIG_DEPLOYMENT_CHARTS_LIST}>
                    <DeploymentChartsList />
                </Route>
                {DeploymentChartDetailRouter && <DeploymentChartDetailRouter />}
                <Redirect to={URLS.GLOBAL_CONFIG_DEPLOYMENT_CHARTS_LIST} />
            </Switch>
        </div>
    )
}

export default DeploymentChartsRouter
