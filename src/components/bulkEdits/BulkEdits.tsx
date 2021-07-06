import React, { Component } from 'react'
import { DOCUMENTATION } from '../../config';
import Tippy from '@tippyjs/react';
import CodeEditor from '../CodeEditor/CodeEditor';
import { ViewType } from '../../config';
import { BulkEditsProps, BulkEditsState, OutputObjectTabs } from './bulkEdits.type';
import { FragmentHOC, noop, } from '../common';
import yamlJsParser from 'yaml';
import { Progressing, showError, ErrorScreenManager } from '../common';
import { ReactComponent as Question } from '../../assets/icons/ic-help-outline.svg';
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg';
import { ReactComponent as PlayButton } from '../../assets/icons/ic-play.svg';
import { updateBulkList, getSeeExample, updateImpactedObjectsList } from './bulkedits.service';
import ResponsiveDrawer from '../app/ResponsiveDrawer';
import ReactSelect from 'react-select';
import { DropdownIndicator } from '../charts/charts.util';
import './bulkEdit.css'
import { multiSelectStyles } from './bulkedit.utils'
import { MarkDown } from '../charts/discoverChartDetail/DiscoverChartDetails';
import { AutoSizer } from 'react-virtualized'
import { editor } from 'monaco-editor';
import { toast } from 'react-toastify';

editor.defineTheme('vs-gray--dt', {
    base: 'vs-dark',
    inherit: true,
    rules: [
        //@ts-ignore
        { background: '#f2f4f7' }
    ],
    colors: {
        'editor.background': '#f2f4f7',
    }
});

// const OutputTabs = (handleOutputTabs) => {
//   return <label className="tertiary-tab__radio">
//         <input type="radio" name="status" value={`output`}  onChange={handleOutputTabs}/>
//         <span className="tertiary-output-tab bulk-output-tabs "> Output </span>
//     </label>
// }

export default class BulkEdits extends Component<BulkEditsProps, BulkEditsState>{

    constructor(props) {
        super(props)

        this.state = {
            view: ViewType.LOADING,
            statusCode: 0,
            bulkConfig: undefined,
            bulkOutput: "",
            updatedTemplate: [],
            impactedObjects: [],
            readmeResult: [],
            showExamples: false,
            showHeaderDescription: true,
            showOutputData: true,
            showObjectsOutputDrawer: false,
            codeEditorPayload: undefined,
        }
    }

    componentDidMount = () => {
        this.setState({
            view: ViewType.LOADING,
        })

        getSeeExample().then((res) => {
            let bulkConfig = res.result
            let readmeResult = bulkConfig.map((elm) => elm.readme)
            let updatedTemplate = bulkConfig.map((elm) => {
                return {
                    value: 1,
                    label: elm.task,
                }
            })

            this.setState({
                view: ViewType.FORM,
                bulkConfig: bulkConfig,
                updatedTemplate: updatedTemplate,
                readmeResult: readmeResult
            })
        })
        .catch((error) => {
            showError(error);
            this.setState({ view: ViewType.FORM });
        })
    }

    renderBulkEditHeader = () => {
        return (<div className="page-header brdr-btm pl-20">
            <div className="page-header__title flex left fs-16 pt-16 pb-16 "> Run Scripts
                <Tippy className="default-tt " arrow={false} placement="top" content={
                    <span style={{ display: "block", width: "66px" }}> Learn more </span>}>
                    <Question className="icon-dim-20 ml-16 cursor" />
                </Tippy>
            </div>
        </div>)
    }

    renderBulkHeaderDescription = () => {
        return (
            <div className="deployment-group-list-page">
                <div className="bulk-desciription flex left pt-10 pb-10 pl-20 pr-20 cn-9" >
                    <Question className="icon-dim-16 mr-13" style={{ stroke: "#664bee" }} />
                    <div>Run scripts to bulk edit configurations for multiple devtron components.
                      <a className="learn-more__href" href={DOCUMENTATION.APP_CREATE_ENVIRONMENT_OVERRIDE} rel="noreferrer noopener" target="_blank"> Learn more</a>
                    </div>
                    <Close style={{ margin: "auto", marginRight: "0" }} className="icon-dim-20 cursor" onClick={() => this.setState({ showHeaderDescription: false })} />
                </div>
            </div>
        )
    }

    handleRunButton = () => {
        this.setState({
            view: ViewType.LOADING
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
            let output = response.result;
            this.setState({
                view: ViewType.FORM,
                bulkOutput: output,
                showObjectsOutputDrawer: true
            })
        })
            .catch((error) => {
                showError(error);
                this.setState({ view: ViewType.FORM });
            })
    }

    handleShowImpactedObjectButton = () => {
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
            let result = response.result.map((elm) => elm.appName)
            this.setState({
                view: ViewType.FORM,
                impactedObjects: result,
                showObjectsOutputDrawer: true
            })

        }).catch((error) => {
            showError(error);
            this.setState({ view: ViewType.FORM });
        })
    }

    renderCodeEditorHeader = () => {
        return (
            <div className="flex left pt-8 pb-8 bcn-0 pl-20 pr-20 bw-1" >
                <button type="button" className="cta ellipsis-right flex mr-12" style={{ maxHeight: '32px', minWidth: '72px' }} onClick={() => this.handleRunButton()} >
                    <span ><PlayButton className="flex icon-dim-16 mr-8" /></span> Run
                </button>
                <button className="en-2 bw-1 cb-5 fw-6 bcn-0 br-4 pt-6 pb-6 pl-12 pr-12" style={{ maxHeight: '32px' }} onClick={() => this.handleShowImpactedObjectButton()}>
                    Show Impacted Objects
                </button>
                {!this.state.showExamples ?
                    <div className="cb-5 fw-6 pointer" onClick={() => this.setState({ showExamples: true })} style={{ margin: "auto", marginRight: "0" }}>
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

    renderCodeEditorBody = () => {
        let codeEditorBody = this.state.codeEditorPayload
        return (<div className="code-editor-container">
            <CodeEditor
                // theme={'vs-gray--dt'}
                height={700}
                value={codeEditorBody}
                mode="yaml"
                onChange={(event) => { this.handleConfigChange(event) }}
            >
            </CodeEditor>
        </div>
        )
    }

    renderOutputList = () => {
        return (<div> {this.state.bulkOutput} </div>)
    }

    renderImpactedObjectsList = () => {
        return <div>{this.state.impactedObjects.map((itm) => { return <div> {itm} <br /><br /> </div> })} </div>
    }

    outputImpactedTabSelector = () => {
        let onMouseDown = null
        return <FragmentHOC onMouseDown={onMouseDown || noop} >
            <div className={OutputObjectTabs.OUTPUT == 'Output' ? 'active bcn-0' : null} >
                <div className="bulk-output-drawer bcn-0 " >
                    <div className="bulk-output-header flex left pb-6 pl-20 pr-20 pt-6 border-top border-btm bcn-0 cursor--ns-resize" >
                        <button className="cta small cancel mr-16 flex " style={{ height: '20px' }} onClick={() => this.setState({ showOutputData: true })}>{OutputObjectTabs.OUTPUT}</button>
                        {/* <OutputTabs handleOutputTabs={() => this.setState({ showOutputData: true })}/> */}
                        <button className="cta small cancel flex" style={{ height: '20px' }} onClick={() => {
                            return this.setState({showOutputData: false,}),
                                 this.handleShowImpactedObjectButton()
                        }}>
                            {OutputObjectTabs.IMPACTED_OBJECTS}
                        </button>
                        <Close
                            style={{ margin: "auto", marginRight: "70px" }}
                            className="icon-dim-20 cursor"
                            onClick={() => this.setState({ showObjectsOutputDrawer: false })} />
                    </div>
                    <div className=" cn-9 fs-13 pl-20 pr-20 pt-40" style={{ letterSpacing: "0.2px" }}>
                        {!this.state.showOutputData ? this.renderImpactedObjectsList() : this.renderOutputList()}
                    </div>
                </div>
            </div>
        </FragmentHOC>
    }

    renderObjectOutputDrawer = () => {
        return (<>
            <ResponsiveDrawer
                className="output-drawer"
                onHeightChange={(height) => { (document.getElementById('dummy-div').style.height = `${height}px`) }}
                isDetailedView={!!OutputObjectTabs.OUTPUT}
                anchor={this.outputImpactedTabSelector()}>
            </ResponsiveDrawer>
            <div id="dummy-div" style={{ width: '100%', height: '0px' }}></div>
        </>
        )
    }

    handleUpdateTemplate = () => {
        this.setState({ readmeResult: this.state.bulkConfig.map((elm) => elm.readme) })
    }

    renderSampleTemplateHeader = () => {
        return (
            <div className="readme-header bcn-0 pt-5 pb-5 flex pr-20">
                <ReactSelect
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
                <Close style={{ margin: "auto", marginRight: "50px" }} className="icon-dim-20 cursor" onClick={() => this.setState({ showExamples: false })} />
            </div>
        )
    }

    renderSampleTemplateBody = () => {
        let readmeJson = yamlJsParser.stringify(this.state.readmeResult)
        return <div className="updated-container--sample flex left pt-8 pb-8 bcn-0 pl-20 pr-20 ">
            <div className="right-readme">  <MarkDown markdown={readmeJson} /> </div>
        </div>
    }

    renderBulkCodeEditor = () => {
        return (<>
            {this.renderCodeEditorHeader()}
            {(this.state.view === ViewType.LOADING) ? <div style={{ height: 'calc(100vh - 125px)', width: '100vw' }}> <Progressing pageLoader /> </div> : this.renderCodeEditorBody()}

        </>)
    }

    renderReadmeSection = () => {
        return (
            <div className="updated-container" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div>{this.renderBulkCodeEditor()}</div>
                <div  >
                    {this.renderSampleTemplateHeader()}
                    {this.renderSampleTemplateBody()}
                </div>
            </div>
        )
    }

    render() {
        if (this.state.view === ViewType.ERROR) {
            return <div className="global-configuration__component flex">
                <ErrorScreenManager code={this.state.statusCode} />
            </div>
        }

        return (<div>
            {this.renderBulkEditHeader()}
            {this.state.showHeaderDescription ? this.renderBulkHeaderDescription() : null}
            {this.state.showExamples ? this.renderReadmeSection() : this.renderBulkCodeEditor()}
            {this.state.showObjectsOutputDrawer ? this.renderObjectOutputDrawer() : null}
        </div>
        )
    }
}
