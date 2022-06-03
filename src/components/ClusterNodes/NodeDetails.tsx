import React, { useState, useEffect } from 'react'
import './clusterNodes.scss'
import { BreadCrumb, Progressing, useBreadcrumb } from '../common'
import { ReactComponent as Info } from '../../assets/icons/ic-info-filled.svg'
import { ReactComponent as AlertTriangle } from '../../assets/icons/ic-alert-triangle.svg'
import { ReactComponent as Cpu } from '../../assets/icons/ic-cpu.svg'
import { ReactComponent as Memory } from '../../assets/icons/ic-memory.svg'
import { ReactComponent as Storage } from '../../assets/icons/ic-storage.svg'
import { ReactComponent as Edit } from '../../assets/icons/ic-pencil.svg'
import PageHeader from '../common/header/PageHeader'
import { useParams } from 'react-router'

export default function NodeDetails() {
    const [loader, setLoader] = useState(false)
    const [selectedTabIndex, setSelectedTabIndex] = useState(0)
    const { clusterId, nodeName } = useParams<{ clusterId: string; nodeName: string }>()

    const renderNodeDetailsTabs = (): JSX.Element => {
        return (
            <ul role="tablist" className="tab-list">
                <li
                    className="tab-list__tab pointer"
                    onClick={() => {
                        setSelectedTabIndex(0)
                    }}
                >
                    <div className={`mb-6 fs-13${selectedTabIndex == 0 ? ' fw-6 cb-5' : ' fw-4'}`}>Summary</div>
                    {selectedTabIndex == 0 && <div className="node-details__active-tab" />}
                </li>
                <li
                    className="tab-list__tab pointer"
                    onClick={() => {
                        setSelectedTabIndex(1)
                    }}
                >
                    <div className={`mb-6 flexbox fs-13${selectedTabIndex == 1 ? ' fw-6 cb-5' : ' fw-4'}`}>
                        <Edit className={`icon-dim-16 mt-2 mr-5 ${selectedTabIndex == 1 ? ' edit-yaml-icon' : ''}`} />
                        YAML
                    </div>
                    {selectedTabIndex == 1 && <div className="node-details__active-tab" />}
                </li>
                <li
                    className="tab-list__tab pointer"
                    onClick={() => {
                        setSelectedTabIndex(2)
                    }}
                >
                    <div className={`mb-6 fs-13${selectedTabIndex == 2 ? ' fw-6 cb-5' : ' fw-4'}`}>Node conditions</div>
                    {selectedTabIndex == 2 && <div className="node-details__active-tab" />}
                </li>
            </ul>
        )
    }

    const { breadcrumbs } = useBreadcrumb(
        {
            alias: {
                clusters: {
                    component: <span className="cb-5 fs-13">Clusters</span>,
                    linked: true,
                },
                ':clusterId': {
                    component: <span className="cb-5 fs-13">{clusterId}</span>,
                    linked: true,
                },
                ':nodeName': {
                    component: <span className="fs-13">{nodeName}</span>,
                    linked: false,
                },
            },
        },
        [clusterId, nodeName],
    )

    const renderBreadcrumbs = (): JSX.Element => {
        return <BreadCrumb breadcrumbs={breadcrumbs} />
    }

    const renderSummary = (): JSX.Element => {
        return (
            <div className="node-details-container">
                <div className="ml-20 mr-20 mb-12 mt-16 pl-20 pr-20 pt-16 pb-16 bcn-0 br-4">
                    <div className="fw-6 fs-16 cn-9">ip-172-31-2-152.us-east-2.compute.internal</div>
                    <div className="fw-6 fs-13 cr-5">NOT RUNNING</div>
                </div>
                <div className="ml-20 mr-20 mt-12 node-details-grid">
                    <div className="fw-6 fs-16 cn-9">
                        <div className=" en-2 bw-1 br-4 bcn-0">
                            <div className="flexbox bcr-5 pt-12 pb-12 pr-10 pl-20 top-radius-4">
                                <Info className="error-icon-white mt-2 mb-2 mr-8 icon-dim-18" />
                                <span className="fw-6 fs-14 cn-9">2 Errors</span>
                            </div>
                            <div className="pt-12 pr-20 pl-20">
                                <div>
                                    <div className="fw-6 fs-13 cn-9">OutOfDisk</div>
                                    <p className="fw-4 fs-13 cn-7 mb-12">
                                        kubelet has insufficient disk space available
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-12 en-2 bw-1 br-4 bcn-0">
                            <div className="flexbox bcy-5 pt-12 pb-12 pr-10 pl-20 top-radius-4">
                                <AlertTriangle className="alert-icon-white mt-2 mb-2 mr-8 icon-dim-18" />
                                <span className="fw-6 fs-14 cn-9">2 Errors</span>
                            </div>
                            <div className="pt-12 pr-20 pl-20">
                                <div>
                                    <div className="fw-6 fs-13 cn-9">Resource overcommitted</div>
                                    <p className="fw-4 fs-13 cn-7 mb-12">Limits for “cpu” is over 100%</p>
                                </div>
                                <div>
                                    <div className="fw-6 fs-13 cn-9">2 taints applied</div>
                                    <p className="fw-4 fs-13 cn-7 mb-12">
                                        Taints may be restricting pods from being scheduled on this node
                                    </p>
                                </div>
                                <div>
                                    <div className="fw-6 fs-13 cn-9">Unschedulable: true</div>
                                    <p className="fw-4 fs-13 cn-7 mb-12">
                                        This restricts pods from being scheduled on this node
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-12 en-2 bw-1 br-4 bcn-0">
                            <div className="flexbox pt-12 pb-12 pr-10 pl-20 top-radius-4">
                                <span className="fw-6 fs-14 cn-9">Node overview</span>
                            </div>
                            <div className="pr-20 pl-20">
                                <div>
                                    <div className="fw-6 fs-13 cn-7">Name</div>
                                    <p className="fw-4 fs-13 cn-9 mb-12">ip-172-31-2-152.us-east-2.compute.internal</p>
                                </div>
                                <div>
                                    <div className="fw-6 fs-13 cn-7">Role</div>
                                    <p className="fw-4 fs-13 cn-9 mb-12">Node</p>
                                </div>
                                <div>
                                    <div className="fw-6 fs-13 cn-9">K8s version</div>
                                    <p className="fw-4 fs-13 cn-7 mb-12">1.12.6_1546</p>
                                </div>
                                <div>
                                    <div className="fw-6 fs-13 cn-9">Unschedulable</div>
                                    <p className="fw-4 fs-13 cn-7 mb-12">True</p>
                                </div>
                                <div>
                                    <div className="fw-6 fs-13 cn-9">Created at</div>
                                    <p className="fw-4 fs-13 cn-7 mb-12">Wed, 30 Dec 2020 11:56:06 +0530</p>
                                </div>
                                <div>
                                    <div className="fw-6 fs-13 cn-9">Internal IP</div>
                                    <p className="fw-4 fs-13 cn-7 mb-12">172.31.177.00</p>
                                </div>
                                <div>
                                    <div className="fw-6 fs-13 cn-9">External IP</div>
                                    <p className="fw-4 fs-13 cn-7 mb-12">3.135.185.157</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="ml-12">
                        <div className="en-2 bw-1 br-4 bcn-0">
                            <div className="resource-row border-bottom fw-6 fs-13 pt-12 pb-12 pr-20 pl-20 cn-7">
                                <div></div>
                                <div>Resource</div>
                                <div>Requests</div>
                                <div>Limits</div>
                                <div>Capacity</div>
                                <div>Usage</div>
                            </div>
                            <div className="resource-row border-bottom-n1 fw-4 fs-13 pt-12 pb-12 pr-20 pl-20 cn-9">
                                <Cpu className="error-icon-white mt-2 mb-2 icon-dim-18" />
                                <div>cpu</div>
                                <div>1081m (54%)</div>
                                <div>1,850m (92%)</div>
                                <div>1,850m (92%)</div>
                                <div>1,850m (92%)</div>
                            </div>
                            <div className="resource-row border-bottom-n1 fw-4 fs-13 pt-12 pb-12 pr-20 pl-20 cn-9">
                                <Memory className="error-icon-white mt-2 mb-2 icon-dim-18" />
                                <div>memory</div>
                                <div>905Mi (18%)</div>
                                <div>2,398Mi (49%)</div>
                                <div>2,398Mi (49%)</div>
                                <div>2,398Mi (49%)</div>
                            </div>
                            <div className="resource-row border-bottom-n1 fw-4 fs-13 pt-12 pb-12 pr-20 pl-20 cn-9">
                                <Storage className="error-icon-white mt-2 mb-2 icon-dim-18" />
                                <div>ephemeral-storage</div>
                                <div>0m (0%)</div>
                                <div>0m (0%)</div>
                                <div>0m (0%)</div>
                                <div>0m (0%)</div>
                            </div>
                            <div className="resource-row border-bottom-n1 fw-4 fs-13 pt-12 pb-12 pr-20 pl-20 cn-9">
                                <Storage className="error-icon-white mt-2 mb-2 icon-dim-18" />
                                <div>attachable-volumes-aws-ebs</div>
                                <div>0</div>
                                <div>0</div>
                                <div>0</div>
                                <div>0</div>
                            </div>
                        </div>
                        <div className="en-2 bw-1 br-4 bcn-0 mt-12">
                            <div className="flexbox pt-12 pb-12 pr-10 pl-20 top-radius-4">
                                <span className="fw-6 fs-14 cn-9">Node overview</span>
                            </div>
                            <div className="pr-20 pl-20">
                                <div>
                                    <div className="fw-6 fs-13 cn-9">External IP</div>
                                    <p className="fw-4 fs-13 cn-7 mb-12">3.135.185.157</p>
                                </div>
                            </div>
                        </div>
                        <div className="en-2 bw-1 br-4 bcn-0 mt-12">
                            <div className="fw-6 fs-14 cn-9 pr-20 pl-20 pt-12">Pods</div>
                            <div className="pods-row border-bottom pt-12 pb-12 pr-20 pl-20 fw-6 fs-13 cn-7">
                                <div>Namespace</div>
                                <div>Pod</div>
                                <div>CPU Requests</div>
                                <div>CPU Limits</div>
                                <div className="ellipsis-right">Memory Requests</div>
                                <div>Memory Limits</div>
                                <div>Age</div>
                            </div>
                            <div className="pods-row border-bottom-n1 pt-12 pb-12 pr-20 pl-20 fw-4 fs-13 cn-9">
                                <div>argo</div>
                                <div>calico-kube-controllers-cf4844b67-fgrkr</div>
                                <div>0m (0%)</div>
                                <div>0m (0%)</div>
                                <div>0m (0%)</div>
                                <div>0m (0%)</div>
                                <div>8d</div>
                            </div>
                            <div className="pods-row border-bottom-n1 pt-12 pb-12 pr-20 pl-20 fw-4 fs-13 cn-9">
                                <div>devtron-demo</div>
                                <div>calico-node-szbc5</div>
                                <div>30m (1%)</div>
                                <div>300m (15%)</div>
                                <div>50Mi (1%)</div>
                                <div>300Mi (6%)</div>
                                <div>8d</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const renderYAMLEditor = (): JSX.Element => {
        return <div className="node-details-container">YAML EDITOR</div>
    }

    const renderConditions = (): JSX.Element => {
        return <div className="node-details-container">Conditions</div>
    }

    const renderTabs = () => {
        if (selectedTabIndex === 1) {
            return renderYAMLEditor()
        } else if (selectedTabIndex === 2) {
            return renderConditions()
        } else {
            return renderSummary()
        }
    }

    if (loader) {
        return <Progressing />
    }

    return (
        <>
            <PageHeader
                breadCrumbs={renderBreadcrumbs}
                isBreadcrumbs={true}
                showTabs={true}
                renderHeaderTabs={renderNodeDetailsTabs}
            />
            {renderTabs()}
        </>
    )
}
