export interface LinkedCIDetailModalProps {
    ciPipelineName: string
    ciPipelineId: string
    linkedWorkflowCount: number
    onCloseUrl: string
}
export interface LinkedCIAppDto {
    appId: number
    appName: string
    deploymentStatus: string
    environmentId: number
    environmentName: string
    triggerMode: string
}
