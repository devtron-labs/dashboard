import React, { Component } from 'react';
import img from '../../../../assets/img/app-not-deployed.png';
import { MATERIAL_TYPE } from './types';

export class EmptyStateCdMaterial extends Component<{ materialType: string }> {

    render() {
        let msg;
        if (this.props.materialType == MATERIAL_TYPE.rollbackMaterialList) msg = <p>There are no rollback materials.</p>
        else msg = <p>Please Trigger CI Pipeline and find the image here for deployment.</p>

        return <div className="trigger-modal__empty-state">
            <img src={img} alt="no-image" className="cd-material__img"/>
            <h3>Image not available</h3>
            {msg}
        </div>
    }

}