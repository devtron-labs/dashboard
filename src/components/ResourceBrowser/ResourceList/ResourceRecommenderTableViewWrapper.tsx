import { ErrorScreenManager, TableViewWrapperProps, URLS } from '@devtron-labs/devtron-fe-common-lib'

import { ResourceFilterOptionsProps } from '../Types'
import ResourceFilterOptions from './ResourceFilterOptions'

interface ResourceRecommenderTableViewWrapperProps extends ResourceFilterOptionsProps, TableViewWrapperProps {
    resourceListError: any
    reloadResourceListData: () => void
}

export const ResourceRecommenderTableViewWrapper = ({
    children,
    resourceListError,
    reloadResourceListData,
    ...props
}: ResourceRecommenderTableViewWrapperProps) => (
    <div className="resource-list-container flexbox-col flex-grow-1 border__primary--left dc__overflow-hidden">
        <ResourceFilterOptions searchPlaceholder="Search" {...props} />

        {resourceListError ? (
            <ErrorScreenManager
                code={resourceListError?.code}
                redirectURL={URLS.RESOURCE_BROWSER}
                reload={reloadResourceListData}
            />
        ) : (
            children
        )}
    </div>
)
