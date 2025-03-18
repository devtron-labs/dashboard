import { AppHeaderType } from '@Components/app/types'

export interface AppSelectorType extends Partial<Pick<AppHeaderType, 'recentlyVisitedDevtronApps'>> {
    onChange: ({ label, value }) => void
    appId: number
    appName: string
    isJobView?: boolean
}
