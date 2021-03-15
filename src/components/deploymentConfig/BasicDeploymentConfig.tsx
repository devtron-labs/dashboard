import React, { Component } from 'react'
import { ReactComponent as Question } from '../../assets/icons/ic-help-outline.svg';
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg';
import { ReactComponent as Dropdown } from '../../assets/icons/appstatus/ic-dropdown.svg';
import { CustomInput } from '../globalConfigurations/GlobalConfiguration';
import { Toggle } from '../common';
import Tippy from '@tippyjs/react';

export interface BasicDeploymentConfigProps {
    isIngressCollapsed: boolean;
    valuesOverride: any;
    mapping: any;
    toggleIngressCollapse: () => void;
}
export class BasicDeploymentConfig extends Component<BasicDeploymentConfigProps, {}> {


    render() {
        let path = this.props.mapping.cpuLimit.split('.');
        // let value = path.reduce(val, (item, s)=>{s
        //     return value = this.props.valuesOverride[val];
        // }, {})
        let containerPort = this.props.mapping.containerPort;

        return <div>
            <p className="fw-6 fs-14 mt-20 mb-8">Container Port</p>
            <CustomInput value={9090} label="Port" name="port" onChange={(event) => { }} error={[]} />
            <p className="fw-6 fs-14 mt-20 mr-8 mb-8">Resources (CPU & Memory)</p>
            <div className="flex left mb-12">
                <div className="mr-16">
                    <CustomInput value={9090} label="CPU Request" name="cpu-request" onChange={(event) => { }} error={[]} />
                </div>
                <div>
                    <CustomInput value={9090} label="CPU Limit" name="cpu-limit" onChange={(event) => { }} error={[]} />
                </div>
            </div>
            <div className="flex left">
                <div className="mr-16">
                    <CustomInput value={9090} label="CPU Request" name="memory-request" onChange={(event) => { }} error={[]} />
                </div>
                <div>
                    <CustomInput value={9090} label="CPU Limit" name="memory-limit" onChange={(event) => { }} error={[]} />
                </div>
            </div>

            <div className="mb-8 mt-24">
                <div className="flex left mb-8">
                    <p className="fw-6 fs-14 mr-8 mb-0">Replicas</p>
                    <Question className="icon-dim-20" />
                </div>
                <CustomInput value={1} label="Replica Count" name="memory-limit" onChange={(event) => { }} error={[]} />
            </div>

            <div className="mb-8 mt-24">
                <div className="flex left mb-8">
                    <p className="fw-6 fs-14 mr-8 mb-0">Probe URLs</p>
                    <Question className="icon-dim-20" />
                </div>
                <div className="flex left">
                    <div className="mr-16">
                        <CustomInput value={1} label="LivenessProbe/Path" name="memory-limit" onChange={(event) => { }} error={[]} />
                    </div>
                    <div className="">
                        <CustomInput value={1} label="ReadinessProbe/Path" name="memory-limit" onChange={(event) => { }} error={[]} />
                    </div>
                </div>
            </div>
            <hr className="divider" />
            <div onClick={this.props.toggleIngressCollapse} className="flex left cursor">
                <div className="cn-9 fs-16 fw-6 mb-6 cursor">Ingress and Service</div>
                <span className="m-auto-mr-0 ">
                    <Dropdown className="icon-dim-24 rotate " style={{ ['--rotateBy' as any]: this.props.isIngressCollapsed ? '180deg' : '0deg' }} />
                </span>
            </div>
            {this.props.isIngressCollapsed ? <>
                <div className="flex left mb-8 mt-24">
                    <p className="fw-6 fs-14 mr-8 mb-0">Ingress (Enabled)</p>
                    <div style={{ width: "20px", height: "15px" }}>
                        <Toggle rootClassName="" />
                    </div>
                </div>
                <p className="cn-7 fs-13 mb-6">Annotation</p>
                <div className="flex left">
                    <div className="mr-16">
                        <CustomInput value={1} label="" name="annotation-k" onChange={(event) => { }} error={[]} />
                    </div>
                    <div className="mr-16">
                        <CustomInput value={1} label="" name="annotation-v" onChange={(event) => { }} error={[]} />
                    </div>
                </div>

                <div className="form-row mb-12">
                    <div className="add-parameter pointer flex left cb-5 fs-14" onClick={(e) => { }}>
                        <Add className="icon-dim-20 fcb-5 mr-8" />
                        <span>Add parameter</span>
                    </div>
                </div>
                <div className="flex left mb-12">
                    <div className="mr-16">
                        <CustomInput value={1} label="Host" name="annotation-k" onChange={(event) => { }} error={[]} />
                    </div>
                    <div className="mr-16">
                        <CustomInput value={1} label="Path" name="annotation-k" onChange={(event) => { }} error={[]} />
                    </div>
                </div>
                <div className="flex left bottom  mb-12">
                    <div className="mr-16">
                        <CustomInput value={1} label="tls" name="annotation-k" onChange={(event) => { }} error={[]} />
                    </div>
                    <div className="mr-16">
                        <CustomInput value={1} label="" name="annotation-k" onChange={(event) => { }} error={[]} />
                    </div>
                </div>
                <div className="flex left mb-8 mt-24">
                    <p className="fw-6 fs-14 mr-8">Service</p>
                    <Question className="icon-dim-20" />
                </div>
                <CustomInput value={1} label="type" name="annotation-k" onChange={(event) => { }} error={[]} />
                <p className="cn-7 fs-13 mt-6 mb-0">Annotation</p>
                <div className="flex left">
                    <div className="mr-16">
                        <CustomInput value={1} label="" name="annotation-k" onChange={(event) => { }} error={[]} />
                    </div>
                    <div className="mr-16">
                        <CustomInput value={1} label="" name="annotation-v" onChange={(event) => { }} error={[]} />
                    </div>
                </div>

                <div className="form-row mb-12">
                    <div className="add-parameter pointer flex left cb-5 fs-14" onClick={(e) => { }}>
                        <Add className="icon-dim-20 fcb-5 mr-8" />
                        <span>Add parameter</span>
                    </div>
                </div>
                <hr className="divider" />
            </> : ""}
            <div className="form__buttons mt-32">
                <button className="cta" type="submit">{'Save'}</button>
            </div>
        </div>

    }
}
