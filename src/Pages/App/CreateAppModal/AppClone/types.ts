import { BaseAppMetaData } from '@devtron-labs/devtron-fe-common-lib'

export interface AppCloneListProps {
    handleCloneAppClick: ({ appId, appName }: BaseAppMetaData) => void
    isJobView?: boolean
}
