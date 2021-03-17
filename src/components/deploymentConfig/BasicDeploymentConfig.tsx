import React, { Component } from 'react'
import { ReactComponent as Question } from '../../assets/icons/ic-help-outline.svg';
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg';
import { ReactComponent as Dropdown } from '../../assets/icons/appstatus/ic-dropdown.svg';
import { CustomInput } from '../globalConfigurations/GlobalConfiguration';
import { Toggle } from '../common';
import JSONPath from 'jsonpath';
import YAML from 'yaml';

export interface BasicDeploymentConfigProps {
    isIngressCollapsed: boolean;
    valuesOverride: any;
    mapping: any;
    handleBasicDeploymentConfig: (value, path) => void;
    toggleIngressCollapse: () => void;
}
export class BasicDeploymentConfig extends Component<BasicDeploymentConfigProps, {}> {

    getValues() {
        let valuesOverride = YAML.parse(this.props.valuesOverride);
        let replicaCount: number, replicas: number,
            ingressAnnotation: string, ingressHost: string, ingressTls: string,
            livenessPath: string, readinessPath: string, serviceAnnotation: string,
            serviceType: string;
        let ports: string[] = JSONPath.query(valuesOverride, 'ContainerPort..port');
        let cpuLimit: string = JSONPath.query(valuesOverride, this.props.mapping.cpuLimit);
        let cpuRequest: string = JSONPath.query(valuesOverride, this.props.mapping.cpuRequest);
        let memoryLimit: string = JSONPath.query(valuesOverride, this.props.mapping.memoryLimit);
        let memoryRequest: string = JSONPath.query(valuesOverride, this.props.mapping.memoryRequest);
        // ingressAnnotation = JSONPath.query(valuesOverride, this.props.mapping.ingressAnnotation);
        // ingressHost = JSONPath.query(valuesOverride, this.props.mapping.ingressHost);
        // ingressTls = JSONPath.query(valuesOverride, this.props.mapping.ingressTls);
        livenessPath = JSONPath.query(valuesOverride, this.props.mapping.livenessPath);
        readinessPath = JSONPath.query(valuesOverride, this.props.mapping.readinessPath);
        replicaCount = JSONPath.query(valuesOverride, this.props.mapping.replicaCount);
        // replicas = JSONPath.query(valuesOverride, this.props.mapping.replicas);
        serviceAnnotation = JSONPath.query(valuesOverride, 'service.annotations');
        // serviceType = JSONPath.query(valuesOverride, this.props.mapping.serviceType);

        return {
            ports, cpuRequest, cpuLimit, memoryLimit, memoryRequest,
            replicas, replicaCount, ingressAnnotation,
            ingressHost, ingressTls, livenessPath, readinessPath, serviceAnnotation,
            serviceType
        }
    }

    render() {
        let { ports, cpuRequest, cpuLimit, memoryLimit, memoryRequest,
            replicas, replicaCount, ingressAnnotation,
            ingressHost, ingressTls, livenessPath, readinessPath, serviceAnnotation,
            serviceType } = this.getValues();

        return <div>
            <p className="fw-6 fs-14 mt-20 mb-8">Container Port</p>
            {ports.map((port, index) => <CustomInput value={port} label="Port" name="port" onChange={(event) => { this.props.handleBasicDeploymentConfig(event.target.value, 'ContainerPort..port') }} error={[]} />)}
            <div className="form-row mb-12">
                <div className="add-parameter pointer flex left cb-5 fs-14" onClick={(e) => { }}>
                    <Add className="icon-dim-20 fcb-5 mr-8" />
                    <span>Add parameter</span>
                </div>
            </div>

            <p className="fw-6 fs-14 mt-20 mr-8 mb-8">Resources (CPU & Memory)</p>
            <div className="flex left mb-12">
                <div className="mr-16">
                    <CustomInput value={cpuRequest} label="CPU Request" name="cpu-request" onChange={(event) => { this.props.handleBasicDeploymentConfig(event.target.value, this.props.mapping.cpuRequest) }} error={[]} />
                </div>
                <div>
                    <CustomInput value={cpuLimit} label="CPU Limit" name="cpu-limit" onChange={(event) => { this.props.handleBasicDeploymentConfig(event.target.value, this.props.mapping.cpuLimit) }} error={[]} />
                </div>
            </div>
            <div className="flex left">
                <div className="mr-16">
                    <CustomInput value={memoryRequest} label="Memory Request" name="memory-request" onChange={(event) => { this.props.handleBasicDeploymentConfig(event.target.value, this.props.mapping.memoryRequest) }} error={[]} />
                </div>
                <div>
                    <CustomInput value={memoryLimit} label="Memory Limit" name="memory-limit" onChange={(event) => { this.props.handleBasicDeploymentConfig(event.target.value, this.props.mapping.memoryLimit) }} error={[]} />
                </div>
            </div>

            <div className="mb-8 mt-24">
                <div className="flex left mb-8">
                    <p className="fw-6 fs-14 mr-8 mb-0">Replicas</p>
                    <Question className="icon-dim-20" />
                </div>
                <CustomInput value={replicaCount} label="Replica Count" name="memory-limit"
                    onChange={(event) => { this.props.handleBasicDeploymentConfig(event.target.value, this.props.mapping.replicaCount) }} error={[]} />
            </div>

            <div className="mb-8 mt-24">
                <div className="flex left mb-8">
                    <p className="fw-6 fs-14 mr-8 mb-0">Probe URLs</p>
                    <Question className="icon-dim-20" />
                </div>
                <div className="flex left">
                    <div className="mr-16">
                        <CustomInput value={livenessPath} label="LivenessProbe/Path" name="LivenessProbe"
                            onChange={(event) => { this.props.handleBasicDeploymentConfig(event.target.value, this.props.mapping.livenessPath) }} error={[]} />
                    </div>
                    <div className="">
                        <CustomInput value={readinessPath} label="ReadinessProbe/Path" name="ReadinessProbe"
                            onChange={(event) => { this.props.handleBasicDeploymentConfig(event.target.value, this.props.mapping.readinessPath) }} error={[]} />
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
                        <CustomInput value={ingressHost} label="Host" name="ingress-host"
                            onChange={(event) => { this.props.handleBasicDeploymentConfig(event.target.value, this.props.mapping.ingressHost) }} error={[]} />
                    </div>
                    <div className="mr-16">
                        <CustomInput value={ingressTls} label="Path" name="ingress-path"
                            onChange={(event) => { this.props.handleBasicDeploymentConfig(event.target.value, this.props.mapping.ingressTls) }} error={[]} />
                    </div>
                </div>
                <div className="flex left bottom  mb-12">
                    <div className="mr-16">
                        <CustomInput value={1} label="tls" name="tls-k" onChange={(event) => { }} error={[]} />
                    </div>
                    <div className="mr-16">
                        <CustomInput value={1} label="" name="tls-v" onChange={(event) => { }} error={[]} />
                    </div>
                </div>
                <div className="flex left mb-8 mt-24">
                    <p className="fw-6 fs-14 mr-8">Service</p>
                </div>
                <CustomInput value={serviceType} label="type" name="annotation-k"
                    onChange={(event) => { this.props.handleBasicDeploymentConfig(event.target.value, this.props.mapping.serviceType) }} error={[]} />
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
                <button className="cta" type="submit">Save</button>
            </div>
        </div>
    }
}
