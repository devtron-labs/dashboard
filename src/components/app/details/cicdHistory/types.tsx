import { TERMINAL_STATUS_MAP } from '../../../../config'
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

export const TERMINAL_STATUS_COLOR_CLASS_MAP = {
  [TERMINAL_STATUS_MAP.SUCCEEDED]: 'cg-5',
  [TERMINAL_STATUS_MAP.HEALTHY]: 'cg-5',
  [TERMINAL_STATUS_MAP.FAILED]: 'cr-5',
  [TERMINAL_STATUS_MAP.ERROR]: 'cr-5',
}

export const PROGRESSING_STATUS = {
  [TERMINAL_STATUS_MAP.RUNNING]: 'running',
  [TERMINAL_STATUS_MAP.PROGRESSING]: 'progressing',
  [TERMINAL_STATUS_MAP.STARTING]: 'starting',
}