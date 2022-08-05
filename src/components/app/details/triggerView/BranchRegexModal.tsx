import React from 'react'
import { ReactComponent as GitLab } from '../../../../assets/icons/git/gitlab.svg'
import { ReactComponent as Git } from '../../../../assets/icons/git/git.svg'
import { ReactComponent as GitHub } from '../../../../assets/icons/git/github.svg'
import { ReactComponent as BitBucket } from '../../../../assets/icons/git/bitbucket.svg'
import { SourceTypeMap } from '../../../../config'
import { ReactComponent as CloseIcon } from '../../../../assets/icons/ic-close.svg'
import { ReactComponent as LeftIcon } from '../../../../assets/icons/ic-arrow-backward.svg'
import { ReactComponent as Error } from '../../../../assets/icons/ic-alert-triangle.svg'
import { BranchRegexModalProps, CIMaterialType } from './types'

function BranchRegexModal({
    material,
    selectedCIPipeline,
    showWebhookModal,
    title,
    isChangeBranchClicked,
    context,
    onClickNextButton,
    onShowCIModal,
    handleRegexInputValue,
    regexValue,
    onCloseBranchRegexModal,
}: BranchRegexModalProps) {
    const getBranchRegexName = (gitMaterialId: number): string => {
        if (Array.isArray(selectedCIPipeline?.ciMaterial)) {
            for (let _ciMaterial of selectedCIPipeline.ciMaterial) {
                if (
                    _ciMaterial.gitMaterialId === gitMaterialId &&
                    _ciMaterial.source &&
                    _ciMaterial.source.type === SourceTypeMap.BranchRegex
                ) {
                    return _ciMaterial.source.regex
                }
            }
        }
        return ''
    }

    const renderBranchRegexMaterialHeader = (close: () => void) => {
        return (
            <div className="trigger-modal__header">
                <h1 className="modal__title flex left fs-16">{title}</h1>
                <button
                    type="button"
                    className="transparent"
                    onClick={() => {
                        close()
                    }}
                >
                    <CloseIcon />
                </button>
            </div>
        )
    }

    const renderMaterialRegexFooterNextButton = (context) => {
        let _isDisabled = true

        for (let index = 0; index < material.length; index++) {
            const selectedMaterial = material[index]
            const _regexValue = regexValue[selectedMaterial.gitMaterialId] || {}
            _isDisabled = _regexValue.isInvalid
            if (_isDisabled) {
                break
            }
        }

        return (
            <div className="trigger-modal__trigger flex right">
                <button
                    className="cta flex mr-20"
                    onClick={(e) => {
                        onClickNextButton(context)
                    }}
                    disabled={_isDisabled}
                >
                    Save {!isChangeBranchClicked && '& Next'}
                    {!isChangeBranchClicked && (
                        <LeftIcon
                            style={{ ['--rotateBy' as any]: '180deg' }}
                            className={`rotate icon-dim-16 ml-8 ${_isDisabled ? 'scn-4' : 'scn-0'}`}
                        />
                    )}
                </button>
            </div>
        )
    }

    const renderValidationErrorLabel = (message: string): JSX.Element => {
        return (
            <div className="error-label flex left align-start fs-11 fw-4 mt-6 ml-36">
                <Error className="icon-dim-16" />
                <div className="ml-4 cr-5">{message}</div>
            </div>
        )
    }

    const onClickBackArrow = (): void => {
        onCloseBranchRegexModal()
        onShowCIModal()
    }

    return (
        <>
            {renderBranchRegexMaterialHeader(context.closeCIModal)}
            <div className="select-material--regex-body p-20 fs-13">
                <div className="flex left">
                    {isChangeBranchClicked && (
                        <div onClick={onClickBackArrow}>
                            <LeftIcon className="rotate icon-dim-20 mr-16 cursor" />
                        </div>
                    )}

                    <div>
                        <h4 className="mb-0 fw-6 ">Set a primary branch</h4>
                        <p className="mt-4">
                            Primary branch will be used to trigger automatic builds on every commit. This can be changed
                            later.
                        </p>
                    </div>
                </div>
                {material?.map((mat: CIMaterialType, index) => {
                    const _regexValue = regexValue[mat.gitMaterialId] || {}
                    return (
                        mat.regex && (
                            <div className="border-bottom pb-20 pt-20" key={`regex_${index}`}>
                                <div className="flex left">
                                    <span className="mr-14">
                                        {mat.gitMaterialUrl.includes('gitlab') ? <GitLab /> : null}
                                        {mat.gitMaterialUrl.includes('github') ? <GitHub /> : null}
                                        {mat.gitMaterialUrl.includes('bitbucket') ? <BitBucket /> : null}
                                        {mat.gitMaterialUrl.includes('gitlab') ||
                                        mat.gitMaterialUrl.includes('github') ||
                                        mat.gitMaterialUrl.includes('bitbucket') ? null : (
                                            <Git />
                                        )}
                                    </span>
                                    <span>
                                        <div className="fw-6 fs-14">{mat.gitMaterialName}</div>
                                        <div className="pb-12">
                                            Use branch name matching&nbsp;
                                            <span className="fw-6">
                                                {getBranchRegexName(mat.gitMaterialId) || mat.regex}
                                            </span>
                                        </div>
                                    </span>
                                </div>
                                <input
                                    tabIndex={index}
                                    placeholder="Enter branch name matching regex"
                                    className="form__input ml-36 w-95"
                                    name="name"
                                    value={_regexValue.value}
                                    onChange={(e) => handleRegexInputValue(mat.gitMaterialId, e.target.value, mat)}
                                    autoFocus
                                    autoComplete="off"
                                />
                                {_regexValue.value &&
                                    _regexValue.isInvalid &&
                                    renderValidationErrorLabel('Branch name does not match the regex.')}
                                {!_regexValue.value && renderValidationErrorLabel('This is a required field')}
                            </div>
                        )
                    )
                })}
            </div>
            {!showWebhookModal && renderMaterialRegexFooterNextButton(context)}
        </>
    )
}

export default BranchRegexModal
