import React, { Component } from 'react'
import { DOCUMENTATION } from '../../config';
import Tippy from '@tippyjs/react';
import CodeEditor from '../CodeEditor/CodeEditor';
import { BulkEditsProps, BulkEditsState } from './bulkEdits.type';
import yamlJsParser from 'yaml';
import sample from './sampleConfig.json';
import { Progressing, DevtronSwitch as Switch, DevtronSwitchItem as SwitchItem, showError, ErrorScreenManager, } from '../common';
import { ReactComponent as Question } from '../../assets/icons/ic-help-outline.svg';
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg';
import { ReactComponent as PlayButton } from '../../assets/icons/ic-play.svg';

export default class BulkEdits extends Component<BulkEditsProps, BulkEditsState>{
    constructor(props) {
        super(props)

        this.state = {
            editsConfig: undefined
        }
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
                    <Close style={{ margin: "auto", marginRight: "0" }} className="icon-dim-20 cursor"
                    //  onClick={this.props.close}
                    />

                </div>
            </div>
        )
    }

    renderImpactedObjectButtons = () => {
        return (
            <div className="flex left pt-8 pb-8 bcn-0 pl-20 pr-20 ">
                <button type="button" className="cta ellipsis-right flex mr-12" style={{ maxHeight: '32px', minWidth: '72px' }} >
                    <span ><PlayButton className="flex icon-dim-16 mr-8" /></span> Run
                </button>
                <button className="en-2 bw-1 cb-5 fw-6 bcn-0 br-4 pt-6 pb-6 pl-12 pr-12">
                    Show Impacted Objects
                </button>
                <div className="cb-5 fw-6" style={{ margin: "auto", marginRight: "0" }}>
                    See Examples
                </div>
            </div>
        )
    }


    renderBulkCodeEditor = () => {
        let codeEditorBody = yamlJsParser.stringify(sample)
        return (
            <div className="mt-0 ml-24 mr-24 mb-24">
                <div className="code-editor-container" >
                    <CodeEditor
                        // value={codeEditorBody}
                        height={770}
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

    renderImpactedObjectDrawer = () => {
        return (
            <div>
                
            </div>
        )
    }

    render() {
        return (
            <div>
                {this.renderBulkEditHeader()}
                {this.renderBulkEditHeaderDescription()}
                {this.renderImpactedObjectButtons()}
                {this.renderBulkCodeEditor()}
                {this.renderImpactedObjectDrawer()}
            </div>
        )
    }
}
