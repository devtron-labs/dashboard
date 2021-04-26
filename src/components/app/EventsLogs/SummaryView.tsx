import React, { useEffect } from 'react';
import { AggregatedNodes } from '../types';
import summarylist from './summarylist.json';

export interface SummaryProps {
    appName: string;
    environmentName: string;
    nodeName: string;
    nodes: AggregatedNodes;
}

export const SummaryView: React.FC<SummaryProps> = ({ appName, environmentName, nodeName, nodes }) => {

    useEffect(() => {

        

    }, [appName, environmentName, nodeName])

    return <div className="pb-20" style={{ gridColumn: '1 / span 2', overflow: "scroll", height: "100%" }}>
        <div className="w-100 pt-20 pl-20 pr-20" style={{ display: "grid", gridTemplateColumns: '1fr 1fr', gap: "12px" }}>
            <div className="flex left top column pt-16 pb-16 pl-16 pr-16 en-7 br-4 bw-1" style={{}} >
                <div className="cn-0 o-1 fw-6 fs-14" style={{}}>Configuration</div>
                <div className="cn-0 ">
                    {summarylist.configuration.map((configuration) =>
                        <div className="w-100" style={{ display: "grid", gridTemplateColumns: '100px 1fr', gap: "16px" }}>
                            <div className="pt-6 o-05">{configuration.Priority}</div>
                            <div className="pt-6">{configuration.Selector}</div>
                        </div>)}
                </div>
            </div>

            <div className="flex left top column pt-16 pb-16 pl-16 pr-16 br-4 en-7 bw-1">
                <div className="cn-0 o-1 fw-6 fs-14">Status</div>
                <div className="cn-0">
                    <div className="w-100" style={{ display: "grid", gridTemplateColumns: '100px 1fr', gap: "16px" }}>
                        <div className="pt-6 o-05 cn-0">QoS</div>
                        <div className="">BestEffort</div>
                    </div>
                    <div className="w-100" style={{ display: "grid", gridTemplateColumns: '100px 1fr', gap: "16px" }}>
                        <div className="pt-6 o-05">Phase</div>
                        <div className="cg-5">Running</div>
                    </div>
                    <div className="w-100" style={{ display: "grid", gridTemplateColumns: '100px 1fr', gap: "16px" }}>
                        <div className="pt-6 o-05">Pod IP</div>
                        <div>100.121.233.57</div>
                    </div>
                    <div className="w-100" style={{ display: "grid", gridTemplateColumns: '100px 1fr', gap: "16px" }}>
                        <div className="pt-6 o-05">Host IP</div>
                        <div>172.31.25.102</div>
                    </div>
                </div>
            </div>
        </div>

        <div className="mr-20 ml-20 mt-20 mb-20 flex left top column pt-16 pb-16 pl-16 pr-16 br-4 en-7 bw-1" >
            <div className="cn-0 mb-8 fw-6 fs-14">Pod Conditions</div>
            <div className="w-100">
                <div className="w-100 mt-7 mb-7" style={{ display: "grid", gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: "16px", borderBottom: "bcn-7" }}>
                    <div className="pt-7 pb-7 cn-0">Type</div>
                    <div className="pt-7 pb-7 cn-0">Status</div>
                    <div className="pt-7 pb-7 cn-0">Last Transition Time</div>
                    <div className="pt-7 pb-7 cn-0">Message</div>
                    <div className="pt-7 pb-7 cn-0">Reason</div>
                </div>
                {summarylist.podConditions.map((pod) => {
                    return <div className="w-100" style={{ display: "grid", gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: "16px", borderBottom: "bcn-7" }}>
                        <div className="pt-3 pb-3 cn-0 o-05">{pod.type}</div>
                        <div className="pt-3 pb-3 cn-0">{pod.status}</div>
                        <div className="pt-3 pb-3 cn-0">{pod.lastTransitionTime}</div>
                        <div className="pt-3 pb-3 cn-0">{pod.message}</div>
                        <div className="pt-3 pb-3 cn-0">{pod.reason}</div>
                    </div>
                })}
            </div>
        </div>
        <div className="mr-20 ml-20 mt-20 mb-20 flex left top column pt-16 pl-16 pr-16 br-4 en-7 bw-1" >
            <div className="cn-0 mb-8 fw-6 fs-14">Init Container init-chown-data</div>
            <div className="cn-0  w-100">
                <div className="" style={{ display: "grid", gridTemplateColumns: '100px 1fr', gap: "16px" }}>
                    <div className="pt-3 pb-3 o-05 cn-0">Image</div>
                    <div className="pt-3 pb-3 ">busybox:1.30.0</div>
                </div>
                <div className="w-100" style={{ display: "grid", gridTemplateColumns: '100px 1fr', gap: "16px" }}>
                    <div className="pt-3 pb-3  o-05">Image ID</div>
                    <div className="pt-3 pb-3 ">docker-pullable://busybox@sha256:7964ad52e396a6e045c39b5a44438424ac5</div>
                </div>
                <div className="w-100" style={{ display: "grid", gridTemplateColumns: '100px 1fr', gap: "16px" }}>
                    <div className="pt-3 pb-3  o-05">Command</div>
                    <div className="pt-3 pb-3 ">['chown', '-R', '472:472', '/var/lib/grafana']</div>
                </div>
            </div>
            <div className="cn-0 w-100">
                <div className="w-100 fw-6 mt-6 mb-3">Volume Mounts</div>
                <div className="w-100" style={{ display: "grid", gridTemplateColumns: '1fr 2fr', gap: "16px" }}>
                    <div className="mt-7 mb-7">Name</div>
                    <div className="mt-7 mb-7">MountPath</div>
                </div>
                <div className="o-02" style={{ borderBottom: "1px solid white" }}></div>
                <div className="w-100" style={{ display: "grid", gridTemplateColumns: '1fr 2fr', gap: "16px" }}>
                    <div className="pt-3 pb-3  o-05">grafana-vol</div>
                    <div className="pt-3 pb-3 ">/var/lib/grafana (rw)</div>
                </div>
                <div className="w-100" style={{ display: "grid", gridTemplateColumns: '1fr 2fr', gap: "16px" }}>
                    <div className="pt-3 pb-3 o-05">grafana-vol</div>
                    <div className="pt-3 pb-3 ">/var/lib/grafana (rw)</div>
                </div>
            </div>
        </div>
        <div className="w-100 pt-16 pr-20 pl-20" style={{ display: "grid" }}>
            <div className="w-100 flex left top column pt-16 pb-16 pl-16 pr-16 en-7 br-4 bw-1" style={{}} >
                <div className="cn-0 o-1 fw-6 fs-14" style={{}}>Configuration</div>
                <div className="cn-0 w-100">
                    <div className="w-100" style={{ display: "grid", gridTemplateColumns: '100px 1fr', gap: "16px" }}>
                        <div className="pt-6 o-05">Priority</div>
                        <div className="pt-6">0</div>
                    </div>
                    <div className="w-100" style={{ display: "grid", gridTemplateColumns: '100px 1fr', gap: "16px" }}>
                        <div className="pt-6 o-05">Node</div>
                        <div className="pt-6" style={{ color: "#62aceb" }}>ip-172-31-25-102.us-east-2.compute.internal</div>
                    </div>
                    <div className="w-100" style={{ display: "grid", gridTemplateColumns: '100px 1fr', gap: "16px" }}>
                        <div className="pt-6 o-05">Selector</div>
                        <div className="pt-6" style={{ color: "#62aceb" }}>monitoring-grafana</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}