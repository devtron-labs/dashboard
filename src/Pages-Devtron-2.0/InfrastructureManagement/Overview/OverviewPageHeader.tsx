import {
    BreadCrumb,
    BreadcrumbText,
    DOCUMENTATION,
    getInfrastructureManagementBreadcrumb,
    PageHeader,
    useBreadcrumb,
} from '@devtron-labs/devtron-fe-common-lib'

const OverviewPageHeader = () => {
    const { breadcrumbs } = useBreadcrumb(
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

    const renderBreadcrumbs = () => <BreadCrumb breadcrumbs={breadcrumbs} />

    return <PageHeader isBreadcrumbs breadCrumbs={renderBreadcrumbs} docPath={DOCUMENTATION.INFRA_MANAGEMENT} />
}

export default OverviewPageHeader
