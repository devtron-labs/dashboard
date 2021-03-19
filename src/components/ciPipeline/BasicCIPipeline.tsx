import React, { Component } from 'react'
import { VisibleModal, Progressing, OpaqueModal, ButtonWithLoader, Trash, Page, showError, ConditionalWrap, Toggle } from '../common';
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg';
import { ViewType } from '../../config';
import { RouteComponentProps } from 'react-router';

export interface BasicCIPipelineProps extends RouteComponentProps<{ appId: string, ciPipelineId: string, workflowId: string}> {
    view: string;
    close:() => void;
    loadingData: boolean;
    renderMaterials : () => void;
    savePipeline: () => void;
    renderAdvanceCI: () => void;
}

export default class BasicCIPipeline extends Component<BasicCIPipelineProps, {}> {
    render() { 
    {console.log(this.props)}
     let text = this.props.match.params.ciPipelineId ? "Update Pipeline" : "Create Pipeline";
        if (this.props.view == ViewType.LOADING) {
            return <OpaqueModal onHide={this.props.close}>
                <Progressing pageLoader />
            </OpaqueModal>
        }
        else {
            return <VisibleModal className="">
                <div className="modal__body br-0 modal__body--w-600 modal__body--p-0">
                    <div className="modal__header m-20">
                        <div className="modal__title fs-16">Create build pipeline</div>
                        <button type="button" className="transparent" >
                            <Close className="icon-dim-24" />
                        </button>
                    </div>
                    <hr className="divider" />
                    <div className="m-20">
                        <div className="cn-9 fw-6 fs-14 mb-18">Select code source</div>
                        {this.props.renderMaterials()}
                    </div>
                    <hr className="mb-12 divider" />
                    <div className="flex left mb-12">
                        <div className={"cursor br-4 pt-8 pb-8 pl-16 pr-16 ml-20 cn-7 fs-14 fw-6"} style={{ border: "1px solid #d0d4d9", width: "155px" }} onClick={this.props.renderAdvanceCI}>
                            Advanced options
                    </div>
                        <div className="m-auto-mr-0" style={{ width: "155px" }}>
                            <ButtonWithLoader rootClassName="cta flex-1" loaderColor="white"
                                onClick={this.props.savePipeline}
                                isLoading={this.props.loadingData}>
                                {text}
                            </ButtonWithLoader>
                        </div>
                    </div>

                </div>
            </VisibleModal>
        }
  
        
    }
}

