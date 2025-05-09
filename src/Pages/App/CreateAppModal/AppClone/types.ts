import { BaseAppMetaData, GenericEmptyStateType, GenericInfoCardProps } from '@devtron-labs/devtron-fe-common-lib'
import { GenericFilterEmptyStateProps } from '@devtron-labs/devtron-fe-common-lib/dist/Common/EmptyState/types'

export interface GenericInfoCardListingProps
    extends Pick<GenericInfoCardProps, 'borderVariant'>,
        Pick<GenericFilterEmptyStateProps, 'handleClearFilters'> {
    list: (Pick<GenericInfoCardProps, 'Icon' | 'author' | 'description' | 'linkProps' | 'onClick' | 'title'> &
        Record<'id', string>)[]
    emptyStateConfig: Pick<GenericEmptyStateType, 'title' | 'subTitle' | 'image'>
    searchKey?: string
    reloadList?: () => void
    error?: Record<string, unknown>
    isLoading?: boolean
}

export interface AppCloneListProps {
    handleCloneAppClick: ({ appId, appName }: BaseAppMetaData) => void
    isJobView?: boolean
}
