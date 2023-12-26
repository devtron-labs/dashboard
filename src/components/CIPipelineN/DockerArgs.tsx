import React from 'react'
import { TippyCustomized, TippyTheme, CustomInput } from '@devtron-labs/devtron-fe-common-lib'
import { DockerArgsAction, DockerArgsItemProps, DockerArgsProps } from './types'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as QuestionIcon } from '../v2/assets/icons/ic-question.svg'
import { ReactComponent as HelpIcon } from '../../assets/icons/ic-help.svg'

function DockerArgsItem({ arg, index, handleDockerArgsUpdate }: DockerArgsItemProps) {
    const handleDockerArgKeyUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
        const argData = {
            index,
            value: event.target.value,
        }
        handleDockerArgsUpdate({ action: DockerArgsAction.UPDATE_KEY, argData })
    }

    const handleDockerArgValueUpdate = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const argData = {
            index,
            value: event.target.value,
        }
        handleDockerArgsUpdate({ action: DockerArgsAction.UPDATE_VALUE, argData })
    }

    const handleRemoveDockerArg = () => {
        const argData = {
            index,
        }
        handleDockerArgsUpdate({ action: DockerArgsAction.DELETE, argData })
    }

    return (
        <div className="flexbox justify-space">
            <div className="mt-8 w-100">
                <CustomInput
                    name="arg-key"
                    data-testid={`docker-arg-key-${index}`}
                    rootClassName="w-100 dc__top-radius-4 pl-10 pr-10 pt-6 pb-6 en-2 bw-1"
                    autoComplete="off"
                    placeholder="Key"
                    type="text"
                    value={arg.key}
                    onChange={handleDockerArgKeyUpdate}
                />
                <textarea
                    data-testid={`docker-arg-value-${index}`}
                    className="build__value w-100 dc__bottom-radius-4 dc__no-top-border pl-10 pr-10 pt-6 pb-6 en-2 bw-1 mxh-140 form__textarea"
                    value={arg.value}
                    placeholder="Value"
                    onChange={handleDockerArgValueUpdate}
                />
            </div>

            <button
                className="dc__no-background flexbox dc__align-start dc__no-border dc__outline-none-imp"
                onClick={handleRemoveDockerArg}
                type="button"
            >
                <Close className="icon-dim-24 mt-6 ml-6" />
            </button>
        </div>
    )
}

export default function DockerArgs({ args, handleDockerArgsUpdate }: DockerArgsProps) {
    const handleAddDockerArgs = () => {
        handleDockerArgsUpdate({ action: DockerArgsAction.ADD })
    }

    return (
        <div>
            <h3 className="flex left fs-13 fw-6 cn-9 lh-20 m-0">
                Docker build arguments
                <TippyCustomized
                    theme={TippyTheme.white}
                    className="w-300"
                    placement="top"
                    Icon={HelpIcon}
                    iconClass="fcv-5"
                    heading="Docker Build Arguments"
                    infoText="Key/value pair will be appended as docker build arguments (--build-args)."
                    showCloseButton
                    trigger="click"
                    interactive
                >
                    <QuestionIcon className="icon-dim-16 fcn-6 ml-4 cursor" />
                </TippyCustomized>
            </h3>
            <p className="fs-13 fw-4 cn-7 lh-20 m-0">Override docker build configurations for this pipeline.</p>
            <div
                className="pointer cb-5 fw-6 fs-13 flexbox content-fit lh-32 mt-8"
                onClick={handleAddDockerArgs}
                data-testid="create-build-pipeline-docker-args-add-parameter-button"
            >
                <Add className="add-icon mt-6" />
                Add parameter
            </div>
            {args.length > 0 &&
                args.map((arg, index) => (
                    <DockerArgsItem
                        key={`build-${index}`}
                        index={index}
                        arg={arg}
                        handleDockerArgsUpdate={handleDockerArgsUpdate}
                    />
                ))}
        </div>
    )
}
