import { MultiValue } from "react-select"
import { ResponseType } from "../../services/service.types"
import { OptionType } from "../app/types"
import { ActionResponse } from "../external-apps/ExternalAppService"

export interface OptionTypeWithIcon {
    label: string
    value: any
    icon: string
}

export interface MonitoringTool {
    id: number
    name: string
    icon: string
}

export interface ExternalLink {
    id?: number
    monitoringToolId: number
    name: string
    url: string
    clusterIds: string[]
}

export interface LinkAction {
    tool: OptionTypeWithIcon
    invalidTool?: boolean
    name: string
    invalidName?: boolean
    clusters: MultiValue<OptionType>
    invalidClusters?: boolean
    urlTemplate: string
    invalidUrlTemplate?: boolean
}

export interface ConfigureLinkActionType {
    index: number
    link: LinkAction
    showDelete: boolean
    clusters: MultiValue<OptionType>
    selectedClusters: MultiValue<OptionType>
    monitoringTools: MultiValue<OptionTypeWithIcon>
    onMonitoringToolSelection: (key: number, selected: OptionType) => void
    onClusterSelection: (key: number, selected: MultiValue<OptionType>) => void
    onNameChange: (key: number, name: string) => void,
    onUrlTemplateChange: (key: number, urlTemplate: string) => void,
    deleteLinkData: (key: number) => void
}

export interface MonitoringToolResponse extends ResponseType {
    result?: MonitoringTool[]
}

export interface ExternalLinkResponse extends ResponseType {
    result?: ExternalLink[]
}

export interface ExternalLinkUpdateResponse extends ResponseType {
    result?: ActionResponse
}