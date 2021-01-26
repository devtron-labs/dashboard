import React, { Component } from 'react';
import triangleAlert from '../../assets/icons/ic-alert-triangle.svg';

export class DeprecatedWarn extends Component {
    render() {
        return (
            <div className="flex left">
                <img src={triangleAlert} alt="" className="icon-dim-16"/>
                <span className="deprecated-warn__text">Deprecated</span>
            </div>
        )
    }
}

export class UpdateWarn extends Component {
    render() {
        return (
            <div className="flex left">
                <img src={triangleAlert} alt="" className="icon-dim-16"/>
                <span className="deprecated-warn__text">Update Required</span>
            </div>
        )
    }
}
