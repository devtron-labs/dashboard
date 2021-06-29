import React, { Component } from 'react'
import { DOCUMENTATION } from '../../config';
import Tippy from '@tippyjs/react';
import CodeEditor from '../CodeEditor/CodeEditor';
import { ViewType } from '../../config';
import { BulkEditsProps, BulkEditsState, OutputObjectTabs } from './bulkEdits.type';
import { Option, FragmentHOC, noop, } from '../common';
import yamlJsParser from 'yaml';
import sample from './sampleConfig.json';
import { Progressing, DevtronSwitch as Switch, DevtronSwitchItem as SwitchItem, showError, ErrorScreenManager, } from '../common';
import { ReactComponent as Question } from '../../assets/icons/ic-help-outline.svg';
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg';
import { ReactComponent as PlayButton } from '../../assets/icons/ic-play.svg';
import { getReadme, getOutputListMin } from './bulkedits.service';
import ResponsiveDrawer from '../app/ResponsiveDrawer';
import ReactSelect from 'react-select';
import { menuList, DropdownIndicator, ValueContainer } from '../charts/charts.util';
import './bulkEdit.css'
import { multiSelectStyles } from './bulkedit.utils'
import { MarkDown } from '../charts/discoverChartDetail/DiscoverChartDetails';
import { AutoSizer } from 'react-virtualized'
import MonacoEditor from 'react-monaco-editor';
import { editor } from 'monaco-editor';

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

export default class BulkEdits extends Component<BulkEditsProps, BulkEditsState>{

    constructor(props) {
        super(props)

        this.state = {
            view: ViewType.LOADING,
            statusCode:0,
            ImpactedObjectList: "",
            outputList: [],
            readmeResult: undefined,
            showExamples: false,
            showHeaderDescription: true,
            showOutputData: true,
            showObjectsOutputDrawer: false,
        }
    }

    componentDidMount = () => {

        getReadme().then((res) => {
            this.setState({ readmeResult: res.result.readme })
        }).catch((error) => {
            showError(error);
        })

        getOutputListMin().then((res) => {
            this.setState({
                view: ViewType.FORM,
                outputList: res
            })
        }).catch((error) => {
            showError(error);
        })

        // getImpactedListMin().then((res) => {
        //     let response = res
        //     this.setState({
        //         view: ViewType.FORM,
        //         outputList: response
        //     })
        // }).catch((error) => {
        //     showError(error);
        // })
    }


    renderBulkEditHeader = () => {
        return (<div className="page-header brdr-btm pl-20">
            <div className="page-header__title flex left fs-16 pt-16 pb-16 "> Run Scripts
                <Tippy className="default-tt " arrow={false} placement="top" content={
                    <span style={{ display: "block", width: "66px" }}> Learn more </span>}>
                    <Question className="icon-dim-20 ml-16" />
                </Tippy>
            </div>
        </div>)
    }

    renderBulkEditHeaderDescription = () => {
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
        // this.setState({
        //     showObjectsOutputDrawer: true
        // })
    }

    renderCodeEditorHeader = () => {
        return (
            <div className="flex left pt-8 pb-8 bcn-0 pl-20 pr-20 bw-1" style={{ borderBottom: '1px solid #d0d4d9' }} >
                <button type="button" className="cta ellipsis-right flex mr-12" style={{ maxHeight: '32px', minWidth: '72px' }} onClick={() => this.handleRunButton()} >
                    <span ><PlayButton className="flex icon-dim-16 mr-8" /></span> Run
                </button>
                <button className="en-2 bw-1 cb-5 fw-6 bcn-0 br-4 pt-6 pb-6 pl-12 pr-12" style={{ maxHeight: '32px' }} onClick={() => this.setState({ showObjectsOutputDrawer: true })}>
                    Show Impacted Objects
                </button>
                {!this.state.showExamples ?
                    <div className="cb-5 fw-6 pointer" onClick={() => this.setState({ showExamples: true })} style={{ margin: "auto", marginRight: "0" }}>
                        See Examples
                </div> : null}
            </div>
        )
    }

    renderCodeEditorBody = () => {
        let codeEditorBody = yamlJsParser.stringify(sample)
        return (
            <MonacoEditor
                theme={'vs-gray--dt'}
                height={700}
            >
            </MonacoEditor>
        )
    }

    renderOutputList = () => {
        // { console.log(this.state.outputList.map((itm) => { return itm.appNameIncludes.split("  ") })) }
        return (<div className="cn-9 fs-13 pl-20 pr-20 pt-8" style={{ fontFamily: "SourceCodePro", letterSpacing: "0.2px" }}>
            {this.state.outputList.map((itm) => { return <div> {itm.appNameIncludes} <br /><br /> </div> })}
        </div>)
    }

    renderImpactedObjectsList = () => {
        return <div className="cn-9 fs-13 pl-20 pr-20 pt-8" style={{ fontFamily: "SourceCodePro", letterSpacing: "0.2px" }}>
            {this.state.outputList.map((itm) => { return <div> {itm.appNameExcludes} <br /><br /> </div> })}
        </div>
    }

    outputImpactedTabSelector = () => {
        let onMouseDown = null
        return <FragmentHOC onMouseDown={onMouseDown || noop} >
            <div className={OutputObjectTabs.OUTPUT == 'Output' ? 'active bcn-0' : null} >
                <div className="bcn-0 pt-6 border-top" >
                    <div className="flex left pb-6 pl-20 pr-20" style={{ boxShadow: "inset 0 -1px 0 0 #d0d4d9" }}>
                        <button className="cta small cancel mr-16 flex " style={{ height: '20px' }} onClick={() => this.setState({ showOutputData: true })}>{OutputObjectTabs.OUTPUT}</button>
                        <button className="cta small cancel flex" style={{ height: '20px' }} onClick={() => this.setState({ showOutputData: false })}>{OutputObjectTabs.IMPACTED_OBJECTS}</button>
                        <Close style={{ margin: "auto", marginRight: "0" }} className="icon-dim-20 cursor"
                            onClick={() => this.setState({ showObjectsOutputDrawer: false })} />
                    </div>
                    {!this.state.showOutputData ? this.renderImpactedObjectsList() : this.renderOutputList()}
                </div>
            </div>
        </FragmentHOC>

    }
    renderObjectOutputDrawer = () => {
        return (<>
            <ResponsiveDrawer
                className="output-drawer"
                onHeightChange={(height) => { return console.log(height), (document.getElementById('dummy-div').style.height = `${height}px`) }}
                isDetailedView={!!OutputObjectTabs.OUTPUT}
                anchor={this.outputImpactedTabSelector()}>
            </ResponsiveDrawer>
            <div id="dummy-div" style={{ width: '100%', height: '0px' }}></div>
        </>
        )
    }

    renderSampleTemplateHeader = () => {
        return (
            <div className="readme-header bcn-0 pt-5 pb-5 flex pr-20">
                <ReactSelect
                    className="select-width"
                    placeholder="Update Deployment Template"
                    components={{
                        IndicatorSeparator: null,
                        Option,
                        DropdownIndicator,
                        ValueContainer,
                    }}
                    styles={{
                        ...multiSelectStyles,
                        ...menuList,
                    }} />
                <Close style={{ margin: "auto", marginRight: "0" }} className="icon-dim-20 cursor" onClick={() => this.setState({ showExamples: false })} />
            </div>
        )
    }

    renderSampleTemplateBody = () => {
        return (<div className="updated-container--sample flex left pt-8 pb-8 bcn-0 pl-20 pr-20 ">
            <div className="right-readme">
                <MarkDown markdown={this.state.readmeResult} />
            </div>
        </div>)
    }

    renderBulkCodeEditor = () => {
        return (<>
            {this.renderCodeEditorHeader()}
            {(this.state.view === ViewType.LOADING) ?<div style={{ height: 'calc(100vh - 125px)', width: '100vw' }}> <Progressing pageLoader /> </div>: this.renderCodeEditorBody() }
            
        </>)
    }

    renderUpdatedDeploymentTemplate = () => {
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
            { this.state.showHeaderDescription ? this.renderBulkEditHeaderDescription() : null}
            {this.state.showExamples ? this.renderUpdatedDeploymentTemplate() : this.renderBulkCodeEditor()}
            {this.state.showObjectsOutputDrawer ? this.renderObjectOutputDrawer() : null}
        </div>
        )
    }
}
