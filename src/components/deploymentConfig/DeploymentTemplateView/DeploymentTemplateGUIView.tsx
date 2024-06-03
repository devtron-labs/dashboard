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

import React, { useContext, useMemo } from 'react'
import {
    CustomInput,
    InfoColourBar,
    Progressing,
    Toggle,
    RJSFForm,
    GenericEmptyState,
} from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import YAML from 'yaml'
import { BASIC_FIELDS, DEPLOYMENT_TEMPLATE_LABELS_KEYS, GUI_VIEW_TEXTS } from '../constants'
import { validateBasicView } from '../DeploymentConfig.utils'
import {
    BasicFieldErrorObj,
    DeploymentConfigContextType,
    DeploymentConfigStateActionTypes,
    DeploymentTemplateGUIViewProps,
} from '../types'
import { ReactComponent as Help } from '../../../assets/icons/ic-help.svg'
import { ReactComponent as WarningIcon } from '../../../assets/icons/ic-warning.svg'
import { ReactComponent as ICArrow } from '../../../assets/icons/ic-arrow-forward.svg'
import EmptyFolderImage from '../../../assets/img/Empty-folder.png'
import { DeploymentConfigContext } from '../DeploymentConfig'
import { getRenderActionButton } from '../utils'

const UISchema = {
    'ui:submitButtonOptions': {
        norender: true,
    },
}

const DeploymentTemplateGUIView = ({
    fetchingValues,
    value,
    readOnly,
    guiSchema,
    editorOnChange,
}: DeploymentTemplateGUIViewProps) => {
    const {
        isUnSet,
        state: { chartConfigLoading },
        dispatch,
        changeEditorMode,
    } = useContext<DeploymentConfigContextType>(DeploymentConfigContext)

    const state = useMemo(() => {
        try {
            const parsedGUISchema = JSON.parse(guiSchema)
            if (!Object.keys(parsedGUISchema).length) {
                throw new Error()
            }
            return {
                guiSchema: parsedGUISchema,
            }
        } catch {
            return {
                error: new Error('No GUI schema defined'),
            }
        }
    }, [guiSchema])

    const handleFormChange = (data) => {
        editorOnChange(YAML.stringify(data.formData))
    }

    const renderContent = () => {
        if (chartConfigLoading || !value || fetchingValues) {
            return <Progressing pageLoader />
        }

        if (state.error) {
            return (
                <GenericEmptyState
                    image={EmptyFolderImage}
                    title={state.error.message}
                    subTitle={'To modify configuration, switch to advanced (YAML) view'}
                >
                    <button
                        type="button"
                        className="cta cta-with-img secondary dc__gap-6"
                        onClick={changeEditorMode}
                        aria-label={GUI_VIEW_TEXTS.SWITCH_TO_ADVANCE_BUTTON_TEXT}
                    >
                        <span>{GUI_VIEW_TEXTS.SWITCH_TO_ADVANCE_BUTTON_TEXT}</span>
                        <ICArrow className="icon-dim-16-imp" />
                    </button>
                </GenericEmptyState>
            )
        }

        return (
            <RJSFForm
                className="w-650-px"
                schema={state.guiSchema}
                formData={YAML.parse(value)}
                onChange={handleFormChange}
                uiSchema={UISchema}
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
                className={`form__row--gui-container p-20 flex-grow-1 dc__overflow-scroll ${
                    !isUnSet ? 'gui dc__border-top-n1' : 'gui-with-warning'
                } ${state.error ? 'dc__border-bottom-n1' : ''}`}
            >
                {renderContent()}
            </div>
            {!state.error && (
                <InfoColourBar
                    message="To modify additional configurations"
                    classname="dc__content-start en-2 bw-1 dc__no-left-border dc__no-right-border bcv-1 bcv-1 w-100 switch-to-advance-info-bar"
                    Icon={Help}
                    iconClass="fcv-5 icon-dim-20"
                    renderActionButton={getRenderActionButton(changeEditorMode)}
                />
            )}
        </>
    )
}

export default DeploymentTemplateGUIView
