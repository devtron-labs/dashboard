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

import moment from 'moment'
import { useEffect, useState } from 'react'
import {
    showError,
    DetailsProgressing,
    YAMLStringify,
    CodeEditor,
    versionComparatorBySortOrder,
    MODES,
    SelectPicker,
    SelectPickerVariantType,
    ComponentSizeType,
} from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import { Moment12HourFormat } from '../../../../config'
import { getChartValues } from '../../../charts/charts.service'
import { getDeploymentManifestDetails } from '../../chartDeploymentHistory/chartDeploymentHistory.service'
import { ReactComponent as Lock } from '../../../../assets/icons/ic-locked.svg'
import {
    ChartGroupOptionType,
    ChartKind,
    ChartValuesDiffOptionType,
    ChartValuesEditorType,
    CompareWithDropdownProps,
    ValuesForDiffStateType,
} from './ChartValuesView.type'
import { ReactComponent as Edit } from '../../../../assets/icons/ic-pencil.svg'
import {
    GROUPED_OPTION_LABELS,
    ListToTraverseKeys,
    MANIFEST_OUTPUT_INFO_TEXT,
    MANIFEST_OUTPUT_TIPPY_CONTENT,
} from './ChartValuesView.constants'
import { getFormattedChartValuesDiffOptionLabel } from './ChartValuesView.utils'

const CompareWithDropdown = ({
    deployedChartValues,
    defaultChartValues,
    presetChartValues,
    deploymentHistoryOptionsList,
    selectedVersionForDiff,
    handleSelectedVersionForDiff,
    manifestView,
}: CompareWithDropdownProps) => {
    const [groupedOptions, setGroupedOptions] = useState<ChartGroupOptionType[]>([
        {
            label: '',
            options: [],
        },
    ])

    useEffect(() => {
        const _groupedOptions = []
        if (deploymentHistoryOptionsList?.length > 0) {
            _groupedOptions.push({
                label: GROUPED_OPTION_LABELS.PreviousDeployments,
                options: deploymentHistoryOptionsList,
            })
        }

        if (!manifestView) {
            const noOptions = [{ label: GROUPED_OPTION_LABELS.NoOptions, value: 0, info: '' }]
            _groupedOptions.push(
                {
                    label: GROUPED_OPTION_LABELS.OtherApps,
                    options: deployedChartValues?.length > 0 ? deployedChartValues : noOptions,
                },
                {
                    label: GROUPED_OPTION_LABELS.PresetValues,
                    options: presetChartValues?.length > 0 ? presetChartValues : noOptions,
                },
                {
                    label: GROUPED_OPTION_LABELS.DefaultValues,
                    options:
                        defaultChartValues?.length > 0
                            ? [...defaultChartValues].sort((a, b) => versionComparatorBySortOrder(a.version, b.version))
                            : noOptions,
                },
            )
        }
        setGroupedOptions(_groupedOptions)
    }, [deployedChartValues, defaultChartValues, deploymentHistoryOptionsList])

    return (
        <SelectPicker
            inputId="compare-values-select"
            classNamePrefix="compare-values-select"
            variant={SelectPickerVariantType.COMPACT}
            options={groupedOptions}
            isSearchable={false}
            value={selectedVersionForDiff}
            isOptionDisabled={(option) => option.value === 0}
            onChange={handleSelectedVersionForDiff}
            menuSize={ComponentSizeType.medium}
        />
    )
}

export default function ChartValuesEditor({
    loading,
    isExternalApp,
    isDeployChartView,
    isCreateValueView,
    appId,
    appName,
    valuesText,
    onChange,
    repoChartValue,
    chartValuesList,
    deploymentHistoryList,
    defaultValuesText,
    showEditorHeader,
    hasChartChanged,
    showInfoText,
    manifestView,
    generatedManifest,
    comparisonView,
    selectedChartValues,
}: ChartValuesEditorType) {
    const [valuesForDiffState, setValuesForDiffState] = useState<ValuesForDiffStateType>({
        loadingValuesForDiff: false,
        deployedChartValues: [],
        defaultChartValues: [],
        presetChartValues: [],
        deploymentHistoryOptionsList: [],
        selectedValuesForDiff: defaultValuesText,
        deployedManifest: '',
        valuesForDiff: new Map<number, string>(),
        manifestsForDiff: new Map<number, string>(),
        selectedVersionForDiff: null,
        selectedManifestVersionForDiff: null,
    })

    useEffect(() => {
        const ExternalModeCondition = chartValuesList.length > 0 && isExternalApp
        const FullModeCondition =
            !manifestView &&
            chartValuesList.length > 0 &&
            (isDeployChartView || isCreateValueView || deploymentHistoryList.length > 0)
        if (ExternalModeCondition || FullModeCondition) {
            const deployedChartValues = []
            const defaultChartValues = []
            const presetChartValues = []
            let _selectedVersionForDiff

            for (let index = 0; index < chartValuesList.length; index++) {
                const _chartValue = chartValuesList[index]
                const processedChartValue = {
                    label: getFormattedChartValuesDiffOptionLabel(_chartValue.name, _chartValue.chartVersion),
                    value: _chartValue.id,
                    appStoreVersionId: _chartValue.appStoreVersionId || 0,
                    info: _chartValue.environmentName ? `Deployed on: ${_chartValue.environmentName}` : '',
                    description: _chartValue.environmentName ? `Deployed on: ${_chartValue.environmentName}` : '',
                    kind: _chartValue.kind,
                    version: _chartValue.chartVersion,
                }
                if (_chartValue.kind === ChartKind.DEPLOYED && _chartValue.name !== appName) {
                    deployedChartValues.push(processedChartValue)
                } else if (_chartValue.kind === ChartKind.DEFAULT) {
                    defaultChartValues.push(processedChartValue)
                } else if (_chartValue.kind === ChartKind.TEMPLATE) {
                    presetChartValues.push(processedChartValue)
                }
                if (isCreateValueView && _chartValue.id === selectedChartValues?.id) {
                    _selectedVersionForDiff = processedChartValue
                }
            }
            const deploymentHistoryOptionsList = deploymentHistoryList.map((_deploymentHistory) => {
                return {
                    label: getFormattedChartValuesDiffOptionLabel(
                        moment(new Date(_deploymentHistory.deployedAt.seconds * 1000)).format(Moment12HourFormat),
                        _deploymentHistory.chartMetadata.chartVersion,
                    ),
                    value: _deploymentHistory.version,
                    info: '',
                    version: _deploymentHistory.chartMetadata.chartVersion,
                }
            })

            setValuesForDiffState({
                ...valuesForDiffState,
                deployedChartValues,
                defaultChartValues,
                presetChartValues,
                deploymentHistoryOptionsList,
                selectedVersionForDiff:
                    _selectedVersionForDiff ||
                    (deploymentHistoryOptionsList.length > 0
                        ? deploymentHistoryOptionsList[0]
                        : deployedChartValues.length > 0
                          ? deployedChartValues[0]
                          : presetChartValues.length > 0
                            ? presetChartValues[0]
                            : defaultChartValues[0]),
            })
        }
    }, [chartValuesList, deploymentHistoryList, selectedChartValues])

    useEffect(() => {
        if (comparisonView && valuesForDiffState.selectedVersionForDiff) {
            setValuesForDiffState({
                ...valuesForDiffState,
                loadingValuesForDiff: true,
            })
            const { selectedVersionForDiff } = valuesForDiffState
            const _version = selectedVersionForDiff.value
            const _currentValues = manifestView
                ? valuesForDiffState.manifestsForDiff.get(_version)
                : valuesForDiffState.valuesForDiff.get(_version)
            if (!_currentValues) {
                if (
                    selectedVersionForDiff.kind === ChartKind.DEPLOYED ||
                    selectedVersionForDiff.kind === ChartKind.DEFAULT ||
                    selectedVersionForDiff.kind === ChartKind.TEMPLATE
                ) {
                    getChartValues(_version, selectedVersionForDiff.kind)
                        .then((res) => {
                            const _valuesForDiff = valuesForDiffState.valuesForDiff
                            _valuesForDiff.set(_version, res.result.values)
                            setValuesForDiffState({
                                ...valuesForDiffState,
                                loadingValuesForDiff: false,
                                valuesForDiff: _valuesForDiff,
                                selectedValuesForDiff: res.result.values,
                                selectedManifestForDiff: valuesForDiffState.manifestsForDiff.get(_version),
                            })
                        })
                        .catch((e) => {
                            showError(e)
                            setValuesForDiffState({
                                ...valuesForDiffState,
                                selectedValuesForDiff: '',
                                loadingValuesForDiff: false,
                            })
                        })
                } else {
                    getDeploymentManifestDetails(appId, _version, isExternalApp)
                        .then((res) => {
                            const _valuesForDiff = valuesForDiffState.valuesForDiff
                            const _manifestsForDiff = valuesForDiffState.manifestsForDiff
                            let _selectedValues: string
                            try {
                                _selectedValues = YAMLStringify(JSON.parse(res.result.valuesYaml))
                            } catch (error) {
                                _selectedValues = res.result.valuesYaml
                            }
                            _valuesForDiff.set(_version, _selectedValues)
                            _manifestsForDiff.set(_version, res.result.manifest)
                            const _valuesForDiffState = {
                                ...valuesForDiffState,
                                loadingValuesForDiff: false,
                                valuesForDiff: _valuesForDiff,
                                selectedValuesForDiff: _selectedValues,
                                selectedManifestForDiff: _manifestsForDiff.get(_version),
                            }

                            if (_version === deploymentHistoryList[0].version) {
                                _valuesForDiffState.deployedManifest = res.result.manifest
                            }

                            setValuesForDiffState(_valuesForDiffState)
                        })
                        .catch((e) => {
                            showError(e)
                            setValuesForDiffState({
                                ...valuesForDiffState,
                                selectedValuesForDiff: '',
                                loadingValuesForDiff: false,
                            })
                        })
                }
            } else {
                setValuesForDiffState({
                    ...valuesForDiffState,
                    loadingValuesForDiff: false,
                    selectedValuesForDiff: _currentValues,
                    selectedManifestForDiff: _currentValues,
                })
            }
        }
    }, [comparisonView, valuesForDiffState.selectedVersionForDiff])

    useEffect(() => {
        if (
            (!comparisonView && valuesForDiffState.selectedVersionForDiff) ||
            (comparisonView && !valuesForDiffState.selectedVersionForDiff)
        ) {
            let _selectedVersionForDiff
            if (isCreateValueView && selectedChartValues && valuesForDiffState.selectedVersionForDiff) {
                if (valuesForDiffState.selectedVersionForDiff.value !== selectedChartValues?.id) {
                    const listToTraverse =
                        selectedChartValues.kind === ChartKind.DEPLOYED
                            ? ListToTraverseKeys.deployedChartValues
                            : ListToTraverseKeys.defaultChartValues
                    _selectedVersionForDiff = valuesForDiffState[listToTraverse].find(
                        (chartData) => chartData.value === selectedChartValues.id,
                    )
                } else {
                    _selectedVersionForDiff = valuesForDiffState.selectedVersionForDiff
                }
            }
            setValuesForDiffState({
                ...valuesForDiffState,
                selectedVersionForDiff:
                    _selectedVersionForDiff ||
                    (valuesForDiffState.deploymentHistoryOptionsList.length > 0
                        ? valuesForDiffState.deploymentHistoryOptionsList[0]
                        : valuesForDiffState.deployedChartValues.length > 0
                          ? valuesForDiffState.deployedChartValues[0]
                          : valuesForDiffState.defaultChartValues[0]),
            })
        }
    }, [comparisonView])

    const handleSelectedVersionForDiff = (selected: ChartValuesDiffOptionType) => {
        if (selected.value !== valuesForDiffState.selectedVersionForDiff.value) {
            setValuesForDiffState({
                ...valuesForDiffState,
                selectedVersionForDiff: selected,
            })
        }
    }

    return (
        <CodeEditor
            diffView={comparisonView}
            noParsing
            mode={MODES.YAML}
            loading={loading || valuesForDiffState.loadingValuesForDiff}
            customLoader={
                <div className="flex h-100">
                    <DetailsProgressing size={32}>
                        {manifestView && !comparisonView && (
                            <span className="fs-13 fw-4 cn-7 mt-8">
                                Generating the manifest. <br /> Please wait...
                            </span>
                        )}
                    </DetailsProgressing>
                </div>
            }
            readOnly={manifestView}
            height="fitToParent"
            {...(comparisonView
                ? {
                      diffView: true,
                      originalValue: manifestView
                          ? valuesForDiffState.selectedManifestForDiff
                          : valuesForDiffState.selectedValuesForDiff,
                      modifiedValue: manifestView ? generatedManifest : valuesText,
                      onModifiedValueChange: onChange,
                  }
                : {
                      diffView: false,
                      value: manifestView ? generatedManifest : valuesText,
                      onChange,
                  })}
        >
            {showEditorHeader && (
                <CodeEditor.Header>
                    <div className="flex fs-12 fw-6 cn-7">
                        <Edit className="icon-dim-16 mr-10" />
                        values.yaml
                    </div>
                </CodeEditor.Header>
            )}
            {!manifestView && showInfoText && hasChartChanged && (
                <CodeEditor.Warning
                    className="dc__ellipsis-right"
                    text={`Please ensure that the values are compatible with "${repoChartValue.chartRepoName}/${repoChartValue.chartName}"`}
                />
            )}
            {manifestView && (
                <CodeEditor.Information className="dc__ellipsis-right" text={MANIFEST_OUTPUT_INFO_TEXT}>
                    <Tippy
                        className="default-tt w-250"
                        arrow={false}
                        placement="bottom"
                        content={MANIFEST_OUTPUT_TIPPY_CONTENT}
                    >
                        <span className="cursor cb-5 fw-6">&nbsp;Know more</span>
                    </Tippy>
                </CodeEditor.Information>
            )}
            {comparisonView && (
                <CodeEditor.Header hideDefaultSplitHeader>
                    <div className="flex left fs-12 fw-6 cn-7">
                        <span style={{ width: '90px' }} data-testid="compare-with-heading">
                            Compare with:
                        </span>
                        <CompareWithDropdown
                            deployedChartValues={valuesForDiffState.deployedChartValues}
                            defaultChartValues={valuesForDiffState.defaultChartValues}
                            presetChartValues={valuesForDiffState.presetChartValues}
                            deploymentHistoryOptionsList={valuesForDiffState.deploymentHistoryOptionsList}
                            selectedVersionForDiff={valuesForDiffState.selectedVersionForDiff}
                            handleSelectedVersionForDiff={handleSelectedVersionForDiff}
                            manifestView={manifestView}
                        />
                    </div>
                    <div className="chart-values-view__diff-view-current flex left fs-12 fw-6 cn-7 pl-12">
                        {manifestView ? (
                            <>
                                <Lock className="icon-dim-16 mr-8" />
                                <span>Manifest output for current YAML</span>
                            </>
                        ) : (
                            <>
                                <Edit className="icon-dim-16 mr-10" />
                                values.yaml&nbsp;
                                {(selectedChartValues?.chartVersion || repoChartValue?.version) &&
                                    `(${selectedChartValues?.chartVersion || repoChartValue?.version})`}
                            </>
                        )}
                    </div>
                </CodeEditor.Header>
            )}
        </CodeEditor>
    )
}
