import React, { Component } from 'react'
import { DOCUMENTATION } from '../../config';
import Tippy from '@tippyjs/react';
import { ReactComponent as Question } from '../../assets/icons/ic-help-outline.svg';

export default class BulkEdits extends Component {
    render() {
        return (
            <div>
                <div className="deployment-group-list-page">
                    <div className="page-header">
                        <div className="page-header__title flex left fs-16 pt-16 pb-16"> Run Scripts
                        <Tippy className="default-tt " arrow={false} placement="top" content={
                                <span style={{ display: "block", width: "66px" }}> Learn more </span>}>
                                <Question className="icon-dim-20 ml-16" />
                            </Tippy>
                        </div>
                    </div>
                    <div className="pt-10 pb-10 pl-20" style={{ backgroundColor: "#f3f0ff" }}>
                        <div>Run scripts to bulk edit configurations for multiple devtron components.
                            <a className="learn-more__href" href={DOCUMENTATION.APP_CREATE_ENVIRONMENT_OVERRIDE} rel="noreferrer noopener" target="_blank"> Learn more</a>
                        </div>

                    </div>
                </div>
            </div>
        )
    }
}
