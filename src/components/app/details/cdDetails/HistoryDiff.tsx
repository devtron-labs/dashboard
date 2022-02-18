import React from 'react';
import './cdDetail.scss';

function HistoryDiff() {
    return (
        <>
            <div className="historical-diff__left">
                Deployment Template
                <div className="cg-5">2 changes</div>
            </div>
            <div className="historical-diff__right ci-details__body bcn-1">
                <div className="en-2 bw-1 br-4 deployment-diff__upper bcn-0 ml-20 mt-20 mb-16 mr-20">
                    <div className="pl-16 pr-16 pt-16">
                        <div className="pb-16">
                            <div className="cn-6">Chart version</div>
                            <div className="cn-9">3.8.0</div>
                        </div>
                        <div className="pb-16">
                            <div className="cn-6">Application metrics</div>
                            <div className="cn-9">Disabled</div>
                        </div>
                        <div className="pb-16">
                            <div className="cn-6">When do you want the pipeline to execute?</div>
                            <div className="cn-9">Manual</div>
                        </div>
                    </div>
                    <div className="pl-16 pr-16 pt-16">
                        <div className="pb-16">
                            <div className="cn-6">Chart version</div>
                            <div className="cn-9">3.8.0</div>
                        </div>
                        <div className="pb-16">
                            <div className="cn-6">Application metrics</div>
                            <div className="cn-9">Disabled</div>
                        </div>
                        <div className="pb-16">
                            <div className="cn-6">When do you want the pipeline to execute?</div>
                            <div className="cn-9">Manual</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default HistoryDiff;
