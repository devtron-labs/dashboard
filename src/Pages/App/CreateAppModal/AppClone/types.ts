import { BaseAppMetaData, GenericInfoCardListingProps } from '@devtron-labs/devtron-fe-common-lib'

import { APP_TYPE } from '@Config/constants'

import { SidebarProps } from '../types'

export interface AppCloneListProps extends Pick<SidebarProps, 'handleCreationMethodChange'> {
    handleCloneAppClick: ({ appId, appName }: BaseAppMetaData) => void
    isJobView?: boolean
}

export type CloneListResponse = {
    type: APP_TYPE.DEVTRON_APPS | APP_TYPE.JOB
    list: GenericInfoCardListingProps['list']
    totalCount: number
}

export interface DevtronAppCloneListProps extends Pick<AppCloneListProps, 'handleCloneAppClick' | 'isJobView'> {
    searchKey: string
}
