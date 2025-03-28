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

import { useState } from 'react'
import {
    CodeEditor,
    ConfigurationType,
    DeploymentTemplateConfigState,
    MarkDown,
    MODES,
    noop,
    OverrideMergeStrategyType,
    SelectPickerOptionType,
    versionComparatorBySortOrder,
} from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as ICBookOpen } from '@Icons/ic-book-open.svg'
import { ReactComponent as ICPencil } from '@Icons/ic-pencil.svg'
import { importComponentFromFELibrary } from '@Components/common'
import { DeploymentTemplateFormProps } from './types'
import { GUIView as DeploymentTemplateGUIView } from './GUIView'
import { APPLICATION_METRICS_DROPDOWN_OPTIONS, DEPLOYMENT_TEMPLATE_LABELS_KEYS } from './constants'
import { getEditorSchemaURIFromChartNameAndVersion } from './utils'
import { MERGE_STRATEGY_OPTIONS } from '../constants'

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
    publishedTemplateData,
    draftTemplateData,
    isAppMetricsEnabled,
    handleAppMetricsToggle,
    handleMergeStrategyChange,
    charts,
    handleChartChange,
}: DeploymentTemplateFormProps) => {
    // STATES
    const [expressEditComparisonViewLHSValue, setExpressEditComparisonViewLHSValue] =
        useState<DeploymentTemplateConfigState>(latestDraft ? draftTemplateData : publishedTemplateData)

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

    // HANDLERS
    const handleExpressEditCompareWithChange = (isDraft: boolean) => {
        setExpressEditComparisonViewLHSValue(isDraft ? draftTemplateData : publishedTemplateData)
    }

    const onChartSelect = (selected: SelectPickerOptionType) => {
        handleChartChange(charts.find((chart) => chart.id === selected.value) || selectedChart)
    }

    const toggleApplicationMetrics = () => {
        handleAppMetricsToggle()
    }

    // CONFIGS
    const filteredCharts = selectedChart
        ? charts
              .filter((cv) => cv.name === selectedChart.name)
              .sort((a, b) => versionComparatorBySortOrder(a.version, b.version))
        : []

    const dataDiffConfig = [
        {
            title: 'Chart',
            lhs: {
                displayValue: selectedChart?.name,
            },
            rhs: {
                displayValue: expressEditComparisonViewLHSValue?.selectedChart?.name,
            },
        },
        {
            title: 'Version',
            lhs: {
                displayValue: expressEditComparisonViewLHSValue?.selectedChart?.version,
                value: expressEditComparisonViewLHSValue?.selectedChart?.id,
            },
            rhs: {
                value: selectedChart?.id,
                dropdownConfig: {
                    options: filteredCharts.map((chart) => ({
                        label: chart.version,
                        value: chart.id,
                    })),
                    onChange: onChartSelect,
                },
            },
        },
        ...(environmentName
            ? [
                  {
                      title: 'Merge strategy',
                      lhs: {
                          displayValue: expressEditComparisonViewLHSValue?.mergeStrategy,
                      },
                      rhs: {
                          value: mergeStrategy,
                          dropdownConfig: {
                              options: MERGE_STRATEGY_OPTIONS,
                              onChange: (newValue: SelectPickerOptionType) => {
                                  handleMergeStrategyChange(newValue.value as OverrideMergeStrategyType)
                              },
                          },
                      },
                  },
              ]
            : []),
        {
            title: 'Application metrics',
            lhs: {
                displayValue: expressEditComparisonViewLHSValue?.isAppMetricsEnabled ? 'Enabled' : 'Disabled',
                value: expressEditComparisonViewLHSValue?.isAppMetricsEnabled?.toString(),
            },
            rhs: {
                value: isAppMetricsEnabled.toString(),
                dropdownConfig: {
                    options: APPLICATION_METRICS_DROPDOWN_OPTIONS,
                    onChange: toggleApplicationMetrics,
                },
            },
        },
    ]

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
                    dataDiffConfig={dataDiffConfig}
                    readOnly={readOnly}
                    lhsEditor={{
                        value: expressEditComparisonViewLHSValue?.editorTemplate,
                        schemaURI: getEditorSchemaURIFromChartNameAndVersion(
                            expressEditComparisonViewLHSValue?.selectedChart?.name,
                            expressEditComparisonViewLHSValue?.selectedChart?.version,
                        ),
                        validatorSchema: expressEditComparisonViewLHSValue?.schema,
                    }}
                    rhsEditor={{
                        value: editedDocument,
                        onChange: editorOnChange,
                        schemaURI: getEditorSchemaURIFromChartNameAndVersion(
                            selectedChart?.name,
                            selectedChart?.version,
                        ),
                        validatorSchema: schema,
                    }}
                    showDraftOption={!!latestDraft}
                    handleCompareWithChange={handleExpressEditCompareWithChange}
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
