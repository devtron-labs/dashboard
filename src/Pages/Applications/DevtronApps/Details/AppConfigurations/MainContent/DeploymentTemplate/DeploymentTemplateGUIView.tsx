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
    RJSFForm,
    FormProps,
    GenericEmptyState,
    joinObjects,
    flatMapOfJSONPaths,
    HIDE_SUBMIT_BUTTON_UI_SCHEMA,
    Button,
    ButtonVariantType,
} from '@devtron-labs/devtron-fe-common-lib'
import { JSONPath } from 'jsonpath-plus'
import EmptyFolderImage from '@Images/Empty-folder.png'
import { ReactComponent as Help } from '@Icons/ic-help.svg'
import { ReactComponent as WarningIcon } from '@Icons/ic-warning.svg'
import { ReactComponent as ICArrow } from '@Icons/ic-arrow-forward.svg'
import { DeploymentTemplateGUIViewProps } from './types'
import { GUI_VIEW_TEXTS, DEPLOYMENT_TEMPLATE_LABELS_KEYS } from './constants'
import { makeObjectFromJsonPathArray } from './utils'

export const getRenderActionButton =
    ({ handleChangeToYAMLMode }: Pick<DeploymentTemplateGUIViewProps, 'handleChangeToYAMLMode'>) =>
    () => (
        <Button
            dataTestId="base-deployment-template-switchtoadvanced-button"
            text="Switch to Advanced"
            onClick={handleChangeToYAMLMode}
            variant={ButtonVariantType.text}
        />
    )

const DeploymentTemplateGUIView = ({
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
    rootClassName,
}: DeploymentTemplateGUIViewProps) => {
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
                    ...lockedConfigKeysWithLockType.config.flatMap((key) =>
                        // NOTE: we need to use the original document to evaluate the actual paths
                        flatMapOfJSONPaths([key], parsedUneditedDocument)
                            .concat(flatMapOfJSONPaths([key], parsedEditedDocument))
                            .map((path) => makeObjectFromJsonPathArray(0, JSONPath.toPathArray(path))),
                    ),
                ]),
            }
        } catch {
            const chartDetailsText = selectedChart ? `${selectedChart.name} / ${selectedChart.version}` : ''

            return {
                error: {
                    title: 'GUI schema not found',
                    subTitle: `The GUI view is generated by a schema. Please provide GUI schema for ${chartDetailsText} to show the GUI view`,
                },
            }
        }
    }, [guiSchema, hideLockedKeys])

    const handleFormChange: FormProps['onChange'] = (data) => {
        editorOnChange?.(YAML.stringify(data.formData))
    }

    const renderContent = () => {
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
                className="w-650"
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

    const guiContainerClassName = rootClassName
        ? `${rootClassName} dc__overflow-scroll ${
              !isUnSet ? 'gui dc__border-top-n1' : 'gui-with-warning'
          } ${state.error ? 'dc__border-bottom-n1 gui--no-infobar' : ''}`
        : `form__row--gui-container dc__overflow-scroll ${
              !isUnSet ? 'gui dc__border-top-n1' : 'gui-with-warning'
          } ${state.error ? 'dc__border-bottom-n1 gui--no-infobar' : ''}`

    return (
        <>
            {isUnSet && (
                <div className="bcy-1 fs-12 fw-4 cn-9 en-2 bw-1 dc__no-left-border dc__no-right-border flexbox pt-8 pr-16 pb-8 pl-16 h-32 lh-16">
                    <WarningIcon className="warning-icon-y7 icon-dim-16 mr-8" />
                    {DEPLOYMENT_TEMPLATE_LABELS_KEYS.codeEditor.warning}
                </div>
            )}

            <div className={guiContainerClassName}>{renderContent()}</div>

            {!state.error && (
                <InfoColourBar
                    message="To modify additional configurations"
                    classname="dc__content-start en-2 bw-1 dc__no-left-border dc__no-right-border bcv-1 bcv-1 w-100 lh-20"
                    Icon={Help}
                    iconClass="fcv-5 icon-dim-20"
                    renderActionButton={getRenderActionButton({ handleChangeToYAMLMode })}
                />
            )}
        </>
    )
}

export default DeploymentTemplateGUIView
