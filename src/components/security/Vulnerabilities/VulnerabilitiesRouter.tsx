import { Navigate, Route, Routes } from 'react-router-dom'

import {
    BASE_ROUTES,
    BreadCrumb,
    BreadcrumbText,
    DOCUMENTATION,
    getSecurityCenterBreadcrumb,
    InfoBlock,
    PageHeader,
    ROUTER_URLS,
    useBreadcrumb,
} from '@devtron-labs/devtron-fe-common-lib'

import { SecurityScansTab } from '../SecurityScansTab'
import { CVEList } from './CVEList'

const VulnerabilitiesRouter = () => {
    const { breadcrumbs } = useBreadcrumb(ROUTER_URLS.SECURITY_CENTER_VULNERABILITIES, {
        alias: {
            ...getSecurityCenterBreadcrumb(),
            vulnerabilities: {
                component: <BreadcrumbText heading="Vulnerabilities" isActive />,
                linked: false,
            },
        },
    })

    const renderBreadcrumbs = () => (
        <BreadCrumb breadcrumbs={breadcrumbs} path={ROUTER_URLS.SECURITY_CENTER_VULNERABILITIES} />
    )

    return (
        <div className="flexbox-col flex-grow-1 dc__overflow-hidden">
            <PageHeader breadCrumbs={renderBreadcrumbs} isBreadcrumbs docPath={DOCUMENTATION.SECURITY_CENTER} />
            <InfoBlock
                variant="neutral"
                description="Showing vulnerabilities from active deployments. Data is limited to applications and environments you have access to."
                borderConfig={{ top: false, right: false, left: false }}
                borderRadiusConfig={{ top: false, bottom: false, right: false, left: false }}
            />
            <Routes>
                <Route path={BASE_ROUTES.SECURITY_CENTER.VULNERABILITIES.DEPLOYMENTS} element={<SecurityScansTab />} />
                <Route path={BASE_ROUTES.SECURITY_CENTER.VULNERABILITIES.CVES} element={<CVEList />} />
                <Route
                    path="*"
                    element={<Navigate to={BASE_ROUTES.SECURITY_CENTER.VULNERABILITIES.DEPLOYMENTS} replace />}
                />
            </Routes>
        </div>
    )
}

export default VulnerabilitiesRouter
