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

import { useEffect, useMemo, useRef, useState } from 'react'
import YAML from 'yaml'
import {
    InfoColourBar,
    RJSFForm,
    FormProps,
    GenericEmptyState,
    joinObjects,
    flatMapOfJSONPaths,
    HIDE_SUBMIT_BUTTON_UI_SCHEMA,
    convertJSONPointerToJSONPath,
    OverrideMergeStrategyType,
} from '@devtron-labs/devtron-fe-common-lib'
import { JSONPath } from 'jsonpath-plus'
import EmptyFolderImage from '@Images/Empty-folder.png'
import { ReactComponent as Help } from '@Icons/ic-help.svg'
import { ReactComponent as ICWarningY5 } from '@Icons/ic-warning-y5.svg'
import { ReactComponent as ICArrow } from '@Icons/ic-arrow-forward.svg'
import { GUIViewProps, GUIViewModelType, ViewErrorType } from './types'
import { GUI_VIEW_TEXTS, DEPLOYMENT_TEMPLATE_LABELS_KEYS } from '../constants'
import { getRenderActionButton, makeObjectFromJsonPathArray } from './utils'
import { GUIViewModel, ViewError } from './GUIViewModel'
import GUIViewCheckbox from './GUIViewCheckbox'

const GUIView = ({
    value,
    readOnly,
    editorOnChange,
    hideLockedKeys,
    lockedConfigKeysWithLockType,
    uneditedDocument,
    editedDocument,
    isUnSet,
    handleChangeToYAMLMode,
    guiSchema,
    selectedChart,
    mergeStrategy,
}: GUIViewProps) => {
    const [formData, setFormData] = useState(null)
    const [uncheckedPathsList, setUncheckedPathsList] = useState([])
    const modelRef = useRef<GUIViewModelType>(null)

    useEffect(() => {
        try {
            setFormData(YAML.parse(value))
            if (mergeStrategy === OverrideMergeStrategyType.PATCH && !modelRef.current) {
                modelRef.current = new GUIViewModel(guiSchema, value)
                setUncheckedPathsList(modelRef.current.getUncheckedNodes())
            }
        } catch {
            handleChangeToYAMLMode()
        }

        return () => {
            if (mergeStrategy !== OverrideMergeStrategyType.PATCH) {
                modelRef.current = null
            }
        }
    }, [value, guiSchema, mergeStrategy])

    const state = useMemo(() => {
        try {
            const chartDetailsText = selectedChart ? `${selectedChart.name} / ${selectedChart.version}` : ''
            const parsedGUISchema = JSON.parse(guiSchema)

            if (!Object.keys(parsedGUISchema).length) {
                throw new ViewError(
                    'GUI schema not found',
                    `The GUI view is generated by a schema. Please provide GUI schema for ${chartDetailsText} to show the GUI view`,
                )
            }

            if (modelRef.current && !modelRef.current?.totalCheckedCount) {
                throw new ViewError(
                    'All fields are unselected',
                    'Select fields from the side pane that you wish to be displayed here',
                )
            }

            if (!hideLockedKeys) {
                return {
                    guiSchema: parsedGUISchema,
                    uiSchema: joinObjects([
                        HIDE_SUBMIT_BUTTON_UI_SCHEMA,
                        ...uncheckedPathsList.map((path) =>
                            makeObjectFromJsonPathArray(0, JSONPath.toPathArray(convertJSONPointerToJSONPath(path))),
                        ),
                    ]),
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
                    ...lockedConfigKeysWithLockType.config.flatMap((key) =>
                        // NOTE: we need to use the original document to evaluate the actual paths
                        flatMapOfJSONPaths([key], parsedUneditedDocument)
                            .concat(flatMapOfJSONPaths([key], parsedEditedDocument))
                            .map((path) => makeObjectFromJsonPathArray(0, JSONPath.toPathArray(path))),
                    ),
                    ...uncheckedPathsList.map((path) =>
                        makeObjectFromJsonPathArray(0, JSONPath.toPathArray(convertJSONPointerToJSONPath(path))),
                    ),
                ]),
            }
        } catch (err) {
            if (err instanceof ViewError) {
                return {
                    error: err as ViewErrorType,
                }
            }

            return {
                error: {
                    title: 'Something unexpected happened!',
                    subTitle: err.message ?? 'Something broke while processing the json schema',
                },
            }
        }
    }, [guiSchema, hideLockedKeys, uncheckedPathsList, modelRef.current?.totalCheckedCount])

    const handleFormChange: FormProps['onChange'] = (data) => {
        editorOnChange?.(YAML.stringify(data.formData))
    }

    const updateNodeForPath = (path: string) => {
        if (modelRef.current) {
            const newFormData = modelRef.current.updateNodeForPath({ path, json: formData })
            setUncheckedPathsList(modelRef.current.getUncheckedNodes())
            editorOnChange?.(YAML.stringify(newFormData))
        }
    }

    const renderForm = () => {
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
            <div className="dc__overflow-scroll">
                <RJSFForm
                    schema={state.guiSchema}
                    className={!modelRef.current ? 'dc__mxw-960' : ''}
                    formData={formData || {}}
                    onChange={handleFormChange}
                    uiSchema={state.uiSchema}
                    disabled={readOnly}
                    experimental_defaultFormStateBehavior={{
                        emptyObjectFields: 'skipDefaults',
                    }}
                    liveValidate
                />
            </div>
        )
    }

    return (
        <>
            {isUnSet && (
                <div className="flexbox dc__gap-8 dc__align-items-center code-editor__warning">
                    <ICWarningY5 className="icon-dim-16" />
                    {DEPLOYMENT_TEMPLATE_LABELS_KEYS.codeEditor.warning}
                </div>
            )}

            <div
                className="dc__grid dc__overflow-hidden flex-grow-1"
                style={{
                    gridTemplateColumns: modelRef.current ? '1fr 350px' : '1fr',
                }}
            >
                {renderForm()}
                {modelRef.current && (
                    <div className="dc__overflow-scroll py-20 pl-32 pr-20 flexbox-col dc__gap-12">
                        {modelRef.current.root.children.map((child) => (
                            <GUIViewCheckbox key={child.key} node={child} updateNodeForPath={updateNodeForPath} />
                        ))}
                    </div>
                )}
            </div>

            {!state.error && (
                <InfoColourBar
                    message="To modify additional configurations"
                    classname="dc__content-start ev-2 bw-1 dc__no-border-radius dc__no-bottom-border dc__no-left-border dc__no-right-border bcv-1 bcv-1 w-100 lh-20"
                    Icon={Help}
                    iconClass="fcv-5 icon-dim-20"
                    renderActionButton={getRenderActionButton({ handleChangeToYAMLMode })}
                />
            )}
        </>
    )
}

export default GUIView
