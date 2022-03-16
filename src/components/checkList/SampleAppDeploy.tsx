import React from 'react';
import { AppListConstants } from '../../config';
import Sample from '../../assets/img/ic-checklist-sample-app@2x.png';

interface SampleAppDeployType {
    parentClassName?: string;
}

export default function SampleAppDeploy({ parentClassName }: SampleAppDeployType) {
    return (
        <div className={`bcn-0 mb-8 br-4 ${parentClassName}`}>
            <img className="img-width pt-12 pl-16" src={Sample} />
            <div className="pl-16 pr-16 pt-12 pb-12 fs-13">
                <div className="cn-9">Deploy a sample Node.js application.</div>
                <a
                    href={AppListConstants.SAMPLE_NODE_REPO_URL}
                    target="_blank"
                    rel="noopener noreferer"
                    className="no-decor cb-5 fw-6"
                >
                    Visit git repo
                </a>
            </div>
        </div>
    );
}
