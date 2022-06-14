import React from 'react'
import Help from '../../../assets/icons/ic-help-green.svg';
import { Progressing } from '../../common';
import { ReactComponent as GreenCheck } from '../../../assets/icons/ic-check.svg';
import { ReactComponent as Error } from '../../../assets/icons/ic-error-exclamation.svg';
import './validateForm.css'
import { showError } from '../helpers/Helpers';
import { ReactComponent as InfoIcon } from '../../../assets/icons/info-filled.svg';

export enum VALIDATION_STATUS {
    SUCCESS = 'SUCCESS',
    FAILURE = 'FAILURE',
    LOADER = 'LOADER',
    DRY_RUN = 'DRY_RUN'
};

function renderOnClickValidate(onClickValidate) {
    return (
        <a onClick={() => onClickValidate()} className="fw-6 onlink pointer learn-more__href ">VALIDATE</a>
    )
}

function ValidateDryRun({ onClickValidate, configName }) {
    return (
        <div className="eb-2 pt-10 pb-10 pl-16 pr-16 br-4 bw-1 bcn-0 flexbox-col mb-16">
            <div className="flex flex-justify">
                <div className="flex">
                    <img src={Help} className="icon-dim-20" />
                    <div className="fs-13">
                        <span className="ml-8 fw-6">Perform a dry run to validate the below {configName} configurations.</span>
                    </div>
                </div>
                {renderOnClickValidate(onClickValidate)}
            </div>
        </div>
    )
}

function ValidateLoading({ message }) {
    return <div className="eb-2 pt-10 pb-10 pl-16 pr-16 br-4 bw-1 bcn-0 flexbox-col mb-16">
        <div className="flex left">
            <div><Progressing /></div>
            <div className="fs-13">
                <span className="ml-8 fw-6">{message}</span>
            </div>
        </div>
    </div>

}

function ValidateSuccess({ onClickValidate, warning }) {
    return <div className="mb-16"><div className={`${warning ? 'success-no-border':'success-border_rad'} git_success pt-10 pb-10 pl-16 pr-16 br-4 bw-1 bcn-0 flexbox-col bcg-1`}>
        <div className="flex flex-justify">
            <div className="flex">
                <GreenCheck className="icon-dim-20 scg-5" />
                <div className="fs-13">
                    <span className="ml-8 fw-6">Configurations validated</span>
                </div>
            </div>
            {renderOnClickValidate(onClickValidate)}
        </div>
    </div>
     {warning &&
        <div className="p-16 bw-1 en-2 br-4 success-warning">
            <span className="fs-13 cn-9">{warning}</span>
        </div>}
    </div>
}

function ValidateFailure({ formId, validationError, onClickValidate, validatedTime = "", isChartRepo = false, warning }) {
    return <div className=" br-4 bw-1 bcn-0 flexbox-col mb-16">
        <div className="flex config_failure er-2 bcr-1 pt-10 pb-10 pl-13 pr-16 br-4 bw-1 flex-justify">
            <div className="flex">
                <Error className="icon-dim-20 ml--3 stroke_width" />
                <div className="fs-13">
                    <span className="ml-8 fw-6">Configurations validation failed</span>
                </div>
            </div>
            {isChartRepo && <a onClick={() => onClickValidate()} className="fw-6 onlink pointer learn-more__href ">VALIDATE</a>}
            {
                !isChartRepo && formId && renderOnClickValidate(onClickValidate)
            }
        </div>
        <div className="flex left config_failure-actions en-2 pt-10 pb-10 pl-16 pr-16 br-4 bw-1">
            <div className="fs-13">
                {isChartRepo &&
                    <>
                        {validationError?.errtitle} <br />
                        <span className="fw-6">Error: </span> {validationError?.errMessage}
                    </>}
                {!isChartRepo && <>
                    <p className="mt-0 mb-0">Devtron was unable to perform the following actions.</p>
                    {Object.entries(validationError).map(([value, name]) =>
                        <p key={value} className="mt-4 mb-0"><span className="fw-6 text-lowercase">{value}: </span>{name}</p>
                    )} 
                    {warning &&
                     <p className="mt-4 mb-0"><span className="fw-6 text-lowercase">NOTE: </span>{warning}</p>}
                    </>
                }
            </div>
        </div>
    </div>
}

export function ValidateForm({ id, onClickValidate, validationError, isChartRepo = false, validationStatus = "", configName, warning = "" }) {
    return (
        <div className="mt-16">
            {!id && validationStatus != VALIDATION_STATUS.LOADER && 
                <div className="infobar flex left bcb-1 eb-2 bw-1 br-4 mb-20 pt-10 pb-10 pr-16 pl-16"><InfoIcon className="icon-dim-18 mr-8" />Only public chart repositories can be connected as of now.</div>}
            {id && validationStatus == VALIDATION_STATUS.DRY_RUN &&
                <ValidateDryRun onClickValidate={onClickValidate} configName={configName} />}
            { validationStatus == VALIDATION_STATUS.LOADER &&
                <ValidateLoading message="Validating repo configuration. Please wait… " />}
            {validationStatus == VALIDATION_STATUS.FAILURE &&
                <ValidateFailure validationError={validationError} onClickValidate={onClickValidate} formId={id} isChartRepo={isChartRepo} warning={warning} />}
            {validationStatus == VALIDATION_STATUS.SUCCESS &&
                <ValidateSuccess onClickValidate={onClickValidate} warning={warning} />}
        </div>
    )
}
