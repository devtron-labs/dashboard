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

import { Component } from 'react'
import yamlJsParser from 'yaml'
import {
    showError,
    Progressing,
    ErrorScreenManager,
    PageHeader,
    CodeEditor,
    SelectPicker,
    SelectPickerVariantType,
    ComponentSizeType,
    ToastManager,
    ToastVariantType,
    MarkDown,
    Button,
    ButtonVariantType,
    ButtonStyleType,
    MODES,
} from '@devtron-labs/devtron-fe-common-lib'
import { DOCUMENTATION, SERVER_MODE, ViewType } from '../../config'
import { BulkEditsProps, BulkEditsState } from './bulkEdits.type'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as PlayButton } from '../../assets/icons/ic-play.svg'
import { updateBulkList, getSeeExample, updateImpactedObjectsList } from './bulkedits.service'
import './bulkEdit.scss'
import {
    OutputTabs,
    renderCMAndSecretImpObj,
    renderConfigMapOutput,
    renderDeploymentTemplateOutput,
    renderSecretOutput,
} from './bulkedit.utils'
import { OutputDivider, OutputObjectTabs, STATUS } from './constants'

export default class BulkEdits extends Component<BulkEditsProps, BulkEditsState> {
    constructor(props) {
        super(props)

        this.state = {
            view: ViewType.LOADING,
            statusCode: 0,
            outputResult: undefined,
            impactedObjects: undefined,
            isReadmeLoading: true,
            outputName: 'output',
            bulkConfig: [],
            updatedTemplate: [],
            readmeResult: [],
            showExamples: true,
            showOutputData: true,
            showImpactedData: false,
            codeEditorPayload: undefined,
        }
    }

    componentDidMount() {
        if (this.props.serverMode == SERVER_MODE.FULL) {
            this.setState({
                view: ViewType.LOADING,
            })
            this.getInitialized()
        }
    }

    getInitialized() {
        getSeeExample()
            .then((res) => {
                this.setState({ view: ViewType.LOADING })
                const bulkConfig = res.result
                let kind = bulkConfig.map((elm) => elm.script.kind)
                kind = kind.toString().toLocaleLowerCase()
                let apiVersion = bulkConfig.map((elm) => elm.script.apiVersion)
                apiVersion = apiVersion.toString()
                const readmeResult = bulkConfig.map((elm) => elm.readme)
                const updatedTemplate = bulkConfig.map((elm) => {
                    return {
                        value: elm.operation,
                        label: elm.operation,
                    }
                })

                this.setState({
                    view: ViewType.FORM,
                    isReadmeLoading: false,
                    bulkConfig,
                    updatedTemplate,
                    readmeResult,
                })
            })
            .catch((error) => {
                showError(error)
                this.setState({ view: ViewType.FORM, statusCode: error.code })
            })
    }

    handleRunButton = (e) => {
        const outputDiv = document.querySelector('.code-editor-body')
        outputDiv.scrollTop = outputDiv.scrollHeight

        this.setState({
            view: ViewType.LOADING,
            outputName: 'output',
        })

        let configJson: any = {}
        try {
            configJson = yamlJsParser.parse(this.state.codeEditorPayload)
        } catch (error) {
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
                    showOutputData: true,
                    outputName: 'output',
                    outputResult,
                    showImpactedData: false,
                    impactedObjects: undefined,
                })
            })
            .catch((error) => {
                showError(error)
                this.setState({ view: ViewType.FORM, statusCode: error.code, outputName: 'output' })
            })
    }

    handleShowImpactedObjectButton = () => {
        const outputDiv = document.querySelector('.code-editor-body')
        outputDiv.scrollTop = outputDiv.scrollHeight

        this.setState({
            view: ViewType.LOADING,
            outputName: 'impacted',
        })

        let configJson: any = {}
        try {
            configJson = yamlJsParser.parse(this.state.codeEditorPayload)
        } catch (error) {
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
                    outputName: 'impacted',
                    showImpactedData: true,
                })
            })
            .catch((error) => {
                showError(error)
                this.setState({ view: ViewType.FORM, statusCode: error.code, outputName: 'impacted' })
            })
    }

    renderCodeEditorHeader = () => {
        return (
            <div className="flex bg__primary px-20 py-8 dc__border-bottom dc__content-space">
                <div className="flexbox dc__gap-12">
                    <Button
                        text="Run"
                        onClick={this.handleRunButton}
                        dataTestId="run-button"
                        startIcon={<PlayButton />}
                        size={ComponentSizeType.medium}
                    ></Button>
                    <Button
                        text="Show Impacted Objects"
                        onClick={this.handleShowImpactedObjectButton}
                        dataTestId="show-impacted-objects-button"
                        size={ComponentSizeType.medium}
                        variant={ButtonVariantType.secondary}
                    ></Button>
                </div>

                {!this.state.showExamples ? (
                    <div className="cb-5 fw-6 fs-13 pointer" onClick={() => this.setState({ showExamples: true })}>
                        See Samples
                    </div>
                ) : null}
            </div>
        )
    }

    handleConfigChange = (value) => {
        this.setState({
            codeEditorPayload: value,
        })
    }

    handleOutputTab = (e, key: string) => {
        if (key == 'output') {
            this.setState({
                outputName: 'output',
                showOutputData: true,
                showImpactedData: false,
            })
        }
        if (key == 'impacted') {
            this.setState({
                outputName: 'impacted',
                showImpactedData: true,
                showOutputData: false,
            })
        }
    }

    renderCodeEditorBody = () => {
        return (
            <div className="code-editor-body dc__grid-half flexbox-col flex-grow-1 mh-0">
                <CodeEditor
                    mode={MODES.YAML}
                    height="fitToParent"
                    value={this.state.codeEditorPayload}
                    onChange={this.handleConfigChange}
                />
                <div className="bulk-output-drawer bg__primary flexbox-col flex-grow-1 mh-0">
                    <div className="bulk-output-header flex left pl-20 pr-20 pt-6 dc__border-top dc__border-bottom bg__primary">
                        <OutputTabs
                            handleOutputTabs={(e) => this.handleOutputTab(e, 'output')}
                            outputName={this.state.outputName}
                            value="output"
                            name={OutputObjectTabs.OUTPUT}
                        />
                        <OutputTabs
                            handleOutputTabs={(e) => this.handleOutputTab(e, 'impacted')}
                            outputName={this.state.outputName}
                            value="impacted"
                            name={OutputObjectTabs.IMPACTED_OBJECTS}
                        />
                    </div>
                    <div
                        className="bulk-output-body cn-9 fs-13 p-20 dc__overflow-auto flexbox-col flex-grow-1 mh-0"
                        data-testid="output-message"
                    >
                        {this.state.showOutputData ? (
                            this.state.statusCode === 404 ? (
                                <>{STATUS.ERROR}</>
                            ) : (
                                this.renderOutputs()
                            )
                        ) : null}
                        {this.state.showImpactedData ? (
                            this.state.statusCode === 404 ? (
                                <>{STATUS.ERROR}</>
                            ) : (
                                this.renderImpactedObjects()
                            )
                        ) : null}
                    </div>
                </div>
            </div>
        )
    }

    renderOutputs = () => {
        const payloadStringWithoutSpaces = this.state.codeEditorPayload?.split(' ').join('')
        const deploymentTemplateInPayload = payloadStringWithoutSpaces?.includes('deploymentTemplate:\nspec:')
        const configMapInPayload = payloadStringWithoutSpaces?.includes('configMap:\nspec:')
        const secretInPayload = payloadStringWithoutSpaces?.includes('secret:\nspec:')
        return this.state.view === ViewType.LOADING ? (
            <Progressing pageLoader />
        ) : this.state.outputResult == undefined ? (
            ''
        ) : (
            <div>
                {configMapInPayload ? renderConfigMapOutput(this.state.outputResult.configMap) : null}
                {deploymentTemplateInPayload
                    ? renderDeploymentTemplateOutput(this.state.outputResult.deploymentTemplate)
                    : null}
                {secretInPayload ? renderSecretOutput(this.state.outputResult.secret) : null}
            </div>
        )
    }

    renderConfigMapImpObj = () => {
        return (
            <div>
                <div>
                    *CONFIGMAPS: <br /> <br />
                    {!this.state.impactedObjects?.configMap?.length ? (
                        <>No Result Found </>
                    ) : (
                        <>
                            {this.state.impactedObjects.configMap.map((elm) => {
                                return renderCMAndSecretImpObj(elm)
                            })}
                        </>
                    )}
                </div>
                {OutputDivider}
            </div>
        )
    }

    renderDeploymentTemplateImpObj = () => {
        return (
            <div>
                <div>
                    *DEPLOYMENT TEMPLATE: <br /> <br />
                    {this.state.impactedObjects.deploymentTemplate.length === 0 ? (
                        <>No Result Found</>
                    ) : (
                        <>
                            {this.state.impactedObjects.deploymentTemplate.map((elm) => {
                                return (
                                    <div>
                                        App Id: {elm.appId} <br />
                                        App Name: {elm.appName} <br />
                                        Environment Id: {elm.envId} <br />
                                        <br />
                                    </div>
                                )
                            })}
                        </>
                    )}
                </div>
                {OutputDivider}
            </div>
        )
    }

    renderSecretImpObj = () => {
        return (
            <div>
                <div>
                    *SECRETS: <br /> <br />
                    {this.state.impactedObjects.secret.length === 0 ? (
                        <>No Result Found</>
                    ) : (
                        <>
                            {this.state.impactedObjects.secret.map((elm) => {
                                return renderCMAndSecretImpObj(elm)
                            })}
                        </>
                    )}
                </div>
                {OutputDivider}
            </div>
        )
    }

    renderImpactedObjects = () => {
        const payloadStringWithoutSpaces = this.state.codeEditorPayload?.split(' ').join('')
        const deploymentTemplateInPayload = payloadStringWithoutSpaces?.includes('deploymentTemplate:\nspec:')
        const configMapInPayload = payloadStringWithoutSpaces?.includes('configMap:\nspec:')
        const secretInPayload = payloadStringWithoutSpaces?.includes('secret:\nspec:')
        return this.state.view === ViewType.LOADING ? (
            <Progressing pageLoader />
        ) : this.state.impactedObjects == undefined ? (
            ''
        ) : (
            <div>
                {configMapInPayload ? this.renderConfigMapImpObj() : null}
                {deploymentTemplateInPayload ? this.renderDeploymentTemplateImpObj() : null}
                {secretInPayload ? this.renderSecretImpObj() : null}
            </div>
        )
    }

    handleUpdateTemplate = () => {
        this.setState({ isReadmeLoading: true })
        getSeeExample()
            .then((res) => {
                const readmeResult = res.result.map((elm) => elm.readme)
                this.setState({
                    isReadmeLoading: false,
                    readmeResult,
                })
            })
            .catch((error) => {
                showError(error)
                this.setState({ isReadmeLoading: false, statusCode: error.code })
            })
    }

    onClickHideExamples = () => {
        this.setState({ showExamples: false })
    }

    renderSampleTemplateHeader = () => {
        return (
            <div className="dc__border-bottom bg__primary py-8 px-20 flex  h-48 dc__content-space">
                <div className="flex left dc__gap-16">
                    <div className="fw-6 cn-9" data-testid="sample-application">
                        Sample:
                    </div>
                    <SelectPicker
                        inputId="sample-application"
                        name="sample-application"
                        classNamePrefix="sample-application-select"
                        value={this.state.updatedTemplate[0]}
                        placeholder="Update Deployment Template"
                        options={this.state.updatedTemplate}
                        onChange={() => this.handleUpdateTemplate()}
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
        const readmeJson = this.state.readmeResult.toString()
        return this.state.isReadmeLoading ? (
            <Progressing pageLoader />
        ) : (
            <div className="deploy-chart__readme-column flexbox-col flex-grow-1 mh-0 dc__overflow-auto">
                <MarkDown markdown={readmeJson} className="flexbox-col flex-grow-1 mh-0" />
            </div>
        )
    }

    renderBulkCodeEditor = () => {
        return (
            <div className="dc__border-right flexbox-col flex-grow-1 mh-0">
                {this.renderCodeEditorHeader()}
                {this.renderCodeEditorBody()}
            </div>
        )
    }

    renderReadmeSection = () => {
        return (
            <div className="flexbox-col flex-grow-1 mh-0 dc__overflow-hidden">
                {this.renderSampleTemplateHeader()}
                {this.renderSampleTemplateBody()}
            </div>
        )
    }

    renderCodeEditorAndReadme = () => {
        return (
            <div className="bulk-container vertical-divider flex-grow-1 mh-0 dc__grid-half">
                {this.renderBulkCodeEditor()}
                {this.renderReadmeSection()}
            </div>
        )
    }

    renderReadmeAndCodeEditor = () => {
        return (
            <div className={`${this.state.showExamples ? 'code-editor-readme' : null}`}>
                <div>{this.renderBulkCodeEditor()}</div>
                {this.state.showExamples ? (
                    <div className="flex end" style={{ transition: 'all .2s ease-out' }}>
                        {this.renderReadmeSection()}
                    </div>
                ) : null}
            </div>
        )
    }

    renderBulkEditBody = () => {
        return !this.state.showExamples ? this.renderBulkCodeEditor() : this.renderCodeEditorAndReadme()
    }

    render() {
        if (this.state.view === ViewType.ERROR) {
            return (
                <div className="dc__align-reload-center">
                    <ErrorScreenManager code={this.state.statusCode} />
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
                        tippyRedirectLink: DOCUMENTATION.BULK_UPDATE,
                    }}
                />
                {this.renderBulkEditBody()}
            </div>
        )
    }
}
