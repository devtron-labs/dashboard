import React from 'react'
import Help from '../../../assets/icons/ic-help-green.svg';
import { Progressing } from '../../common';
import { ReactComponent as GreenCheck } from '../../../assets/icons/ic-check.svg';
import { ReactComponent as Close } from '../../../assets/icons/ic-close.svg';

export function ValidateForm({ onClickValidate, tab="" }) {
    return (
        <div className="eb-2 pt-10 pb-10 pl-16 pr-16 br-4 bw-1 bcn-0 flexbox-col mb-16">
            <div className="flex flex-justify">
                <div className="flex">
                    <img src={Help} className="icon-dim-20" />
                    <div className="fs-13">
                        <span className="ml-8 fw-6">Perform a dry run to validate the below gitops configurations.</span>
                    </div>
                </div>
                <a onClick={() => onClickValidate()} className="fw-6 onlink pointer">VALIDATE</a>
            </div>
        </div>
    )
}

export function ValidateLoading({ message, tab="" }) {
    return <div className="eb-2 pt-10 pb-10 pl-16 pr-16 br-4 bw-1 bcn-0 flexbox-col mb-16">
        <div className="flex left">
            <div><Progressing /></div>
            <div className="fs-13">
                <span className="ml-8 fw-6">{message}</span>
            </div>
        </div>
    </div>

}

export function ValidationSuccess({ onClickValidate }) {
    return <div className="git_success pt-10 pb-10 pl-16 pr-16 br-4 bw-1 bcn-0 flexbox-col mb-16">
        <div className="flex flex-justify">
            <div className="flex">
                <GreenCheck className="icon-dim-20 scg-5" />
                <div className="fs-13">
                    <span className="ml-8 fw-6">Configurations validated</span>
                </div>
            </div>
            <a onClick={() => onClickValidate()} className="fw-6 onlink pointer">VALIDATE</a>
        </div>
    </div>
}

export function ValidateFailure({ formId, validationError, onClickValidate, validatedTime="" }) {
    return <div className=" br-4 bw-1 bcn-0 flexbox-col mb-16">
        <div className="flex config_failure er-2 bcr-1 pt-10 pb-10 pl-13 pr-16 br-4 bw-1 flex-justify">
            <div className="flex">
                <Close className="icon-dim-20 scr-5 ml--3 stroke_width" />
                <div className="fs-13">
                    <span className="ml-8 fw-6">Configurations validation failed</span>
                </div>
            </div>
            {formId &&
                <a onClick={() => onClickValidate()} className="fw-6 onlink pointer">VALIDATE</a>}
        </div>
        <div className="flex left config_failure-actions en-2 pt-10 pb-10 pl-16 pr-16 br-4 bw-1">
            <div className="fs-13">
                <p className="mt-0 mb-0">Devtron was unable to perform the following actions.</p>
                {Object.entries(validationError).map(([value, name]) =>
                    <p key={value} className="mt-4 mb-0"><span className="fw-6 text-lowercase">{value}: </span>{name}</p>

                )}
            </div>
        </div>
    </div>

}