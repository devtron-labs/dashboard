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

/* eslint-disable react/prop-types */

import { Component, createRef } from 'react'
import Draggable, { DraggableEventHandler } from 'react-draggable'
import yamlJsParser from 'yaml'

import {
    BulkEditConfigV2Type,
    Button,
    ButtonStyleType,
    ButtonVariantType,
    CodeEditor,
    ComponentSizeType,
    ErrorScreenManager,
    GenericSectionErrorState,
    Icon,
    MarkDown,
    MODES,
    motion,
    noop,
    PageHeader,
    Progressing,
    ResponseType,
    SelectPicker,
    SelectPickerVariantType,
    showError,
    ToastManager,
    ToastVariantType,
    useMotionTemplate,
    useMotionValue,
} from '@devtron-labs/devtron-fe-common-lib'

import { importComponentFromFELibrary } from '@Components/common'

import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { SERVER_MODE, ViewType } from '../../config'
import {
    OutputTabs,
    renderCMAndSecretImpObj,
    renderConfigMapOutput,
    renderDeploymentTemplateOutput,
    renderSecretOutput,
} from './bulkedit.utils'
import { getSeeExample, updateBulkList, updateImpactedObjectsList } from './bulkedits.service'
import { BulkEditsProps, BulkEditsState, BulkEditVersion } from './bulkEdits.type'
import { OutputDivider, OutputObjectTabs, STATUS } from './constants'

import './bulkEdit.scss'

const getBulkEditConfig = importComponentFromFELibrary('getBulkEditConfig', null, 'function')

const ReadmeVersionOptions = [
    ...(getBulkEditConfig
        ? [
              {
                  label: 'v1beta2/application',
                  value: BulkEditVersion.v2,
              },
          ]
        : []),
    {
        label: 'v1beta1/application',
        value: BulkEditVersion.v1,
    },
]

class BulkEdits extends Component<BulkEditsProps, BulkEditsState> {
    private editorAndOutputContainerRef = createRef<HTMLDivElement>()

    constructor(props: BulkEditsProps) {
        super(props)

        this.state = {
            view: ViewType.LOADING,
            statusCode: 0,
            outputResult: undefined,
            impactedObjects: undefined,
            isReadmeLoading: true,
            readmeVersionOptions: ReadmeVersionOptions,
            selectedReadmeVersionOption: ReadmeVersionOptions[0],
            readmeResult: {
                [BulkEditVersion.v1]: null,
                [BulkEditVersion.v2]: null,
            },
            showExamples: true,
            activeOutputTab: 'none',
            codeEditorPayload: undefined,
            schema: null,
        }
    }

    componentDidMount() {
        // eslint-disable-next-line react/prop-types
        const { serverMode } = this.props

        if (serverMode === SERVER_MODE.FULL) {
            this.setState({
                view: ViewType.LOADING,
            })
            this.getInitialized()
        }
    }

    getInitialized() {
        Promise.allSettled([
            (getBulkEditConfig?.() as Promise<ResponseType<BulkEditConfigV2Type>>).then(
                ({ result: { readme, schema } }) => {
                    this.setState({ schema })

                    return readme
                },
            ),
            getSeeExample().then(({ result }) => result[0].readme),
        ])
            .then(([v2ReadmeResult, v1ReadmeResult]) => {
                const v2Readme = v2ReadmeResult.status === 'fulfilled' ? v2ReadmeResult.value : null
                const v1Readme = v1ReadmeResult.status === 'fulfilled' ? v1ReadmeResult.value : null

                this.setState({
                    isReadmeLoading: false,
                    view: ViewType.FORM,
                    readmeResult: { [BulkEditVersion.v1]: v1Readme, [BulkEditVersion.v2]: v2Readme },
                })
            })
            .catch(noop)
    }

    handleRunButton = () => {
        const { codeEditorPayload } = this.state

        this.setState({
            view: ViewType.LOADING,
        })

        let configJson: any = {}
        try {
            configJson = yamlJsParser.parse(codeEditorPayload)
        } catch {
            // Invalid YAML, couldn't be parsed to JSON. Show error toast
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Invalid Yaml',
            })
            this.setState({ view: ViewType.FORM })
            return
        }
        const errorMessage = []
        errorMessage.push(STATUS.ERROR)

        const payload = configJson

        updateBulkList(payload)
            .then((response) => {
                const outputResult = response.result
                this.setState({
                    statusCode: 0,
                    view: ViewType.FORM,
                    activeOutputTab: 'output',
                    outputResult,
                    impactedObjects: undefined,
                })
            })
            .catch((error) => {
                showError(error)
                this.setState({ view: ViewType.FORM, statusCode: error.code })
            })
    }

    handleShowImpactedObjectButton = () => {
        const { codeEditorPayload } = this.state

        this.setState({
            view: ViewType.LOADING,
        })

        let configJson: any = {}
        try {
            configJson = yamlJsParser.parse(codeEditorPayload)
        } catch {
            // Invalid YAML, couldn't be parsed to JSON. Show error toast
            ToastManager.showToast({
                variant: ToastVariantType.error,
                description: 'Invalid Yaml',
            })
            this.setState({ view: ViewType.FORM })
            return
        }

        const payload = configJson

        updateImpactedObjectsList(payload)
            .then((response) => {
                const impactedObjects = response.result
                this.setState({
                    statusCode: 0,
                    view: ViewType.FORM,
                    impactedObjects,
                    outputResult: undefined,
                    activeOutputTab: 'impacted',
                })
            })
            .catch((error) => {
                showError(error)
                this.setState({ view: ViewType.FORM, statusCode: error.code })
            })
    }

    handleReferSampleScriptClick = () => this.setState({ showExamples: true })

    renderCodeEditorHeader = () => {
        const { showExamples } = this.state

        return (
            <div className="flex bg__primary px-20 py-8 dc__border-bottom dc__content-space">
                <div className="flexbox dc__gap-12">
                    <h1 className="m-0 fs-13 cn-9 fw-6 lh-20 dc__open-sans">Script</h1>
                    {!showExamples && (
                        <Button
                            dataTestId="refer-sample-script-button"
                            text="Refer Sample Script"
                            variant={ButtonVariantType.text}
                            size={ComponentSizeType.medium}
                            onClick={this.handleReferSampleScriptClick}
                        />
                    )}
                </div>

                <div className="flexbox dc__gap-12">
                    <Button
                        text="Show Impacted Objects"
                        onClick={this.handleShowImpactedObjectButton}
                        dataTestId="show-impacted-objects-button"
                        size={ComponentSizeType.small}
                        variant={ButtonVariantType.secondary}
                    />
                    <Button
                        text="Run"
                        onClick={this.handleRunButton}
                        dataTestId="run-button"
                        startIcon={<Icon name="ic-play-outline" color={null} />}
                        size={ComponentSizeType.small}
                    />
                </div>
            </div>
        )
    }

    handleConfigChange = (value) => {
        this.setState({
            codeEditorPayload: value,
        })
    }

    handleOutputTab = (key: BulkEditsState['activeOutputTab']) => {
        this.setState({
            activeOutputTab: key,
        })
    }

    renderOutputContent = () => {
        const { statusCode, activeOutputTab } = this.state

        if (statusCode === 404) {
            return STATUS.ERROR
        }

        return activeOutputTab === 'output' ? this.renderOutputs() : this.renderImpactedObjects()
    }

    handleDrag: DraggableEventHandler = (_, data) => {
        const { outputHeightMV } = this.props
        const newHeight =
            outputHeightMV.get() - (data.deltaY / this.editorAndOutputContainerRef.current.clientHeight) * 100
        // Clamp the height between 10% and 90%
        const clamped = Math.min(90, Math.max(10, newHeight))
        outputHeightMV.set(clamped)
    }

    renderCodeEditorBody = () => {
        const { codeEditorPayload, schema, activeOutputTab } = this.state
        const { gridTemplateRows } = this.props

        if (activeOutputTab === 'none') {
            return (
                <div className="dc__overflow-hidden flex-grow-1">
                    <CodeEditor
                        mode={MODES.YAML}
                        height="100%"
                        value={codeEditorPayload}
                        onChange={this.handleConfigChange}
                        validatorSchema={schema}
                    />
                </div>
            )
        }

        // TODO: make sure to disable cursor selection while dragging

        return (
            <motion.div
                className="dc__grid flex-grow-1 dc__overflow-hidden"
                ref={this.editorAndOutputContainerRef}
                style={{ gridTemplateRows }}
            >
                <motion.div className="dc__overflow-hidden flex-grow-1">
                    <CodeEditor
                        mode={MODES.YAML}
                        height="100%"
                        value={codeEditorPayload}
                        onChange={this.handleConfigChange}
                        validatorSchema={schema}
                    />
                </motion.div>

                <Draggable
                    handle=".bulk-edit"
                    axis="none"
                    position={{ x: 0, y: 0 }}
                    bounds={{ left: 0, right: 0 }}
                    onDrag={this.handleDrag}
                >
                    <div className="bulk-edit border__secondary flex dc__zi-10">
                        <Icon name="ic-resize-handle" size={16} color={null} />
                    </div>
                </Draggable>

                <motion.div className="bulk-output-drawer bg__primary flexbox-col dc__overflow-auto">
                    <div className="bulk-output-header flex left pl-20 pr-20 pt-6 dc__border-top dc__border-bottom bg__primary">
                        <OutputTabs
                            handleOutputTabs={() => this.handleOutputTab('output')}
                            outputName={activeOutputTab}
                            value="output"
                            name={OutputObjectTabs.OUTPUT}
                        />
                        <OutputTabs
                            handleOutputTabs={() => this.handleOutputTab('impacted')}
                            outputName={activeOutputTab}
                            value="impacted"
                            name={OutputObjectTabs.IMPACTED_OBJECTS}
                        />
                    </div>
                    <div
                        className="bulk-output-body cn-9 fs-13 p-20 dc__overflow-auto flexbox-col flex-grow-1"
                        data-testid="output-message"
                    >
                        {this.renderOutputContent()}
                    </div>
                </motion.div>
            </motion.div>
        )
    }

    renderOutputs = () => {
        const { view, outputResult } = this.state

        if (view === ViewType.LOADING) {
            return <Progressing pageLoader />
        }

        return outputResult ? (
            <div>
                {renderConfigMapOutput(outputResult.configMap)}
                {renderDeploymentTemplateOutput(outputResult.deploymentTemplate)}
                {renderSecretOutput(outputResult.secret)}
            </div>
        ) : (
            ''
        )
    }

    renderConfigMapImpObj = () => {
        const { impactedObjects } = this.state

        return (
            <div>
                <div>
                    *CONFIGMAPS: <br /> <br />
                    {!impactedObjects.configMap?.length ? (
                        <>No Result Found </>
                    ) : (
                        <>{impactedObjects.configMap.map((elm) => renderCMAndSecretImpObj(elm))}</>
                    )}
                </div>
                {OutputDivider}
            </div>
        )
    }

    renderDeploymentTemplateImpObj = () => {
        const { impactedObjects } = this.state

        return (
            <div>
                <div>
                    *DEPLOYMENT TEMPLATE: <br /> <br />
                    {!impactedObjects.deploymentTemplate?.length ? (
                        <>No Result Found</>
                    ) : (
                        <>
                            {impactedObjects.deploymentTemplate.map((elm) => (
                                <div>
                                    App Id: {elm.appId} <br />
                                    App Name: {elm.appName} <br />
                                    {elm.envId && (
                                        <>
                                            Environment Id: {elm.envId} <br />
                                        </>
                                    )}
                                    {elm.envName && (
                                        <>
                                            Environment Name: {elm.envName} <br />
                                        </>
                                    )}
                                    <br />
                                </div>
                            ))}
                        </>
                    )}
                </div>
                {OutputDivider}
            </div>
        )
    }

    renderSecretImpObj = () => {
        const { impactedObjects } = this.state

        return (
            <div>
                <div>
                    *SECRETS: <br /> <br />
                    {!impactedObjects.secret?.length ? (
                        <>No Result Found</>
                    ) : (
                        <>{impactedObjects.secret.map((elm) => renderCMAndSecretImpObj(elm))}</>
                    )}
                </div>
                {OutputDivider}
            </div>
        )
    }

    renderImpactedObjects = () => {
        const { view, impactedObjects } = this.state

        if (view === ViewType.LOADING) {
            return <Progressing pageLoader />
        }

        return impactedObjects ? (
            <div>
                {this.renderConfigMapImpObj()}
                {this.renderDeploymentTemplateImpObj()}
                {this.renderSecretImpObj()}
            </div>
        ) : (
            ''
        )
    }

    handleUpdateTemplate = (option: BulkEditsState['selectedReadmeVersionOption']) => {
        this.setState({ selectedReadmeVersionOption: option })
    }

    onClickHideExamples = () => {
        this.setState({ showExamples: false })
    }

    renderSampleTemplateHeader = () => {
        const { selectedReadmeVersionOption, readmeVersionOptions } = this.state

        return (
            <div className="dc__border-bottom bg__primary py-8 px-20 flex dc__content-space">
                <div className="flex left dc__gap-16">
                    <div className="fw-6 cn-9" data-testid="sample-application">
                        Sample:
                    </div>
                    <SelectPicker
                        inputId="sample-application"
                        name="sample-application"
                        classNamePrefix="sample-application-select"
                        value={selectedReadmeVersionOption}
                        placeholder="Update Deployment Template"
                        options={readmeVersionOptions}
                        onChange={this.handleUpdateTemplate}
                        variant={SelectPickerVariantType.COMPACT}
                        size={ComponentSizeType.medium}
                        menuSize={ComponentSizeType.medium}
                    />
                </div>
                <Button
                    icon={<Close />}
                    onClick={this.onClickHideExamples}
                    dataTestId="hide-examples-button"
                    variant={ButtonVariantType.borderLess}
                    style={ButtonStyleType.negativeGrey}
                    ariaLabel="Hide Sample"
                    size={ComponentSizeType.small}
                />
            </div>
        )
    }

    renderSampleTemplateBody = () => {
        const { readmeResult, selectedReadmeVersionOption, isReadmeLoading } = this.state
        const readmeJson = readmeResult[selectedReadmeVersionOption.value]

        if (isReadmeLoading) {
            return <Progressing pageLoader />
        }

        if (!readmeJson) {
            return <GenericSectionErrorState rootClassName="flex-grow-1" />
        }

        return (
            <div className="deploy-chart__readme-column flexbox-col flex-grow-1 dc__overflow-auto">
                <MarkDown markdown={readmeJson} className="flexbox-col flex-grow-1" />
            </div>
        )
    }

    renderBulkCodeEditor = () => (
        <div className="bulk-container flexbox-col flex-grow-1 dc__overflow-hidden">
            {this.renderCodeEditorHeader()}
            {this.renderCodeEditorBody()}
        </div>
    )

    renderReadmeSection = () => (
        <div className="flexbox-col flex-grow-1 dc__overflow-hidden">
            {this.renderSampleTemplateHeader()}
            {this.renderSampleTemplateBody()}
        </div>
    )

    renderCodeEditorAndReadme = () => (
        <div className="bulk-container vertical-divider flex-grow-1 dc__grid-half dc__overflow-hidden">
            {this.renderBulkCodeEditor()}
            {this.renderReadmeSection()}
        </div>
    )

    renderBulkEditBody = () => {
        const { showExamples } = this.state
        return !showExamples ? this.renderBulkCodeEditor() : this.renderCodeEditorAndReadme()
    }

    render() {
        const { view, statusCode } = this.state
        if (view === ViewType.ERROR) {
            return (
                <div className="dc__align-reload-center">
                    <ErrorScreenManager code={statusCode} />
                </div>
            )
        }

        return (
            <div className="fs-13 flexbox-col flex-grow-1 h-100 dc__overflow-hidden">
                <PageHeader
                    headerName="Bulk Edit"
                    tippyProps={{
                        isTippyCustomized: true,
                        tippyMessage: 'Run scripts to bulk edit configurations for multiple devtron components.',
                        tippyRedirectLink: 'BULK_UPDATE',
                    }}
                />
                {this.renderBulkEditBody()}
            </div>
        )
    }
}

const BulkEditsWithUseResizable = (props: Pick<BulkEditsProps, 'serverMode'>) => {
    const outputHeightMV = useMotionValue(50)
    const gridTemplateRows = useMotionTemplate`1fr 1px ${outputHeightMV}%`

    return <BulkEdits {...{ ...props, outputHeightMV, gridTemplateRows }} />
}

export default BulkEditsWithUseResizable
