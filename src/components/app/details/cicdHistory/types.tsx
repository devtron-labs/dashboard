import { CIPipeline } from '../cIDetails/types'

export interface BuildDetails {
    triggerHistory: Map<number, History>
    pipeline: CIPipeline
    fullScreenView: boolean
    setFullScreenView: React.Dispatch<React.SetStateAction<boolean>>
    synchroniseState: (triggerId: number, triggerDetails: History) => void
    isSecurityModuleInstalled: boolean
    isBlobStorageConfigured: boolean
}