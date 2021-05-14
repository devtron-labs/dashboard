
import React, { Component } from 'react'
import { ExternalAppScaleModalState, ExternalAppScaleModalProps } from './appDetails.type';
import { ViewType } from '../../../../config';
import { VisibleModal, Checkbox, Progressing, } from '../../../common';
import { ReactComponent as Info } from '../../../../assets/icons/ic-info-filled.svg';
import { ReactComponent as ScaleDown } from '../../../../assets/icons/ic-scale-down.svg';
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg';
import { getScalePodList } from './appDetails.service';

export default class ExternalAppScaleModal extends Component<ExternalAppScaleModalProps, ExternalAppScaleModalState> {
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
            scalePodLoading: false,
            showRestore: false
        }
    }

    componentDidMount() {
        getScalePodList().then((response) => {
            this.setState({
                scalePodsToZero: response.result.scalePodToZeroList
            }, () => { console.log(this.state.scalePodsToZero) })
        })
    }

    handleScaleObjectToZero = () => {
        this.setState({
            scalePodsToZero: this.state.scalePodsToZero.map((item) => {
                return {
                    ...item,
                    isChecked: !item.isChecked,
                    value: !item.isChecked ? "CHECKED" : "INTERMEDIATE"
                }

            })
        }) 

        let allKey = Object.keys(this.state.scalePodsToZero)
        let areAllSelected = allKey.reduce((acc, item) => {
            acc = acc && this.state.scalePodsToZero[item].isChecked
            return acc;
        }, true)
        let isAnySelected = allKey.reduce((acc, item) => {
            acc = acc || this.state.scalePodsToZero[item].isChecked
            return acc;
        }, true)

        {console.log(areAllSelected)}
        {console.log(isAnySelected)}


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

    handleAllScaleObjects = () => {
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

    handleScalePodsToZero = () => {
        this.setState({
            scalePodLoading: true
        })
        let doc = document.getElementsByClassName('scale-pod-list') as HTMLCollectionOf<HTMLElement>;
        doc[0].style.opacity = "0.5"
        let payload = this.state.scalePodsToZero.filter(item => item.isChecked)
        getScalePodList().then((response) => { return response })
        this.setState({
            scalePodLoading: false
        })
        { console.log(payload) }
    }

    render() {
        const { scalePodsToZero } = this.state;
        return (
            <div>
                <VisibleModal className="" >
                    <div className={`modal__body br-4`} style={{ width: "600px" }}>
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
                                <div className="ml-30">
                                    Scaled down objects will stop using resources until restored or a new deployment is initiated. How does this work?</div>
                            </div>
                        </div>
                        <div className="fw-6 mt-16 mb-8 fs-14 cn-9">Select objects to scale down to 0 (zero)</div>
                        <div className="scale-pod-list">
                            <div className="cn-5 pt-9 pb-9 fw-6 border-bottom">
                                <Checkbox rootClassName="mb-0 fs-14 cursor bcn-0 p"
                                    isChecked={this.state.scalePodName.name.isChecked}
                                    value={this.state.scalePodName.name.value}
                                    onChange={(e) => { e.stopPropagation(); this.handleAllScaleObjects() }} >
                                    <div className="pl-16 fw-6">
                                        <span>Name</span>
                                    </div>
                                </Checkbox>
                            </div>
                            {scalePodsToZero.map((list) =>
                                <div className="pt-11 pb-11" >
                                    <Checkbox rootClassName="mb-0 fs-14 cursor bcn-0 p"
                                        isChecked={list.isChecked}
                                        value={list.value}
                                        onChange={(e) => { e.stopPropagation(); this.handleScaleObjectToZero() }} >
                                        <div className="pl-16">
                                            <span className="cn-9 fw-6">{list?.kind} / </span>
                                            <span>{list?.name}</span>
                                        </div>
                                    </Checkbox>
                                </div>
                            )}
                        </div>
                        <button style={{ margin: "auto", marginRight: "0px", marginTop: "20px", fontWeight: "normal" }} className="cta flex" onClick={(e) => { e.preventDefault(); this.handleScalePodsToZero() }}>
                            {this.state.scalePodLoading ?
                                <>
                                    <div className="icon-dim-16 mr-4"> <Progressing pageLoader /> </div> Please wait...
                            </> :
                                <>
                                    <ScaleDown className="icon-dim-16 mr-4" /> Scale Pods to 0 (zero)
                             </>}
                        </button>

                    </div>
                </VisibleModal>
            </div>
        )
    }
}
