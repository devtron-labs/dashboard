import React from 'react';
import { Drawer } from '../../../common';
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg';
import { ReactComponent as Progressing } from '../../../../assets/icons/appstatus/progressing-rotating.svg';
import { ReactComponent as Waiting } from '../../../../assets/icons/ic-clock.svg';
import { ReactComponent as Failed } from '../../../../assets/icons/appstatus/ic-appstatus-failed.svg';
import { ReactComponent as Success } from '../../../../assets/icons/ic-outline-check.svg';
import { ReactComponent as Unknown } from '../../../../assets/icons/appstatus/unknown.svg';
import Uncheck from '../../../../assets/img/ic-success@2x.png';

export function DeploymentStatusModal({ appName, environmentName, deploymentStatus, close }) {
    let lastDeploymentStatus = deploymentStatus?.lastDeploymentStatus?.toLowerCase() || "";

    return <Drawer position="right" width="800px" onClose={close}>
        <div className="app-details-status-modal bcn-0" onClick={(e) => e.stopPropagation()}>
            <div className="pl-20 pr-20 pt-12 pb-12 flex flex-align-center flex-justify" style={{ borderBottom: "1px solid #d0d4d9" }}>
                <div>
                    <h2 className="fs-16 lh-1-5 fw-6 m-0">Deployment status: {appName} / {environmentName}</h2>
                    <p className={`m-0 text-uppercase app-summary__status-name fs-12 fw-6 f-${lastDeploymentStatus}`}>
                        {lastDeploymentStatus}
                    </p>
                </div>
                <button type="button" className="transparent flex icon-dim-24" onClick={close}>
                    <Close className="icon-dim-24" />
                </button>
            </div>
            <div className="p-20">
                <AppDeploymentStage stage={deploymentStatus?.gitPushStep} stageName="gitPushStep" stageNumber={1} title="Push to git" />
                <AppDeploymentStage stage={deploymentStatus?.gitPullStep} stageName="gitPullStep" stageNumber={2} title="Pull from git" />
                <AppDeploymentStage stage={deploymentStatus?.configApplyStep} stageName="configApplyStep" stageNumber={3} title="Apply configuration" />
                <AppDeploymentStage stage={deploymentStatus?.k8sDeploy} stageName="k8sDeploy" stageNumber={4} title="Rollout" />
            </div>
        </div>
    </Drawer>
}

const AppDeploymentStage = ({ stage, stageName, stageNumber, title }) => {
    let status = stage?.status?.toLowerCase();
    const MessageStageStatus = {
        gitPushStep: {
            error: "Error in pushing configuration to git.",
            in_progress: "Pulling configuration from git.",
            success: "Configuration pushed to git.",
        },
        gitPullStep: {
            error: "Error while pulling configuration from git.",
            in_progress: "Pulling configuration from git.",
            success: "Configuration pulled from git.",
            waiting: "Waiting for previous steps to complete.",
        },
        configApplyStep: {
            error: "Error in applying configuration to kubernetes.",
            in_progress: "Applying configuration to kubernetes.",
            success: "Configuration  applied to kubernetes.",
            waiting: "Waiting for previous steps to complete.",
        },
        k8sDeploy: {
            error: "Error encountered during deployment.",
            in_progress: "Deployment is in progress.",
            success: "Deployment completed successfully.",
            waiting: "Waiting for previous steps to complete.",
        }
    }

    const MessageGeneric = {
        gitPushStep: "Configuration will be pushed to git.",
        gitPullStep: "Configuration will be pulled from git.",
        configApplyStep: "Configuration will be applied to kubernetes.",
        k8sDeploy: "Deployment will be completed.",
    };

    let messageString: string = MessageStageStatus[stageName][status?.toLowerCase()];
    if (!messageString) {
        messageString = MessageGeneric[stageName];
    }

    let classes = 'position-rel add-line';
    if (stageName === 'gitPushStep') {
        classes += ' add-line--git-push';
    }
    else if (stageName === 'k8sDeploy') {
        classes += ' add-line--rollout';
    }

    return <div className={classes}>
        <div className="flex left ">
            <div className="fs-14 cn-9">{stageNumber}/4</div>
            <div className="mr-18 ml-17 icon-dim-20 bcn-0 position-rel">
                <AppDeploymentStageStatusIcon status={status} />
            </div>
            <div className="pt-12 pb-12" >
                <AppDeploymentStageStatusMessage status={status} title={title} messageString={messageString} />
            </div>
        </div>
        {status === "error" ? <div className="flex left ml-38">
            <div className="w-100 cr-5 bcr-1 ml-24 p-12 br-4"><div className="cn-9 fw-6">Error Message:</div>
                {stage.errorMessage}</div>
        </div> : null}
    </div>
}

const AppDeploymentStageStatusMessage: React.FC<{ status: string; title: string; messageString: string }> = ({ status, title, messageString }) => {
    switch (status) {
        case "error": return <>
            <div className="lh-1-5 fs-14 cr-5">
                Error: {title}
            </div>
            <div className="cn-7">{messageString}</div>
        </>
        case "in_progress":
        case "success": return <>
            <div className="lh-1-5 fs-14 cn-9">
                {title}
            </div>
            <div className="cn-7">{messageString}</div>
        </>
        case "waiting": return <>
            <div className="lh-1-5 fs-14 cn-9 o-5">
                {title}
            </div>
            <div className="cn-7 o-5">{messageString}</div>
        </>
        default: return <>
            <div className="lh-1-5 fs-14 cn-9">
                {title}
            </div>
            <div className="cn-7">{messageString}</div>
        </>
    }
}

const AppDeploymentStageStatusIcon: React.FC<{ status: string }> = ({ status }) => {
    switch (status) {
        case "error": return <Failed className="icon-dim-20" />
        case "in_progress": return <Progressing className="icon-dim-20" />
        case "success": return <Success className="icon-dim-20" />
        case "waiting": return <Waiting className="icon-dim-20 o-5" />
        case "unknown": return <Unknown className="icon-dim-20" />
        default: return <img src={Uncheck} className="icon-dim-20" />
    }
}