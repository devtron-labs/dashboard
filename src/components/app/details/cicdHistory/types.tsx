import { TERMINAL_STATUS_MAP } from '../../../../config'
import { CIPipeline } from '../cIDetails/types'


export interface WebHookData {
  Id: number
  EventActionType: string
  Data: any
}

export interface History {
    id: number
    name: string
    status: string
    podStatus: string
    message: string
    startedOn: string
    finishedOn: string
    ciPipelineId: number
    namespace: string
    logLocation: string
    gitTriggers: Map<number, GitTriggers>
    ciMaterials: CiMaterial[]
    triggeredBy: number
    artifact: string
    artifactId: number
    triggeredByEmail: string
    stage?: 'POST' | 'DEPLOY' | 'PRE'
    blobStorageEnabled?: boolean
}

export interface CiMaterial {
    id: number
    gitMaterialId: number
    gitMaterialUrl: string
    gitMaterialName: string
    type: string
    value: string
    active: boolean
    lastFetchTime: string
    isRepoError: boolean
    repoErrorMsg: string
    isBranchError: boolean
    branchErrorMsg: string
    url: string
}

export interface GitTriggers {
    Commit: string
    Author: string
    Date: Date
    Message: string
    Changes: string[]
    WebhookData: WebHookData
    GitRepoUrl: string
    GitRepoName: string
    CiConfigureSourceType: string
    CiConfigureSourceValue: string
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