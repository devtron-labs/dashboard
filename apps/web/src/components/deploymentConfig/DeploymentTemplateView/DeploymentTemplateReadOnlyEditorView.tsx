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
import { Progressing, YAMLStringify, MarkDown, CodeEditor } from '@devtron-labs/devtron-fe-common-lib'
import YAML from 'yaml'
import { DeploymentConfigContextType, DeploymentTemplateReadOnlyEditorViewProps } from '../types'
import { MODES } from '../../../config'
import { DeploymentConfigContext } from '../DeploymentConfig'
import DeploymentTemplateGUIView from './DeploymentTemplateGUIView'
import { importComponentFromFELibrary } from '../../common'

const removeLockedKeysFromYaml = importComponentFromFELibrary('removeLockedKeysFromYaml', null, 'function')
const reapplyRemovedLockedKeysToYaml = importComponentFromFELibrary('reapplyRemovedLockedKeysToYaml', null, 'function')

export default function DeploymentTemplateReadOnlyEditorView({
    value,
    isEnvOverride,
    lockedConfigKeysWithLockType,
    hideLockedKeys,
    uneditedDocument,
}: DeploymentTemplateReadOnlyEditorViewProps) {
    const { state } = useContext<DeploymentConfigContextType>(DeploymentConfigContext)
    const addOperationsRef = useRef([])

    // NOTE: the following can throw error but not putting it in try block
    // in order for it to not fail silently
    if (removeLockedKeysFromYaml && reapplyRemovedLockedKeysToYaml) {
        if (hideLockedKeys) {
            const { document, addOperations } = removeLockedKeysFromYaml(value, lockedConfigKeysWithLockType.config)
            value = YAML.stringify(document, { simpleKeys: true })
            if (addOperations.length) {
                addOperationsRef.current = addOperations
            }
        } else {
            value = YAMLStringify(reapplyRemovedLockedKeysToYaml(YAML.parse(value), addOperationsRef.current), {
                simpleKeys: true,
            })
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
            uneditedDocument={uneditedDocument}
        />
    )
}
