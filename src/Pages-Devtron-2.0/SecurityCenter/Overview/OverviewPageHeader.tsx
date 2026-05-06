import {
    BreadCrumb,
    BreadcrumbText,
    DOCUMENTATION,
    getSecurityCenterBreadcrumb,
    PageHeader,
    ROUTER_URLS,
    useBreadcrumb,
} from '@devtron-labs/devtron-fe-common-lib'

const TippyContent = () => (
    <div className="px-12 pt-12 fs-13 fw-4">
        Devtron provides DevSecOps capabilities across your software development life cycle.
        <p className="pt-20 m-0">
            One of the key components of DevSecOps is the detection of security risks. Currently, Devtron supports the
            following types of scanning:
        </p>
        <ul className="pl-20">
            <li>Image Scan</li>
            <li>Code Scan</li>
            <li>Kubernetes Manifest Scan</li>
        </ul>
    </div>
)

const OverviewPageHeader = () => {
    const { breadcrumbs } = useBreadcrumb(
        ROUTER_URLS.SECURITY_CENTER_OVERVIEW,
        {
            alias: {
                ...getSecurityCenterBreadcrumb(),
                overview: {
                    component: <BreadcrumbText heading="Overview" isActive />,
                },
            },
        },
        [],
    )

    const renderBreadcrumbs = () => <BreadCrumb breadcrumbs={breadcrumbs} path={ROUTER_URLS.SECURITY_CENTER_OVERVIEW} />

    return (
        <PageHeader
            tippyProps={{
                isTippyCustomized: true,
                tippyRedirectLink: 'SECURITY',
                additionalContent: <TippyContent />,
                tippyHeader: 'Security Center',
            }}
            isBreadcrumbs
            breadCrumbs={renderBreadcrumbs}
            docPath={DOCUMENTATION.SECURITY_CENTER}
        />
    )
}

export default OverviewPageHeader
