import { Redirect, Route, Switch } from 'react-router-dom'

import {
    BreadCrumb,
    BreadcrumbText,
    DOCUMENTATION,
    getSecurityCenterBreadcrumb,
    InfoBlock,
    PageHeader,
    URLS,
    useBreadcrumb,
} from '@devtron-labs/devtron-fe-common-lib'

import { SecurityScansTab } from '../SecurityScansTab'
import { CVEList } from './CVEList'

const VulnerabilitiesRouter = () => {
    const { breadcrumbs } = useBreadcrumb({
        alias: {
            ...getSecurityCenterBreadcrumb(),
            vulnerabilities: {
                component: <BreadcrumbText heading="Vulnerabilities" isActive />,
                linked: false,
            },
            deployments: null,
            cves: null,
        },
    })

    const renderBreadcrumbs = () => <BreadCrumb breadcrumbs={breadcrumbs} />

    return (
        <div className="flexbox-col flex-grow-1 dc__overflow-hidden">
            <PageHeader breadCrumbs={renderBreadcrumbs} isBreadcrumbs docPath={DOCUMENTATION.SECURITY} />
            <InfoBlock
                variant="neutral"
                description="Showing vulnerabilities from active deployments. Data is limited to applications and environments you have access to."
                borderConfig={{ top: false, right: false, left: false }}
                borderRadiusConfig={{ top: false, bottom: false, right: false, left: false }}
            />
            <Switch>
                <Route path={URLS.SECURITY_CENTER_VULNERABILITY_DEPLOYMENTS} exact>
                    <SecurityScansTab />
                </Route>
                <Route path={URLS.SECURITY_CENTER_VULNERABILITY_CVES} exact>
                    <CVEList />
                </Route>
                <Redirect to={URLS.SECURITY_CENTER_VULNERABILITY_DEPLOYMENTS} />
            </Switch>
        </div>
    )
}

export default VulnerabilitiesRouter
