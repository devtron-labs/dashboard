import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { URLS } from '../../config';
import img from '../../assets/img/ic-checklist-chart@2x.png';
import './checklist.css';

export class AllChartsCheck extends Component<{}, {}> {
    render() {
        return (
            <div className="bcg-1 flexbox mt-16">
                <img className="img-width pt-12 pb-12 pl-16 " src={img} />
                <div className="pl-20 fs-13">
                    <div className="pt-16 cn-9"> Deploy charts using Devtron.</div>
                    <NavLink to={`${URLS.CHARTS}/discover`} className="no-decor cb-5 fw-6">
                        Discover Helm charts
                    </NavLink>
                </div>
            </div>
        );
    }
}
