import React, { Component } from 'react'
import Tippy from '@tippyjs/react';
import { ReactComponent as Question } from '../../assets/icons/ic-help-outline.svg';
import { BasicDeploymentConfigState } from './types';
import { Progressing } from '../common';


export default class BasicDeploymentConfig extends Component <{}, BasicDeploymentConfigState> {
    constructor(props) {
        super(props)
    
        this.state = {
            loading: false,
        }
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
            <div className="flex left">
                <div className="cn-9 fs-16 fw-6 mb-6 cursor">Ingress and Service</div>
            </div>
            <hr />
            <div className="form__buttons">
             <button className="cta" type="submit">{this.state.loading ? <Progressing /> : 'Save'}</button>
            </div>
            </div>
        )
    }
}
