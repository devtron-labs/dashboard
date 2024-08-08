/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react'
import { Progressing } from '@devtron-labs/devtron-fe-common-lib'
import Help from '../../../assets/icons/ic-help-green.svg'
import { ReactComponent as GreenCheck } from '../../../assets/icons/ic-check.svg'
import { ReactComponent as Error } from '../../../assets/icons/ic-error-exclamation.svg'
import './validateForm.css'

export enum VALIDATION_STATUS {
    SUCCESS = 'SUCCESS',
    FAILURE = 'FAILURE',
    LOADER = 'LOADER',
    DRY_RUN = 'DRY_RUN',
}

function renderOnClickValidate(onClickValidate) {
    return (
        <a onClick={() => onClickValidate()} className="fw-6 onlink pointer dc__link ">
            VALIDATE
        </a>
    )
}

const ValidateDryRun = ({ onClickValidate, configName }) => {
    return (
        <div className="eb-2 pt-10 pb-10 pl-16 pr-16 br-4 bw-1 bcn-0 flexbox-col w-100">
            <div className="flex flex-justify">
                <div className="flex">
                    <img src={Help} className="icon-dim-20" />
                    <div className="fs-13">
                        <span className="ml-8 fw-6">
                            Perform a dry run to validate the below {configName} configurations.
                        </span>
                    </div>
                </div>
                {renderOnClickValidate(onClickValidate)}
            </div>
        </div>
    )
}

const ValidateLoading = ({ message }) => {
    return (
        <div className="eb-2 pt-10 pb-10 pl-16 pr-16 br-4 bw-1 bcn-0 flexbox-col w-100">
            <div className="flex left">
                <div>
                    <Progressing />
                </div>
                <div className="fs-13">
                    <span className="ml-8 fw-6">{message}</span>
                </div>
            </div>
        </div>
    )
}

const ValidateSuccess = ({ onClickValidate, warning }) => {
    return (
        <div className="w-100">
            <div
                className={`${warning ? 'success-no-border' : 'success-border_rad'} git_success pt-10 pb-10 pl-16 pr-16 br-4 bw-1 bcn-0 flexbox-col bcg-1`}
            >
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
            {warning && (
                <div className="p-16 bw-1 en-2 br-4 success-warning">
                    <span className="fs-13 cn-9">{warning}</span>
                </div>
            )}
        </div>
    )
}

const ValidateFailure = ({
    formId,
    validationError,
    onClickValidate,
    validatedTime = '',
    isChartRepo = false,
    warning,
    showValidate,
}) => {
    return (
        <div className=" br-4 bw-1 bcn-0 flexbox-col w-100">
            <div className="flex config_failure er-2 bcr-1 pt-10 pb-10 pl-13 pr-16 br-4 bw-1 flex-justify">
                <div className="flex">
                    <Error className="icon-dim-20 ml--3 stroke_width" />
                    <div className="fs-13">
                        <span className="ml-8 fw-6">Configurations validation failed</span>
                    </div>
                </div>
                {isChartRepo && (
                    <a onClick={() => onClickValidate()} className="fw-6 onlink pointer dc__link ">
                        VALIDATE
                    </a>
                )}
                {!isChartRepo && formId && showValidate && renderOnClickValidate(onClickValidate)}
            </div>
            <div className="flex left config_failure-actions en-2 pt-10 pb-10 pl-16 pr-16 br-4 bw-1">
                <div className="fs-13">
                    {isChartRepo && (
                        <>
                            <div>{validationError?.errtitle} </div>
                            <span className="fw-6">Error: </span> {validationError?.errMessage}
                        </>
                    )}
                    {!isChartRepo && (
                        <>
                            <p className="mt-0 mb-0">Devtron was unable to perform the following actions.</p>
                            {Object.entries(validationError).map(([value, name]) => (
                                <p key={value} className="mt-4 mb-0">
                                    <span className="fw-6 dc__lowercase">{value}: </span>
                                    {name}
                                </p>
                            ))}
                            {warning && (
                                <p className="mt-4 mb-0">
                                    <span className="fw-6 dc__lowercase">NOTE: </span>
                                    {warning}
                                </p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export const ValidateForm = ({
    id,
    onClickValidate,
    validationError,
    isChartRepo = false,
    validationStatus = '',
    configName,
    warning = '',
    showValidate = true,
}) => {
    return (
        <>
            {!id && configName === 'chart repo' && validationStatus != VALIDATION_STATUS.LOADER}
            {id && validationStatus === VALIDATION_STATUS.DRY_RUN && (
             <div className="w-100">  <ValidateDryRun onClickValidate={onClickValidate} configName={configName} /></div>
            )}
            {validationStatus === VALIDATION_STATUS.LOADER && (
               <div className="w-100"> <ValidateLoading message="Validating repo configuration. Please wait… " /></div>
            )}
            {validationStatus === VALIDATION_STATUS.FAILURE && (
              <div className='w-100'> <ValidateFailure
                    validationError={validationError}
                    onClickValidate={onClickValidate}
                    formId={id}
                    isChartRepo={isChartRepo}
                    warning={warning}
                    showValidate={showValidate}
                />
                </div> 
            )}
            {validationStatus === VALIDATION_STATUS.SUCCESS && (
               <div className='w-100'><ValidateSuccess onClickValidate={onClickValidate} warning={warning} /></div> 
            )}
        </>
    )
}
