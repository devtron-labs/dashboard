//@ts-nocheck
import React, { Component } from 'react'
import Tippy from '@tippyjs/react';
import { ReactComponent as Question } from '../../assets/icons/ic-help-outline.svg';
import { BasicDeploymentConfigState } from './types';
import { Progressing } from '../common';
import { ReactComponent as Dropdown } from '../../assets/icons/appstatus/ic-dropdown.svg';
import { KeyValueInput } from '../configMaps/ConfigMap'


export default class BasicDeploymentConfig extends Component<{}, BasicDeploymentConfigState> {
    constructor(props) {
        super(props)

        this.state = {
            loading: false,
            isCollapsed: false,
            args: [],

        }
        this.toggleCollapse = this.toggleCollapse.bind(this);
        this.handleArgsChange = this.handleArgsChange.bind(this);
    }

    toggleCollapse() {
        this.setState({
            isCollapsed: !this.state.isCollapsed,
        })
    }
    handleArgsChange() {

    }

    render() {
        return (
            <div>
                <div className="flex left mb-20">
                    <div>
                        <span className="tertiary-tab form__basic-tab flex left ">
                            <div className="mr-16">
                                <input
                                    type="radio"
                                    value="google"
                                    checked={false}
                                    name="status"
                                //onClick={this.handleSSOClick}
                                />
                            </div>
                            <div>
                                <aside className="cn-9 fs-13 fw-6">Wizard (Basic)</aside>
                                <aside className="cn-7">You can configure only a subset of the available settings.</aside>
                            </div>
                        </span>
                    </div>
                    <div className="">
                        <span className="tertiary-tab form__basic-tab flex left">
                            <div className="mr-16">
                                <input
                                    type="radio"
                                    value="google"
                                    checked={false}
                                    name="status"
                                //onClick={this.handleSSOClick}
                                />
                            </div>
                            <div>
                                <aside className="cn-9 fs-13 fw-6">YAML Editor (Advanced)</aside>
                                <aside className="cn-7">You can configure all available settings in YAML/JSON format.</aside>
                            </div>
                        </span>
                    </div>
                </div>
                <div className="flex left mb-8 mt-24">
                    <div className="fw-6 fs-14 mr-8">Container Port</div>
                    <Tippy className="default-tt" arrow={false} placement="top" content={
                        <span style={{ display: "block", width: "160px" }}> </span>}>
                        <Question className="icon-dim-20" />
                    </Tippy>
                </div>
                <div className="cn-7 fs-13 mb-6">Port</div>
                <input id="host"
                    value={"8080"}
                    autoFocus
                    tabIndex={1}
                    type="text"
                    className="form__input-w-200 "
                    placeholder={"Port"}
                    //onChange={(event) => this.handleChange(event)}
                    autoComplete="off" />
                <div className="fw-6 fs-14 mt-24 mb-8">Resources (CPU & Memory)</div>
                <div className="flex left mb-12">
                    <div className="mr-16">
                        <div className="cn-7 fs-13 mb-6">CPU Request</div>
                        <input id="host"
                            //value={"8080"}
                            placeholder={"CPU (cores) Count"}
                            autoFocus
                            tabIndex={1}
                            type="text"
                            className="form__input-w-200 "
                            //onChange={(event) => this.handleChange(event)}
                            autoComplete="off" />
                    </div>
                    <div>
                        <div className="cn-7 fs-13 mb-6">CPU Limit</div>
                        <input id="host"
                            //value={"8080"}
                            placeholder={"CPU (cores) Count"}
                            autoFocus
                            tabIndex={1}
                            type="text"
                            className="form__input-w-200 "
                            //onChange={(event) => this.handleChange(event)}
                            autoComplete="off" />
                    </div>
                </div>
                <div className="flex left mb-12">
                    <div className="mr-16">
                        <div className="cn-7 fs-13 mb-6">Memory Request</div>
                        <input id="host"
                            //value={"8080"}
                            placeholder={"Memory (cores) Count"}
                            autoFocus
                            tabIndex={1}
                            type="text"
                            className="form__input-w-200 "
                            //onChange={(event) => this.handleChange(event)}
                            autoComplete="off" />
                    </div>
                    <div>
                        <div className="cn-7 fs-13 mb-6">Memory Limit</div>
                        <input id="host"
                            //value={"8080"}
                            placeholder={"Memory (cores) Count"}
                            autoFocus
                            tabIndex={1}
                            type="text"
                            className="form__input-w-200 "
                            //onChange={(event) => this.handleChange(event)}
                            autoComplete="off" />
                    </div>
                </div>
                <div className="flex left mb-8 mt-24">
                    <div className="fw-6 fs-14 mr-8">Relicas</div>
                    <Tippy className="default-tt" arrow={false} placement="top" content={
                        <span style={{ display: "block", width: "160px" }}> </span>}>
                        <Question className="icon-dim-20" />
                    </Tippy>

                </div>
                <div className="mb-24">
                    <div className="cn-7 fs-13 mb-6">Replica Count</div>
                    <input id="host"
                        value={1}
                        autoFocus
                        tabIndex={1}
                        type="text"
                        className="form__input-w-200 "
                        placeholder={"Port"}
                        //onChange={(event) => this.handleChange(event)}
                        autoComplete="off" />
                </div>
                <div className="flex left mb-8 mt-24">
                    <div className="fw-6 fs-14 mr-8">Probe URLs</div>
                    <Tippy className="default-tt" arrow={false} placement="top" content={
                        <span style={{ display: "block", width: "160px" }}> </span>}>
                        <Question className="icon-dim-20" />
                    </Tippy>
                </div>
                <div className="flex left mb-12">
                    <div className="mr-16">
                        <div className="cn-7 fs-13 mb-6">LivenessProbe/Path</div>
                        <input id="host"
                            //value={"8080"}
                            placeholder={"Enter path"}
                            autoFocus
                            tabIndex={1}
                            type="text"
                            className="form__input-w-200 "
                            //onChange={(event) => this.handleChange(event)}
                            autoComplete="off" />
                    </div>
                    <div>
                        <div className="cn-7 fs-13 mb-6">ReadinessProbe/Path</div>
                        <input id="host"
                            //value={"8080"}
                            placeholder={"Enter path"}
                            autoFocus
                            tabIndex={1}
                            type="text"
                            className="form__input-w-200 "
                            //onChange={(event) => this.handleChange(event)}
                            autoComplete="off" />
                    </div>
                </div>
                <hr />
                <div onClick={this.toggleCollapse} className="flex left cursor">
                    <div className="cn-9 fs-16 fw-6 mb-6 cursor">Ingress and Service</div>
                    <span className="m-auto-mr-0 ">
                        <Dropdown className="icon-dim-32 rotate " style={{ ['--rotateBy' as any]: this.state.isCollapsed ? '180deg' : '0deg' }} />
                    </span>
                </div>
                <div className="flex left mb-8 mt-24">
                    <div className="fw-6 fs-14 mr-8">Ingress (Enabled)</div>
                    <Tippy className="default-tt" arrow={false} placement="top" content={
                        <span style={{ display: "block", width: "160px" }}> </span>}>
                        <Question className="icon-dim-20" />
                    </Tippy>
                </div>
                <div className="cn-7 fs-13 mb-6 mt-6">Annotation</div>
                {this.state.args && this.state.args.map((arg, idx) => <KeyValueInput keyLabel={"Key"} valueLabel={"Value"}  {...arg} key={idx} index={idx} onChange={this.handleArgsChange} onDelete={e => { let argsTemp = [...arg]; argsTemp.splice(idx, 1); }} valueType="text" />)}
                <div className="form-row form-row__add-parameters mb-12">
                    <div className="add-parameter pointer" onClick={e => setArgs(args => [{ k: "", v: '', keyError: '', valueError: '' }, ...args])}>
                        <span className="fa fa-plus mr-4"></span>Add parameter
                    </div>
                </div>
                <div className="flex left mb-12">
                    <div className="mr-16">
                        <div className="cn-7 fs-13 mb-6">Host</div>
                        <input id="host"
                            value={"false"}
                            placeholder={"Enter path"}
                            autoFocus
                            tabIndex={1}
                            type="text"
                            className="form__input-w-200 "
                            //onChange={(event) => this.handleChange(event)}
                            autoComplete="off" />
                    </div>
                    <div>
                        <div className="cn-7 fs-13 mb-6">Path</div>
                        <input id="host"
                            value={"false"}
                            placeholder={"Enter path"}
                            autoFocus
                            tabIndex={1}
                            type="text"
                            className="form__input-w-200 "
                            //onChange={(event) => this.handleChange(event)}
                            autoComplete="off" />
                    </div>
                </div>
                <div className="cn-7 fs-13 mb-6">tls</div>
                <div className="form-row form-row__add-parameters mb-24 mt-6">
                    <div className="add-parameter pointer" onClick={e => setArgs(args => [{ k: "", v: '', keyError: '', valueError: '' }, ...args])}>
                        <span className="fa fa-plus mr-4"></span>Add parameter
                    </div>
                </div>
                <div className="flex left mb-8 mt-24">
                    <div className="fw-6 fs-14 mr-8">Service</div>
                    <Tippy className="default-tt" arrow={false} placement="top" content={
                        <span style={{ display: "block", width: "160px" }}> </span>}>
                        <Question className="icon-dim-20" />
                    </Tippy>

                </div>
                <div className="mb-24">
                    <div className="cn-7 fs-13 mb-6">type</div>
                    <input id="host"
                        value={1}
                        autoFocus
                        tabIndex={1}
                        type="text"
                        className="form__input-w-200 "
                        placeholder={"Port"}
                        //onChange={(event) => this.handleChange(event)}
                        autoComplete="off" />
                </div>
                <div className="cn-7 fs-13 mb-6">Annotation</div>
                {this.state.args && this.state.args.map((arg, idx) => <KeyValueInput keyLabel={"Key"} valueLabel={"Value"}  {...arg} key={idx} index={idx} onChange={this.handleArgsChange} onDelete={e => { let argsTemp = [...arg]; argsTemp.splice(idx, 1); }} valueType="text" />)}
                <div className="form-row form-row__add-parameters">
                    <div className="add-parameter pointer" onClick={e => setArgs(args => [{ k: "", v: '', keyError: '', valueError: '' }, ...args])}>
                        <span className="fa fa-plus mr-4 mt-6"></span>Add parameter
                    </div>
                </div>
                <hr />
                <div className="form__buttons">
                    <button className="cta" type="submit">{this.state.loading ? <Progressing /> : 'Save'}</button>
                </div>
            </div>
        )
    }
}
