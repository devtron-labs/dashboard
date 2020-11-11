import React, { Component } from 'react';
import triangleAlert from '../../assets/icons/ic-alert-triangle.svg';

export class DeprecatedWarn extends Component {
    render() {
        return (
            <div className="flexbox" style={{alignItems: 'center'}}>
                <img src={triangleAlert} className="icon-dim-16 mr-8" style={{margin: 0}}/>
                <span className="deprecated-warn__text">Deprecated</span>
            </div>
        )
    }
}

export class UpdateWarn extends Component {
    render() {
        return (
            <div className="flexbox" style={{alignItems: 'center'}}>
                <img src={triangleAlert} className="icon-dim-16 mr-8" style={{margin: 0}}/>
                <span className="deprecated-warn__text">Update Required</span>
            </div>
        )
    }
}