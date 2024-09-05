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

import { useEffect, useMemo, useState } from 'react'
import YAML from 'yaml'
import {
    InfoColourBar,
    Progressing,
    RJSFForm,
    FormProps,
    GenericEmptyState,
    joinObjects,
    flatMapOfJSONPaths,
    HIDE_SUBMIT_BUTTON_UI_SCHEMA,
    useDeploymentTemplateContext,
    DeploymentConfigStateActionTypes,
} from '@devtron-labs/devtron-fe-common-lib'
import { JSONPath } from 'jsonpath-plus'
import { DEPLOYMENT_TEMPLATE_LABELS_KEYS, GUI_VIEW_TEXTS } from '../constants'
import { DeploymentTemplateGUIViewProps } from '../types'
import { ReactComponent as Help } from '../../../assets/icons/ic-help.svg'
import { ReactComponent as WarningIcon } from '../../../assets/icons/ic-warning.svg'
import { ReactComponent as ICArrow } from '../../../assets/icons/ic-arrow-forward.svg'
import EmptyFolderImage from '../../../assets/img/Empty-folder.png'
import { getRenderActionButton, makeObjectFromJsonPathArray } from '../utils'

const DeploymentTemplateGUIView = ({
    value,
    readOnly,
    editorOnChange,
    hideLockedKeys,
    lockedConfigKeysWithLockType,
    uneditedDocument,
    editedDocument,
}: DeploymentTemplateGUIViewProps) => {
    const {
        isUnSet,
        state: { chartConfigLoading, guiSchema, selectedChart, wasGuiOrHideLockedKeysEdited },
        dispatch,
        handleChangeToYAMLMode,
    } = useDeploymentTemplateContext()
    const [formData, setFormData] = useState(null)

    useEffect(() => {
        try {
            setFormData(YAML.parse(value))
        } catch {
            handleChangeToYAMLMode()
        }
    }, [value])

    const state = useMemo(() => {
        try {
            const parsedGUISchema = JSON.parse(guiSchema)
            if (!Object.keys(parsedGUISchema).length) {
                throw new Error()
            }
            if (!hideLockedKeys) {
                return {
                    guiSchema: parsedGUISchema,
                    uiSchema: HIDE_SUBMIT_BUTTON_UI_SCHEMA,
                }
            }
            // Note: if the locked keys are not resolved from the following json(s)
            // then the logic to hide them will not work
            const parsedUneditedDocument = YAML.parse(uneditedDocument)
            const parsedEditedDocument = YAML.parse(editedDocument)
            // NOTE: suppose we lock ingress.hosts[1].host, and the locked key's path is
            // resolved from either of the above json(s) then host field from all array entries
            // will be hidden not just the host field at index 1 (limitation)
            return {
                guiSchema: parsedGUISchema,
                uiSchema: joinObjects([
                    HIDE_SUBMIT_BUTTON_UI_SCHEMA,
                    ...lockedConfigKeysWithLockType.config.flatMap((key) => {
                        // NOTE: we need to use the original document to evaluate the actual paths
                        return flatMapOfJSONPaths([key], parsedUneditedDocument)
                            .concat(flatMapOfJSONPaths([key], parsedEditedDocument))
                            .map((path) => {
                                return makeObjectFromJsonPathArray(0, JSONPath.toPathArray(path))
                            })
                    }),
                ]),
            }
        } catch {
            return {
                error: {
                    title: 'GUI schema not found',
                    subTitle: `The GUI view is generated by a schema. Please provide GUI schema for ${selectedChart?.name} / ${selectedChart?.version} to show the GUI view`,
                },
            }
        }
    }, [guiSchema, hideLockedKeys])

    const handleFormChange: FormProps['onChange'] = (data) => {
        if (!wasGuiOrHideLockedKeysEdited) {
            dispatch({ type: DeploymentConfigStateActionTypes.wasGuiOrHideLockedKeysEdited, payload: true })
        }
        editorOnChange?.(YAML.stringify(data.formData))
    }

    const renderContent = () => {
        // TODO: Can remove
        if (chartConfigLoading) {
            return <Progressing pageLoader />
        }

        if (state.error) {
            return (
                <GenericEmptyState image={EmptyFolderImage} {...state.error}>
                    <button
                        type="button"
                        className="cta cta-with-img secondary dc__gap-6"
                        onClick={handleChangeToYAMLMode}
                        aria-label={GUI_VIEW_TEXTS.SWITCH_TO_ADVANCE_BUTTON_TEXT}
                    >
                        <span>{GUI_VIEW_TEXTS.SWITCH_TO_ADVANCE_BUTTON_TEXT}</span>
                        <ICArrow className="icon-dim-16-imp dc__no-shrink" />
                    </button>
                </GenericEmptyState>
            )
        }

        return (
            <RJSFForm
                className="w-650-px"
                schema={state.guiSchema}
                formData={formData || {}}
                onChange={handleFormChange}
                uiSchema={state.uiSchema}
                disabled={readOnly}
                experimental_defaultFormStateBehavior={{
                    emptyObjectFields: 'skipDefaults',
                }}
                liveValidate
            />
        )
    }

    return (
        <>
            {isUnSet && (
                <div className="bcy-1 fs-12 fw-4 cn-9 en-2 bw-1 dc__no-left-border dc__no-right-border flexbox pt-8 pr-16 pb-8 pl-16 h-32 lh-16">
                    <WarningIcon className="warning-icon-y7 icon-dim-16 mr-8" />
                    {DEPLOYMENT_TEMPLATE_LABELS_KEYS.codeEditor.warning}
                </div>
            )}

            <div
                className={`form__row--gui-container dc__overflow-scroll ${
                    !isUnSet ? 'gui dc__border-top-n1' : 'gui-with-warning'
                } ${state.error ? 'dc__border-bottom-n1 gui--no-infobar' : ''}`}
            >
                {renderContent()}
            </div>

            {/* In case of readOnly makes no sense */}
            {!state.error && (
                <InfoColourBar
                    message="To modify additional configurations"
                    classname="dc__content-start en-2 bw-1 dc__no-left-border dc__no-right-border bcv-1 bcv-1 w-100 switch-to-advance-info-bar"
                    Icon={Help}
                    iconClass="fcv-5 icon-dim-20"
                    renderActionButton={getRenderActionButton(handleChangeToYAMLMode)}
                />
            )}
        </>
    )
}

export default DeploymentTemplateGUIView
