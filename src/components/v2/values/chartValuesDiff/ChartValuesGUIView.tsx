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

import React, { useMemo, useState } from 'react'
import {
    Progressing,
    GenericEmptyState,
    RJSFForm,
    HIDE_SUBMIT_BUTTON_UI_SCHEMA,
    EMPTY_STATE_STATUS,
    showError,
} from '@devtron-labs/devtron-fe-common-lib'
import { compare as JSONPatchCompare } from 'fast-json-patch'
import { ReactComponent as ICError } from '@Icons/ic-error-exclamation.svg'
import { UpdateApplicationButton } from './ChartValuesView.component'
import { ChartValuesGUIFormProps } from './ChartValuesView.type'
import { updateYamlDocument } from './ChartValuesView.utils'

// TODO: add support for Slider in RJSF

const ChartValuesGUIForm = ({
    schemaJson,
    fetchingSchemaJson,
    valuesYamlDocument,
    dispatch,
    isDeleteInProgress,
    isDeployChartView,
    isCreateValueView,
    openReadMe,
    isUpdateInProgress,
    deployOrUpdateApplication,
}: ChartValuesGUIFormProps): JSX.Element => {
    const [formData, setFormData] = useState(valuesYamlDocument?.toJS() ?? {})

    const state = useMemo(() => {
        try {
            if (schemaJson) {
                return {
                    json: JSON.parse(schemaJson),
                }
            }
            throw Error('No json schema found!')
        } catch (error) {
            return {
                error,
            }
        }
    }, [schemaJson])

    const handleFormUpdate: React.ComponentProps<typeof RJSFForm>['onChange'] = ({ formData: currentData }) => {
        // NOTE: adding a try catch block for safety, even though it should not fail
        try {
            const operations = JSONPatchCompare(formData, currentData)
            updateYamlDocument(operations, formData, valuesYamlDocument, dispatch)
        } catch (err) {
            showError(err)
        }
        setFormData(currentData)
    }

    if (fetchingSchemaJson) {
        return <Progressing size={32} fullHeight />
    }

    if (!schemaJson || state.error) {
        return (
            <GenericEmptyState
                SvgImage={ICError}
                title={state.error.message}
                subTitle={EMPTY_STATE_STATUS.CHART_VALUES_GUIT_VIEW.SUBTITLE}
            />
        )
    }

    return (
        // TODO: look at css
        <div
            className={`chart-values-view__gui-form-container ${
                !isDeployChartView && !isCreateValueView ? 'values-update-view' : ''
            } ${openReadMe ? 'chart-values-view__full-mode' : ''}`}
        >
            <RJSFForm
                schema={state.json}
                uiSchema={HIDE_SUBMIT_BUTTON_UI_SCHEMA}
                formData={formData}
                onChange={handleFormUpdate}
                experimental_defaultFormStateBehavior={{
                    emptyObjectFields: 'skipDefaults',
                }}
            />
            {/* // TODO: how to update the schema? */}
            <UpdateApplicationButton
                isUpdateInProgress={isUpdateInProgress}
                isDeleteInProgress={isDeleteInProgress}
                isDeployChartView={isDeployChartView}
                isCreateValueView={isCreateValueView}
                deployOrUpdateApplication={deployOrUpdateApplication}
            />
        </div>
    )
}

export default ChartValuesGUIForm
