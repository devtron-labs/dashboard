import React from 'react'
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg'
import { ButtonWithLoader, VisibleModal } from '../../common'
import { ReactComponent as Help } from '../../../assets/icons/ic-help.svg'
import { ReactComponent as BotIcon } from '../../../assets/icons/ic-bot.svg'
import { ReactComponent as PersonIcon } from '../../../assets/icons/ic-person.svg'
import InfoColourBar from '../../common/infocolourBar/InfoColourbar'
import { CIPipelineType } from '../types'

export function WebhookCI({ appName, connectCDPipelines, getWorkflows, close, deleteWorkflow }: CIPipelineType) {
    return (
        <VisibleModal className="">
            <div className="modal__body modal__body__ci_new_ui br-0 modal__body--p-0">
                <div className="flex flex-align-center flex-justify dc__border-bottom bcn-0 pr-20">
                    <h2 className="fs-16 fw-6 lh-1-43 m-0 title-padding">Deploy image from external source</h2>
                    <button
                        type="button"
                        className="dc__transparent flex icon-dim-24"
                        onClick={() => {
                            close()
                        }}
                    >
                        <Close className="icon-dim-24" />
                    </button>
                </div>
                <div className="p-20">
                    <div className="fw-6 fs-14 cn-9 pb-12">Deploy to environment</div>
                    <div className="flex mb-20">
                        <div className="w-50 pr-8">
                            <div className="fs-13 fw-4 cn-7 pb-6">Environment</div>
                            <input type="text" className="form__input" />
                        </div>
                        <div className="w-50 pl-8">
                            <div className="fs-13 fw-4 cn-7 pb-6">Namespace</div>
                            <input type="text" className="form__input" />
                        </div>
                    </div>
                    <div className="fw-6 fs-14 cn-9 pb-8">When do you want to deploy</div>
                    <div className="flex mb-20">
                        <div className="flex dc__content-start w-50 pt-8 pr-16 pb-8 pl-16 br-4 mr-8 bcn-0 en-2 bw-1">
                            <BotIcon className="icon-dim-20 mr-12" />
                            <div>
                                <div>Automatic</div>
                                <div>Deploy everytime a new image is received</div>
                            </div>
                        </div>
                        <div className="flex dc__content-start w-50 pt-8 pr-16 pb-8 pl-16 br-4 ml-8 bcn-0 en-2 bw-1">
                            <PersonIcon className="icon-dim-20 mr-12" />
                            <div>
                                <div>Manual</div>
                                <div>Select and deploy from available images</div>
                            </div>
                        </div>
                    </div>
                    <InfoColourBar
                        message="Connecting to external CI service: A webhook url and sample JSON will be generated after the pipeline is created."
                        classname="bw-1 bcv-1 ev-2 bcv-1 fs-12"
                        Icon={Help}
                        iconClass="fcv-5 h-20"
                    />
                </div>
                <div className="dc__border-top">footer</div>
            </div>
        </VisibleModal>
    )
}
