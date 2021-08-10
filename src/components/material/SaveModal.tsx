import React, { Component } from 'react'
import { showError, VisibleModal } from '../common';
import { MaterialView } from './MaterialView';
import { CreateMaterialState } from './material.types';
import { ReactComponent as Info } from '../../assets/ic-info-filled-border.svg';

export default class SaveModal extends Component {
    render() {
        return (
            <div>
                <VisibleModal className="app-status__material-modal">
                {console.log('hi')}
                <div className="modal__body pl-24 pr-24" onClick={e => e.stopPropagation()}>
                    <Info className="icon-dim-40" />
                    <div className="mt-16 cn-9 fw-6 fs-18 mb-8">Configure existing build pipelines to use changes</div>
                    <div className="fs-14 cn-7">
                        To use this repository please configure it in existing build pipelines, if any.
                        <br />
                        <br />
                        NOTE: Already created build pipelines will continue running based on previous configurations.
                   </div>
                    {/* <div className="form__row form__buttons mt-40">
                        <button className="cta cancel mr-16" type="button" onClick={e => this.cancel}>Cancel</button>
                        <button className="cta" type="submit" onClick={(e) => this.save(e)} >Okay, Save changes</button>
                    </div> */}
                </div>
            </VisibleModal>
                
            </div>
        )
    }
}
