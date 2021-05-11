import React, { useEffect, useState } from 'react';
import { ScalePodsNameType, ScalePodsToZero } from './appDetails.type'
import { VisibleModal, Checkbox } from '../../../common';
import { ReactComponent as Info } from '../../../../assets/icons/ic-info-filled.svg';
import { ReactComponent as ScaleDown } from '../../../../assets/icons/ic-scale-down.svg';

export function ScalePods() {
    const [showRestore, toggleRestore] = useState(false)
    const [scalePodsName, setScalePodsName] = useState<ScalePodsNameType>({
        name: {
            isChecked: false,
            value: "CHECKED"
        },
    })

    const [scalePodsToZero, setScalePodsToZero] = useState<ScalePodsToZero>({

        rollout: {
            isChecked: false,
            value: "CHECKED",
        },
        horizontalPodAutoscaler: {
            isChecked: false,
            value: "CHECKED",
        },
        deployment: {
            isChecked: false,
            value: "CHECKED",
        }
    })

    function handleScaleObject(key: "rollout" | "horizontalPodAutoscaler" | "deployment") {
        let scalePodsToZeroUpdate = {
            ...scalePodsToZero,
            [key]: {
                isChecked: !scalePodsToZero[key].isChecked,
                value: !scalePodsToZero[key].isChecked ? "CHECKED" : "INTERMEDIATE"

            }
        };
        let areAllSelected = scalePodsToZeroUpdate.rollout.isChecked && scalePodsToZeroUpdate.horizontalPodAutoscaler.isChecked && scalePodsToZeroUpdate.deployment.isChecked;
        let isAnySelected = scalePodsToZeroUpdate.rollout.isChecked || scalePodsToZeroUpdate.horizontalPodAutoscaler.isChecked || scalePodsToZeroUpdate.deployment.isChecked;

        setScalePodsToZero(scalePodsToZeroUpdate);

        if (areAllSelected) {
            return setScalePodsName({
                name: {
                    isChecked: true,
                    value: "CHECKED",
                }
            })
        } else if (isAnySelected) {
            return setScalePodsName({
                name: {
                    isChecked: true,
                    value: "INTERMEDIATE"
                }
            })
        } else {
            return setScalePodsName({
                name: {
                    isChecked: false,
                    value: "CHECKED",
                }
            })
        }
    }

    function handleAllScaleObjects() {

        if (!scalePodsName.name.isChecked) {
            setScalePodsToZero({
                rollout: {
                    isChecked: true,
                    value: "CHECKED"
                },
                horizontalPodAutoscaler: {
                    isChecked: true,
                    value: "CHECKED"
                },
                deployment: {
                    isChecked: true,
                    value: "CHECKED"
                }
            })
        } else {
            setScalePodsToZero({
                rollout: {
                    isChecked: false,
                    value: "INTERMEDIATE"
                },
                horizontalPodAutoscaler: {
                    isChecked: false,
                    value: "INTERMEDIATE"
                },
                deployment: {
                    isChecked: false,
                    value: "INTERMEDIATE"
                }
            })
        }
        setScalePodsName({
            name: {
                isChecked: !scalePodsName.name.isChecked,
                value: scalePodsName.name.isChecked ? "INTERMEDIATE" : "CHECKED"
            }
        })
    }

    function toggleScalePods() {
        toggleRestore(true)
    }

    return (
        <>
            <VisibleModal className="" >
                <div className={`modal__body br-4`} style={{ width: "600px" }}>
                    <h1 className="cn-9 fw-6 fs-20 m-0">Select objects to scale</h1>
                    <div className="fs-14 mt-24 mb-8 br-4 p-16 eb-2 bw-1" style={{ backgroundColor: "#f0f7ff" }}>
                        <div>
                            <div className="flex left ">
                                <Info className="icon-dim-20 mr-8 " />
                                <div className="fw-6">What does this do?</div>
                            </div>
                            <div className="ml-30">
                                Scaled down objects will stop using resources until restored or a new deployment is initiated. How does this work?</div>
                        </div>
                    </div>
                    <div className="fw-6 mt-16 mb-8 fs-14 cn-9">Select objects to scale down to 0 (zero)</div>
                    <div className="cn-5 pt-9 pb-9 fw-6 border-bottom">
                        <Checkbox rootClassName="mb-0 fs-14 cursor bcn-0 p"
                            isChecked={scalePodsName.name.isChecked}
                            value={scalePodsName.name.value}
                            onChange={(e) => { e.stopPropagation(); handleAllScaleObjects() }}
                        >
                            <div className="pl-16 fw-6">
                                <span>Name</span>
                            </div>
                        </Checkbox>
                    </div>
                    <div className="pt-11 pb-11" >
                        <Checkbox rootClassName="mb-0 fs-14 cursor bcn-0 p"
                            isChecked={scalePodsToZero.rollout.isChecked}
                            value={scalePodsToZero.rollout.value}
                            onChange={(e) => { e.stopPropagation(); handleScaleObject("rollout") }}
                        >
                            <div className="pl-16">
                                <span className="cn-9 fw-6">Rollout / </span>
                                <span>dashboard-bp-devtroncd</span>
                            </div>
                        </Checkbox>
                    </div>
                    <div className="pt-11 pb-11">
                        <Checkbox rootClassName="mb-0 fs-14 cursor bcn-0 p"
                            isChecked={scalePodsToZero.horizontalPodAutoscaler.isChecked}
                            value={scalePodsToZero.horizontalPodAutoscaler.value}
                            onChange={(e) => { e.stopPropagation(); handleScaleObject("horizontalPodAutoscaler") }}
                        >
                            <div className="pl-16">
                                <span className="cn-9 fw-6">HorizontalPodAutoscaler / </span>
                                <span> dashboard-bp-devtroncd-hpa</span>
                            </div>
                        </Checkbox>

                    </div>
                    <div className="pt-11 pb-11">
                        <Checkbox rootClassName="mb-0 fs-14 cursor bcn-0 p"
                            isChecked={scalePodsToZero.deployment.isChecked}
                            value={scalePodsToZero.deployment.value}
                            onChange={(e) => { e.stopPropagation(); handleScaleObject("deployment") }}
                        >
                            <div className="pl-16">
                                <span className="cn-9 fw-6">Deployment / </span>
                                <span>dashboard-bp-devtroncd</span>
                            </div>
                        </Checkbox>

                    </div>
                    <button style={{ margin: "auto", marginRight: "0px", marginTop: "20px" }} className="cta flex" onClick={() => toggleScalePods()}>
                        <ScaleDown className="icon-dim-16" />
                                Scale Pods to 0
                            </button>

                    {showRestore && <>
                        <h1 className="fw-6 mt-20 mb-8 fs-14 cn-9">Select objects to restore</h1>
                        <div className="cn-5 pt-9 pb-9 fw-6 border-bottom">
                            <Checkbox rootClassName="mb-0 fs-14 cursor bcn-0 p"
                                isChecked={scalePodsName.name.isChecked}
                                value={"CHECKED"}
                                onChange={(e) => { e.stopPropagation(); handleAllScaleObjects() }}
                            >
                                <div className="pl-16 fw-6">
                                    <span>Name</span>
                                </div>
                            </Checkbox>
                        </div>
                        <div className="pt-11 pb-11" >
                            <Checkbox rootClassName="mb-0 fs-14 cursor bcn-0 p"
                                isChecked={scalePodsToZero.rollout.isChecked}
                                value={"CHECKED"}
                                onChange={(e) => { e.stopPropagation(); handleScaleObject("rollout") }}
                            >
                                <div className="pl-16">
                                    <span className="cn-9 fw-6">Rollout / </span>
                                    <span>dashboard-bp-devtroncd</span>
                                </div>
                            </Checkbox>
                        </div>
                        <button style={{ margin: "auto", marginRight: "0px", marginTop: "20px" }} className="cta flex" onClick={() => toggleRestore(false)}>
                            <ScaleDown className="icon-dim-16" />
                                Restore
                            </button>
                    </>
                    }
                </div>
            </VisibleModal>
        </>
    )
}