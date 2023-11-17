import ci from '../../assets/img/ic-pipeline-ci@2x.png'
import linkedPipeline from '../../assets/icons/ic-pipeline-linked.svg'
import webhook from '../../assets/img/webhook.svg'
import ciJobIcon from '../../assets/icons/ic-job-node.svg'
import { CIPipelineNodeType, PipelineType } from '../app/details/triggerView/types'

export const WORKFLOW_EDITOR_HEADER_TIPPY = {
    HEADING: 'Workflow Editor',
    INFO_TEXT: {
        JOB_VIEW:
            'Configure job pipelines to be executed. Pipelines can be configured to be triggered automatically based on code change or time.',
        DEFAULT: 'Workflow consist of pipelines from build to deployment stages of an application.',
    },
    DOCUMENTATION_LINK_TEXT: 'Learn more',
}

export const WORKFLOW_OPTIONS_MODAL = {
    ACTION_TEXT: 'Select an image source for new workflow',
    ACTION_NOTE: 'You can switch between image sources later',
}

export const WORKFLOW_OPTIONS_MODAL_TYPES = {
    DEFAULT: 'Build Container Image',
    RECIEVE: 'Receive Container Image',
    JOB: 'Create job pipeline',
}

export const SOURCE_TYPE_CARD_VARIANTS = {
    SOURCE_CODE: {
        title: 'Build and Deploy from Source Code',
        subtitle: 'Build container image from a Git repo and deploy to an environment.',
        image: ci,
        alt: 'CI',
        dataTestId: 'build-deploy-from-source-code-button',
        type: CIPipelineNodeType.CI,
    },
    LINKED_PIPELINE: {
        title: 'Linked Build Pipeline',
        subtitle: 'Use image built by another build pipeline within Devtron.',
        image: linkedPipeline,
        alt: 'Linked-CI',
        dataTestId: 'linked-build-pipeline-button',
        type: CIPipelineNodeType.LINKED_CI,
    },
    EXTERNAL_SERVICE: {
        title: 'Deploy Image from External Service',
        subtitle: 'Receive images from an external service (eg. jenkins) and deploy to an environment.',
        image: webhook,
        alt: 'External-CI',
        dataTestId: 'deploy-image-external-service-link',
        type: PipelineType.WEBHOOK,
    },
    JOB: {
        title: 'Create a Job',
        subtitle: 'Create and trigger a job. Such as trigger Jenkins build trigger',
        image: ciJobIcon,
        alt: 'Job-CI',
        dataTestId: 'job-ci-pipeline-button',
        type: CIPipelineNodeType.JOB_CI,
    },
}

export const NO_ENV_FOUND = 'No environment found. Please create a CD Pipeline first.'

export const TOAST_MESSAGES = {
    SUCCESS_CHANGE_TO_WEBHOOK: 'Successfully changed CI to webhook',
}
