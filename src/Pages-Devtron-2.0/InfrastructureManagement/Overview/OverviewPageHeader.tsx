import {
    BreadCrumb,
    BreadcrumbText,
    DOCUMENTATION,
    getInfrastructureManagementBreadcrumb,
    PageHeader,
    ROUTER_URLS,
    useBreadcrumb,
} from '@devtron-labs/devtron-fe-common-lib'

const OverviewPageHeader = () => {
    const { breadcrumbs } = useBreadcrumb(
        ROUTER_URLS.INFRASTRUCTURE_MANAGEMENT_OVERVIEW,
        {
            alias: {
                ...getInfrastructureManagementBreadcrumb(),
                overview: {
                    component: <BreadcrumbText heading="Overview" isActive />,
                },
            },
        },
        [],
    )

    const renderBreadcrumbs = () => (
        <BreadCrumb breadcrumbs={breadcrumbs} path={ROUTER_URLS.INFRASTRUCTURE_MANAGEMENT_OVERVIEW} />
    )

    return <PageHeader isBreadcrumbs breadCrumbs={renderBreadcrumbs} docPath={DOCUMENTATION.INFRA_MANAGEMENT} />
}

export default OverviewPageHeader
