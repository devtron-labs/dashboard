import { useLocation } from 'react-router-dom'

import { BreadCrumb, PageHeader, useBreadcrumb } from '@devtron-labs/devtron-fe-common-lib'

import { getSecurityBreadcrumbAlias, getTippyContent } from './security.util'

export const SecurityPageHeader = () => {
    const { pathname } = useLocation()
    const { breadcrumbs } = useBreadcrumb(getSecurityBreadcrumbAlias(pathname), [pathname])

    const renderBreadcrumbs = () => <BreadCrumb breadcrumbs={breadcrumbs} />

    return (
        <PageHeader
            tippyProps={{
                isTippyCustomized: true,
                tippyRedirectLink: 'SECURITY',
                additionalContent: getTippyContent(),
                tippyHeader: 'Security Center',
            }}
            breadCrumbs={renderBreadcrumbs}
            isBreadcrumbs
        />
    )
}
