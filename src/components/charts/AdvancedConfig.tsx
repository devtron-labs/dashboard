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

import React, { useState, useEffect, useMemo } from 'react'
import {
    showError,
    Progressing,
    VisibleModal,
    useAsync,
    CustomInput,
    CodeEditor,
    MarkDown,
    MODES,
    isCodeMirrorEnabled,
} from '@devtron-labs/devtron-fe-common-lib'
import { useHistory } from 'react-router-dom'
import { Select, mapByKey, useKeyDown, Info, Pencil } from '../common'
import { getEnvironmentListMin } from '../../services/service'
import { ChartGroupEntry, AdvancedConfigHelpers, ChartValuesNativeType, ChartVersionType } from './charts.types'
import { getReadme, getChartValues } from './charts.service'
import { ValuesYamlConfirmDialog } from './dialogs/ValuesYamlConfirmDialog'
import { ReactComponent as LockIcon } from '../../assets/icons/ic-locked.svg'
import { ReactComponent as WarningIcon } from '../../assets/icons/ic-alert-triangle.svg'
import { getSavedValuesListURL } from './charts.helper'

interface AdvancedConfigProps extends AdvancedConfigHelpers {
    chart: ChartGroupEntry
    index: number
}

const AdvancedConfig: React.FC<AdvancedConfigProps> = ({
    chart,
    index,
    fetchChartValues,
    getChartVersionsAndValues,
    handleEnvironmentChange,
    handleChartValueChange,
    handleChartVersionChange,
    handleValuesYaml,
    handleNameChange,
    discardValuesYamlChanges,
}) => {
    const {
        environment,
        loading,
        chartMetaData: { chartName },
        valuesYaml,
        id,
        appStoreValuesChartVersion,
        appStoreApplicationVersionId,
        appStoreValuesVersionId,
        appStoreValuesVersionName,
        kind,
        name: appName,
        availableChartVersions,
        availableChartValues,
        appStoreApplicationVersion,
    } = chart
    const [environments, setEnvironments] = useState(new Map())
    const [showReadme, setReadme] = useState(false)
    const [showDiff, setDiff] = useState(false)
    const [chartValuesLoading, setChartValuesLoading] = useState(false)
    const [showValuesYamlDialog, toggleValuesYamlDialog] = useState(false)
    const [valuesYamlSelection, setValuesYamlSelection] = useState({
        valuesId: appStoreApplicationVersionId,
        kind,
    })
    const [readmeLoading, readmeResult, error, reload] = useAsync(
        () => getReadme(appStoreApplicationVersionId),
        [appStoreApplicationVersionId],
    )
    const { push } = useHistory()

    useEffect(() => {
        async function getEnvironments() {
            try {
                const { result } = await getEnvironmentListMin()
                setEnvironments(mapByKey(result, 'id'))
            } catch (err) {
                showError(err)
            }
        }
        getEnvironments()
    }, [])

    function handleChartVersionChangeAdvancedConfig(index, value) {
        if (chart.originalValuesYaml !== chart.valuesYaml) {
            toggleValuesYamlDialog(true)
        } else {
            handleChartVersionChange(index, value)
        }
    }

    function handleChartValueChangeAdvancedConfig(e) {
        const [kind, valuesId] = e.target.value.split('..')
        setValuesYamlSelection({ valuesId, kind })
        if (chart.originalValuesYaml !== chart.valuesYaml) {
            toggleValuesYamlDialog(true)
        } else {
            setValuesYamlSelection({ valuesId, kind })
            handleChartValueChange(index, kind, Number(valuesId))
        }
    }

    function discardValuesYamlChangesAdvancedConfig(e) {
        discardValuesYamlChanges(index)
        toggleValuesYamlDialog(false)
    }

    function copyValuesYamlToClipBoard(e) {
        const textarea = document.createElement('textarea')
        const main = document.getElementsByClassName('main')[0]
        main.appendChild(textarea)
        textarea.value = chart.valuesYaml
        textarea.select()
        document.execCommand('copy')
        main.removeChild(textarea)
        toggleValuesYamlDialog(false)
        handleChartValueChange(index, valuesYamlSelection.kind, Number(valuesYamlSelection.valuesId))
    }

    async function handleDiff(e) {
        if (!chart.availableChartValues) {
            setChartValuesLoading(true)
            try {
                await fetchChartValues(chart.id, index)
                setDiff(true)
            } catch (err) {
                showError(err)
            } finally {
                setChartValuesLoading(false)
            }
        } else {
            setDiff(true)
        }
    }

    function openSavedValuesList() {
        push(getSavedValuesListURL(chart.id))
    }

    let selectedChartValue: ChartValuesNativeType = {
        id: appStoreValuesVersionId || appStoreApplicationVersionId,
        name: appStoreValuesVersionName || 'Default',
        chartVersion: appStoreValuesChartVersion,
    }

    let selectedChartVersion: ChartVersionType = {
        id: appStoreApplicationVersionId,
        version: appStoreApplicationVersion,
    }

    // NOTE: appStoreValuesVersionId does not exist in case of default chart value version.
    if (appStoreValuesVersionId && availableChartValues.length) {
        const values = availableChartValues?.find(({ kind: k }) => kind === k)
        selectedChartValue = values.values?.find(({ id }) => id === appStoreValuesVersionId)
    }

    if (availableChartVersions.length) {
        selectedChartVersion = availableChartVersions.find(({ id }) => id === appStoreApplicationVersionId)
    }

    const availableChartValuesCopy = JSON.parse(JSON.stringify(availableChartValues || []))
    let chartValuesDropDown = availableChartValuesCopy.map((chartValuesObj) => {
        if (chartValuesObj.kind === 'DEFAULT') {
            chartValuesObj.values = chartValuesObj.values.filter((e) => e.id === chart.appStoreApplicationVersionId)
        }
        return chartValuesObj
    })
    // chart group create flow, do not show deployed values
    if (!handleEnvironmentChange) {
        chartValuesDropDown = chartValuesDropDown.filter((arr) => arr.kind !== 'DEPLOYED')
    }

    // TODO: use default state for variables, so that you don't have to apply ?. before every object.
    const warning: boolean = selectedChartValue.chartVersion !== selectedChartVersion.version

    return (
        <>
            <div className="advanced-config flexbox flex-grow-1">
                <form action="" className="advanced-config__form">
                    <h1 className="form__title form__title--mb-24" data-testid="advanced-option-heading">
                        {chartName}
                    </h1>
                    {handleNameChange && (
                        <div className="mb-16">
                            <CustomInput
                                placeholder="Enter app name"
                                name="appName"
                                label="App name"
                                value={appName.value}
                                onChange={(e) => handleNameChange(index, e.target.value)}
                                data-testid="advanced-option-app-name-box"
                                required
                                error={appName?.error}
                                helperText={
                                    appName.suggestedName ? (
                                        <>
                                            Suggested Name:
                                            <span
                                                className="anchor pointer"
                                                onClick={() => handleNameChange(index, appName.suggestedName)}
                                            >
                                                {appName.suggestedName}
                                            </span>
                                        </>
                                    ) : null
                                }
                            />
                        </div>
                    )}
                    {handleEnvironmentChange && (
                        <div className="flex top mb-16">
                            <div className="flex column half left top">
                                <label htmlFor="" className="form__label" data-testid="advanced-option-environment">
                                    Deploy to environment*
                                </label>
                                <Select
                                    rootClassName={`${environment?.error ? 'popup-button--error' : ''}`}
                                    onChange={(e) => handleEnvironmentChange(index, e.target.value)}
                                    value={environment?.id}
                                >
                                    <Select.Button
                                        rootClassName="select-button--default"
                                        dataTestIdDropdown="advanced-option-environment-list"
                                    >
                                        {environments.has(environment?.id)
                                            ? environments.get(environment.id).environment_name
                                            : 'Select Environment'}
                                    </Select.Button>
                                    {Array.from(environments.values())
                                        .filter((itm) => !itm.isVirtualEnvironment)
                                        .map((env) => (
                                            <Select.Option value={env.id} key={env.id}>
                                                {env.environment_name}
                                            </Select.Option>
                                        ))}
                                </Select>
                                {environment?.error && (
                                    <span className="form__error flex left">
                                        <WarningIcon className="mr-5 icon-dim-16" />
                                        {environment?.error || ''}
                                    </span>
                                )}
                            </div>
                            <div className="flex column half left top">
                                <label htmlFor="" className="form__label" data-testid="advanced-option-namespace">
                                    Namespace*
                                </label>
                                <input
                                    autoComplete="off"
                                    disabled
                                    className="form__input"
                                    value={
                                        environments.has(environment?.id)
                                            ? environments.get(environment?.id).namespace
                                            : ''
                                    }
                                    data-testid="advanced-option-namespace-box"
                                />
                            </div>
                        </div>
                    )}
                    <div className="flex top mb-16">
                        <div className="flex column left top half">
                            <label htmlFor="" className="form__label" data-testid="advanced-option-chart-version">
                                Chart version
                            </label>
                            <Select
                                rootClassName="select-button--default"
                                value={appStoreApplicationVersionId}
                                onChange={(e) => handleChartVersionChangeAdvancedConfig(index, e.target.value)}
                            >
                                {!availableChartVersions?.length && (
                                    <Select.Async api={() => getChartVersionsAndValues(chart.id, index)} />
                                )}
                                <Select.Button dataTestIdDropdown="advanced-option-chart-version-list">{`v${selectedChartVersion.version}`}</Select.Button>
                                {availableChartVersions.map(({ id, version }) => (
                                    <Select.Option key={id} value={id}>
                                        {version}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>

                        <div className="flex column left top half">
                            <label className="form__label form__label--manage-values">
                                <span data-testid="advanced-option-value">Values</span>
                                <button
                                    type="button"
                                    className="text-button p-0"
                                    onClick={openSavedValuesList}
                                    data-testid="advanced-option-preset-values-button"
                                >
                                    Preset values
                                </button>
                            </label>
                            <Select
                                onChange={handleChartValueChangeAdvancedConfig}
                                value={`${kind}..${appStoreValuesVersionId}`}
                            >
                                {!chartValuesDropDown?.length && (
                                    <Select.Async api={() => getChartVersionsAndValues(chart.id, index)} />
                                )}
                                <Select.Button
                                    rootClassName="select-button--default"
                                    dataTestIdDropdown="advanced-option-values-list"
                                >
                                    <span
                                        className="ml-5 select-button__selected-option dc__ellipsis-right"
                                        style={{ width: '100%' }}
                                    >
                                        {`${selectedChartValue.name} (v${selectedChartValue.chartVersion})`}
                                    </span>
                                </Select.Button>
                                {chartValuesDropDown?.map(({ kind, values }) => (
                                    <Select.OptGroup key={kind} label={kind === 'TEMPLATE' ? 'CUSTOM' : kind}>
                                        {values?.map(({ chartVersion, id, name, environmentName }) => (
                                            <Select.Option key={`${kind}..${id}`} value={`${kind}..${id}..${name}`}>
                                                <div className="flex left column">
                                                    <span style={{ color: 'var(--N900)', fontSize: '14px' }}>
                                                        {name} ({chartVersion})
                                                    </span>
                                                    {environmentName && (
                                                        <span style={{ color: 'var(--N700)', fontSize: '12px' }}>
                                                            {environmentName}
                                                        </span>
                                                    )}
                                                </div>
                                            </Select.Option>
                                        ))}
                                        {(!values || values?.length === 0) && (
                                            <div
                                                onClick={(e) => e.stopPropagation()}
                                                className="select__option-with-subtitle select__option-with-subtitle--empty-state"
                                            >
                                                No Results
                                            </div>
                                        )}
                                    </Select.OptGroup>
                                ))}
                            </Select>
                        </div>
                    </div>
                    {!handleNameChange && (
                        <div className="tips">
                            {/* only chart group create and update flow */}
                            <Info className="tips__icon" />
                            <div className="column">
                                <b className="tips__title">Tips</b>
                                <ul className="tips__container">
                                    <li className="tips__tip">
                                        Only default & custom values can be used in a chart group. Read how to create
                                        custom values.
                                    </li>
                                    <li className="tips__tip">Selected values can be edited during deployment.</li>
                                    <li className="tips__tip">
                                        You can select other deployed values during deployment.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}
                    <CodeEditor.Container>
                        <CodeEditor
                            codeEditorProps={{
                                value: valuesYaml,
                                onChange: handleValuesYaml
                                    ? (valuesYaml) => {
                                          handleValuesYaml(index, valuesYaml)
                                      }
                                    : () => {},
                            }}
                            codeMirrorProps={{
                                value: valuesYaml,
                                height: 'auto',
                                onChange: handleValuesYaml
                                    ? (valuesYaml) => {
                                          handleValuesYaml(index, valuesYaml)
                                      }
                                    : () => {},
                            }}
                            noParsing
                            loading={loading}
                            readOnly={!handleValuesYaml}
                            mode={MODES.YAML}
                        >
                            <CodeEditor.Header>
                                <div className="flex dc__content-space w-100">
                                    <span data-testid="code-editor-code-editor-container-heading">
                                        {appName.value}.yaml
                                    </span>
                                    <div className="flex">
                                        {!handleValuesYaml && <LockIcon className="mr-5" />}
                                        {handleValuesYaml && (
                                            <button
                                                className="cta small  cancel mr-16"
                                                type="button"
                                                onClick={handleDiff}
                                                data-testid="advanced-option-check-diff-button"
                                            >
                                                {chartValuesLoading ? <Progressing /> : 'Check diff'}
                                            </button>
                                        )}
                                        <button
                                            className="cta small  cancel"
                                            type="button"
                                            onClick={(e) => setReadme(true)}
                                            data-testid="advanced-option-readme-button"
                                        >
                                            Readme
                                        </button>
                                    </div>
                                </div>
                            </CodeEditor.Header>
                            {warning ? (
                                <CodeEditor.Warning text="The values configuration was created for a different chart version. Review the diff before continuing." />
                            ) : null}
                        </CodeEditor>
                    </CodeEditor.Container>
                </form>
            </div>
            {showReadme && (
                <VisibleModal className="">
                    <ReadmeCharts
                        readme={readmeResult.result.readme}
                        valuesYaml={valuesYaml}
                        handleClose={(e) => setReadme(false)}
                        chart={chart}
                        onChange={handleValuesYaml ? (valuesYaml) => handleValuesYaml(index, valuesYaml) : null}
                    />
                </VisibleModal>
            )}
            {showDiff && (
                <VisibleModal className="">
                    <ValuesDiffViewer
                        chartName={chart?.chartMetaData?.chartName || ''}
                        appName={chart?.name?.value || ''}
                        valuesYaml={valuesYaml}
                        kind={kind}
                        selectedChartValue={selectedChartValue}
                        availableChartValues={chart.availableChartValues || []}
                        handleClose={(e) => setDiff(false)}
                        onChange={handleValuesYaml ? (valuesYaml) => handleValuesYaml(index, valuesYaml) : null}
                        fetchChartValues={() => fetchChartValues(chart.id, index)}
                    />
                </VisibleModal>
            )}
            {showValuesYamlDialog ? (
                <ValuesYamlConfirmDialog
                    className=""
                    title="Discard values yaml changes?"
                    description="Selecting a different value will discard changes made to yaml"
                    closeOnESC
                    close={() => toggleValuesYamlDialog(false)}
                    copyYamlToClipboard={copyValuesYamlToClipBoard}
                    discardYamlChanges={discardValuesYamlChangesAdvancedConfig}
                />
            ) : null}
        </>
    )
}

export default AdvancedConfig

const ReadmeCharts = ({ readme, valuesYaml, onChange, handleClose, chart }) => {
    const key = useKeyDown()
    useEffect(() => {
        if (key.join().includes('Escape')) {
            handleClose()
        }
    }, [key.join()])
    return (
        <div className="advanced-config__readme">
            <h3>{chart.chartMetaData.chartName}</h3>
            <div className="readme-config-container" data-testid="readme-container">
                <div className="readme-config--header vertical-divider">
                    <h5 className="flex left">Readme.md</h5>
                    <h5 className="flex left">
                        {chart?.name?.value}.yaml
                        <Pencil style={{ marginLeft: 'auto' }} />
                    </h5>
                </div>
                <div className="readme-config--body">
                    <div className="left column">
                        <MarkDown markdown={readme} />
                    </div>
                    <div className="right column">
                        <CodeEditor
                            mode={MODES.YAML}
                            noParsing
                            readOnly={!onChange}
                            codeEditorProps={{
                                value: valuesYaml,
                                height: '100%',
                                onChange: onChange ? onChange : () => {},
                            }}
                            codeMirrorProps={{
                                value: valuesYaml,
                                height: '100%',
                                onChange: onChange ? onChange : () => {},
                            }}
                        />
                    </div>
                </div>
            </div>
            <div className="flex right">
                <button className="cta secondary" onClick={handleClose} data-testid="readme-done-button">
                    Done
                </button>
            </div>
        </div>
    )
}

const ValuesDiffViewer = ({
    chartName,
    appName,
    valuesYaml,
    selectedChartValue,
    kind: originalKind,
    availableChartValues,
    fetchChartValues,
    onChange,
    handleClose,
}) => {
    const [versionId, setVersionId] = useState(selectedChartValue.id)
    const [kind, setKind] = useState(originalKind)
    const [originalValuesYaml, setOriginalValuesYaml] = useState('')

    const { DEFAULT, TEMPLATE, DEPLOYED } = availableChartValues.reduce(
        (agg, { kind, values }) => {
            agg[kind] = values
            return agg
        },
        { DEFAULT: [], TEMPLATE: [], DEPLOYED: [] },
    )
    const valuesMap = useMemo(() => {
        if (kind === 'DEFAULT') {
            return mapByKey(DEFAULT, 'id')
        }
        if (kind === 'DEPLOYED') {
            return mapByKey(DEPLOYED, 'id')
        }
        if (kind === 'TEMPLATE') {
            return mapByKey(TEMPLATE, 'id')
        }
    }, [DEPLOYED, DEFAULT, TEMPLATE, kind, versionId])

    const [loading, result, error, reload] = useAsync(() => getChartValues(versionId, kind), [versionId, kind])
    useEffect(() => {
        if (!result) {
            return
        }
        setOriginalValuesYaml(result?.result?.values)
    }, [result])

    const key = useKeyDown()
    useEffect(() => {
        if (key.join().includes('Escape')) {
            handleClose()
        }
    }, [key.join()])

    function handleValuesChange(e) {
        const [kind, id] = e.target.value.split('--')
        setVersionId(Number(id))
        setKind(kind)
    }

    const chartVersion = valuesMap?.get(versionId)?.chartVersion || selectedChartValue.chartVersion

    return (
        <div className="advanced-config__diff">
            <h3>{chartName}</h3>
            <div className="readme-config-container" data-testid="check-diff-container">
                {/* TODO: use code editor header */}
                <div className="readme-config--header vertical-divider">
                    <h5 className="flex left">
                        <Select
                            rootClassName="values-select"
                            onChange={handleValuesChange}
                            value={`${kind}--${versionId}`}
                            autoWidth={false}
                        >
                            {availableChartValues?.length === 0 && <Select.Async api={fetchChartValues} />}
                            <Select.Button>
                                {kind} {chartVersion}
                            </Select.Button>
                            <Select.OptGroup className="select__option-group" label="DEPLOYED VALUES">
                                {DEPLOYED?.map((value) => (
                                    <Select.Option key={value.id} value={`DEPLOYED` + `--${value.id}`} id={value.id}>
                                        <div className="flex column left">
                                            <div className="dc__ellipsis-right">
                                                {value.name}
                                                {value.chartVersion}
                                            </div>
                                            <div>ENV: {value.environmentName}</div>
                                        </div>
                                    </Select.Option>
                                ))}
                                {DEPLOYED?.length === 0 && (
                                    <div className="select__option-with-subtitle select__option-with-subtitle--empty-state">
                                        No Results
                                    </div>
                                )}
                            </Select.OptGroup>
                            <Select.OptGroup className="select__option-group" label="CUSTOM VALUES">
                                {TEMPLATE?.map((value) => (
                                    <Select.Option key={value.id} value={`TEMPLATE` + `--${value.id}`} id={value.id}>
                                        {value.name} (v{value.chartVersion})
                                    </Select.Option>
                                ))}
                                {TEMPLATE?.length === 0 && (
                                    <div className="select__option-with-subtitle select__option-with-subtitle--empty-state">
                                        No Results
                                    </div>
                                )}
                            </Select.OptGroup>
                            <Select.OptGroup className="select__option-group" label="DEFAULT VALUES">
                                {DEFAULT?.map((value) => (
                                    <Select.Option key={value.id} value={`DEFAULT` + `--${value.id}`} id={value.id}>
                                        Default (v{value.chartVersion})
                                    </Select.Option>
                                ))}
                                {DEFAULT?.length === 0 && (
                                    <div className="select__option-with-subtitle select__option-with-subtitle--empty-state">
                                        No Results
                                    </div>
                                )}
                            </Select.OptGroup>
                        </Select>
                        <LockIcon style={{ marginLeft: 'auto' }} />
                    </h5>
                    <h5 className="flex left">
                        {appName}.yaml
                        <Pencil style={{ marginLeft: 'auto' }} />
                    </h5>
                </div>
                <div
                    {...(isCodeMirrorEnabled()
                        ? {
                              className: 'mw-none mh-0',
                          }
                        : {
                              className: 'readme-config--body',
                              style: { gridTemplateColumns: '1fr' },
                          })}
                >
                    <CodeEditor
                        mode={MODES.YAML}
                        noParsing
                        loading={loading && !originalValuesYaml}
                        readOnly={!onChange}
                        diffView
                        codeEditorProps={{
                            value: valuesYaml,
                            defaultValue: originalValuesYaml,
                            height: '100%',
                            onChange: onChange ? (valuesYaml) => onChange(valuesYaml) : () => {},
                        }}
                        codeMirrorProps={{
                            modifiedValue: valuesYaml,
                            originalValue: originalValuesYaml,
                            height: '100%',
                            onModifiedValueChange: onChange ? (valuesYaml) => onChange(valuesYaml) : () => {},
                        }}
                    />
                </div>
            </div>
            <div className="flex right">
                <button className="cta secondary" onClick={handleClose} data-testid="check-diff-done-button">
                    Done
                </button>
            </div>
        </div>
    )
}
