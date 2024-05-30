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

import React, { useContext, useRef } from 'react'
import { CustomInput, InfoColourBar, Progressing, Toggle, RJSFForm } from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import YAML from 'yaml'
import { BASIC_FIELDS, DEPLOYMENT_TEMPLATE_LABELS_KEYS } from '../constants'
import { validateBasicView } from '../DeploymentConfig.utils'
import {
    BasicFieldErrorObj,
    DeploymentConfigContextType,
    DeploymentConfigStateActionTypes,
    DeploymentTemplateGUIViewProps,
} from '../types'
import { ReactComponent as Help } from '../../../assets/icons/ic-help.svg'
import { ReactComponent as Add } from '../../../assets/icons/ic-add.svg'
import { ReactComponent as AlertTriangle } from '../../../assets/icons/ic-alert-triangle.svg'
import { ReactComponent as WarningIcon } from '../../../assets/icons/ic-warning.svg'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import { DeploymentConfigContext } from '../DeploymentConfig'
import { getRenderActionButton } from '../utils'

const uiSchema = {
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
    const { isUnSet, state, dispatch, changeEditorMode } =
        useContext<DeploymentConfigContextType>(DeploymentConfigContext)

    const handleFormChange = (data) => {
        editorOnChange(YAML.stringify(data.formData))
    }

    const renderContent = () => {
        if (state.chartConfigLoading || !value || fetchingValues) {
            return <Progressing pageLoader />
        }

        return (
            <RJSFForm
                className="w-650-px"
                schema={guiSchema}
                formData={YAML.parse(value)}
                onChange={handleFormChange}
                uiSchema={uiSchema}
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
                className={`form__row--gui-container p-20 scrollable ${
                    !isUnSet ? 'gui dc__border-top-n1' : 'gui-with-warning'
                }`}
            >
                {renderContent()}
            </div>
            <InfoColourBar
                message="To modify additional configurations"
                classname="dc__content-start en-2 bw-1 dc__no-left-border dc__no-right-border bcv-1 bcv-1 w-100 switch-to-advance-info-bar"
                Icon={Help}
                iconClass="fcv-5 icon-dim-20"
                renderActionButton={getRenderActionButton(changeEditorMode)}
            />
        </>
    )
}

export default DeploymentTemplateGUIView
