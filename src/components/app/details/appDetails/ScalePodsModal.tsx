
import React, { Component } from 'react'
import { ViewType } from '../../../../config';
import { VisibleModal, Checkbox, Progressing, } from '../../../common';
import { ReactComponent as Info } from '../../../../assets/icons/ic-info-filled.svg';
import { ReactComponent as ScaleDown } from '../../../../assets/icons/ic-scale-down.svg';
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg';
import { ReactComponent as Restore } from '../../../../assets/icons/ic-restore.svg';
import { getScalePodList } from './appDetails.service';
import { ExternalAppScaleModalState, ExternalAppScaleModalProps, ScaleToZero } from './appDetails.type';

export class ScalePodsModal extends Component<ExternalAppScaleModalProps, ExternalAppScaleModalState> {
    constructor(props) {
        super(props)

        this.state = {
            view: ViewType.LOADING,
            scalePodsToZero: [],
            objectToRestore: [],
            scalePodName: {
                name: {
                    isChecked: false,
                    value: "CHECKED"
                },
            },
            objectToRestoreName: {
                name: {
                    isChecked: false,
                    value: "CHECKED"
                },
            },
            scalePodLoading: false,
            objectToRestoreLoading: false,
            showRestore: false
        }
    }

    componentDidMount() {
        getScalePodList().then((response) => {
            this.setState({
                view: ViewType.FORM,
                scalePodsToZero: response.result.scalePodToZeroList,
                objectToRestore: response.result.objectToRestoreList
            }, () => { console.log(this.state.scalePodsToZero) })
        })
    }

    handleScaleObjectToZeroList = (key) => {
        let scalePodToZeroUpdate: ScaleToZero[] = this.state.scalePodsToZero.map((item) => {
            if (key == item.kind) {
                return {
                    ...item,
                    isChecked: !item.isChecked,
                    value: !item.isChecked ? "CHECKED" : "INTERMEDIATE"
                }
            } else {
                return item;
            }
        })

        this.setState({
            scalePodsToZero: scalePodToZeroUpdate
        })

        let allKey = Object.keys(scalePodToZeroUpdate)
        let areAllSelected = allKey.reduce((acc, item) => {
            acc = acc && scalePodToZeroUpdate[item].isChecked
            return acc;
        })
        let isAnySelected = allKey.reduce((acc, item) => {
            acc = acc || scalePodToZeroUpdate[item].isChecked
            return acc;
        }, false)

        if (areAllSelected) {
            return this.setState({
                scalePodName: {
                    name: {
                        isChecked: true,
                        value: "CHECKED",
                    }
                }
            })
        } else if (isAnySelected) {
            return this.setState({
                scalePodName: {
                    name: {
                        isChecked: true,
                        value: "INTERMEDIATE",
                    }
                }
            })
        } else {
            return this.setState({
                scalePodName: {
                    name: {
                        isChecked: false,
                        value: "CHECKED",
                    }
                }
            })
        }
    }

    handleAllScaleObjectsName = () => {
        if (!this.state.scalePodName.name.isChecked) {
            this.setState({
                scalePodsToZero: this.state.scalePodsToZero.map((item) => {
                    return {
                        ...item,
                        value: "CHECKED",
                        isChecked: true
                    }
                })
            })
        } else {
            this.setState({
                scalePodsToZero: this.state.scalePodsToZero.map((item) => {
                    return {
                        ...item,
                        isChecked: false,
                        value: "INTERMEDIATE",
                    }
                })
            })
        }
        this.setState({
            scalePodName: {
                name: {
                    isChecked: !this.state.scalePodName.name.isChecked,
                    value: this.state.scalePodName.name.isChecked ? "INTERMEDIATE" : "CHECKED"
                }
            }
        })
    }

    handleScalePodsToZerobutton = () => {
        this.setState({
            scalePodLoading: true,
            showRestore: true
        })
        let doc = document.getElementsByClassName('scale-pod-list') as HTMLCollectionOf<HTMLElement>;
        doc[0].style.opacity = "0.5"
        let payload = this.state.scalePodsToZero.filter(item => item.isChecked)
        getScalePodList().then((response) => { return response })
        this.setState({
            // scalePodLoading: false
        })
    }

    handleAllObjectToRestoreName() {
        if (!this.state.objectToRestoreName.name.isChecked) {
            this.setState({
                objectToRestore: this.state.objectToRestore.map((item) => {
                    return {
                        ...item,
                        isChecked: true,
                        value: "CHECKED"
                    }
                })
            })
        } else {
            this.setState({
                objectToRestore: this.state.objectToRestore.map((item) => {
                    return {
                        ...item,
                        isChecked: false,
                        value: "INTERMEDIATE",
                    }
                })
            })
        }
        this.setState({
            objectToRestoreName: {
                name: {
                    isChecked: !this.state.objectToRestoreName.name.isChecked,
                    value: this.state.objectToRestoreName.name.isChecked ? "INTERMEDIATE" : "CHECKED"
                }
            }
        })
    }

    handleObjectToRestoreList = (key) => {
        let objectToRestoreUpdate: ScaleToZero[] = this.state.objectToRestore.map((item) => {
            if (key == item.kind) {
                return {
                    ...item,
                    isChecked: !item.isChecked,
                    value: !item.isChecked ? "CHECKED" : "INTERMEDIATE"
                }
            } else {
                return item;
            }
        })

        this.setState({
            objectToRestore: objectToRestoreUpdate
        })

        let allKey = Object.keys(objectToRestoreUpdate)
        let areAllSelected = allKey.reduce((acc, item) => {
            acc = acc && objectToRestoreUpdate[item].isChecked
            return acc;
        })
        let isAnySelected = allKey.reduce((acc, item) => {
            acc = acc || objectToRestoreUpdate[item].isChecked
            return acc;
        }, false)

        if (areAllSelected) {
            return this.setState({
                objectToRestoreName: {
                    name: {
                        isChecked: true,
                        value: "CHECKED",
                    }
                }
            })
        } else if (isAnySelected) {
            return this.setState({
                objectToRestoreName: {
                    name: {
                        isChecked: true,
                        value: "INTERMEDIATE",
                    }
                }
            })
        } else {
            return this.setState({
                objectToRestoreName: {
                    name: {
                        isChecked: false,
                        value: "CHECKED",
                    }
                }
            })
        }
    }

    handleObjectToRestorebutton() {
        this.setState({ objectToRestoreLoading: true });
        let doc = document.getElementsByClassName('scale-pod-list') as HTMLCollectionOf<HTMLElement>;
        doc[0].style.opacity = "0.5"
        let payload = this.state.objectToRestore.filter(item => item.isChecked)
        getScalePodList().then((response) => { return response })
        this.setState({ showRestore: false })
    }

    renderScaleModalHeader() {
        return <>
            <div className="flex left">
                <h1 className="cn-9 fw-6 fs-20 m-0">Select objects to scale</h1>
                <button type="button" className="transparent p-0" style={{ lineHeight: "0", margin: "auto", marginRight: "0" }} onClick={() => this.props.onClose()}>
                    <Close className="icon-dim-24" />
                </button>
            </div>
            <div className="fs-14 mt-24 mb-8 br-4 p-16 eb-2 bw-1" style={{ backgroundColor: "#f0f7ff" }}>
                <div>
                    <div className="flex left ">
                        <Info className="icon-dim-20 mr-8 " />
                        <div className="fw-6">What does this do?</div>
                    </div>
                    <div className="ml-30"> Scaled down objects will stop using resources until restored or a new deployment is initiated.</div>
                </div>
            </div>
        </>
    }

    renderScalePodToZeroList() {
        const { scalePodsToZero } = { ...this.state };

        return <>
            {this.state.view == ViewType.LOADING ?
                <div style={{ minHeight: "210px" }} className="flex"><Progressing pageLoader /></div> : <>
                    <div className="fw-6 mt-16 mb-8 fs-14 cn-9">Select objects to scale down to 0 (zero)</div>
                    <div className="scale-pod-list">
                        <div className="cn-5 pt-9 pb-9 fw-6 border-bottom">
                            <Checkbox rootClassName="mb-0 fs-14 cursor bcn-0 p"
                                isChecked={this.state.scalePodName.name.isChecked}
                                value={this.state.scalePodName.name.value}
                                onChange={(e) => { e.stopPropagation(); this.handleAllScaleObjectsName() }} >
                                <span className="ml-16 fw-6 p-0">Name</span>
                            </Checkbox>
                        </div>
                        {scalePodsToZero.map((item) =>
                            <div className="pt-11 pb-11" >
                                <Checkbox rootClassName="mb-0 fs-14 cursor bcn-0 p"
                                    isChecked={item.isChecked}
                                    value={item.value}
                                    onChange={(e) => { e.stopPropagation(); this.handleScaleObjectToZeroList(item.kind) }} >
                                    <div className="pl-16">
                                        <span className="cn-9 fw-6">{item?.kind} / </span>
                                        <span>{item?.name}</span>
                                    </div>
                                </Checkbox>
                            </div>
                        )}
                    </div>
                    <button className="cta flex mt-0 fw-5 ml-auto" onClick={(e) => { e.preventDefault(); this.handleScalePodsToZerobutton() }}>
                        {this.state.scalePodLoading ?
                            <>
                                <div className="icon-dim-16 mr-4"> <Progressing pageLoader /> </div> Please wait...
                            </> :
                            <>
                                <ScaleDown className="icon-dim-16 mr-4" /> Scale Pods to 0 (zero)
                             </>}
                    </button></>}
        </>
    }

    renderObjectToRestore() {
        const { objectToRestore } = { ...this.state }
        return <>
            <h1 className="fw-6 mt-20 mb-8 fs-14 cn-9">Select objects to restore</h1>
            <div className="cn-5 pt-9 pb-9 fw-6 border-bottom">
                <Checkbox rootClassName="mb-0 fs-14 cursor bcn-0 p"
                    isChecked={this.state.objectToRestoreName.name.isChecked}
                    value={this.state.objectToRestoreName.name.value}
                    onChange={(e) => { e.stopPropagation(); this.handleAllObjectToRestoreName() }}>
                    <span className="ml-16 fw-6 p-0">Name</span>
                </Checkbox>
            </div>
            {objectToRestore.map((item) =>
                <div className="pt-11 pb-11" >
                    <Checkbox rootClassName="mb-0 fs-14 cursor bcn-0"
                        isChecked={item.isChecked}
                        value={item.value}
                        onChange={(e) => { e.stopPropagation(); this.handleObjectToRestoreList(item.kind) }}>
                        <div className="pl-16">
                            <span className="cn-9 fw-6">{item.kind} / </span>
                            <span>{item.name}</span>
                        </div>
                    </Checkbox>
                </div>
            )}
            <button className="mt-20 cta flex ml-auto" onClick={(e) => { e.preventDefault(); this.handleObjectToRestorebutton() }}>
                {this.state.objectToRestoreLoading ?
                    <>
                        <div className="icon-dim-16 mr-4">
                            <Progressing pageLoader />
                        </div>
                        Please wait...
                    </>
                    : <>
                        <Restore className="fcn-0 scn-0 icon-dim-16 mr-4" /> Restore
                     </>}
            </button>
        </>
    }

    render() {
        return (
            <VisibleModal className="" >
                <div className={`modal__body br-4`} style={{ width: "600px" }}>
                    {this.renderScaleModalHeader()}
                    {this.renderScalePodToZeroList()}
                    {this.state.showRestore && <> {this.renderObjectToRestore()} </>}
                </div>
            </VisibleModal>
        )
    }
}