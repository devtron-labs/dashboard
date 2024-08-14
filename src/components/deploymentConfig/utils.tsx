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

import { applyCompareDiffOnUneditedDocument, ResponseType, YAMLStringify } from '@devtron-labs/devtron-fe-common-lib'
import YAML from 'yaml'
import { DeploymentTemplateOptionsTabProps } from './types'
import fallbackGuiSchema from './basicViewSchema.json'
import fallbackJobsNCronJobGuiSchema from './fallbackJobsNCronJobGuiSchema.json'
import { DEPLOYMENT, JOB_AND_CRONJOB_CHART_NAME, ROLLOUT_DEPLOYMENT, STATEFUL_SET } from './constants'

export const getRenderActionButton =
    (changeEditorMode: DeploymentTemplateOptionsTabProps['changeEditorMode']) => () => (
        <button
            type="button"
            className="dc__unset-button-styles"
            onClick={changeEditorMode}
            data-testid="base-deployment-template-switchtoadvanced-button"
        >
            <span className="cb-5 cursor fw-6">Switch to Advanced</span>
        </button>
    )

const getGuiSchemaFromChartName = (chartName: string) => {
    switch (chartName) {
        case JOB_AND_CRONJOB_CHART_NAME:
            return fallbackJobsNCronJobGuiSchema
        case DEPLOYMENT:
        case ROLLOUT_DEPLOYMENT:
        case STATEFUL_SET:
            return fallbackGuiSchema
        default:
            return {}
    }
}

export const addGUISchemaIfAbsent = (response: ResponseType, chartName: string) => {
    if (response && response.result && !response.result.guiSchema) {
        return {
            ...response,
            result: {
                ...response.result,
                guiSchema: JSON.stringify(getGuiSchemaFromChartName(chartName)),
            },
        }
    }
    return response
}

export const makeObjectFromJsonPathArray = (index: number, paths: string[]) => {
    if (index >= paths.length) {
        return {
            'ui:widget': 'hidden',
        }
    }
    if (paths[index] === '$') {
        return makeObjectFromJsonPathArray(index + 1, paths)
    }
    const key = paths[index]
    const isKeyNumber = !Number.isNaN(Number(key))
    if (isKeyNumber) {
        return { items: makeObjectFromJsonPathArray(index + 1, paths) }
    }
    return { [key]: makeObjectFromJsonPathArray(index + 1, paths) }
}

export const applyCompareDiffOfTempFormDataOnOriginalData = (
    unedited: string,
    edited: string,
    updateTempFormData?: (data: string) => void,
) => {
    const updated = applyCompareDiffOnUneditedDocument(YAML.parse(unedited), YAML.parse(edited))
    updateTempFormData?.(YAMLStringify(updated))
    return updated
}
