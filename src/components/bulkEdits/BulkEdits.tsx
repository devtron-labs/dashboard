import React, { Component } from 'react'
import { DOCUMENTATION } from '../../config';
import Tippy from '@tippyjs/react';
import CodeEditor from '../CodeEditor/CodeEditor';
import { ViewType } from '../../config';
import { BulkEditsProps, BulkEditsState, OutputTabType } from './bulkEdits.type';
import { FragmentHOC, noop, } from '../common';
import yamlJsParser from 'yaml';
import { Progressing, showError, ErrorScreenManager } from '../common';
import { ReactComponent as Question } from '../../assets/icons/ic-help-outline.svg';
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg';
import { ReactComponent as PlayButton } from '../../assets/icons/ic-play.svg';
import { updateBulkList, getSeeExample, updateImpactedObjectsList } from './bulkedits.service';
import ReactSelect from 'react-select';
import { DropdownIndicator } from '../charts/charts.util';
import './bulkEdit.css'
import { multiSelectStyles } from './bulkedit.utils'
import { MarkDown } from '../charts/discoverChartDetail/DiscoverChartDetails';
import { toast } from 'react-toastify';
import '../charts/discoverChartDetail/DiscoverChartDetails.scss';
import '../charts/modal/DeployChart.scss';



export enum OutputObjectTabs {
    OUTPUT = "Output",
    IMPACTED_OBJECTS = "Impacted objects"
}

const STATUS = {
    EMPTY: "We could not find any matching devtron applications."
}

const OutputTabs: React.FC<OutputTabType> = ({ handleOutputTabs, outputName, value, name }) => {
    return <label className="tertiary-tab__radio flex">
        <input type="radio" name="status" checked={outputName === value} value={value} onClick={handleOutputTabs} />
        <div className="tertiary-output-tab cursor mr-12"> {name} </div>
    </label>
}

export default class BulkEdits extends Component<BulkEditsProps, BulkEditsState>{

    constructor(props) {
        super(props)

        this.state = {
            view: ViewType.LOADING,
            isReadmeLoading: true,
            outputName: "output",
            statusCode: 0,
            bulkConfig: [],
            bulkOutput: "",
            updatedTemplate: [],
            impactedObjects: [],
            readmeResult: [],
            showExamples: true,
            showHeaderDescription: true,
            showOutputData: true,
            codeEditorPayload: undefined,
        }
    }

    componentDidMount = () => {
        this.setState({
            view: ViewType.LOADING,
        })

        getSeeExample().then((res) => {
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
                showError(error);
                this.setState({ view: ViewType.FORM, statusCode: error.code });
            })
    }

    renderBulkEditHeader = () => {
        return (<div className="page-header brdr-btm pl-20">
            <div className="page-header__title flex left fs-16 pt-16 pb-16 "> Bulk Edit
                <Tippy className="default-tt " arrow={false} placement="top" content={
                    <span style={{ display: "block", width: "66px" }}> Learn more </span>}>
                    <a className="learn-more__href flex" href={DOCUMENTATION.BULK_UPDATE} rel="noreferrer noopener" target="_blank">
                        <Question className="icon-dim-20 ml-16 cursor" /></a>
                </Tippy>

            </div>
        </div>)
    }

    renderBulkHeaderDescription = () => {
        return (
            <div className="deployment-group-list-page">
                <div className="bulk-desciription flex left pt-10 pb-10 pl-20 pr-20 cn-9" >
                    <Question className="icon-dim-16 mr-13 fcv-5" />
                    <div>Run scripts to bulk edit configurations for multiple devtron components.
                      <a className="learn-more__href" href={DOCUMENTATION.BULK_UPDATE} rel="noreferrer noopener" target="_blank"> Learn more</a>
                    </div>
                    <Close style={{ margin: "auto", marginRight: "0" }} className="icon-dim-20 cursor" onClick={() => this.setState({ showHeaderDescription: false })} />
                </div>
            </div>
        )
    }

    handleRunButton = () => {
        var outputDiv = document.querySelector('.code-editor-body')
        outputDiv.scrollTop = outputDiv.scrollHeight;

        this.setState({
            view: ViewType.LOADING,
            outputName: "output"
        })

        let configJson: any = {};
        try {
            configJson = yamlJsParser.parse(this.state.codeEditorPayload)
        }
        catch (error) {
            //Invalid YAML, couldn't be parsed to JSON. Show error toast
            toast.error("Invalid Yaml");
            this.setState({ view: ViewType.FORM });
            return;
        }

        let payload = configJson

        updateBulkList(payload).then((response) => {
            this.setState({ view: ViewType.LOADING, outputName: 'output' })
            let output = response.result;
            this.setState({
                ...this.state,
                view: ViewType.FORM,
                bulkOutput: output,
                showOutputData: true,
                outputName: 'output'
            })
        })
            .catch((error) => {
                showError(error);
                this.setState({ view: ViewType.FORM, statusCode: error.code, outputName: 'output' });
            })
    }

    handleShowImpactedObjectButton = () => {
        var outputDiv = document.querySelector('.code-editor-body')
        outputDiv.scrollTop = outputDiv.scrollHeight;

        this.setState({
            view: ViewType.LOADING,
            outputName: "impacted"
        })

        let configJson: any = {};
        try {
            configJson = yamlJsParser.parse(this.state.codeEditorPayload)
        }
        catch (error) {
            //Invalid YAML, couldn't be parsed to JSON. Show error toast
            toast.error("Invalid Yaml");
            this.setState({ view: ViewType.FORM });
            return;
        }

        let payload = configJson

        updateImpactedObjectsList(payload).then((response) => {
            let impactedObjects = []
            if (response.result.length === 0) { impactedObjects.push(STATUS.EMPTY) }
            else response.result.map((elm) => { impactedObjects.push(elm.appName) })
            this.setState({
                ...this.state,
                view: ViewType.FORM,
                impactedObjects: impactedObjects,
                showOutputData: false,
                outputName: "impacted"
            })

        }).catch((error) => {
            showError(error);
            this.setState({ view: ViewType.FORM, statusCode: error.code });
        })
    }

    renderCodeEditorHeader = () => {
        return (
            <div className="flex left pt-8 pb-8 bcn-0 pl-20 pr-20 border-btm" >
                <button type="button" className="bulk-run-button cta ellipsis-right flex mr-12 pl-12 pr-12" onClick={() => this.handleRunButton()} >
                    <span ><PlayButton className="flex icon-dim-16 mr-8" /></span> Run
                </button>
                <button className="en-2 bw-1 cb-5 fw-6 bcn-0 br-4 pt-6 pb-6 pl-12 pr-12" style={{ maxHeight: '32px' }} onClick={() => this.handleShowImpactedObjectButton()}>
                    Show Impacted Objects
                </button>
                {!this.state.showExamples ?
                    <div className="cb-5 fw-6 fs-13 pointer" onClick={() => this.setState({ showExamples: true })} style={{ margin: "auto", marginRight: "0" }}>
                        See Examples
                </div> : null}
            </div>
        )
    }

    handleConfigChange = (value) => {
        this.setState({
            ...this.state,
            codeEditorPayload: value
        })
    }

    handleOutputTab = (key: string) => {
        if (key == "output") {
            this.setState({
                outputName: "output"
            })
        }
        if (key == "impacted") {
            this.setState({
                outputName: "impacted"
            })
        }
    }

    renderCodeEditorBody = () => {
        let codeEditorBody = this.state.codeEditorPayload
        return <div>
            <CodeEditor
                theme='vs-gray--dt'
                height={400}
                value={codeEditorBody}
                mode="yaml"
                onChange={(event) => { this.handleConfigChange(event) }}
            >
            </CodeEditor>
            <div className="bulk-output-drawer bcn-0 " >
                <div className="bulk-output-header flex left pl-20 pr-20 pt-6 border-top border-btm bcn-0" >
                    <OutputTabs handleOutputTabs={() => this.handleOutputTab("output")} outputName={this.state.outputName} value={'output'} name={OutputObjectTabs.OUTPUT} />
                    <OutputTabs handleOutputTabs={() => this.handleOutputTab("impacted")} outputName={this.state.outputName} value={'impacted'} name={OutputObjectTabs.IMPACTED_OBJECTS} />
                </div>
                <div className="bulk-output-body cn-9 fs-13 pl-20 pr-20 pt-20">
                    {!this.state.showOutputData ? this.renderImpactedObjects() : this.renderOutputs()}
                </div>
            </div>
        </div>
    }

    renderOutputs = () => {
        return (
            this.state.view === ViewType.LOADING ? <div style={{ height: 'calc(100vh - 700px)' }}><Progressing pageLoader /></div> : <div> {this.state.bulkOutput} </div>)
    }

    renderImpactedObjects = () => {
        return <div>
            {(this.state.view === ViewType.LOADING) ? <div style={{ height: 'calc(100vh - 700px)' }}> <Progressing pageLoader /> </div> :
                this.state.impactedObjects.map((itm) => {
                    return <div>{itm}<br /><br /></div>
                })} </div>
    }

    handleUpdateTemplate = () => {
        this.setState({ isReadmeLoading: true })
        getSeeExample().then((res) => {
            let readmeResult = res.result.map((elm) => elm.readme)
            this.setState({
                isReadmeLoading: false,
                readmeResult: readmeResult
            })
        })
            .catch((error) => {
                showError(error);
                this.setState({ isReadmeLoading: false, statusCode: error.code });
            })

    }

    renderSampleTemplateHeader = () => {
        return (
            <div className="border-btm bcn-0 pt-5 pb-5 flex pr-20">
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
                    }}
                    styles={{
                        ...multiSelectStyles,
                    }} />
                <Close style={{ margin: "auto", marginRight: "0px" }} className="icon-dim-20 cursor" onClick={() => this.setState({ showExamples: false })} />
            </div>
        )
    }

    renderSampleTemplateBody = () => {
        let readmeJson = this.state.readmeResult.toString()
        return (this.state.isReadmeLoading ? <div style={{ height: 'calc(100vh - 150px)' }}><Progressing pageLoader /></div> :
            <div className="updated-container--sample flex left pb-8 deploy-chart__readme-column">
                <div className="right-readme "><MarkDown markdown={readmeJson} className="deploy-chart__readme-markdown" /></div>
            </div>)
    }

    renderBulkCodeEditor = () => {
        return (<div className="border-right">
            {this.renderCodeEditorHeader()}
            <div className="code-editor-body">
                {this.renderCodeEditorBody()}
            </div>

        </div>)
    }

    renderReadmeSection = () => {
        return (<div>
            {this.renderSampleTemplateHeader()}
            {this.renderSampleTemplateBody()}
        </div>)
    }

    renderCodeEditorAndReadme = () => {
        return (<div className="bulk-container" >
            <div>{this.renderBulkCodeEditor()}</div>
            <div>{this.renderReadmeSection()}</div>
        </div>

        )
    }

    renderReadmeAndCodeEditor = () => {
        return <div className={`${this.state.showExamples ? "code-editor-readme" : null}`}>
            <div>{this.renderBulkCodeEditor()}</div>
            {this.state.showExamples ? <div className="flex end" style={{ transition: "all .2s ease-out" }}>{this.renderReadmeSection()}</div> : null}

        </div>
    }

    render() {
        if (this.state.view === ViewType.ERROR) {
            return <div className="global-configuration__component flex">
                <ErrorScreenManager code={this.state.statusCode} />
            </div>
        }

        return (<div style={{ backgroundColor: "white" }}>
            {this.renderBulkEditHeader()}
            {this.state.showHeaderDescription ? this.renderBulkHeaderDescription() : null}
            {!this.state.showExamples ? <div> {this.renderBulkCodeEditor()}</div> : this.renderCodeEditorAndReadme()}
        </div>
        )
    }
}
