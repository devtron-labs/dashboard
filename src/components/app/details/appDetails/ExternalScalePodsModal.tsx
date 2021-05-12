//@ts-nocheck
import React, { useState, useEffect } from 'react';
import { VisibleModal, Checkbox, Progressing, } from '../../../common';
import { ReactComponent as Info } from '../../../../assets/icons/ic-info-filled.svg';
import { ReactComponent as ScaleDown } from '../../../../assets/icons/ic-scale-down.svg';
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg';
import { getScalePodList } from './appDetails.service';
import { ScalePodsNameType, ScalePodsToZero, ScalePodsObjectList } from './appDetails.type'

export function ExternalScalePods({ onClose }) {
    const [scalePodsList, setScalePodsList] = useState<ScalePodsObjectList>([])
    const [showRestore, toggleRestore] = useState(false)
    const [scalePodLoading, setScalePodLoading] = useState(false)
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
    const [form, setForm] = useState({
        kind: "",
        name: ""
    })

    useEffect(() => {
        getScalePodList().then((response) => {
            { console.log(response) }
            setScalePodsList(response)
        })
    }, [])

    function handleScaleObjectToZero(key: "rollout" | "horizontalPodAutoscaler" | "deployment") {
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

    function handleScalePodsToZero() {
        toggleRestore(true)
        setScalePodLoading(true);
        let doc = document.getElementsByClassName('scale-pod-list') as HTMLCollectionOf<HTMLElement>;
        doc[0].style.opacity = "0.5"
        let payload = scalePodsList.filter(item => item.isChecked)
        getScalePodList(payload).then((response) =>{ return response })
        setForm(payload)
        setScalePodLoading(false);
        { console.log(payload) }
        // setScalePodLoading(false);
    }

    return (
        <>
            <VisibleModal className="" >
                <div className={`modal__body br-4`} style={{ width: "600px" }}>
                    <div className="flex left">
                        <h1 className="cn-9 fw-6 fs-20 m-0">Select objects to scale</h1>
                        <button type="button" className="transparent p-0" style={{ lineHeight: "0", margin: "auto", marginRight: "0" }} onClick={onClose}>
                            <Close className="icon-dim-24" />
                        </button>
                    </div>
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
                    <div className="scale-pod-list">
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

                        {scalePodsList.map((list) =>
                            <div className="pt-11 pb-11" >
                                {console.log(scalePodsList)}
                                {console.log(scalePodsToZero)}
                                <Checkbox rootClassName="mb-0 fs-14 cursor bcn-0 p"
                                    isChecked={scalePodsToZero[list?.kind].isChecked}
                                    value={scalePodsToZero[list?.kind].value}
                                    onChange={(e) => { e.stopPropagation(); handleScaleObjectToZero(list?.kind) }}
                                >
                                    <div className="pl-16">
                                        <span className="cn-9 fw-6">{list?.kind} / </span>
                                        <span>{list?.name}</span>
                                    </div>
                                </Checkbox>
                            </div>
                        )}
                    </div>
                    <button style={{ margin: "auto", marginRight: "0px", marginTop: "20px", fontWeight: "normal" }} className="cta flex" onClick={(e) => { e.preventDefault(); handleScalePodsToZero() }}>
                        {scalePodLoading ?
                            <>
                                <div className="icon-dim-16 mr-4"> <Progressing pageLoader /> </div> Please wait...
                            </> :
                            <>
                                <ScaleDown className="icon-dim-16 mr-4" /> Scale Pods to 0 (zero)
                             </>}
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
                                onChange={(e) => { e.stopPropagation(); handleScaleObjectToZero("rollout") }}
                            >
                                <div className="pl-16">
                                    <span className="cn-9 fw-6">{form.kind} / </span>
                                    <span>{form.name}</span>
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