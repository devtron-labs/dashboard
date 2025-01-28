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

import { Component } from 'react'
import {
    Progressing,
    ConditionalWrap,
    Checkbox,
    InfoColourBar,
    multiSelectStyles,
    TippyCustomized,
    TippyTheme,
    stopPropagation,
    CHECKBOX_VALUE,
    CustomInput,
    SelectPicker,
    ComponentSizeType,
    SelectPickerProps,
    DeleteComponent,
    Button,
    ButtonStyleType,
    ButtonVariantType,
    DeleteConfirmationModal,
} from '@devtron-labs/devtron-fe-common-lib'
import { NavLink } from 'react-router-dom'
import Tippy from '@tippyjs/react'
import { MaterialViewProps, MaterialViewState } from './material.types'
import { URLS } from '../../config'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as Down } from '../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as ICHelpOutline } from '../../assets/icons/ic-help-outline.svg'
import { ReactComponent as Help } from '../../assets/icons/ic-help.svg'
import { ReactComponent as Check } from '../../assets/icons/ic-check-circle-green.svg'
import { ReactComponent as Wrong } from '../../assets/icons/ic-close-circle.svg'
import { isAWSCodeCommitURL, renderMaterialIcon, sortObjectArrayAlphabetically } from '../common/helpers/Helpers'
import { deleteMaterial } from './material.service'
import {
    DeleteComponentsName,
    DC_MATERIAL_VIEW__ISMULTI_CONFIRMATION_MESSAGE,
    DC_MATERIAL_VIEW_ISSINGLE_CONFIRMATION_MESSAGE,
} from '../../config/constantMessaging'
import { ReactComponent as Info } from '../../assets/icons/info-filled.svg'
import { ReactComponent as InfoOutlined } from '../../assets/icons/ic-info-outlined.svg'
import { AuthenticationType } from '../cluster/cluster.type'
import {
    INCLUDE_EXCLUDE_COMMIT_TIPPY,
    INCLUDE_EXCLUDE_COMMIT_INFO,
    INFO_BAR,
    INCLUDE_EXCLUDE_PLACEHOLDER,
    USE_REGEX_TIPPY_CONTENT,
} from './constants'

export class MaterialView extends Component<MaterialViewProps, MaterialViewState> {
    constructor(props) {
        super(props)

        this.state = {
            deleting: false,
            confirmation: false,
        }
    }

    toggleConfirmation = () => {
        this.setState((prevState) => {
            return { confirmation: !prevState.confirmation }
        })
    }

    setDeleting = () => {
        this.setState({
            deleting: !this.state.deleting,
        })
    }

    setToggleCollapse = (e) => {
        this.props.toggleCollapse(e)
        this.setState({ confirmation: false })
    }

    renderCollapsedView() {
        if (this.props.material.id) {
            return (
                <div
                    key={`${this.props.material.id}`}
                    className="white-card artifact-collapsed"
                    tabIndex={0}
                    onClick={this.props.toggleCollapse}
                    data-testid="already-existing-git-material"
                >
                    <span className="mr-8">{renderMaterialIcon(this.props.material.url)}</span>
                    <div className="">
                        <div className="git__provider">{this.props.material.name}</div>
                        <p className="git__url">{this.props.material.url}</p>
                    </div>
                    <Down className="collapsed__icon icon-dim-20" style={{ transform: 'rotateX(0deg)' }} />
                </div>
            )
        }
        return (
            <div
                className="white-card white-card--add-new-item mb-16 dashed"
                onClick={this.props.toggleCollapse}
                data-testid="add-multi-git-repo"
            >
                <Add className="icon-dim-24 mr-5 fcb-5 dc__vertical-align-middle" />
                <span className="dc__artifact-add">Add Git Repository</span>
            </div>
        )
    }

    gitAuthType = (key) => {
        const res =
            this.props.providers?.filter((provider) => provider?.id === this.props.material?.gitProvider?.id) || []
        if (key === 'host') {
            return res[0]?.authMode == 'SSH' ? 'ssh' : 'https'
        }
        if (key === 'placeholder') {
            if (isAWSCodeCommitURL(this.props.material?.gitProvider?.url)) {
                return 'e.g. git-codecommit.ap-south-1.amazonaws.com/v1/repos/repo_name'
            }

            return res[0]?.authMode == 'SSH' ? 'e.g. git@github.com:abc/xyz.git' : 'e.g. https://gitlab.com/abc/xyz.git'
        }
    }

    preventRepoDeleteContent = () => {
        return (
            <>
                <h2 className="fs-13 fw-4 lh-20 cn-0 m-0 p-0">Cannot Delete!</h2>
                <p className="fs-13 fw-4 lh-20 cn-0 m-0 p-0">At least one repository is required.</p>
            </>
        )
    }

    onClickDelete = () => {
        if (this.props.material.isUsedInCiConfig) {
            if (this.props.toggleRepoSelectionTippy && this.props.setRepo) {
                this.props.toggleRepoSelectionTippy()
                this.props.setRepo(this.props.material.name)
            }
        } else {
            this.toggleConfirmation()
        }
    }

    regexInfoSteps = (): JSX.Element => {
        return (
            <div data-testid="exclude-include-use-regex-info" className="w-500 h-380 fs-13 bg__primary">
                <div className="h-365 dc__align-start p-12 dc__gap-12 dc__position-sticky dc__overflow-auto">
                    <div className="w-476 h-112 flex column dc__align-start p-0 dc__gap-4">
                        {USE_REGEX_TIPPY_CONTENT.insructionsList.regexInfo.map((item, index) => (
                            <div
                                key={item.info}
                                className={`${index === 2 ? 'h-24' : 'h-40'} dc__gap-12 w-476 fs-13 fw-4 flex dc__align-start p-0`}
                            >
                                <div className="w-28 h-24 flex column dc__content-center dc__align-items-center p-10 dc__gap-10 bcn-1 br-4 mono dc__no-border">
                                    {item.regex}
                                </div>
                                <span className={`${index === 2 ? 'h-20' : 'h-40'} w-436 lh-20`}>{item.info}</span>
                            </div>
                        ))}
                    </div>
                    <div className="w-476 mt-12 dc__border-n1 flex column dc__align-start p-0 br-4">
                        <div className="w-476 regex-tippy-container h-32 pt-6 pr-12 pb-6 pl-12 dc__gap-16 dc__border-bottom-n1">
                            <span className="h-20 fs-12 fw-6 lh-20 fcn-6">
                                {USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.headingRegex}
                            </span>
                            <span className="h-20 fs-12 fw-6 lh-20 fcn-6">
                                {USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.headingPath}
                            </span>
                        </div>
                        <div className="regex-tippy-container h-82 pt-8 pr-12 pb-8 pl-12 dc__gap-16 dc__align-start dc__border-bottom-n1">
                            <div className="flex left">
                                <span className="bcn-1 lh-20 br-6 pl-4 pr-4 mono fs-13 fw-4 cn-7">
                                    {
                                        USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                            .regexExample1
                                    }
                                </span>
                            </div>
                            <div className="h-66 dc__align-start p-0 dc__gap-6">
                                <div className="h-18 dc__align-items-center p-0 dc__gap-4">
                                    <span className="fs-13 fw-4 lh-10">
                                        {
                                            USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                                .regexPathExample1.regexPath1.partOne
                                        }
                                    </span>
                                    <span className="fs-13 fw-6 lh-10">
                                        {
                                            USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                                .regexPathExample1.regexPath1.partTwo
                                        }
                                    </span>
                                    <span className="fs-13 fw-4 lh-10">
                                        {
                                            USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                                .regexPathExample1.regexPath1.partThree
                                        }
                                    </span>
                                </div>
                                <div className="h-18 mt-6 dc__align-items-center p-0 dc__gap-4">
                                    <span className="fs-13 fw-4 lh-10">
                                        {
                                            USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                                .regexPathExample1.regexPath2.partOne
                                        }
                                    </span>
                                    <span className="fs-13 fw-6 lh-10">
                                        {
                                            USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                                .regexPathExample1.regexPath2.partTwo
                                        }
                                    </span>
                                    <span className="fs-13 fw-4 lh-10">
                                        {
                                            USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                                .regexPathExample1.regexPath2.partThree
                                        }
                                    </span>
                                </div>
                                <div className="h-18 mt-6 dc__align-items-center p-0 dc__gap-4">
                                    <span className="fs-13 fw-4 lh-10">
                                        {
                                            USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                                .regexPathExample1.regexPath3.partOne
                                        }
                                    </span>
                                    <span className="fs-13 fw-6 lh-10">
                                        {
                                            USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                                .regexPathExample1.regexPath3.partTwo
                                        }
                                    </span>
                                    <span className="fs-13 fw-4 lh-10">
                                        {
                                            USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                                .regexPathExample1.regexPath3.partThree
                                        }
                                    </span>
                                </div>
                            </div>
                            <div className="h-66 dc__align-start p-0 dc__gap-6">
                                <Check className="icon-dim-16 mt-2" />
                                <Check className="icon-dim-16 mt-2" />
                                <Wrong className="icon-dim-16 mt-2" />
                            </div>
                        </div>
                        <div className="regex-tippy-container h-82 pt-8 pr-12 pb-8 pl-12 dc__gap-16 dc__align-start dc__border-bottom-n1">
                            <div className="flex left">
                                <span className="bcn-1 lh-20 br-6 pl-4 pr-4 mono fs-13 fw-4 cn-7">
                                    {
                                        USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                            .regexExample2
                                    }
                                </span>
                            </div>
                            <div className="h-66 dc__align-start p-0 dc__gap-6">
                                <div className="h-18 dc__align-items-center p-0 dc__gap-4">
                                    <span className="fs-13 fw-4 lh-10">
                                        {
                                            USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                                .regexPathExample2.regexPath1.partOne
                                        }
                                    </span>
                                    <span className="fs-13 fw-6 lh-10">
                                        {
                                            USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                                .regexPathExample2.regexPath1.partTwo
                                        }
                                    </span>
                                    <span className="fs-13 fw-4 lh-10">
                                        {
                                            USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                                .regexPathExample2.regexPath1.partThree
                                        }
                                    </span>
                                </div>
                                <div className="h-18 mt-6 dc__align-items-center p-0 dc__gap-4">
                                    <span className="fs-13 fw-4 lh-10">
                                        {
                                            USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                                .regexPathExample2.regexPath2.partOne
                                        }
                                    </span>
                                    <span className="fs-13 fw-6 lh-10">
                                        {
                                            USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                                .regexPathExample2.regexPath2.partTwo
                                        }
                                    </span>
                                    <span className="fs-13 fw-4 lh-10">
                                        {
                                            USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                                .regexPathExample2.regexPath2.partThree
                                        }
                                    </span>
                                </div>
                                <div className="h-18 mt-6 dc__align-items-center p-0 dc__gap-4">
                                    <span className="fs-13 fw-4 lh-10">
                                        {
                                            USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                                .regexPathExample2.regexPath3.partOne
                                        }
                                    </span>
                                    <span className="fs-13 fw-6 lh-10">
                                        {
                                            USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                                .regexPathExample2.regexPath3.partTwo
                                        }
                                    </span>
                                    <span className="fs-13 fw-4 lh-10">
                                        {
                                            USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                                .regexPathExample2.regexPath3.partThree
                                        }
                                    </span>
                                </div>
                            </div>
                            <div className="h-66 dc__align-start p-0 dc__gap-6">
                                <Wrong className="icon-dim-16 mt-2" />
                                <Check className="icon-dim-16 mt-2" />
                                <Wrong className="icon-dim-16 mt-2" />
                            </div>
                        </div>
                        <div className="regex-tippy-container h-82 pt-8 pr-12 pb-8 pl-12 dc__gap-16 dc__align-start dc__border-bottom-n1">
                            <div className="flex left">
                                <span className="bcn-1 lh-20 br-6 pl-4 pr-4 mono fs-13 fw-4 cn-7">
                                    {
                                        USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                            .regexExample3.partOne
                                    }
                                </span>
                                <span className="ml-4 fs-13 fw-4 lh-20">
                                    {
                                        USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                            .regexExample3.partTwo
                                    }
                                </span>
                                <span className="bcn-1 lh-20 br-6 pl-4 pr-4 mono fs-13 fw-4 ml-4 cn-7">
                                    {
                                        USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                            .regexExample3.partThree
                                    }
                                </span>
                            </div>
                            <div className="h-66 dc__align-start p-0 dc__gap-6">
                                <div className="h-18 dc__align-items-center p-0 dc__gap-4">
                                    <span className="fs-13 fw-4 lh-10">
                                        {
                                            USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                                .regexPathExample3.regexPath1.partOne
                                        }
                                    </span>
                                    <span className="fs-13 fw-6 lh-10">
                                        {
                                            USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                                .regexPathExample3.regexPath1.partTwo
                                        }
                                    </span>
                                </div>
                                <div className="h-18 mt-6 dc__align-items-center p-0 dc__gap-4">
                                    <span className="fs-13 fw-4 lh-10">
                                        {
                                            USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                                .regexPathExample3.regexPath2.partOne
                                        }
                                    </span>
                                    <span className="fs-13 fw-6 lh-10">
                                        {
                                            USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                                .regexPathExample3.regexPath2.partTwo
                                        }
                                    </span>
                                </div>
                                <div className="h-18 mt-6 dc__align-items-center p-0 dc__gap-4">
                                    <span className="fs-13 fw-4 lh-10">
                                        {
                                            USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                                .regexPathExample3.regexPath3.partOne
                                        }
                                    </span>
                                    <span className="fs-13 fw-6 lh-10">
                                        {
                                            USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                                .regexPathExample3.regexPath3.partTwo
                                        }
                                    </span>
                                </div>
                            </div>
                            <div className="h-66 dc__align-start p-0 dc__gap-6">
                                <Check className="icon-dim-16 mt-2" />
                                <Check className="icon-dim-16 mt-2" />
                                <Check className="icon-dim-16 mt-2" />
                            </div>
                        </div>
                        <div className="regex-tippy-container h-82 pt-8 pr-12 pb-8 pl-12 dc__gap-16 dc__align-start dc__border-bottom-n1">
                            <div className="flex left">
                                <span className="bcn-1 lh-20 br-6 pl-4 pr-4 mono fs-13 fw-4 cn-7">
                                    {
                                        USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                            .regexExample4
                                    }
                                </span>
                            </div>
                            <div className="h-66 dc__align-start p-0 dc__gap-6">
                                <div className="h-18 dc__align-items-center p-0 dc__gap-4">
                                    <span className="fs-13 fw-4 lh-10">
                                        {
                                            USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                                .regexPathExample4.regexPath1.partOne
                                        }
                                    </span>
                                    <span className="fs-13 fw-6 lh-10">
                                        {
                                            USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                                .regexPathExample4.regexPath1.partTwo
                                        }
                                    </span>
                                </div>
                                <div className="h-18 mt-6 dc__align-items-center p-0 dc__gap-4">
                                    <span className="fs-13 fw-4 lh-10">
                                        {
                                            USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                                .regexPathExample4.regexPath2.partOne
                                        }
                                    </span>
                                    <span className="fs-13 fw-6 lh-10">
                                        {
                                            USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                                .regexPathExample4.regexPath2.partTwo
                                        }
                                    </span>
                                </div>
                                <div className="h-18 mt-6 dc__align-items-center p-0 dc__gap-4">
                                    <span className="fs-13 fw-4 lh-10">
                                        {
                                            USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                                .regexPathExample4.regexPath3.partOne
                                        }
                                    </span>
                                    <span className="fs-13 fw-6 lh-10">
                                        {
                                            USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                                .regexPathExample4.regexPath3.partTwo
                                        }
                                    </span>
                                </div>
                            </div>
                            <div className="h-66 dc__align-start p-0 dc__gap-6">
                                <Check className="icon-dim-16 mt-2" />
                                <Check className="icon-dim-16 mt-2" />
                                <Wrong className="icon-dim-16 mt-2" />
                            </div>
                        </div>
                        <div className="regex-tippy-container h-58 pt-8 pr-12 pb-8 pl-12 dc__gap-16 dc__align-start dc__border-bottom-n1">
                            <div className="flex left">
                                <span className="fs-13 fw-4 lh-20">
                                    {
                                        USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                            .regexExample5.partOne
                                    }
                                </span>
                                <span className="bcn-1 lh-20 br-6 pl-4 pr-4 mono fs-13 fw-4 ml-4 cn-7">
                                    {
                                        USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                            .regexExample5.partTwo
                                    }
                                </span>
                                <span className="ml-4 fs-13 fw-4 lh-20">
                                    {
                                        USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                            .regexExample5.partThree
                                    }
                                </span>
                                <span className="bcn-1 lh-20 br-6 pl-4 pr-4 mono fs-13 fw-4 ml-4 cn-7">
                                    {
                                        USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                            .regexExample5.partFour
                                    }
                                </span>
                            </div>
                            <div className="h-66 dc__align-start p-0 dc__gap-6">
                                <div className="h-18 dc__align-items-center p-0 dc__gap-4">
                                    <span className="fs-13 fw-4 lh-10">
                                        {
                                            USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                                .regexPathExample5.regexPath1.partOne
                                        }
                                    </span>
                                </div>
                                <div className="h-18 mt-6 dc__align-items-center p-0 dc__gap-4">
                                    <span className="fs-13 fw-4 lh-10">
                                        {
                                            USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                                .regexPathExample5.regexPath2.partOne
                                        }
                                    </span>
                                </div>
                            </div>
                            <div className="h-66 dc__align-start p-0 dc__gap-6">
                                <Check className="icon-dim-16 mt-2" />
                                <Wrong className="icon-dim-16 mt-2" />
                            </div>
                        </div>
                        <div className="regex-tippy-container h-36 pt-8 pr-12 pb-8 pl-12 dc__gap-16 dc__align-start dc__border-bottom-n1">
                            <div className="flex left">
                                <span className="fs-13 fw-4 lh-20">
                                    {
                                        USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                            .regexExample6.partOne
                                    }
                                </span>
                                <span className="bcn-1 lh-20 br-6 pl-4 pr-4 mono fs-13 fw-4 ml-4 cn-7">
                                    {
                                        USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                            .regexExample6.partTwo
                                    }
                                </span>
                            </div>
                            <div className="h-66 dc__align-start p-0 dc__gap-6">
                                <div className="h-18 dc__align-items-center p-0 dc__gap-4">
                                    <span className="fs-13 fw-4 lh-10">
                                        {
                                            USE_REGEX_TIPPY_CONTENT.insructionsList.regexPathInfo.regexPathExample
                                                .regexPathExample6.regexPath1.partOne
                                        }
                                    </span>
                                </div>
                            </div>
                            <div className="h-66 dc__align-start p-0 dc__gap-6">
                                <Check className="icon-dim-16 mt-2" />
                            </div>
                        </div>
                    </div>
                </div>
                <br />
            </div>
        )
    }

    tippyContent = () => {
        return (
            <div className="p-12 fs-13">
                <div className="mb-20">{INCLUDE_EXCLUDE_COMMIT_TIPPY.lineOne}</div>
                <div className="mb-20">{INCLUDE_EXCLUDE_COMMIT_TIPPY.lineTwo}</div>
                <div>{INCLUDE_EXCLUDE_COMMIT_TIPPY.lineThree}</div>
                <div>{INCLUDE_EXCLUDE_COMMIT_TIPPY.lineFour}</div>
            </div>
        )
    }

    renderIncludeExcludeInfoBar = (): JSX.Element => {
        if (this.props.material.includeExcludeFilePath?.trim() === '') {
            return null
        }
        const filePath = this.props.material.includeExcludeFilePath.split(/\r?\n/)
        let allExcluded = true
        for (const path of filePath) {
            const trimmedPath = path.trim()
            if (trimmedPath !== '' && trimmedPath.charAt(0) !== '!') {
                allExcluded = false
            }
        }
        return (
            <div className="flex left h-36 p-8 bcy-1 dc__border-top">
                <span className="fw-4 fs-13">
                    <InfoOutlined className="icon-dim-16 mr-6 mt-6 fcn-6" />
                </span>
                {INFO_BAR.infoMessage}
                {allExcluded ? (
                    <span className="ml-4 fw-6 cg-5">included</span>
                ) : (
                    <span className="ml-4 fw-6 cr-5">excluded</span>
                )}
            </div>
        )
    }

    renderGitRepoUrlLabel = (): JSX.Element => {
        return (
            <>
                Git Repo URL<span className="cr-5">* </span>(use {this.gitAuthType('host')})
            </>
        )
    }

    getGitProviderOption = (provider) => ({
        ...provider,
        value: provider.id,
        label: provider.name,
        startIcon: renderMaterialIcon(provider.url),
    })

    handleGitProviderChange: SelectPickerProps['onChange'] = (selected) => {
        this.props.handleProviderChange(selected, this.props.material.url)
    }

    renderGitProviderOptionsFooter = () => (
        <NavLink
            to={URLS.GLOBAL_CONFIG_GIT}
            className="flex left dc__gap-8 dc__border-top bg__primary px-8 py-10 cb-5 dc__block fw-6 fs-13 lh-20 anchor cursor dc__no-decor dc__hover-n50"
        >
            <Add className="icon-dim-20 dc__no-shrink fcb-5" data-testid="add-git-account-option" />
            <span>Add Git Account</span>
        </NavLink>
    )

    onDelete = async () => {
        const deletePayload = {
            appId: this.props.appId,
            material: {
                id: this.props.material.id,
                url: this.props.material.url,
                checkoutPath: this.props.material.checkoutPath,
                gitProviderId: this.props.material.gitProvider.id,
                fetchSubmodules: !!this.props.material.fetchSubmodules,
            },
        }

        await deleteMaterial(deletePayload)
    }

    renderForm() {
        const sortedProviders: any[] = this.props.providers
            ? sortObjectArrayAlphabetically(this.props.providers, 'name')
            : []
        const gitProviderOptions = sortedProviders.map(this.getGitProviderOption)
        const selectedGitProviderOption = this.props.material.gitProvider
            ? this.getGitProviderOption(this.props.material.gitProvider)
            : null

        return (
            <form key={`${this.props.material.id}`} className="white-card p-20 mb-16">
                <div
                    className="mb-20 cn-9 fs-16 fw-6 white-card__header--form"
                    data-testid={`${this.props.material.id ? 'edit' : 'add'}-git-repository-heading`}
                >
                    {this.props.material.id ? 'Edit Git Repository' : 'Add Git Repository'}
                    {this.props.material.id ? (
                        <button
                            type="button"
                            className="dc__transparent collapse-button"
                            tabIndex={0}
                            onClick={this.setToggleCollapse}
                        >
                            <Down className="collapsed__icon icon-dim-20" style={{ transform: 'rotateX(180deg)' }} />
                        </button>
                    ) : null}
                </div>
                <div className="form__row form-row__material" data-testid="add-git-repository-form">
                    <div>
                        <SelectPicker
                            classNamePrefix="material-view__select-project"
                            inputId="material-view__select-project"
                            label="Git Account"
                            options={gitProviderOptions}
                            value={selectedGitProviderOption}
                            required
                            error={this.props.isError.gitProvider}
                            renderMenuListFooter={this.renderGitProviderOptionsFooter}
                            onChange={this.handleGitProviderChange}
                            name="material-view__select-project"
                            size={ComponentSizeType.large}
                        />
                    </div>
                    <div>
                        <CustomInput
                            label={this.renderGitRepoUrlLabel()}
                            name="Git Repo URL"
                            placeholder={this.gitAuthType('placeholder')}
                            value={`${this.props.material.url}`}
                            onChange={this.props.handleUrlChange}
                            data-testid="git-repo-url-text-box"
                            error={this.props.isError.url}
                            rootClassName="h-36"
                        />
                    </div>
                </div>
                {this.props.material.gitProvider?.authMode === AuthenticationType.ANONYMOUS && (
                    <InfoColourBar
                        message="This git account has anonymous read access. Only public repositories can be accessed with anonymous authentication."
                        classname="info_bar cn-9 mb-20 lh-20"
                        Icon={Info}
                        iconClass="icon-dim-20"
                    />
                )}
                {!window._env_.HIDE_EXCLUDE_INCLUDE_GIT_COMMITS && (
                    <>
                        <div className="flex left">
                            <Checkbox
                                isChecked={this.props.material.isExcludeRepoChecked}
                                value={CHECKBOX_VALUE.CHECKED}
                                tabIndex={3}
                                onChange={this.props.handleExcludeRepoCheckbox}
                                rootClassName="fs-14 cn-9 mb-8 flex top dc_max-width__max-content"
                            >
                                <div className="ml-12">
                                    <span data-testid="exclude-include-checkbox" className="mt-1 flex left">
                                        Exclude specific file/folder in this repo
                                    </span>
                                </div>
                            </Checkbox>
                            <span>
                                <TippyCustomized
                                    theme={TippyTheme.white}
                                    iconClass="fcv-5"
                                    className="bg__primary deafult-tt"
                                    placement="bottom"
                                    Icon={Help}
                                    heading="Exclude file/folders"
                                    infoText=""
                                    showCloseButton
                                    additionalContent={this.tippyContent()}
                                    trigger="click"
                                    interactive
                                >
                                    <div className="flex">
                                        <ICHelpOutline onClick={stopPropagation} className="icon-dim-16 ml-4 cursor" />
                                    </div>
                                </TippyCustomized>
                            </span>
                        </div>
                        {this.props.material.isExcludeRepoChecked && (
                            <div className="dc__border br-4 mt-8 ml-35">
                                <div className="p-8 dc__border-bottom">
                                    <p className="fw-4 fs-13 mb-0-imp">
                                        Enter file or folder paths to be included or excluded.
                                        <a
                                            data-testid={`${
                                                !this.props.isLearnHowClicked
                                                    ? 'exclude-include-learn'
                                                    : 'exclude-include-hide'
                                            }`}
                                            className="dc__link ml-4 cursor"
                                            onClick={this.props.handleLearnHowClick}
                                            rel="noopener noreferrer"
                                            target="_blank"
                                        >
                                            {!this.props.isLearnHowClicked ? 'Learn how' : 'Hide info'}
                                        </a>
                                    </p>
                                    {this.props.isLearnHowClicked && (
                                        <div data-testid="exclude-include-learn-how-steps" className="ml-8 mt-8">
                                            <div className="flex left">
                                                <div className="dc__bullet mr-6 ml-6" />
                                                <span className="fs-13 fw-4">
                                                    {INCLUDE_EXCLUDE_COMMIT_INFO.infoList.lineOne.partOne}
                                                </span>
                                                <span className="bcn-1 lh-20 br-6 pl-4 pr-4 mono fs-13 fw-4 ml-4 cn-7">
                                                    {INCLUDE_EXCLUDE_COMMIT_INFO.infoList.lineOne.partTwo}
                                                </span>
                                                <span className="ml-4 fs-13 fw-4">
                                                    {INCLUDE_EXCLUDE_COMMIT_INFO.infoList.lineOne.partThree}
                                                </span>
                                                <span className="bcn-1 lh-20 br-6 pl-4 pr-4 mono fs-13 fw-4 ml-4 cn-7">
                                                    {INCLUDE_EXCLUDE_COMMIT_INFO.infoList.lineOne.partFour}
                                                </span>
                                                <br />
                                            </div>
                                            <div className="flex left mt-4">
                                                <div className="dc__bullet mr-6 ml-6" />
                                                <span className="fs-13 fw-4">
                                                    {INCLUDE_EXCLUDE_COMMIT_INFO.infoList.lineTwo.partOne}
                                                </span>
                                                <span className="bcn-1 lh-20 br-6 pl-4 pr-4 mono fs-13 fw-4 ml-4 cn-7">
                                                    {INCLUDE_EXCLUDE_COMMIT_INFO.infoList.lineTwo.partTwo}
                                                </span>
                                                <span className="fs-13 fw-4 ml-2">,</span>
                                                <span className="bcn-1 lh-20 br-6 pl-4 pr-4 mono fs-13 fw-4 ml-4 cn-7">
                                                    {INCLUDE_EXCLUDE_COMMIT_INFO.infoList.lineTwo.partThree}
                                                </span>
                                                <span className="fs-13 fw-4 ml-2">,</span>
                                                <span className="bcn-1 lh-20 br-6 pl-4 pr-4 mono fs-13 fw-4 ml-4 cn-7">
                                                    {INCLUDE_EXCLUDE_COMMIT_INFO.infoList.lineTwo.partFour}
                                                </span>
                                                <TippyCustomized
                                                    theme={TippyTheme.white}
                                                    iconClass="fcv-5"
                                                    className="dc__mxw-none w-505 bg__primary dc__border-radius-8-imp tippy-box default-white tippy-shadow"
                                                    heading={USE_REGEX_TIPPY_CONTENT.insructionsList.heading}
                                                    placement="bottom"
                                                    Icon={Help}
                                                    infoText=""
                                                    showCloseButton
                                                    additionalContent={this.regexInfoSteps()}
                                                    trigger="click"
                                                    interactive
                                                >
                                                    <span
                                                        data-testid="exclude-include-use-regex"
                                                        className="dc__link cursor fs-13 fw-4 ml-8"
                                                    >
                                                        {INCLUDE_EXCLUDE_COMMIT_INFO.infoList.lineTwo.partFive}
                                                    </span>
                                                </TippyCustomized>
                                                <br />
                                            </div>
                                            <div className="flex left mt-6">
                                                <div className="dc__bullet mr-6 ml-6" />
                                                <span className="fs-13 fw-4">
                                                    {INCLUDE_EXCLUDE_COMMIT_INFO.infoList.lineThree}
                                                </span>
                                                <br />
                                            </div>
                                            <div className="ml-10 mt-4 mono fs-13 fw-4">
                                                {INCLUDE_EXCLUDE_COMMIT_INFO.example.lineOne}
                                                <br />
                                                {INCLUDE_EXCLUDE_COMMIT_INFO.example.lineTwo}
                                                <br />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <textarea
                                    data-testid="exclude-include-commit-textbox"
                                    className="form__textarea dc__no-border-imp mxh-140"
                                    autoComplete="off"
                                    autoFocus
                                    placeholder={INCLUDE_EXCLUDE_PLACEHOLDER}
                                    rows={3}
                                    value={this.props.material.includeExcludeFilePath}
                                    onChange={this.props.handleFileChange}
                                />
                                {this.renderIncludeExcludeInfoBar()}
                            </div>
                        )}
                    </>
                )}
                <label>
                    <div className="pt-16">
                        <Checkbox
                            isChecked={this.props.isChecked}
                            value={CHECKBOX_VALUE.CHECKED}
                            tabIndex={4}
                            onChange={this.props.handleCheckoutPathCheckbox}
                            rootClassName="fs-14 cn-9 mb-8 flex top"
                        >
                            <div className="ml-12">
                                {this.props.isJobView ? (
                                    <span data-testid="set-checkout-path-checkbox" className="mb-4 mt-4 flex left">
                                        Set checkout path
                                    </span>
                                ) : (
                                    <>
                                        <span className="mb-4 flex left" data-testid="set-clone-directory-checkbox">
                                            Set clone directory
                                            <Tippy
                                                className="default-tt w-200"
                                                arrow={false}
                                                placement="bottom"
                                                content="Devtron will create the directory and clone the code in it"
                                            >
                                                <div className="flex">
                                                    <ICHelpOutline className="icon-dim-16 ml-4" />
                                                </div>
                                            </Tippy>
                                        </span>
                                        <div className="fs-12 cn-7">
                                            Eg. If your app needs code from multiple git repositories for CI
                                        </div>
                                    </>
                                )}
                            </div>
                        </Checkbox>
                        {this.props.isChecked && (
                            <div className="ml-35">
                                <CustomInput
                                    rootClassName="w-885"
                                    placeholder="e.g. /abc"
                                    value={this.props.material.checkoutPath}
                                    onChange={this.props.handlePathChange}
                                    data-testid="clone-directory-path"
                                    name="clone-directory-path"
                                    error={this.props.isError.checkoutPath}
                                />
                            </div>
                        )}
                    </div>
                    <div className="pt-16 ">
                        <Checkbox
                            isChecked={this.props.material.fetchSubmodules}
                            value={CHECKBOX_VALUE.CHECKED}
                            tabIndex={5}
                            onChange={this.props.handleSubmoduleCheckbox}
                            rootClassName="fs-14 cn-9 flex top"
                        >
                            <div className="ml-12">
                                <span className="mb-4 flex left" data-testid="pull-submodule-recursively-checkbox">
                                    Pull submodules recursively
                                    <Tippy
                                        className="default-tt w-200"
                                        arrow={false}
                                        placement="bottom"
                                        content="This will use credentials from default remote of parent repository."
                                    >
                                        <div className="flex">
                                            <ICHelpOutline className="icon-dim-16 ml-4" />
                                        </div>
                                    </Tippy>
                                </span>
                                <div className="fs-12 cn-7">
                                    Use this to pull submodules recursively while building the code
                                </div>
                            </div>
                        </Checkbox>
                    </div>
                </label>
                <div className="flexbox dc__content-space pt-20">
                    {this.props.material.id && (
                        <ConditionalWrap
                            condition={this.props.preventRepoDelete}
                            wrap={(children) => (
                                <Tippy
                                    className="default-tt"
                                    arrow={false}
                                    placement="top"
                                    content={this.preventRepoDeleteContent()}
                                >
                                    <div className="dc__m-auto ml-0">{children}</div>
                                </Tippy>
                            )}
                        >
                            <Button
                                style={ButtonStyleType.negative}
                                variant={ButtonVariantType.secondary}
                                onClick={this.onClickDelete}
                                disabled={this.props.preventRepoDelete}
                                dataTestId="git-repository-delete-button"
                                isLoading={this.state.deleting}
                                text="Delete"
                            />
                        </ConditionalWrap>
                    )}
                    <div className='flex w-100 dc__gap-12 right'>
                        {this.props.isMultiGit ? (
                            <Button
                                text="Cancel"
                                style={ButtonStyleType.neutral}
                                variant={ButtonVariantType.secondary}
                                onClick={this.props.cancel}
                                dataTestId="git-repository-cancel-button"
                            />
                        ) : null}
                        <Button
                            text="Save"
                            variant={ButtonVariantType.secondary}
                            disabled={this.props.isLoading}
                            onClick={this.props.save}
                            dataTestId="git-repository-save-button"
                            isLoading={this.props.isLoading}
                        />
                    </div>
                </div>
                <DeleteConfirmationModal
                    title={this.props.material.name}
                    component={DeleteComponentsName.GitRepo}
                    showConfirmationModal={this.state.confirmation}
                    closeConfirmationModal={this.toggleConfirmation}
                    onDelete={this.onDelete}
                    reload={this.props.reload}
                    description={
                        this.props.isMultiGit
                            ? DC_MATERIAL_VIEW__ISMULTI_CONFIRMATION_MESSAGE
                            : DC_MATERIAL_VIEW_ISSINGLE_CONFIRMATION_MESSAGE
                    }
                />
            </form>
        )
    }

    render() {
        return this.props.isCollapsed ? this.renderCollapsedView() : this.renderForm()
    }
}
