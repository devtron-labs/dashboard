import { BaseAppMetaData } from '@devtron-labs/devtron-fe-common-lib'

import { JobList } from '@Components/Jobs/Types'
import { APP_TYPE } from '@Config/constants'
import { AppListMin } from '@Services/service.types'

import { SidebarProps } from '../types'

export interface AppCloneListProps extends Pick<SidebarProps, 'handleCreationMethodChange'> {
    handleCloneAppClick: ({ appId, appName }: BaseAppMetaData) => void
    isJobView?: boolean
}

export type DevtronListResponse =
    | { type: APP_TYPE.JOB; data: JobList }
    | { type: APP_TYPE.DEVTRON_APPS; data: AppListMin }

export interface DevtronAppCloneListProps extends Pick<AppCloneListProps, 'handleCloneAppClick' | 'isJobView'> {}
