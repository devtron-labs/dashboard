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

import { CodeEditor, ConfigurationType, MarkDown, MODES, noop } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICBookOpen } from '@Icons/ic-book-open.svg'
import { ReactComponent as ICPencil } from '@Icons/ic-pencil.svg'
import { importComponentFromFELibrary } from '@Components/common'
import { DeploymentTemplateFormProps } from './types'
import { GUIView as DeploymentTemplateGUIView } from './GUIView'
import { DEPLOYMENT_TEMPLATE_LABELS_KEYS } from './constants'
import { getEditorSchemaURIFromChartNameAndVersion } from './utils'

const ExpressEditEditor = importComponentFromFELibrary('ExpressEditEditor', null, 'function')

const DeploymentTemplateForm = ({
    editMode,
    hideLockedKeys,
    lockedConfigKeysWithLockType,
    readOnly,
    selectedChart,
    guiSchema,
    schema,
    isUnSet,
    handleChangeToYAMLMode,
    editorOnChange,
    editedDocument,
    uneditedDocument,
    showReadMe,
    readMe,
    environmentName,
    latestDraft,
    isGuiSupported,
    mergeStrategy,
    isExpressEditView,
    isExpressEditComparisonView,
}: DeploymentTemplateFormProps) => {
    if (editMode === ConfigurationType.GUI && isGuiSupported) {
        return (
            <DeploymentTemplateGUIView
                key={`gui-view-${mergeStrategy}`}
                // NOTE: This is with locked keys so original value is passed
                uneditedDocument={uneditedDocument || '{}'}
                editedDocument={editedDocument || '{}'}
                value={editedDocument}
                readOnly={readOnly}
                hideLockedKeys={hideLockedKeys}
                editorOnChange={editorOnChange}
                lockedConfigKeysWithLockType={lockedConfigKeysWithLockType}
                isUnSet={isUnSet}
                selectedChart={selectedChart}
                guiSchema={guiSchema}
                handleChangeToYAMLMode={handleChangeToYAMLMode}
                mergeStrategy={mergeStrategy}
            />
        )
    }

    const getHeadingPrefix = (): string => {
        if (latestDraft) {
            return 'Last saved draft'
        }

        if (environmentName) {
            return environmentName
        }

        return DEPLOYMENT_TEMPLATE_LABELS_KEYS.baseTemplate.label
    }

    const renderEditorHeader = () => {
        if (showReadMe) {
            return (
                <CodeEditor.Header hideDefaultSplitHeader>
                    <div className="flexbox dc__gap-8 dc__align-items-center fs-12 fw-6 cn-9">
                        {!readOnly && <ICPencil className="icon-dim-16 dc__no-shrink" />}

                        <span className="cn-9 fs-12 fw-6 lh-20">
                            {getHeadingPrefix()}
                            {selectedChart?.version && ` (v${selectedChart.version})`}
                        </span>
                    </div>
                </CodeEditor.Header>
            )
        }

        if (isUnSet) {
            return <CodeEditor.Warning text={DEPLOYMENT_TEMPLATE_LABELS_KEYS.codeEditor.warning} />
        }

        return null
    }

    return (
        <div className={`dc__overflow-auto flex-grow-1 ${showReadMe ? 'dc__grid-half' : 'flexbox-col'}`}>
            {ExpressEditEditor && isExpressEditView ? (
                <ExpressEditEditor
                    isComparisonView={isExpressEditComparisonView}
                    tableConfig={[
                        {
                            title: 'Chart',
                            value: 'Rollout deployment',
                            lhsValue: 'Rollout deployment',
                        },
                        {
                            title: 'Version',
                            value: '3.5.0',
                            lhsValue: '3.5.0',
                            dropdownConfig: { options: [], onChange: () => {} },
                        },
                        {
                            title: 'Merge strategy',
                            value: 'Patch',
                            lhsValue: 'Patch',
                            dropdownConfig: { options: [], onChange: () => {} },
                        },
                        {
                            title: 'Application metrics',
                            value: 'Disabled',
                            lhsValue: 'Disabled',
                            dropdownConfig: { options: [], onChange: () => {} },
                        },
                    ]}
                />
            ) : (
                <>
                    {showReadMe && (
                        <div className="flexbox-col dc__border-right dc__overflow-auto">
                            <div className="flexbox dc__gap-8 bg__primary px-12 pt-6 pb-5 dc__border-bottom flex left">
                                <ICBookOpen className="icon-dim-16 dc__no-shrink scn-9" />
                                <span className="fs-12 fw-6 cn-9 lh-20">{`Readme ${selectedChart ? `(v${selectedChart.version})` : ''}`}</span>
                            </div>

                            <MarkDown markdown={readMe} className="dc__overflow-auto" />
                        </div>
                    )}

                    <div className="flexbox-col dc__overflow-auto flex-grow-1">
                        <CodeEditor
                            mode={MODES.YAML}
                            readOnly={readOnly}
                            noParsing
                            codeEditorProps={{
                                value: editedDocument,
                                schemaURI: getEditorSchemaURIFromChartNameAndVersion(
                                    selectedChart?.name,
                                    selectedChart?.version,
                                ),
                                onChange: readOnly ? noop : editorOnChange,
                                validatorSchema: schema,
                                height: '100%',
                            }}
                            codeMirrorProps={{
                                value: editedDocument,
                                schemaURI: getEditorSchemaURIFromChartNameAndVersion(
                                    selectedChart?.name,
                                    selectedChart?.version,
                                ),
                                onChange: readOnly ? noop : editorOnChange,
                                validatorSchema: schema,
                                height: '100%',
                            }}
                        >
                            {renderEditorHeader()}
                        </CodeEditor>
                    </div>
                </>
            )}
        </div>
    )
}

export default DeploymentTemplateForm
