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
} from '@devtron-labs/devtron-fe-common-lib'
import { DOCUMENTATION, SERVER_MODE, ViewType } from '../../config'
import {
    BulkEditsProps,
    BulkEditsState,
    CMandSecretOutputKeys,
    DtOutputKeys,
    CMandSecretImpactedObjects,
} from './bulkEdits.type'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as PlayButton } from '../../assets/icons/ic-play.svg'
import { updateBulkList, getSeeExample, updateImpactedObjectsList } from './bulkedits.service'
import './bulkEdit.scss'
import '../charts/discoverChartDetail/DiscoverChartDetails.scss'
import '../charts/modal/DeployChart.scss'
import EAEmptyState, { EAEmptyStateType } from '../common/eaEmptyState/EAEmptyState'
import { OutputTabs } from './bulkedit.utils'
import { OutputObjectTabs, STATUS } from './constants'

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
            <div className="flex left pt-8 pb-8 bcn-0 pl-20 pr-20 dc__border-bottom">
                <button
                    type="button"
                    className="bulk-run-button cta dc__ellipsis-right pl-12 pr-12 flex mr-12 "
                    onClick={(e) => this.handleRunButton(e)}
                    data-testid="run-button"
                >
                    <span>
                        <PlayButton className="flex icon-dim-16 mr-8 " />
                    </span>
                    <div>Run</div>
                </button>
                <button
                    className="fs-12 en-2 bw-1 cb-5 fw-6 bcn-0 br-4 pt-6 pb-6 pl-12 pr-12"
                    style={{ maxHeight: '32px' }}
                    onClick={() => this.handleShowImpactedObjectButton()}
                    data-testid="show-impacted-objects-button"
                >
                    Show Impacted Objects
                </button>
                {!this.state.showExamples ? (
                    <div
                        className="cb-5 fw-6 fs-13 pointer"
                        onClick={() => this.setState({ showExamples: true })}
                        style={{ margin: 'auto', marginRight: '0' }}
                    >
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
            <div className="code-editor-body">
                <CodeEditor
                    height="calc(60vh - 97px)"
                    value={this.state.codeEditorPayload}
                    mode="yaml"
                    onChange={(event) => {
                        this.handleConfigChange(event)
                    }}
                    data-testid="code-editor"
                />
                <div className="bulk-output-drawer bcn-0 fs-13">
                    <div className="bulk-output-header flex left pl-20 pr-20 pt-6 dc__border-top dc__border-bottom bcn-0">
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
                    <div className="bulk-output-body cn-9 fs-13 pl-20 pr-20 pt-20" data-testid="output-message">
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

    renderConfigMapOutput = () => {
        return (
            <div>
                <div>
                    *CONFIGMAPS: <br />
                    <br />
                </div>
                <div>
                    #Message: <br />
                    <br />
                    {this.state.outputResult.configMap?.message?.map((elm) => {
                        return (
                            <>
                                {elm}
                                <br />
                            </>
                        )
                    })}
                </div>
                --------------------------
                <br />
                <div>
                    #Failed Operations:
                    <br />
                    <br />
                    {this.state.outputResult.configMap?.failure == null ? (
                        <>No Result Found</>
                    ) : (
                        <>
                            {this.state.outputResult.configMap?.failure.map((elm) => {
                                return this.renderCmAndSecretResponseForOneApp(elm)
                            })}
                        </>
                    )}
                </div>
                --------------------------
                <br />
                <div>
                    #Successful Operations: <br />
                    <br />
                    {this.state.outputResult.configMap?.successful == null ? (
                        <>No Result Found</>
                    ) : (
                        <>
                            {this.state.outputResult.configMap?.successful.map((elm) => {
                                return this.renderCmAndSecretResponseForOneApp(elm)
                            })}
                        </>
                    )}
                </div>
                ----------------------------------------------------
            </div>
        )
    }

    renderDTResponseForOneApp = (DTOutputKeys: DtOutputKeys) => {
        return (
            <div>
                App Id: {DTOutputKeys.appId} <br />
                App Name: {DTOutputKeys.appName} <br />
                Environment Id: {DTOutputKeys.envId} <br />
                Message: {DTOutputKeys.message} <br />
                <br />
            </div>
        )
    }

    renderCmAndSecretResponseForOneApp = (CMandSecretOutputKeys: CMandSecretOutputKeys) => {
        return (
            <div>
                App Id: {CMandSecretOutputKeys.appId} <br />
                App Name: {CMandSecretOutputKeys.appName} <br />
                Environment Id: {CMandSecretOutputKeys.envId} <br />
                Names : {CMandSecretOutputKeys.names.join(', ')} <br />
                Message: {CMandSecretOutputKeys.message} <br />
                <br />
            </div>
        )
    }

    renderCMAndSecretImpObj = (CMandSecretImpactedObject: CMandSecretImpactedObjects) => {
        return (
            <div>
                App Id: {CMandSecretImpactedObject.appId} <br />
                App Name: {CMandSecretImpactedObject.appName} <br />
                Environment Id: {CMandSecretImpactedObject.envId} <br />
                Names : {CMandSecretImpactedObject.names.join(', ')} <br />
                <br />
            </div>
        )
    }

    renderDeploymentTemplateOutput = () => {
        return (
            <div>
                <div>
                    *DEPLOYMENT TEMPLATE: <br />
                    <br />
                </div>
                <div>
                    #Message: <br />
                    <br />
                    {this.state.outputResult.deploymentTemplate?.message?.map((elm) => {
                        return (
                            <>
                                {elm}
                                <br />
                            </>
                        )
                    })}
                </div>
                --------------------------
                <br />
                <div>
                    #Failed Operations:
                    <br />
                    <br />
                    {this.state.outputResult.deploymentTemplate?.failure == null ? (
                        <>No Result Found</>
                    ) : (
                        <>
                            {this.state.outputResult.deploymentTemplate?.failure.map((elm) => {
                                return this.renderDTResponseForOneApp(elm)
                            })}
                        </>
                    )}
                    <br />
                </div>
                --------------------------
                <br />
                <div>
                    #Successful Operations: <br />
                    <br />
                    {this.state.outputResult.deploymentTemplate?.successful == null ? (
                        <>No Result Found</>
                    ) : (
                        <>
                            {this.state.outputResult.deploymentTemplate?.successful.map((elm) => {
                                return this.renderDTResponseForOneApp(elm)
                            })}
                        </>
                    )}
                </div>
                ----------------------------------------------------
            </div>
        )
    }

    renderSecretOutput = () => {
        return (
            <div>
                <div>
                    *SECRETS: <br />
                    <br />
                </div>
                <div>
                    #Message: <br />
                    <br />
                    {this.state.outputResult.secret?.message?.map((elm) => {
                        return (
                            <>
                                {elm}
                                <br />
                            </>
                        )
                    })}
                </div>
                --------------------------
                <br />
                <div>
                    #Failed Operations:
                    <br />
                    <br />
                    {this.state.outputResult.secret?.failure == null ? (
                        <>No Result Found</>
                    ) : (
                        <>
                            {this.state.outputResult.secret?.failure.map((elm) => {
                                return this.renderCmAndSecretResponseForOneApp(elm)
                            })}
                        </>
                    )}
                    <br />
                </div>
                --------------------------
                <br />
                <div>
                    #Successful Operations: <br />
                    <br />
                    {this.state.outputResult.secret?.successful == null ? (
                        <>No Result Found</>
                    ) : (
                        <>
                            {this.state.outputResult.secret?.successful.map((elm) => {
                                return this.renderCmAndSecretResponseForOneApp(elm)
                            })}
                        </>
                    )}
                </div>
                -----------------------------------------------------------------
            </div>
        )
    }

    renderOutputs = () => {
        const payloadStringWithoutSpaces = this.state.codeEditorPayload?.split(' ').join('')
        const deploymentTemplateInPayload = payloadStringWithoutSpaces?.includes('deploymentTemplate:\nspec:')
        const configMapInPayload = payloadStringWithoutSpaces?.includes('configMap:\nspec:')
        const secretInPayload = payloadStringWithoutSpaces?.includes('secret:\nspec:')
        return this.state.view === ViewType.LOADING ? (
            <div style={{ height: 'calc(100vh - 600px)' }}>
                <Progressing pageLoader />
            </div>
        ) : this.state.outputResult == undefined ? (
            ''
        ) : (
            <div>
                {configMapInPayload ? this.renderConfigMapOutput() : null}
                {deploymentTemplateInPayload ? this.renderDeploymentTemplateOutput() : null}
                {secretInPayload ? this.renderSecretOutput() : null}
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
                                return this.renderCMAndSecretImpObj(elm)
                            })}
                        </>
                    )}
                </div>
                -----------------------------------------------------------------
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
                -----------------------------------------------------------------
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
                                return this.renderCMAndSecretImpObj(elm)
                            })}
                        </>
                    )}
                </div>
                -----------------------------------------------------------------
            </div>
        )
    }

    renderImpactedObjects = () => {
        const payloadStringWithoutSpaces = this.state.codeEditorPayload?.split(' ').join('')
        const deploymentTemplateInPayload = payloadStringWithoutSpaces?.includes('deploymentTemplate:\nspec:')
        const configMapInPayload = payloadStringWithoutSpaces?.includes('configMap:\nspec:')
        const secretInPayload = payloadStringWithoutSpaces?.includes('secret:\nspec:')
        return this.state.view === ViewType.LOADING ? (
            <div style={{ height: 'calc(100vh - 600px)' }}>
                <Progressing pageLoader />
            </div>
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

    renderSampleTemplateHeader = () => {
        return (
            <div className="dc__border-bottom bcn-0 py-8 px-20 flex  h-48 dc__content-space">
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
                        variant={SelectPickerVariantType.BORDER_LESS}
                        size={ComponentSizeType.medium}
                        menuSize={ComponentSizeType.medium}
                    />
                </div>
                <Close className="icon-dim-20 cursor" onClick={() => this.setState({ showExamples: false })} />
            </div>
        )
    }

    renderSampleTemplateBody = () => {
        const readmeJson = this.state.readmeResult.toString()
        return this.state.isReadmeLoading ? (
            <div className="bcn-0" style={{ height: 'calc(100vh - 150px)' }}>
                <Progressing pageLoader />
            </div>
        ) : (
            <div className="updated-container--sample flex left pb-8 deploy-chart__readme-column">
                <div className="right-readme ">
                    <MarkDown markdown={readmeJson} className="deploy-chart__readme-markdown" />
                </div>
            </div>
        )
    }

    renderBulkCodeEditor = () => {
        return (
            <div className="dc__border-right">
                {this.renderCodeEditorHeader()}
                {this.renderCodeEditorBody()}
            </div>
        )
    }

    renderReadmeSection = () => {
        return (
            <div>
                {this.renderSampleTemplateHeader()}
                {this.renderSampleTemplateBody()}
            </div>
        )
    }

    renderCodeEditorAndReadme = () => {
        return (
            <div className="bulk-container">
                <div>{this.renderBulkCodeEditor()}</div>
                <div>{this.renderReadmeSection()}</div>
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
        return (
            <div>
                {!this.state.showExamples ? (
                    <div> {this.renderBulkCodeEditor()}</div>
                ) : (
                    this.renderCodeEditorAndReadme()
                )}
            </div>
        )
    }

    renderEmptyStateForEAOnlyMode = () => {
        return (
            <div style={{ height: 'calc(100vh - 250px)' }}>
                <EAEmptyState
                    title="Create, build, deploy and debug custom apps"
                    msg="Create custom application by connecting your code repository. Build and deploy images at the click of a button. Debug your applications using the interactive UI."
                    stateType={EAEmptyStateType.BULKEDIT}
                    knowMoreLink={DOCUMENTATION.HOME_PAGE}
                />
            </div>
        )
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
            <div className="fs-13">
                <PageHeader
                    headerName="Bulk Edit"
                    tippyProps={{
                        isTippyCustomized: true,
                        tippyMessage: 'Run scripts to bulk edit configurations for multiple devtron components.',
                        tippyRedirectLink: DOCUMENTATION.BULK_UPDATE,
                    }}
                />
                {this.props.serverMode == SERVER_MODE.EA_ONLY
                    ? this.renderEmptyStateForEAOnlyMode()
                    : this.renderBulkEditBody()}
            </div>
        )
    }
}
