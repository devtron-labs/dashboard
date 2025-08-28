import { useLocation, useRouteMatch } from 'react-router-dom'

import { BreadCrumb, PageHeader, TabGroup, useBreadcrumb } from '@devtron-labs/devtron-fe-common-lib'

import { getSecurityBreadcrumbAlias, getTippyContent } from './security.util'

export const SecurityPageHeader = () => {
    const { path } = useRouteMatch()
    const { pathname } = useLocation()
    const { breadcrumbs } = useBreadcrumb(getSecurityBreadcrumbAlias(pathname), [pathname])

    const renderSecurityTabs = () => (
        <TabGroup
            tabs={[
                {
                    id: 'security-scans-tab',
                    label: 'Security Scans',
                    tabType: 'navLink',
                    props: {
                        to: `${path}/scans`,
                    },
                },
                {
                    id: 'security-policies-tab',
                    label: 'Security Policies',
                    tabType: 'navLink',
                    props: {
                        to: `${path}/policies`,
                        'data-testid': 'security-policy',
                    },
                },
            ]}
            hideTopPadding
        />
    )

    const renderBreadcrumbs = () => <BreadCrumb breadcrumbs={breadcrumbs} />

    return (
        <PageHeader
            tippyProps={{
                isTippyCustomized: true,
                tippyRedirectLink: 'SECURITY',
                additionalContent: getTippyContent(),
                tippyHeader: 'Security Center',
            }}
            showTabs
            renderHeaderTabs={renderSecurityTabs}
            breadCrumbs={renderBreadcrumbs}
            isBreadcrumbs
        />
    )
}
