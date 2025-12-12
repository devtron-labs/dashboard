import {
    BreadCrumb,
    BreadcrumbText,
    getApplicationManagementBreadcrumb,
    PageHeader,
    useBreadcrumb,
} from '@devtron-labs/devtron-fe-common-lib'

const OverviewPageHeader = () => {
    const { breadcrumbs } = useBreadcrumb(
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

    const renderBreadcrumbs = () => <BreadCrumb breadcrumbs={breadcrumbs} />

    return <PageHeader isBreadcrumbs breadCrumbs={renderBreadcrumbs} />
}

export default OverviewPageHeader
