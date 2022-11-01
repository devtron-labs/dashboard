import { TokenListType } from "../../apiTokens/authorization.type"

export interface WebhookDetailType {
  getWorkflows: () => void
  close: () => void
  deleteWorkflow: (appId?: string, workflowId?: number) => any
}

export interface TabDetailsType {
  key: string
  value: string
}

export interface TokenListOptionsType extends TokenListType {
  label: string
  value: string
}

export interface TokenPermissionType {
  projectName: string
  environmentName: string
  appName: string
  role: string
}

export interface MetadataType {
  key: string
  keyInObj: string[]
  displayName: string
  isSelected: boolean
  readOnly: boolean
}