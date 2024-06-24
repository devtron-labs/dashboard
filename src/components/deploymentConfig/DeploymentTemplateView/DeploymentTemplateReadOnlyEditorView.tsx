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

import React, { useContext } from 'react'
import { Progressing, YAMLStringify, getUnlockedJSON, MarkDown } from '@devtron-labs/devtron-fe-common-lib'
import YAML from 'yaml'
import { DeploymentConfigContextType, DeploymentTemplateReadOnlyEditorViewProps } from '../types'
import CodeEditor from '../../CodeEditor/CodeEditor'
import { MODES } from '../../../config'
import { DeploymentConfigContext } from '../DeploymentConfig'
import DeploymentTemplateGUIView from './DeploymentTemplateGUIView'
import { importComponentFromFELibrary } from '../../common'

const applyPatches = importComponentFromFELibrary('applyPatches', null, 'function')

export default function DeploymentTemplateReadOnlyEditorView({
    value,
    isEnvOverride,
    lockedConfigKeysWithLockType,
    hideLockedKeys,
    removedPatches,
}: DeploymentTemplateReadOnlyEditorViewProps) {
    const { state } = useContext<DeploymentConfigContextType>(DeploymentConfigContext)

    // filtereing the locked keys from the yaml
    if (applyPatches) {
        if (hideLockedKeys) {
            const filteredValue = getUnlockedJSON(YAML.parse(value), lockedConfigKeysWithLockType.config ?? [], false)
            removedPatches.current = filteredValue.removedPatches
            value = YAMLStringify(filteredValue.newDocument)
        } else {
            value = YAMLStringify(applyPatches(YAML.parse(value), removedPatches.current))
        }
    }

    const renderCodeEditor = (): JSX.Element => {
        return (
            <div className="form__row--code-editor-container dc__border-top-n1 dc__border-bottom read-only-mode">
                <CodeEditor
                    value={value}
                    mode={MODES.YAML}
                    validatorSchema={state.schema}
                    loading={state.chartConfigLoading || value === undefined || value === null}
                    height={isEnvOverride ? 'calc(100vh - 251px)' : 'calc(100vh - 218px)'}
                    readOnly
                />
            </div>
        )
    }

    return state.yamlMode ? (
        <>
            {state.showReadme && (
                <div className="dt-readme dc__border-right dc__border-bottom-imp">
                    <div className="code-editor__header flex left fs-12 fw-6 cn-9">Readme</div>
                    {state.chartConfigLoading ? (
                        <Progressing pageLoader />
                    ) : (
                        <MarkDown markdown={state.readme} className="dt-readme-markdown" />
                    )}
                </div>
            )}
            {renderCodeEditor()}
        </>
    ) : (
        <DeploymentTemplateGUIView
            value={value}
            hideLockedKeys={hideLockedKeys}
            lockedConfigKeysWithLockType={lockedConfigKeysWithLockType}
            readOnly
        />
    )
}
