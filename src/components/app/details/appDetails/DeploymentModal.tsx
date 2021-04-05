import { useParams } from 'react-router'
import React, { useState } from 'react';
import { Progressing,  VisibleModal } from '../../../common';
import Uncheck from '../../../../assets/img/ic-success@2x.png';
import { ReactComponent as Close } from '../../../../assets/icons/ic-close.svg';
import { ReactComponent as Waiting } from '../../../../assets/icons/ic-clock.svg';
import { ReactComponent as Failed } from '../../../../assets/icons/appstatus/ic-appstatus-failed.svg';
import { ReactComponent as Success } from '../../../../assets/icons/ic-outline-check.svg';

export function DeploymentModal({ deploymentStatus, lastDeploymentStatus, close}) {
    let gitPushStep = deploymentStatus?.gitPushStep?.status.toLowerCase()
    let gitPullStep = deploymentStatus?.gitPullStep?.status.toLowerCase()
    let configApplyStep = deploymentStatus?.configApplyStep?.status.toLowerCase()
    let k8sDeploy = deploymentStatus?.k8sDeploy?.status.toLowerCase()
    const status = lastDeploymentStatus || ""
    let message= {
        status:{ 
            error: "Error"
        },
        description:"Push to git"
    }
    {console.log(deploymentStatus)}

    return (<> <VisibleModal className="app-status__material-modal flex right ">
    <div className="bcn-0 deployment-status">
        <div className="pl-20 pr-20 pt-10 pb-10 flex flex-align-center flex-justify">
            <div>
                <div className="fs-20 fw-6 ">
                    <div>Deployment status</div>
                </div>
              <span className={`app-summary__status-name fs-14 mr-8 fw-6 f-${status.toLowerCase()}`}>
                            {status}
                        </span>
            </div>
            <button type="button" className="transparent flex icon-dim-24" onClick={close}>
                <Close className="icon-dim-24" />
            </button>
        </div>
        <div className="divider"></div>
        <div>
            <div className="ml-24 mr-24 mt-10" >
                <div className="flex left ">
                    <div className="pt-8 pb-13 fs-14 cn-9">1/4</div>
                    <div className="mr-18 ml-17 ">
                        <div className="no-line" />
                        {gitPushStep === "in_progress" ? <Progressing /> : ""}
                        {gitPushStep === "success" ? <Success className="icon-dim-20" /> : ""}
                        {gitPushStep === "error" ? <Failed className="icon-dim-20" /> : ""}
                        {(gitPushStep === "success" || gitPushStep === "in_progress" || gitPushStep === "error") ? null : <img src={Uncheck} className="icon-dim-20" />}
                        <div className="line" />
                    </div>
                    <span className="pt-13 pb-13" >
                        <div className={(gitPushStep === "error") ? "fs-14 cr-5" : gitPushStep === "in_progress" ? "fs-14 cn-9 fw-`6" : (gitPushStep === "success") ? "fs-14 cn-9 " : "fs-14 o-5"}>
                            {gitPushStep === "error" ? `${message.status.error}: ${message.description}` :  `${message.description}`}
                            </div>
                        <div className="cn-7">
                            {gitPushStep === "error" ? <div >Error in pushing configuration to git.</div> : ""}
                            {gitPushStep === "in_progress" ? <div >Pushing configuration to git.</div> : ""}
                            {gitPushStep === "success" ? <div >Configuration pushed to git.</div> : ""}
                            {!(gitPushStep === "success" || gitPushStep === "in_progress" || gitPushStep === "error") ? <div style={{ opacity: 0.5 }}>Configuration will be pushed to git.</div> : null}
                        </div>
                    </span>
                </div>
                <div className="flex left ">
                    <div className="pt-8 pb-13 fs-14 cn-9">2/4</div>
                    <div className="mr-18 ml-17"><div className="line" />
                        { gitPushStep === "error" ? <img src={Uncheck} className="icon-dim-20" /> : gitPullStep === "waiting" ? <Waiting className="icon-dim-20" /> : gitPullStep === "in_progress" ? <Progressing /> : gitPullStep === "success" ? <Success className="icon-dim-20" /> : gitPullStep === "error" ? <Failed className="icon-dim-20" /> :  null } 
                        {(gitPullStep === "success" || gitPullStep === "in_progress" || gitPullStep === "waiting" || gitPullStep === "error") ? null : <img src={Uncheck} className="icon-dim-20" />}
                        <div className="line" />
                    </div>
                    <span className="pt-13 pb-13" >
                        <div className={(gitPullStep === "error") ? "fs-14 cr-5" : (gitPullStep === "in_progress") ? "fs-14 cn-9 fw-6" : (gitPullStep === "success") ? "fs-14 cn-9 " : "fs-14 o-5"}>
                           {gitPullStep === "error" ? `${message.status.error}: ` :  null}
                            Pull from git
                        </div>
                        <div className="cn-7" >
                            {gitPullStep === "error" ? <div >Error while pulling configuration from git .</div> : ""}
                            {gitPullStep === "in_progress" ? <div >Pulling configuration from git.</div> : ""}
                            {gitPullStep === "success" ? <div > Configuration pulled from git.</div> : ""}
                            {gitPullStep === "waiting" ? <div style={{ opacity: 0.5 }}>Waiting for previous steps to complete.</div> : ""}
                            {!(gitPullStep === "success" || gitPullStep === "in_progress" || gitPullStep === "error" || gitPullStep === "waiting") ? <div style={{ opacity: 0.5 }}>Configuration will be pulled from git.</div> : null}
                        </div>
                    </span>
                </div>
                <div className="flex left ">
                    <div className="pt-8 pb-13 fs-14 cn-9">3/4</div>
                    <div className="mr-18 ml-17">
                        <div className="line" />
                        {gitPushStep === "error" || gitPullStep === "error" ? <img src={Uncheck} className="icon-dim-20" /> : configApplyStep === "waiting" ? <Waiting className="icon-dim-20" /> : configApplyStep === "in_progress" ? <Progressing /> : configApplyStep === "success" ? <Success className="icon-dim-20" /> : configApplyStep === "error" ? <Failed className="icon-dim-20" /> :  null } 
                        {(configApplyStep === "success" || configApplyStep === "in_progress" || configApplyStep === "waiting" || configApplyStep === "error") ? null : <img src={Uncheck} className="icon-dim-20" />}
                        <div className="line" />
                    </div>
                    <span className="pt-13 pb-13">
                        <div className={(configApplyStep === "error") ? "fs-14 cr-5" : (configApplyStep === "in_progress") ? "fs-14 cn-9 fw-6" : (configApplyStep === "success") ? "fs-14 cn-9 " : "fs-14 o-5"}>
                          {configApplyStep === "error" ? `${message.status.error}: ` :  null}
                            Apply configuration
                        </div>
                        <div className="cn-7" >
                            {configApplyStep === "error" ? <div >Error in applying configuration to kubernetes.</div> : ""}
                            {configApplyStep === "in_progress" ? <div>Applying configuration to kubernetes.</div> : ""}
                            {configApplyStep === "success" ? <div>Configuration  applied to kubernetes.</div> : ""}
                            {configApplyStep === "waiting" ? <div style={{ opacity: 0.5 }}>Waiting for previous steps to complete</div> : ""}
                            {!(configApplyStep === "success" || configApplyStep === "in_progress" || configApplyStep === "error" || configApplyStep === "waiting") ? <div style={{ opacity: 0.5 }}> Configuration will be applied to kubernetes.</div> : null}
                        </div>
                    </span>
                </div>

                <div className="flex left ">
                    {!(k8sDeploy === "in_progress") ? <div className="pt-8 pb-13 fs-14 cn-9">4/4</div> : <div className="pt-8 pb-13 fs-14 cn-9 fw-6">4/4</div>}
                    <div className="mr-18 ml-17"><div className="line" />
                        {gitPushStep === "error" || gitPullStep === "error" || configApplyStep === "error" ? <img src={Uncheck} className="icon-dim-20" /> : k8sDeploy === "waiting" ? <Waiting className="icon-dim-20" /> : k8sDeploy === "in_progress" ? <Progressing /> : k8sDeploy === "success" ? <Success className="icon-dim-20" /> : k8sDeploy === "error" ? <Failed className="icon-dim-20" /> : ""}
                        {(k8sDeploy === "success" || k8sDeploy === "in_progress" || k8sDeploy === "waiting" || k8sDeploy === "error") ? null : <img src={Uncheck} className="icon-dim-20" />}
                        <div className="no-line" /></div>
                    <span className="pt-13 pb-13">
                        <div className={(k8sDeploy === "error") ? "fs-14 cr-5" : (k8sDeploy === "in_progress") ? "fs-14 cn-9 fw-6" : (k8sDeploy === "success") ? "fs-14 cn-9 " : "fs-14 o-5"}>
                           {k8sDeploy === "error" ? `${message.status.error}: ` :  null}
                            Rollout
                        </div>
                        <div className="cn-7" >
                            {k8sDeploy === "error" ? <div >Error encountered during deployment.</div> : ""}
                            {k8sDeploy === "in_progress" ? <div>Deployment is in progress.</div> : ""}
                            {k8sDeploy === "success" ? <div>Deployment completed successfully.</div> : ""}
                            {k8sDeploy === "waiting" ? <div style={{ opacity: 0.5 }}>Waiting for previous steps to complete.</div> : ""}
                            {k8sDeploy === "unknown" ? <div style={{ opacity: 0.5 }}>Unable to ascertain the current status of Deployment, please check back in sometime (fix errors mentioned below).</div> : ""}
                            {!(k8sDeploy === "success" || k8sDeploy === "in_progress" || k8sDeploy === "error" || k8sDeploy === "waiting") ? <div>Deployment will be completed.</div> : null}
                        </div>
                    </span>
                </div>

            </div>
        </div>

    </div>
</VisibleModal>
        </>)
}
