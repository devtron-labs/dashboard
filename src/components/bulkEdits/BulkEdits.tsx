import React, { Component } from 'react'
import { DOCUMENTATION, SERVER_MODE } from '../../config'
import CodeEditor from '../CodeEditor/CodeEditor'
import { ViewType } from '../../config'
import {
    BulkEditsProps,
    BulkEditsState,
    OutputTabType,
    CMandSecretOutputKeys,
    DtOutputKeys,
    CMandSecretImpactedObjects,
} from './bulkEdits.type'
import yamlJsParser from 'yaml'
import { Progressing, showError, ErrorScreenManager } from '../common'
import { ReactComponent as Question } from '../../assets/icons/ic-help-outline.svg'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as PlayButton } from '../../assets/icons/ic-play.svg'
import { updateBulkList, getSeeExample, updateImpactedObjectsList } from './bulkedits.service'
import ReactSelect from 'react-select'
import { DropdownIndicator } from '../charts/charts.util'
import './bulkEdit.scss'
import { multiSelectStyles } from './bulkedit.utils'
import { Option } from '../../components/v2/common/ReactSelect.utils'
import { MarkDown } from '../charts/discoverChartDetail/DiscoverChartDetails'
import { toast } from 'react-toastify'
import '../charts/discoverChartDetail/DiscoverChartDetails.scss'
import '../charts/modal/DeployChart.scss'
import EAEmptyState, { EAEmptyStateType } from '../common/eaEmptyState/EAEmptyState'
import PageHeader from '../common/header/PageHeader'
import { BULK_EDIT_MESSAGING, OutputObjectTabs, STATUS } from './constants'
import { BlockList } from 'net'

const OutputTabs: React.FC<OutputTabType> = ({ handleOutputTabs, outputName, value, name }) => {
    return (
        <label className="dc__tertiary-tab__radio flex fs-13">
            <input type="radio" name="status" checked={outputName === value} value={value} onClick={handleOutputTabs} />
            <div className="tertiary-output-tab cursor mr-12 pb-6"> {name} </div>
        </label>
    )
}

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
            showHeaderDescription: true,
            showOutputData: true,
            showImpactedtData: false,
            codeEditorPayload: undefined,
        }
    }

    componentDidMount = () => {
        if (this.props.serverMode == SERVER_MODE.FULL) {
            this.setState({
                view: ViewType.LOADING,
            })
            this.initialise()
        }
    }

    initialise() {
        getSeeExample()
            .then((res) => {
                this.setState({ view: ViewType.LOADING })
                let bulkConfig = res.result
                let kind = bulkConfig.map((elm) => elm.script.kind)
                kind = kind.toString().toLocaleLowerCase()
                let apiVersion = bulkConfig.map((elm) => elm.script.apiVersion)
                apiVersion = apiVersion.toString()
                let readmeResult = bulkConfig.map((elm) => elm.readme)
                let updatedTemplate = bulkConfig.map((elm) => {
                    return {
                        value: elm.operation,
                        label: elm.operation,
                    }
                })

                this.setState({
                    view: ViewType.FORM,
                    isReadmeLoading: false,
                    bulkConfig: bulkConfig,
                    updatedTemplate: updatedTemplate,
                    readmeResult: readmeResult,
                })
            })
            .catch((error) => {
                showError(error)
                this.setState({ view: ViewType.FORM, statusCode: error.code })
            })
    }

    renderBulkHeaderDescription = () => {
        return (
            <div className="deployment-group-list-page ">
                <div className="bulk-desciription flex left pt-10 pb-10 pl-20 pr-20 cn-9">
                    <Question className="icon-dim-16 mr-13 fcv-5" />
                    <div>
                        {BULK_EDIT_MESSAGING.HEADER_TEXT}
                        <a
                            className="dc__link"
                            href={DOCUMENTATION.BULK_UPDATE}
                            rel="noreferrer noopener"
                            target="_blank"
                        >
                            {BULK_EDIT_MESSAGING.HEADER_LINK_TEXT}
                        </a>
                    </div>
                    <Close
                        style={{ margin: 'auto', marginRight: '0' }}
                        className="icon-dim-20 cursor"
                        onClick={() => this.setState({ showHeaderDescription: false })}
                    />
                </div>
            </div>
        )
    }

    handleRunButton = (e) => {
        var outputDiv = document.querySelector('.code-editor-body')
        outputDiv.scrollTop = outputDiv.scrollHeight

        this.setState({
            view: ViewType.LOADING,
            outputName: 'output',
        })

        let configJson: any = {}
        try {
            configJson = yamlJsParser.parse(this.state.codeEditorPayload)
        } catch (error) {
            //Invalid YAML, couldn't be parsed to JSON. Show error toast
            toast.error('Invalid Yaml')
            this.setState({ view: ViewType.FORM })
            return
        }
        let errorMessage = []
        errorMessage.push(STATUS.ERROR)

        let payload = configJson

        updateBulkList(payload)
            .then((response) => {
                let outputResult = response.result
                this.setState({
                    statusCode: 0,
                    view: ViewType.FORM,
                    showOutputData: true,
                    outputName: 'output',
                    outputResult: outputResult,
                    showImpactedtData: false,
                    impactedObjects: undefined,
                })
            })
            .catch((error) => {
                showError(error)
                this.setState({ view: ViewType.FORM, statusCode: error.code, outputName: 'output' })
            })
    }

    handleShowImpactedObjectButton = () => {
        var outputDiv = document.querySelector('.code-editor-body')
        outputDiv.scrollTop = outputDiv.scrollHeight

        this.setState({
            view: ViewType.LOADING,
            outputName: 'impacted',
        })

        let configJson: any = {}
        try {
            configJson = yamlJsParser.parse(this.state.codeEditorPayload)
        } catch (error) {
            //Invalid YAML, couldn't be parsed to JSON. Show error toast
            toast.error('Invalid Yaml')
            this.setState({ view: ViewType.FORM })
            return
        }

        let payload = configJson

        updateImpactedObjectsList(payload)
            .then((response) => {
                let impactedObjects = response.result
                this.setState({
                    statusCode: 0,
                    view: ViewType.FORM,
                    impactedObjects: impactedObjects,
                    outputResult: undefined,
                    outputName: 'impacted',
                    showImpactedtData: true,
                })
            })
            .catch((error) => {
                showError(error)
                this.setState({ view: ViewType.FORM, statusCode: error.code, outputName: 'impacted' })
            })
    }

    renderCodeEditorHeader = () => {
        return (
            <div className="flex left pt-8 pb-8 bcn-0 pl-20 pr-20 border-btm">
                <button
                    type="button"
                    className="bulk-run-button cta dc__ellipsis-right pl-12 pr-12 flex mr-12 "
                    onClick={(e) => this.handleRunButton(e)}
                >
                    <span>
                        <PlayButton className="flex icon-dim-16 mr-8 " />
                    </span>
                    <div>{BULK_EDIT_MESSAGING.RUN}</div>
                </button>
                <button
                    className="fs-12 en-2 bw-1 cb-5 fw-6 bcn-0 br-4 pt-6 pb-6 pl-12 pr-12"
                    style={{ maxHeight: '32px' }}
                    onClick={() => this.handleShowImpactedObjectButton()}
                >
                    {BULK_EDIT_MESSAGING.SHOW_IMPACTED_OBJECTS}
                </button>
                {!this.state.showExamples ? (
                    <div
                        className="cb-5 fw-6 fs-13 pointer"
                        onClick={() => this.setState({ showExamples: true })}
                        style={{ margin: 'auto', marginRight: '0' }}
                    >
                        {BULK_EDIT_MESSAGING.SEE_SAMPLES}
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
                showImpactedtData: false,
            })
        }
        if (key == 'impacted') {
            this.setState({
                outputName: 'impacted',
                showImpactedtData: true,
                showOutputData: false,
            })
        }
    }

    renderCodeEditorBody = () => {
        return (
            <div>
                <CodeEditor
                    theme="vs-gray--dt"
                    height={400}
                    value={this.state.codeEditorPayload}
                    mode="yaml"
                    onChange={(event) => {
                        this.handleConfigChange(event)
                    }}
                ></CodeEditor>
                <div className="bulk-output-drawer bcn-0 fs-13">
                    <div className="bulk-output-header flex left pl-20 pr-20 pt-6 dc__border-top border-btm bcn-0">
                        <OutputTabs
                            handleOutputTabs={(e) => this.handleOutputTab(e, 'output')}
                            outputName={this.state.outputName}
                            value={'output'}
                            name={OutputObjectTabs.OUTPUT}
                        />
                        <OutputTabs
                            handleOutputTabs={(e) => this.handleOutputTab(e, 'impacted')}
                            outputName={this.state.outputName}
                            value={'impacted'}
                            name={OutputObjectTabs.IMPACTED_OBJECTS}
                        />
                    </div>
                    <div className="bulk-output-body cn-9 fs-13 pl-20 pr-20 pt-20">
                        {this.state.showOutputData ? (
                            this.state.statusCode === 404 ? (
                                <>{STATUS.ERROR}</>
                            ) : (
                                this.renderOutputs()
                            )
                        ) : null}
                        {this.state.showImpactedtData ? (
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
                    {BULK_EDIT_MESSAGING.CONFIGMAPS}<br />
                    <br />
                </div>
                <div>
                    {BULK_EDIT_MESSAGING.MESSAGE_TEXT}<br />
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
                    {BULK_EDIT_MESSAGING.FAILED_OPERATION}
                    <br />
                    <br />
                    {this.state.outputResult.configMap?.failure == null ? (
                        <>{BULK_EDIT_MESSAGING.NO_RESULT_FOUND}</>
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
                    {BULK_EDIT_MESSAGING.SUCCESSFUL_OPERATIONS}<br />
                    <br />
                    {this.state.outputResult.configMap?.successful == null ? (
                        <>{BULK_EDIT_MESSAGING.NO_RESULT_FOUND}</>
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
                {BULK_EDIT_MESSAGING.APP_ID}{DTOutputKeys.appId} <br />
                {BULK_EDIT_MESSAGING.APP_NAME}{DTOutputKeys.appName} <br />
                {BULK_EDIT_MESSAGING.ENV_ID}{DTOutputKeys.envId} <br />
                {BULK_EDIT_MESSAGING.MESSAGE}{DTOutputKeys.message} <br />
                <br />
            </div>
        )
    }

    renderCmAndSecretResponseForOneApp = (CMandSecretOutputKeys: CMandSecretOutputKeys) => {
        return (
            <div>
                {BULK_EDIT_MESSAGING.APP_ID}{CMandSecretOutputKeys.appId} <br />
                {BULK_EDIT_MESSAGING.APP_NAME}{CMandSecretOutputKeys.appName} <br />
                {BULK_EDIT_MESSAGING.ENV_ID}{CMandSecretOutputKeys.envId} <br />
                {BULK_EDIT_MESSAGING.NAMES}{CMandSecretOutputKeys.names.join(', ')} <br />
                {BULK_EDIT_MESSAGING.MESSAGE}{CMandSecretOutputKeys.message} <br />
                <br />
            </div>
        )
    }

    renderCMAndSecretImpObj = (CMandSecretImpactedObject: CMandSecretImpactedObjects) => {
        return (
            <div>
                {BULK_EDIT_MESSAGING.APP_ID}{CMandSecretImpactedObject.appId} <br />
                {BULK_EDIT_MESSAGING.APP_NAME}{CMandSecretImpactedObject.appName} <br />
                {BULK_EDIT_MESSAGING.ENV_ID}{CMandSecretImpactedObject.envId} <br />
                {BULK_EDIT_MESSAGING.NAMES}{CMandSecretImpactedObject.names.join(', ')} <br />
                <br />
            </div>
        )
    }

    renderDeploymentTemplateOutput = () => {
        return (
            <div>
                <div>
                    {BULK_EDIT_MESSAGING.DEPLOYMENT_TEMPLATE}<br />
                    <br />
                </div>
                <div>
                {BULK_EDIT_MESSAGING.MESSAGE_TEXT}<br />
<br />
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
                    {BULK_EDIT_MESSAGING.FAILED_OPERATION}
                    <br />
                    <br />
                    {this.state.outputResult.deploymentTemplate?.failure == null ? (
                        <>{BULK_EDIT_MESSAGING.NO_RESULT_FOUND}</>
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
                    {BULK_EDIT_MESSAGING.SUCCESSFUL_OPERATIONS}<br />
                    <br />
                    {this.state.outputResult.deploymentTemplate?.successful == null ? (
                        <>{BULK_EDIT_MESSAGING.NO_RESULT_FOUND}</>
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
                    {BULK_EDIT_MESSAGING.SECRETS_TEXT}<br />
                    <br />
                </div>
                <div>
                    {BULK_EDIT_MESSAGING.MESSAGE_TEXT}<br />
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
                    {BULK_EDIT_MESSAGING.FAILED_OPERATION}
                    <br />
                    <br />
                    {this.state.outputResult.secret?.failure == null ? (
                        <>{BULK_EDIT_MESSAGING.NO_RESULT_FOUND}</>
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
                    {BULK_EDIT_MESSAGING.SUCCESSFUL_OPERATIONS}<br />
                    <br />
                    {this.state.outputResult.secret?.successful == null ? (
                        <>{BULK_EDIT_MESSAGING.NO_RESULT_FOUND}</>
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
        let payloadStringWithoutSpaces = this.state.codeEditorPayload?.split(' ').join('')
        let deploymentTemplateInPayload = payloadStringWithoutSpaces?.includes('deploymentTemplate:\nspec:')
        let configMapInPayload = payloadStringWithoutSpaces?.includes('configMap:\nspec:')
        let secretInPayload = payloadStringWithoutSpaces?.includes('secret:\nspec:')
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
                    {BULK_EDIT_MESSAGING.CONFIGMAPS}<br /> <br />
                    {this.state.impactedObjects.configMap.length === 0 ? (
                        <>{BULK_EDIT_MESSAGING.NO_RESULT_FOUND} </>
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
                    {BULK_EDIT_MESSAGING.DEPLOYMENT_TEMPLATE}<br /> <br />
                    {this.state.impactedObjects.deploymentTemplate.length === 0 ? (
                        <>{BULK_EDIT_MESSAGING.NO_RESULT_FOUND}</>
                    ) : (
                        <>
                            {this.state.impactedObjects.deploymentTemplate.map((elm) => {
                                return (
                                    <div>
                                        {BULK_EDIT_MESSAGING.APP_ID}{elm.appId} <br />
                                        {BULK_EDIT_MESSAGING.APP_NAME}{elm.appName} <br />
                                        {BULK_EDIT_MESSAGING.ENV_ID}{elm.envId} <br />
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
                    {BULK_EDIT_MESSAGING.SECRETS_TEXT}<br /> <br />
                    {this.state.impactedObjects.secret.length === 0 ? (
                        <>{BULK_EDIT_MESSAGING.NO_RESULT_FOUND}</>
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
        let payloadStringWithoutSpaces = this.state.codeEditorPayload?.split(' ').join('')
        let deploymentTemplateInPayload = payloadStringWithoutSpaces?.includes('deploymentTemplate:\nspec:')
        let configMapInPayload = payloadStringWithoutSpaces?.includes('configMap:\nspec:')
        let secretInPayload = payloadStringWithoutSpaces?.includes('secret:\nspec:')
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
                let readmeResult = res.result.map((elm) => elm.readme)
                this.setState({
                    isReadmeLoading: false,
                    readmeResult: readmeResult,
                })
            })
            .catch((error) => {
                showError(error)
                this.setState({ isReadmeLoading: false, statusCode: error.code })
            })
    }

    renderSampleTemplateHeader = () => {
        return (
            <div className="border-btm bcn-0 pt-5 pb-5 flex pr-20">
                <div className="fw-6 cn-9 pl-20">Sample:</div>
                <ReactSelect
                    value={this.state.updatedTemplate[0]}
                    defaultValue={this.state.updatedTemplate[0]}
                    className="select-width"
                    placeholder="Update Deployment Template"
                    options={this.state.updatedTemplate}
                    onChange={() => this.handleUpdateTemplate()}
                    components={{
                        IndicatorSeparator: null,
                        DropdownIndicator,
                        Option,
                    }}
                    styles={{
                        ...multiSelectStyles,
                    }}
                />
                <Close
                    style={{ margin: 'auto', marginRight: '0px' }}
                    className="icon-dim-20 cursor"
                    onClick={() => this.setState({ showExamples: false })}
                />
            </div>
        )
    }

    renderSampleTemplateBody = () => {
        let readmeJson = this.state.readmeResult.toString()
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
                <div className="code-editor-body">{this.renderCodeEditorBody()}</div>
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
                {this.state.showHeaderDescription ? this.renderBulkHeaderDescription() : null}
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
                    title={'Create, build, deploy and debug custom apps'}
                    msg={
                        'Create custom application by connecting your code repository. Build and deploy images at the click of a button. Debug your applications using the interactive UI.'
                    }
                    stateType={EAEmptyStateType.BULKEDIT}
                    knowMoreLink={DOCUMENTATION.HOME_PAGE}
                />
            </div>
        )
    }

    render() {
        if (this.state.view === ViewType.ERROR) {
            return (
                <div className="global-configuration__component flex">
                    <ErrorScreenManager code={this.state.statusCode} />
                </div>
            )
        }

        return (
            <div className="fs-13">
                <PageHeader
                    headerName="Bulk Edit"
                    isTippyShown={true}
                    TippyIcon={Question}
                    tippyMessage={'Learn more'}
                    tippyRedirectLink={DOCUMENTATION.BULK_UPDATE}
                />
                {this.props.serverMode == SERVER_MODE.EA_ONLY
                    ? this.renderEmptyStateForEAOnlyMode()
                    : this.renderBulkEditBody()}
            </div>
        )
    }
}
