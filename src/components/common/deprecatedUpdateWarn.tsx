import React, { Component } from 'react';
import triangleAlert from '../../assets/icons/icon-ic-alert-triangle.svg';

export class DeprecatedWarn extends Component {
    render() {
        return (
            <div className="flexbox">
                <img src={triangleAlert}/>
                <span className="deprecated-warn__text">Deprecated</span>
            </div>
        )
    }
}

export class UpdateWarn extends Component {
    render() {
        return (
            <div className="flexbox">
                <img src={triangleAlert}/>
                <span className="deprecated-warn__text">Update Required</span>
            </div>
        )
    }
}