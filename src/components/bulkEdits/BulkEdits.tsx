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
    Icon,
    GenericSectionErrorState,
} from '@devtron-labs/devtron-fe-common-lib'
import { SERVER_MODE, ViewType } from '../../config'
import { BulkEditsProps, BulkEditsState, BulkEditVersion } from './bulkEdits.type'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
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
import { importComponentFromFELibrary } from '@Components/common'

const getBulkEditConfig = importComponentFromFELibrary('getBulkEditConfig', null, 'function')

const ReadmeVersionOptions = [
    {
        label: 'v1beta1/application',
        value: BulkEditVersion.v1,
    },
    ...(getBulkEditConfig
        ? [
              {
                  label: 'v1beta2/application',
                  value: BulkEditVersion.v2,
              },
          ]
        : []),
]

export default class BulkEdits extends Component<BulkEditsProps, BulkEditsState> {
    constructor(props: BulkEditsProps) {
        super(props)

        this.state = {
            view: ViewType.LOADING,
            statusCode: 0,
            outputResult: undefined,
            impactedObjects: undefined,
            isReadmeLoading: true,
            bulkConfig: [],
            readmeVersionOptions: ReadmeVersionOptions,
            selectedReadmeVersionOption: ReadmeVersionOptions[0],
            readmeResult: {
                [BulkEditVersion.v1]: null,
                [BulkEditVersion.v2]: null,
            },
            showExamples: true,
            activeOutputTab: 'output',
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
        Promise.allSettled([
            getBulkEditConfig?.().then(({ result: { readme } }) => {
                return readme
            }),
            getSeeExample().then(({ result }) => {
                return result[0].readme
            }),
        ])
            .then(([v2ReadmeResult, v1ReadmeResult]) => {
                const v2Readme = v2ReadmeResult.status === 'fulfilled' ? v2ReadmeResult.value : null
                const v1Readme = v1ReadmeResult.status === 'fulfilled' ? v1ReadmeResult.value : null

                this.setState({
                    isReadmeLoading: false,
                    readmeResult: { [BulkEditVersion.v1]: v1Readme, [BulkEditVersion.v2]: v2Readme },
                })
            })
            .catch((error) => {
                showError(error)
                this.setState({ isReadmeLoading: false, statusCode: error.code })
            })
    }

    handleRunButton = () => {
        this.setState({
            view: ViewType.LOADING,
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
        this.setState({
            view: ViewType.LOADING,
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
                    activeOutputTab: 'impacted',
                })
            })
            .catch((error) => {
                showError(error)
                this.setState({ view: ViewType.FORM, statusCode: error.code })
            })
    }

    renderCodeEditorHeader = () => {
        return (
            <div className="flex bg__primary px-20 py-8 dc__border-bottom dc__content-space">
                <h1 className="m-0 fs-13 cn-9 fw-6 lh-20 dc__open-sans">Script</h1>

                <div className="flexbox dc__gap-12">
                    <Button
                        text="Show Impacted Objects"
                        onClick={this.handleShowImpactedObjectButton}
                        dataTestId="show-impacted-objects-button"
                        size={ComponentSizeType.small}
                        variant={ButtonVariantType.secondary}
                    ></Button>
                    <Button
                        text="Run"
                        onClick={this.handleRunButton}
                        dataTestId="run-button"
                        startIcon={<Icon name="ic-play-outline" color={null} />}
                        size={ComponentSizeType.small}
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

    handleOutputTab = (key: BulkEditsState['activeOutputTab']) => {
        this.setState({
            activeOutputTab: key,
        })
    }

    renderCodeEditorBody = () => {
        // TODO: need to hide this if no response yet
        // TODO: also need to make it resizable

        return (
            <div className="dc__grid-rows-2 flex-grow-1 dc__overflow-hidden">
                <div className="dc__overflow-auto">
                    <CodeEditor
                        mode={MODES.YAML}
                        height="auto"
                        value={this.state.codeEditorPayload}
                        onChange={this.handleConfigChange}
                    />
                </div>
                <div className="bulk-output-drawer bg__primary flexbox-col dc__overflow-auto">
                    <div className="bulk-output-header flex left pl-20 pr-20 pt-6 dc__border-top dc__border-bottom bg__primary">
                        <OutputTabs
                            handleOutputTabs={() => this.handleOutputTab('output')}
                            outputName={this.state.activeOutputTab}
                            value="output"
                            name={OutputObjectTabs.OUTPUT}
                        />
                        <OutputTabs
                            handleOutputTabs={() => this.handleOutputTab('impacted')}
                            outputName={this.state.activeOutputTab}
                            value="impacted"
                            name={OutputObjectTabs.IMPACTED_OBJECTS}
                        />
                    </div>
                    <div
                        className="bulk-output-body cn-9 fs-13 p-20 dc__overflow-auto flexbox-col flex-grow-1"
                        data-testid="output-message"
                    >
                        {this.state.activeOutputTab === 'output' ? (
                            this.state.statusCode === 404 ? (
                                <>{STATUS.ERROR}</>
                            ) : (
                                this.renderOutputs()
                            )
                        ) : null}
                        {this.state.activeOutputTab === 'impacted' ? (
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
                    {!this.state.impactedObjects.deploymentTemplate?.length ? (
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
                    {!this.state.impactedObjects.secret?.length ? (
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

    handleUpdateTemplate = (option: BulkEditsState['selectedReadmeVersionOption']) => {
        this.setState({ selectedReadmeVersionOption: option })
    }

    onClickHideExamples = () => {
        this.setState({ showExamples: false })
    }

    renderSampleTemplateHeader = () => {
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
                        value={this.state.selectedReadmeVersionOption}
                        placeholder="Update Deployment Template"
                        options={this.state.readmeVersionOptions}
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
        const readmeJson = this.state.readmeResult[this.state.selectedReadmeVersionOption.value]

        if (this.state.isReadmeLoading) {
            return <Progressing pageLoader />
        }

        if (!readmeJson) {
            return <GenericSectionErrorState rootClassName='flex-grow-1' />
        }

        return (
            <div className="deploy-chart__readme-column flexbox-col flex-grow-1 dc__overflow-auto">
                <MarkDown markdown={readmeJson} className="flexbox-col flex-grow-1" />
            </div>
        )
    }

    renderBulkCodeEditor = () => {
        return (
            <div className="bulk-container flexbox-col flex-grow-1 dc__overflow-hidden">
                {this.renderCodeEditorHeader()}
                {this.renderCodeEditorBody()}
            </div>
        )
    }

    renderReadmeSection = () => {
        return (
            <div className="flexbox-col flex-grow-1 dc__overflow-hidden">
                {this.renderSampleTemplateHeader()}
                {this.renderSampleTemplateBody()}
            </div>
        )
    }

    renderCodeEditorAndReadme = () => {
        return (
            <div className="bulk-container vertical-divider flex-grow-1 dc__grid-half dc__overflow-hidden">
                {this.renderBulkCodeEditor()}
                {this.renderReadmeSection()}
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
                        tippyRedirectLink: 'BULK_UPDATE',
                    }}
                />
                {this.renderBulkEditBody()}
            </div>
        )
    }
}
