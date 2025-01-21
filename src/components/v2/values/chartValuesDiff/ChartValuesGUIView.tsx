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
    InfoColourBar,
} from '@devtron-labs/devtron-fe-common-lib'
import { compare as JSONPatchCompare } from 'fast-json-patch'
import { ReactComponent as ICInfoFilled } from '@Icons/ic-info-filled.svg'
import { ReactComponent as ICError } from '@Icons/ic-error-exclamation.svg'
import { ChartValuesGUIFormProps } from './ChartValuesView.type'
import { updateYamlDocument } from './ChartValuesView.utils'

const ChartValuesGUIForm = ({
    schemaJson,
    fetchingSchemaJson,
    valuesYamlDocument,
    dispatch,
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
        <div className="chart-values-view__gui-form-container dc__overflow-auto">
            <InfoColourBar
                classname="info_bar dc__no-border-radius dc__no-top-border dc__no-right-border dc__no-left-border"
                Icon={ICInfoFilled}
                message={
                    <span className="fs-12 cn-9">
                        This feature is in BETA. If you find an issue please&nbsp;
                        <a
                            className="cb-5 fw-6"
                            href="https://github.com/devtron-labs/devtron/issues/new/choose"
                            target="_blank"
                            rel="noreferrer"
                        >
                            report it here.
                        </a>
                    </span>
                }
            />
            <RJSFForm
                key={state.json}
                schema={state.json}
                uiSchema={HIDE_SUBMIT_BUTTON_UI_SCHEMA}
                formData={formData}
                onChange={handleFormUpdate}
                experimental_defaultFormStateBehavior={{
                    emptyObjectFields: 'skipDefaults',
                }}
            />
        </div>
    )
}

export default ChartValuesGUIForm
