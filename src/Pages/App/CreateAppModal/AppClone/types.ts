import { BaseAppMetaData } from '@devtron-labs/devtron-fe-common-lib'

import { JobList } from '@Components/Jobs/Types'
import { AppListMin } from '@Services/service.types'

import { SidebarProps } from '../types'

export interface AppCloneListProps extends Pick<SidebarProps, 'handleCreationMethodChange'> {
    handleCloneAppClick: ({ appId, appName }: BaseAppMetaData) => void
    isJobView?: boolean
}

export type DevtronListResponse = { type: 'job'; data: JobList } | { type: 'app'; data: AppListMin }

export interface DevtronAppCloneListProps extends Pick<AppCloneListProps, 'handleCloneAppClick' | 'isJobView'> {}
