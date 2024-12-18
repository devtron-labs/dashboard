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
    OverrideMergeStrategyType,
    GUIViewError,
    ToastManager,
    ToastVariantType,
} from '@devtron-labs/devtron-fe-common-lib'
import { JSONPath } from 'jsonpath-plus'
import EmptyFolderImage from '@Images/Empty-folder.png'
import { ReactComponent as Help } from '@Icons/ic-help.svg'
import { ReactComponent as ICWarningY5 } from '@Icons/ic-warning-y5.svg'
import { ReactComponent as ICArrow } from '@Icons/ic-arrow-forward.svg'
import { importComponentFromFELibrary } from '@Components/common'
import { GUIViewProps, GUIViewState } from './types'
import { GUI_VIEW_TEXTS, DEPLOYMENT_TEMPLATE_LABELS_KEYS } from '../constants'
import { getRenderActionButton } from './utils'

const makeObjectFromJsonPathArray = importComponentFromFELibrary('makeObjectFromJsonPathArray', null, 'function')
const ConfigurableGUIViewPanel = importComponentFromFELibrary('ConfigurableGUIViewPanel', null, 'function')
const ConfigurableGUIViewModel = importComponentFromFELibrary('ConfigurableGUIViewModel', null, 'function')

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
    const [configurableGUIViewUISchema, setConfigurableGUIViewUISchema] = useState<object>({})
    const [invalidGUISchemaError, setInvalidGUISchemaError] = useState<GUIViewError | null>(null)
    const modelRef = useRef<typeof ConfigurableGUIViewModel>(null)

    // NOTE: need this ref since we need the updated formData on unmount;
    // if we directly use formData in cleanup function of unmount; we will have a stale reference of formData
    const formDataRef = useRef<object>(null)

    useEffect(() => {
        try {
            const parsedValue = YAML.parse(value)

            setFormData(parsedValue)
            formDataRef.current = parsedValue

            if (ConfigurableGUIViewModel && !modelRef.current && mergeStrategy === OverrideMergeStrategyType.PATCH) {
                modelRef.current = new ConfigurableGUIViewModel(guiSchema, value)
                setConfigurableGUIViewUISchema(modelRef.current.getUISchema())
            }
        } catch (err) {
            if (err instanceof GUIViewError) {
                setInvalidGUISchemaError(err)
            } else {
                handleChangeToYAMLMode()

                ToastManager.showToast({
                    variant: ToastVariantType.warn,
                    description: 'Redirecting to yaml view due to empty/malformed yaml',
                })
            }
        }
    }, [value, guiSchema])

    const state: GUIViewState = useMemo(() => {
        if (invalidGUISchemaError) {
            return { error: invalidGUISchemaError } as GUIViewState
        }

        try {
            const chartDetailsText = selectedChart ? `${selectedChart.name} / ${selectedChart.version}` : ''
            const parsedGUISchema = JSON.parse(guiSchema)

            if (!Object.keys(parsedGUISchema).length) {
                throw new GUIViewError(
                    'GUI schema not found',
                    `The GUI view is generated by a schema. Please provide GUI schema for ${chartDetailsText} to show the GUI view`,
                )
            }

            if (modelRef.current && !modelRef.current.totalCheckedCount) {
                throw new GUIViewError(
                    'All fields are unselected',
                    'Select fields from the side pane that you wish to be displayed here',
                )
            }

            if (!makeObjectFromJsonPathArray || !hideLockedKeys || mergeStrategy === OverrideMergeStrategyType.PATCH) {
                return {
                    guiSchema: parsedGUISchema,
                    uiSchema: joinObjects([HIDE_SUBMIT_BUTTON_UI_SCHEMA, configurableGUIViewUISchema]),
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
                            .filter((path) => !!path)
                            .map((path) => makeObjectFromJsonPathArray(0, JSONPath.toPathArray(path))),
                    ),
                    configurableGUIViewUISchema,
                ]),
            }
        } catch (err) {
            if (err instanceof GUIViewError) {
                return {
                    error: err,
                }
            }

            return {
                error: {
                    title: 'Something unexpected happened!',
                    subTitle: (err.message as string) ?? 'Something broke while processing the json schema',
                } as GUIViewError,
            }
        }
    }, [guiSchema, hideLockedKeys, configurableGUIViewUISchema, invalidGUISchemaError])

    const handleFormChange: FormProps['onChange'] = (data) => {
        editorOnChange(YAML.stringify(data.formData))
    }

    const updateNodeForPath = (path: string) => {
        if (modelRef.current) {
            const newFormData = modelRef.current.updateNodeForPath({ path, json: formData })
            setConfigurableGUIViewUISchema(modelRef.current.getUISchema())
            editorOnChange(YAML.stringify(newFormData))
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
                    <ICWarningY5 className="icon-dim-16 dc__no-shrink" />
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
                {modelRef.current && ConfigurableGUIViewPanel && (
                    <ConfigurableGUIViewPanel
                        disabled={readOnly}
                        node={modelRef.current.root}
                        updateNodeForPath={updateNodeForPath}
                    />
                )}
            </div>

            {!state.error && (
                <InfoColourBar
                    message="To modify additional configurations"
                    classname="dc__content-start ev-2 bw-1 dc__no-border-radius dc__no-bottom-border dc__no-left-border dc__no-right-border bcv-1 bcv-1 w-100 lh-20"
                    Icon={Help}
                    iconClass="fcv-5 icon-dim-20 dc__no-shrink"
                    renderActionButton={getRenderActionButton({ handleChangeToYAMLMode })}
                />
            )}
        </>
    )
}

export default GUIView