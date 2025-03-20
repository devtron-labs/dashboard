import { BaseAppMetaData } from '@Components/app/types'
import { Dispatch, SetStateAction } from 'react'

export interface AppSelectorType {
    onChange: ({ label, value }) => void
    appId: number
    appName: string
    isJobView?: boolean
    recentlyVisitedDevtronApps?: BaseAppMetaData[]
    setRecentlyVisitedDevtronApps?: Dispatch<SetStateAction<BaseAppMetaData[]>>
}
