import { ChangeCIPayloadType } from '../workflowEditor/types'

// Have added any type for most of these since they were legacy do not know the implications of changing them
export interface NewCDPipelineProps {
    match: any
    location: any
    appName: any
    close: any
    getWorkflows: any
    refreshParentWorkflows: any
    envIds: any
    isLastNode: any
    changeCIPayload?: ChangeCIPayloadType
}
