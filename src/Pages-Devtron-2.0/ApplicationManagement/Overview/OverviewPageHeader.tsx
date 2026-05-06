import {
    BreadCrumb,
    BreadcrumbText,
    DOCUMENTATION,
    getApplicationManagementBreadcrumb,
    PageHeader,
    ROUTER_URLS,
    useBreadcrumb,
} from '@devtron-labs/devtron-fe-common-lib'

const OverviewPageHeader = () => {
    const { breadcrumbs } = useBreadcrumb(
        ROUTER_URLS.APPLICATION_MANAGEMENT_OVERVIEW,
        {
            alias: {
                ...getApplicationManagementBreadcrumb(),
                overview: {
                    component: <BreadcrumbText heading="Overview" isActive />,
                },
            },
        },
        [],
    )

    const renderBreadcrumbs = () => (
        <BreadCrumb breadcrumbs={breadcrumbs} path={ROUTER_URLS.APPLICATION_MANAGEMENT_OVERVIEW} />
    )

    return <PageHeader isBreadcrumbs breadCrumbs={renderBreadcrumbs} docPath={DOCUMENTATION.APP_MANAGEMENT} />
}

export default OverviewPageHeader
