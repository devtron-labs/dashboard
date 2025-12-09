import { useLocation } from 'react-router-dom'

import {
    BreadCrumb,
    BreadcrumbText,
    getApplicationManagementBreadcrumb,
    PageHeader,
    useBreadcrumb,
} from '@devtron-labs/devtron-fe-common-lib'

const OverviewPageHeader = () => {
    const { pathname } = useLocation()

    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                ...getApplicationManagementBreadcrumb(),
                overview: {
                    component: <BreadcrumbText heading="Overview" isActive />,
                },
            },
        },
        [pathname],
    )

    const renderBreadcrumbs = () => <BreadCrumb breadcrumbs={breadcrumbs} />

    return <PageHeader isBreadcrumbs breadCrumbs={renderBreadcrumbs} />
}

export default OverviewPageHeader
