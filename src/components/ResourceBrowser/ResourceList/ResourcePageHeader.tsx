import { BreadCrumb, noop, PageHeader } from '@devtron-labs/devtron-fe-common-lib'

import { ResourcePageHeaderProps } from './types'

const ResourcePageHeader = ({ breadcrumbs, renderPageHeaderActionButtons }: ResourcePageHeaderProps) => {
    const renderBreadcrumbs = () => <BreadCrumb breadcrumbs={breadcrumbs} />

    return (
        <PageHeader
            isBreadcrumbs
            breadCrumbs={renderBreadcrumbs}
            headerName=""
            renderActionButtons={renderPageHeaderActionButtons ?? noop}
        />
    )
}

export default ResourcePageHeader
