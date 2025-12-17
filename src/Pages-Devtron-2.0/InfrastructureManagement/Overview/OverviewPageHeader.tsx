import {
    BreadCrumb,
    BreadcrumbText,
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

    return <PageHeader isBreadcrumbs breadCrumbs={renderBreadcrumbs} />
}

export default OverviewPageHeader
