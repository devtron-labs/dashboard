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

import { ButtonProps, ButtonVariantType, InfoBlock, Progressing } from '@devtron-labs/devtron-fe-common-lib'
import './validateForm.css'

export enum VALIDATION_STATUS {
    SUCCESS = 'SUCCESS',
    FAILURE = 'FAILURE',
    LOADER = 'LOADER',
    DRY_RUN = 'DRY_RUN',
}

const getOnClickValidateButtonProps = (onClickValidate: () => void): ButtonProps => ({
    dataTestId: 'validate-button',
    text: 'Validate',
    onClick: onClickValidate,
    variant: ButtonVariantType.text,
})

const ValidateDryRun = ({ onClickValidate, configName }) => (
    <InfoBlock
        heading={`Perform a dry run to validate the below ${configName} configurations.`}
        buttonProps={getOnClickValidateButtonProps(onClickValidate)}
    />
)

const ValidateLoading = ({ message }) => (
    <InfoBlock
        customIcon={
            <div className="icon-dim-20 flex">
                <Progressing />
            </div>
        }
        heading={message}
    />
)

const ValidateSuccess = ({ onClickValidate, warning }) => (
    <div className="w-100">
        <InfoBlock
            variant="success"
            heading="Configurations validated"
            buttonProps={getOnClickValidateButtonProps(onClickValidate)}
            borderRadiusConfig={{
                bottom: !warning,
            }}
            borderConfig={{
                bottom: !warning,
            }}
        />
        {warning && (
            <div className="p-16 bw-1 en-2 br-4 success-warning">
                <span className="fs-13 cn-9">{warning}</span>
            </div>
        )}
    </div>
)

const ValidateFailure = ({ formId, validationError, onClickValidate, isChartRepo = false, warning, showValidate }) => (
    <div className="br-4 bw-1 bg__primary flexbox-col w-100">
        <InfoBlock
            variant="error"
            heading="Configurations validation failed"
            buttonProps={
                isChartRepo || (formId && showValidate) ? getOnClickValidateButtonProps(onClickValidate) : null
            }
            borderConfig={{
                bottom: false,
            }}
            borderRadiusConfig={{
                bottom: false,
            }}
        />

        <div className="flex left config_failure-actions en-2 py-10 px-16 br-4 bw-1">
            <div className="fs-13">
                {isChartRepo ? (
                    <>
                        <div>{validationError?.errtitle} </div>
                        <span className="fw-6">Error: </span> {validationError?.errMessage}
                    </>
                ) : (
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

export const ValidateForm = ({
    id,
    onClickValidate,
    validationError,
    isChartRepo = false,
    validationStatus = '',
    configName,
    warning = '',
    showValidate = true,
}) => (
    <>
        {id && validationStatus === VALIDATION_STATUS.DRY_RUN && (
            <div className="w-100">
                <ValidateDryRun onClickValidate={onClickValidate} configName={configName} />
            </div>
        )}
        {validationStatus === VALIDATION_STATUS.LOADER && (
            <div className="w-100">
                <ValidateLoading message="Validating repo configuration. Please wait… " />
            </div>
        )}
        {validationStatus === VALIDATION_STATUS.FAILURE && (
            <div className="w-100">
                <ValidateFailure
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
            <div className="w-100">
                <ValidateSuccess onClickValidate={onClickValidate} warning={warning} />
            </div>
        )}
    </>
)
