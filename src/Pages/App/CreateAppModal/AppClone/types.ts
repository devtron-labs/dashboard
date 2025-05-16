import { BaseAppMetaData } from '@devtron-labs/devtron-fe-common-lib'

import { JobList } from '@Components/Jobs/Types'
import { AppListMin } from '@Services/service.types'

export interface AppCloneListProps {
    handleCloneAppClick: ({ appId, appName }: BaseAppMetaData) => void
    isJobView?: boolean
}

export type DevtronListResponse = { type: 'job'; data: JobList } | { type: 'app'; data: AppListMin }
