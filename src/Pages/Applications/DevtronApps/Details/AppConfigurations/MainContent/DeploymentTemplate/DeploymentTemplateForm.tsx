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

import { useMemo } from 'react'

import {
    CodeEditor,
    ConfigurationType,
    MarkDown,
    MODES,
    noop,
    OverrideMergeStrategyType,
    SelectPickerOptionType,
} from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as ICBookOpen } from '@Icons/ic-book-open.svg'
import { ReactComponent as ICPencil } from '@Icons/ic-pencil.svg'
import { importComponentFromFELibrary } from '@Components/common'

import { MERGE_STRATEGY_OPTIONS } from '../constants'
import { APPLICATION_METRICS_DROPDOWN_OPTIONS, DEPLOYMENT_TEMPLATE_LABELS_KEYS } from './constants'
import { GUIView as DeploymentTemplateGUIView } from './GUIView'
import { DeploymentTemplateFormProps } from './types'
import { getEditorSchemaURIFromChartNameAndVersion } from './utils'

const ExpressEditDiffEditor = importComponentFromFELibrary('ExpressEditDiffEditor', null, 'function')

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
    isExpressEditComparisonView,
    isAppMetricsEnabled,
    handleAppMetricsToggle,
    handleMergeStrategyChange,
    charts,
    handleChartChange,
    expressEditComparisonViewLHS,
    handleExpressEditCompareWithChange,
}: DeploymentTemplateFormProps) => {
    const chartVersionDropdownOptions = useMemo(
        () =>
            selectedChart
                ? charts
                      .filter((cv) => cv.name === selectedChart.name)
                      .map((chart) => ({
                          label: chart.version,
                          value: chart.id,
                      }))
                : [],
        [selectedChart, charts, editMode],
    )

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
    const onChartSelect = (selected: SelectPickerOptionType) => {
        if (selected.value === selectedChart.id) {
            return
        }
        handleChartChange(charts.find((chart) => chart.id === selected.value) || selectedChart)
    }

    const onMergeStrategySelect = (newValue: SelectPickerOptionType) => {
        handleMergeStrategyChange(newValue.value as OverrideMergeStrategyType)
    }

    const toggleApplicationMetrics = () => {
        handleAppMetricsToggle()
    }

    // CONFIGS
    const dataDiffConfig = [
        {
            title: 'Chart',
            lhs: {
                displayValue: expressEditComparisonViewLHS?.selectedChart?.name,
            },
            rhs: {
                displayValue: selectedChart?.name,
            },
        },
        {
            title: 'Version',
            lhs: {
                displayValue: expressEditComparisonViewLHS?.selectedChart?.version,
                value: expressEditComparisonViewLHS?.selectedChart?.id,
            },
            rhs: {
                value: selectedChart?.id,
                dropdownConfig: {
                    options: chartVersionDropdownOptions,
                    onChange: onChartSelect,
                },
            },
        },
        ...(environmentName
            ? [
                  {
                      title: 'Merge strategy',
                      lhs: {
                          displayValue: expressEditComparisonViewLHS?.mergeStrategy,
                      },
                      rhs: {
                          value: mergeStrategy,
                          dropdownConfig: {
                              options: MERGE_STRATEGY_OPTIONS,
                              onChange: onMergeStrategySelect,
                          },
                      },
                  },
              ]
            : []),
        {
            title: 'Application metrics',
            lhs: {
                displayValue:
                    expressEditComparisonViewLHS &&
                    (expressEditComparisonViewLHS.isAppMetricsEnabled ? 'Enabled' : 'Disabled'),
                value: expressEditComparisonViewLHS?.isAppMetricsEnabled ?? false,
            },
            rhs: selectedChart.isAppMetricsSupported
                ? {
                      value: isAppMetricsEnabled,
                      dropdownConfig: {
                          options: APPLICATION_METRICS_DROPDOWN_OPTIONS,
                          onChange: toggleApplicationMetrics,
                      },
                  }
                : {
                      displayValue: isAppMetricsEnabled ? 'Enabled' : 'Disabled',
                      value: isAppMetricsEnabled,
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

    return ExpressEditDiffEditor && isExpressEditComparisonView ? (
        <ExpressEditDiffEditor
            dataDiffConfig={dataDiffConfig}
            readOnly={readOnly}
            lhsEditor={{
                value: expressEditComparisonViewLHS?.editorTemplate,
                schemaURI: getEditorSchemaURIFromChartNameAndVersion(
                    expressEditComparisonViewLHS?.selectedChart?.name,
                    expressEditComparisonViewLHS?.selectedChart?.version,
                ),
                validatorSchema: expressEditComparisonViewLHS?.schema,
            }}
            rhsEditor={{
                value: editedDocument,
                onChange: editorOnChange,
                schemaURI: getEditorSchemaURIFromChartNameAndVersion(selectedChart?.name, selectedChart?.version),
                validatorSchema: schema,
            }}
            showDraftOption={!!latestDraft}
            handleCompareWithChange={handleExpressEditCompareWithChange}
        />
    ) : (
        <div className={`dc__overflow-auto flex-grow-1 ${showReadMe ? 'dc__grid-half' : 'flexbox-col'}`}>
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
                    value={editedDocument}
                    schemaURI={getEditorSchemaURIFromChartNameAndVersion(selectedChart?.name, selectedChart?.version)}
                    onChange={readOnly ? noop : editorOnChange}
                    validatorSchema={schema}
                    height="100%"
                >
                    {renderEditorHeader()}
                </CodeEditor>
            </div>
        </div>
    )
}

export default DeploymentTemplateForm
