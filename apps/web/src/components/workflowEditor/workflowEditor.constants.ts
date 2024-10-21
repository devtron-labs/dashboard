/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { PipelineType } from '@devtron-labs/devtron-fe-common-lib'
import ci from '../../assets/icons/ic-source-build.svg'
import linkedPipeline from '../../assets/icons/ic-source-linked-build.svg'
import webhook from '../../assets/icons/ic-source-webhook.svg'
import ciJobIcon from '../../assets/icons/ic-source-job.svg'
import { CIPipelineNodeType } from '../app/details/triggerView/types'

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
    CHANGE_CI_TEXT: 'Change image source',
    CHANGE_CI_NOTE: 'Deploy to environments in the workflow from another image source',
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
export const CHANGE_SAME_CI = 'Cannot change to same source type'
export const REQUEST_IN_PROGRESS = 'Request in progress'

export const TOAST_MESSAGES = {
    SUCCESS_CHANGE_TO_WEBHOOK: 'Successfully changed CI to webhook',
    WORKFLOW_NOT_AVAILABLE: 'Selected workflow not available',
}

export const CHANGE_CI_TOOLTIP = {
    TITLE: 'Change image source',
    DISABLED: 'Can not change image source since no image source is present.',
}
