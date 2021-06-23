import React, { Component } from 'react'
import { DOCUMENTATION } from '../../config';
import Tippy from '@tippyjs/react';
import CodeEditor from '../CodeEditor/CodeEditor';
import { BulkEditsProps, BulkEditsState } from './bulkEdits.type';
import { Drawer } from '../common';
import yamlJsParser from 'yaml';
import sample from './sampleConfig.json';
import { Progressing, DevtronSwitch as Switch, DevtronSwitchItem as SwitchItem, showError, ErrorScreenManager, } from '../common';
import { ReactComponent as Question } from '../../assets/icons/ic-help-outline.svg';
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg';
import { ReactComponent as PlayButton } from '../../assets/icons/ic-play.svg';
import { MarkDown } from '../charts/discoverChartDetail/DiscoverChartDetails'
import { getReadme } from './bulkedits.service';

export default class BulkEdits extends Component<BulkEditsProps, BulkEditsState>{
    constructor(props) {
        super(props)

        this.state = {
            editsConfig: undefined,
            showImpactedObjects: false,
            readmeResult: [],
            showExamples: false,
            showHeaderDescription: true
        }
    }

    componentDidMount = () => {
        getReadme().then((res) => {
            this.setState({ readmeResult: res.result })
        }).catch((error) => {
            showError(error);
        })
    }

    renderBulkEditHeader = () => {
        return (<div className="page-header pl-20">
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
                <div className="flex left pt-10 pb-10 pl-20 pr-20" style={{ backgroundColor: "#f3f0ff" }}>
                    <div>Run scripts to bulk edit configurations for multiple devtron components.
                    <a className="learn-more__href" href={DOCUMENTATION.APP_CREATE_ENVIRONMENT_OVERRIDE} rel="noreferrer noopener" target="_blank"> Learn more</a>
                    </div>
                    <Close style={{ margin: "auto", marginRight: "0" }} className="icon-dim-20 cursor" onClick={() => this.setState({ showHeaderDescription: false })}
                    //  onClick={this.props.close}
                    />

                </div>
            </div>
        )
    }

    toggleImapactedObjects = () => {
        this.setState({ showImpactedObjects: !this.state.showImpactedObjects })
    }

    toggleShowExamples = () => {
        this.setState({ showExamples: !this.state.showExamples })
    }

    renderImpactedObjectButtons = () => {
        return (
            <div className="flex left pt-8 pb-8 bcn-0 pl-20 pr-20 ">
                <button type="button" className="cta ellipsis-right flex mr-12" style={{ maxHeight: '32px', minWidth: '72px' }} >
                    <span ><PlayButton className="flex icon-dim-16 mr-8" /></span> Run
                </button>
                <button className="en-2 bw-1 cb-5 fw-6 bcn-0 br-4 pt-6 pb-6 pl-12 pr-12" onClick={() => this.toggleImapactedObjects()}>
                    Show Impacted Objects
                </button>
                <div className="cb-5 fw-6 pointer" onClick={() => this.toggleShowExamples()} style={{ margin: "auto", marginRight: "0" }}>
                    See Examples
                </div>
            </div>
        )
    }

    renderBulkCodeEditor = () => {
        let codeEditorBody = yamlJsParser.stringify(sample)
        return (
            <div className="">
                <div className="code-editor-container" >
                    <CodeEditor
                        // value={codeEditorBody}
                        height={500}
                        mode='yaml'
                        lineDecorationsWidth={50}
                    // readOnly={this.state.configMap !== SwitchItemValues.Configuration}
                    // onChange={(event) => { this.handleConfigChange(event) }}>
                    // <CodeEditor.Header >
                    //     <Switch value={this.state.configMap} name={'tab'} onChange={(event) => { this.handleCodeEditorTab(event.target.value) }}>
                    //         <SwitchItem value={SwitchItemValues.Configuration}> Configuration  </SwitchItem>
                    //         <SwitchItem value={SwitchItemValues.Sample}>  Sample Script</SwitchItem>
                    //     </Switch>
                    // <CodeEditor.ValidationError />
                    // </CodeEditor.Header
                    >
                    </CodeEditor>
                </div>
            </div>
        )
    }

    renderObjectOutputDrawer = () => {
        return (
            <div className="bcn-0 pt-6 " >
                <div className="flex left pb-6 pl-20 pr-20" style={{ boxShadow: "inset 0 -1px 0 0 #d0d4d9" }}>
                    <button className="cta small cancel mr-16 flex " style={{ height: '20px' }}>Output</button>
                    <button className="cta small cancel flex" style={{ height: '20px' }}>Impacted Objects</button>
                    <Close style={{ margin: "auto", marginRight: "0" }} className="icon-dim-20 cursor"
                        onClick={() => this.setState({ showImpactedObjects: false })}
                    />
                </div>
                <div className="cn-9 fs-13 pl-20 pr-20" style={{ fontFamily: "SourceCodePro", letterSpacing: "0.2px", height: "244px" }}>
                    Hello, playground
                </div>
            </div>
        )
    }

    renderReadmeDeploymentHeader = () => {
        return (
            <div>

            </div>
        )
    }

    renderTemplateReadme = () => {
        return (<div style={{ height: "760px" }} className="flex left pt-8 pb-8 bcn-0 pl-20 pr-20 ">
            <div >{`"api":"/orchestrator/deployment/template/update",
                      "method": "put",
                      "action" : "run/show"
                      "payload": { }
                `}
            </div>
        </div>)
    }

    renderUpdatedDeploymentTemplate = () => {
        return (
            <div className="flex">
                <div style={{ width: "50%" }}>
                    {this.renderImpactedObjectButtons()}
                    <div style={{ height: "760px" }}>{this.renderBulkCodeEditor()}</div>
                </div>
                <div style={{ height: "100%", width: "50%" }}>
                    {this.renderReadmeDeploymentHeader()}
                    {this.renderTemplateReadme()}
                </div>
            </div>
        )
    }

    render() {
        return (
            <div>
                {/* {console.log(this.state.readmeResult)} */}
                {this.renderBulkEditHeader()}
                { this.state.showHeaderDescription ? this.renderBulkEditHeaderDescription() : null}
                {this.state.showExamples ? this.renderUpdatedDeploymentTemplate()
                    : <div>
                        {this.renderImpactedObjectButtons()}
                        {this.renderBulkCodeEditor()}
                    </div>}
                {this.state.showImpactedObjects ? this.renderObjectOutputDrawer() : null}
            </div>
        )
    }
}
