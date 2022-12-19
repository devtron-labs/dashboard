import React from 'react';
import { AppListConstants } from '../../config';
import Sample from '../../assets/img/ic-checklist-sample-app@2x.png';
import { DEPLOY_CHART_MESSAGING } from './constants';

interface SampleAppDeployType {
    parentClassName?: string;
    imageClassName?: string;
}

export default function SampleAppDeploy({ parentClassName, imageClassName }: SampleAppDeployType) {
    return (
        <div className={`bcn-0 mb-8 br-4 ${parentClassName}`}>
            <img className={`img-width pt-12 pl-16 ${imageClassName}`} src={Sample} />
            <div className="pl-16 pr-16 pt-12 pb-12 fs-13">
                <div className="cn-9">{DEPLOY_CHART_MESSAGING.DEPLOY_SAMPLE_NODE_APP}</div>
                <a
                    href={AppListConstants.SAMPLE_NODE_REPO_URL}
                    target="_blank"
                    rel="noopener noreferer"
                    className="dc__no-decor cb-5 fw-6"
                >
                    {DEPLOY_CHART_MESSAGING.VISIT_GIT_REPO}
                </a>
            </div>
        </div>
    );
}
