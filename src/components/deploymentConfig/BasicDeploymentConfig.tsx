import React, { Component } from 'react'
import Tippy from '@tippyjs/react';
import { ReactComponent as Question } from '../../assets/icons/ic-help-outline.svg';
import { BasicDeploymentConfigState } from './types';
import { Progressing } from '../common';
import { ReactComponent as Dropdown } from '../../assets/icons/appstatus/ic-dropdown.svg';

export interface BasicDeploymentConfigProps {
    isIngressCollapsed: boolean;
    toggleIngressCollapse: (flag) => void;

}
export class BasicDeploymentConfig extends Component<BasicDeploymentConfigProps, BasicDeploymentConfigState> {

    render() {
        return (<>
            <div>
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
                            
                            tabIndex={1}
                            type="text"
                            className="form__input-w-200 "
                            //onChange={(event) => this.handleChange(event)}
                            autoComplete="off" />
                    </div>
                </div>
                <hr className="divider" />
                <div onClick={this.props.toggleIngressCollapse} className="flex left cursor">
                    <div className="cn-9 fs-16 fw-6 mb-6 cursor">Ingress and Service</div>
                    <span className="m-auto-mr-0 ">
                        <Dropdown className="icon-dim-32 rotate " style={{ ['--rotateBy' as any]: this.props.isIngressCollapsed ? '180deg' : '0deg' }} />
                    </span>
                </div>
                <hr className="divider" />
                {this.props.isIngressCollapsed ? <>
                    <div className="flex left mb-8 mt-24">
                        <div className="fw-6 fs-14 mr-8">Ingress (Enabled)</div>
                        <Tippy className="default-tt" arrow={false} placement="top" content={
                            <span style={{ display: "block", width: "160px" }}> </span>}>
                            <Question className="icon-dim-20" />
                        </Tippy>
                    </div>
                    <div className="cn-7 fs-13 mb-6 mt-6">Annotation</div>
                    <div className="flex left mb-12">
                        <div className="mr-16">
                            <input id="host"
                                //value={"8080"}
                                placeholder={"Key"}
                                
                                tabIndex={1}
                                type="text"
                                className="form__input-w-200 "
                                //onChange={(event) => this.handleChange(event)}
                                autoComplete="off" />
                        </div>
                        <div>
                            <input id="host"
                                value={"8080"}
                                placeholder="Value"
                                
                                tabIndex={1}
                                type="text"
                                className="form__input-w-200 "
                                //onChange={(event) => this.handleChange(event)}
                                autoComplete="off" />
                        </div>
                    </div>
                    <div className="form-row form-row__add-parameters mb-12">
                        {/* <div className="add-parameter pointer" onClick={e => setArgs(args => [{ k: "", v: '', keyError: '', valueError: '' }, ...args])}>
                            <span className="fa fa-plus mr-4"></span>Add parameter
                        </div> */}
                    </div>
                    <div className="flex left mb-12">
                        <div className="mr-16">
                            <div className="cn-7 fs-13 mb-6">Host</div>
                            <input id="host"
                                value={"false"}
                                placeholder={"Enter path"}
                                
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
                                
                                tabIndex={1}
                                type="text"
                                className="form__input-w-200 "
                                //onChange={(event) => this.handleChange(event)}
                                autoComplete="off" />
                        </div>
                    </div>
                    <div className="cn-7 fs-13 mb-6">tls</div>
                    <div className="form-row form-row__add-parameters mb-24 mt-6">
                        {/* <div className="add-parameter pointer" onClick={e => setArgs(args => [{ k: "", v: '', keyError: '', valueError: '' }, ...args])}>
                            <span className="fa fa-plus mr-4"></span>Add parameter
                    </div> */}
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
                            
                            tabIndex={1}
                            type="text"
                            className="form__input-w-200 "
                            placeholder={"Port"}
                            //onChange={(event) => this.handleChange(event)}
                            autoComplete="off" />
                    </div>
                    <div className="cn-7 fs-13 mb-6">Annotation</div>
                    <div className="flex left mb-12">
                        <div className="mr-16">
                            <input id="host"
                                //value={"8080"}
                                placeholder={"Key"}
                                
                                tabIndex={1}
                                type="text"
                                className="form__input-w-200 "
                                //onChange={(event) => this.handleChange(event)}
                                autoComplete="off" />
                        </div>
                        <div>
                            <input id="host"
                                //value={"8080"}
                                placeholder={"Value"}
                                
                                tabIndex={1}
                                type="text"
                                className="form__input-w-200 "
                                //onChange={(event) => this.handleChange(event)}
                                autoComplete="off" />
                        </div>
                    </div>
                    <div className="form-row form-row__add-parameters">
                        {/* <div className="add-parameter pointer" onClick={e => setArgs(args => [{ k: "", v: '', keyError: '', valueError: '' }, ...args])}>
                            <span className="fa fa-plus mr-4 mt-6"></span>Add parameter
                    </div> */}
                    </div>
                    <hr className="divider" />
                </> : ""}
                <div className="form__buttons">
                    <button className="cta" type="submit">{'Save'}</button>
                </div>
            </div>
        </>
        )
    }
}
