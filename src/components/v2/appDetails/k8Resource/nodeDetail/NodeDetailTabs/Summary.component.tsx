import React, { useState, useEffect } from 'react';
import { useSearchString } from '../../../../../common';
import { useParams, useRouteMatch } from 'react-router';
import AppDetailsStore from '../../../appDetails.store';
import { NodeDetailTab } from '../nodeDetail.type';


const SummaryComponent = ({ selectedTab }) => {
    const { queryParams, searchParams } = useSearchString()
    // const node = searchParams?.kind && nodes?.nodes[searchParams.kind]?.has(nodeName) ? nodes.nodes[searchParams.kind].get(nodeName) : null
    const [manifest, setManifest] = useState(null);
    const [isManifestLoading, setManifestLoading] = useState(true);
    const { path, url } = useRouteMatch()
    const params = useParams<{ actionName: string, podName: string, nodeType: string }>()

    useEffect(() => {
        selectedTab(NodeDetailTab.SUMMARY)
    }, [params.podName])

    // useEffect(() => {
    //     selectedTab(NodeDetailTabs.SUMMARY)
    // }, [])

    // useEffect(() => {
    //     async function getManifest() {
    //         if (!appName || !nodeName || !environmentName) return;
    //         try {
    //             setManifestLoading(true);
    //             const response = await getNodeStatus({ ...node, appName: `${appName}-${environmentName}` });
    //             let manifestJSON = YAMLJSParser.parse(response.result.manifest);
    //             setManifest(manifestJSON);
    //         } catch (error) {
    //         }
    //         finally {
    //             setManifestLoading(false);
    //         }
    //     }

    //     getManifest();

    // }, [appName, environmentName, nodeName])

    // if (isManifestLoading) {
    //     return <div className="pb-20" style={{ gridColumn: '1 / span 2', overflowY: "scroll", height: "100%" }}>
    //         <Progressing pageLoader />
    //     </div>
    // }

    return <div className="p-20 bcn-0" style={{ gridColumn: '1 / span 2', overflowY: "scroll", height: "500px" }}>
        <div className="w-100" style={{ display: "grid", gridTemplateColumns: '1fr 1fr', gap: "12px" }}>
            <div className="summary-view__card pt-16 pb-16 pl-16 pr-16 br-4">
                <div className=" fw-6 fs-14">Configuration</div>
                <div className="w-100" style={{ display: "grid", gridTemplateColumns: '100px 1fr', gap: "16px" }}>
                    <div className="pt-6 o-05">Priority</div>
                    <div className="pt-6">{manifest?.spec.priority}</div>
                </div>
                <div className="w-100" style={{ display: "grid", gridTemplateColumns: '100px 1fr', gap: "16px" }}>
                    <div className="pt-6 o-05">Node</div>
                    <div className="pt-6" style={{ color: "#62aceb" }}>{manifest?.spec.nodeName}</div>
                </div>
                <div className="w-100" style={{ display: "grid", gridTemplateColumns: '100px 1fr', gap: "16px" }}>
                    <div className="pt-6 o-05">Selector</div>
                    <div className="pt-6" style={{ color: "#62aceb" }}>{manifest?.spec?.selector}</div>
                </div>
            </div>
            <div className="summary-view__card  pt-16 pb-16 pl-16 pr-16 br-4">
                <div className=" fw-6 fs-14">Status</div>
                <div className="w-100" style={{ display: "grid", gridTemplateColumns: '100px 1fr', gap: "16px" }}>
                    <div className="pt-6 o-05 ">QoS</div>
                    <div className="">{manifest?.status?.qosClass}</div>
                </div>
                <div className="w-100" style={{ display: "grid", gridTemplateColumns: '100px 1fr', gap: "16px" }}>
                    <div className="pt-6 o-05">Phase</div>
                    <div className="cg-5">{manifest?.status?.phase}</div>
                </div>
                <div className="w-100" style={{ display: "grid", gridTemplateColumns: '100px 1fr', gap: "16px" }}>
                    <div className="pt-6 o-05">Pod IP</div>
                    <div>{manifest?.status?.podIP}</div>
                </div>
                <div className="w-100" style={{ display: "grid", gridTemplateColumns: '100px 1fr', gap: "16px" }}>
                    <div className="pt-6 o-05">Host IP</div>
                    <div>{manifest?.status?.hostIP}</div>
                </div>
            </div>
        </div>

        <div className="summary-view__card mt-12  pt-16 pb-16 pl-16 pr-16 br-4" >
            <div className=" mb-8 fw-6 fs-14">Pod Conditions</div>
            <div className="w-100">
                <div className="w-100 mt-7 mb-7" style={{ display: "grid", gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: "16px", borderBottom: "bcn-7" }}>
                    <div className="pt-7 pb-7 ">Type</div>
                    <div className="pt-7 pb-7 ">Status</div>
                    <div className="pt-7 pb-7 ">Last Transition Time</div>
                    <div className="pt-7 pb-7 ">Message</div>
                    <div className="pt-7 pb-7 ">Reason</div>
                </div>
                {manifest?.status.conditions.map((condition) => {
                    return <div key={condition.type} className="w-100" style={{ display: "grid", gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: "16px", borderBottom: "bcn-7" }}>
                        <div className="pt-3 pb-3  o-05">{condition.type}</div>
                        <div className="pt-3 pb-3 ">{condition?.status}</div>
                        <div className="pt-3 pb-3 ">{condition.lastTransitionTime}</div>
                        <div className="pt-3 pb-3 ">{condition?.message}</div>
                        <div className="pt-3 pb-3 ">{condition?.reason}</div>
                    </div>
                })}
            </div>
        </div>

        {manifest?.spec.containers?.map((container) => {
            return <div className="summary-view__card mt-12 flex left top column pt-16 pl-16 pr-16 br-4">
                <div className=" mb-8 fw-6 fs-14">{container.name}</div>
                <div className="  w-100">
                    <div className="" style={{ display: "grid", gridTemplateColumns: '100px 1fr', gap: "16px" }}>
                        <div className="pt-3 pb-3 o-05 ">Image</div>
                        <div className="pt-3 pb-3 ">{container.image}</div>
                    </div>
                    <div className="w-100" style={{ display: "grid", gridTemplateColumns: '100px 1fr', gap: "16px" }}>
                        <div className="pt-3 pb-3 o-05">Image ID</div>
                        <div className="pt-3 pb-3">{container.image}</div>
                    </div>
                    <div className="w-100" style={{ display: "grid", gridTemplateColumns: '100px 1fr', gap: "16px" }}>
                        <div className="pt-3 pb-3 o-05">Command</div>
                        <div className="pt-3 pb-3">[
                            {container?.command?.map((cmd, index) => {
                            return <span>
                                {cmd}
                                {index < container?.command?.length - 1 ? "," : ""}
                            </span>
                        })}
                        ]</div>
                    </div>
                </div>
                <div className=" w-100">
                    <div className="w-100 fw-6 mt-6 mb-3">Volume Mounts</div>
                    <div className="w-100" style={{ display: "grid", gridTemplateColumns: '1fr 2fr', gap: "16px" }}>
                        <div className="mt-7 mb-7">Name</div>
                        <div className="mt-7 mb-7">MountPath</div>
                    </div>
                    <div className="o-02" style={{ borderBottom: "1px solid white" }}></div>
                    {container.volumeMounts.map((volume) => {
                        return <div className="w-100" style={{ display: "grid", gridTemplateColumns: '1fr 2fr', gap: "16px" }}>
                            <div className="pt-3 pb-3 o-05">{volume.name}</div>
                            <div className="pt-3 pb-3">{volume.mountPath}</div>
                        </div>
                    })}
                </div>
            </div>
        })}
    </div >
}

export default SummaryComponent;