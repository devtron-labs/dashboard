import React, { Component } from 'react'
import ReactSelect, { components } from 'react-select'
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
} from '@devtron-labs/devtron-fe-common-lib'
import { MaterialViewProps, MaterialViewState } from './material.types'
import { NavLink } from 'react-router-dom'
import { URLS } from '../../config'
import error from '../../assets/icons/misc/errorInfo.svg'
import { getCustomOptionSelectionStyle } from '../v2/common/ReactSelect.utils'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { ReactComponent as Down } from '../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as GitLab } from '../../assets/icons/git/gitlab.svg'
import { ReactComponent as Git } from '../../assets/icons/git/git.svg'
import { ReactComponent as GitHub } from '../../assets/icons/git/github.svg'
import { ReactComponent as BitBucket } from '../../assets/icons/git/bitbucket.svg'
import { ReactComponent as Question } from '../../assets/icons/ic-help-outline.svg'
import { ReactComponent as QuestionFilled } from '../../assets/icons/ic-help.svg'
import Tippy from '@tippyjs/react'
import { sortObjectArrayAlphabetically } from '../common/helpers/Helpers'
import DeleteComponent from '../../util/DeleteComponent'
import { deleteMaterial } from './material.service'
import {
    DeleteComponentsName,
    DC_MATERIAL_VIEW__ISMULTI_CONFIRMATION_MESSAGE,
    DC_MATERIAL_VIEW_ISSINGLE_CONFIRMATION_MESSAGE,
} from '../../config/constantMessaging'
import { ReactComponent as Info } from '../../assets/icons/info-filled.svg'
import { ReactComponent as InfoOutlined } from '../../assets/icons/ic-info-outlined.svg'
import { AuthenticationType } from '../cluster/cluster.type'
import { INCLUDE_EXCLUDE_COMMIT_TIPPY, INCLUDE_EXCLUDE_COMMIT_INFO, INFO_BAR } from './constants'

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
                    <span className="mr-8">
                        {this.props.material.url.includes('gitlab') ? <GitLab /> : null}
                        {this.props.material.url.includes('github') ? <GitHub /> : null}
                        {this.props.material.url.includes('bitbucket') ? <BitBucket /> : null}
                        {this.props.material.url.includes('gitlab') ||
                        this.props.material.url.includes('github') ||
                        this.props.material.url.includes('bitbucket') ? null : (
                            <Git />
                        )}
                    </span>
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
                data-testid={`add-multi-git-repo`}
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
            return res[0]?.authMode == 'SSH' ? 'e.g. git@github.com:abc/xyz.git' : 'e.g. https://gitlab.com/abc/xyz.git'
        }
    }

    getMaterialPayload = () => {
        return {
            appId: this.props.appId,
            material: {
                id: this.props.material.id,
                url: this.props.material.url,
                checkoutPath: this.props.material.checkoutPath,
                gitProviderId: this.props.material.gitProvider.id,
                fetchSubmodules: this.props.material.fetchSubmodules ? true : false,
            },
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

    isIncludeExcludeOther = (): JSX.Element => {
        const filePath = this.props.material.includeExcludeFilePath.split(/\r?\n/)
        let allExcluded = true
        for (const path of filePath) {
            if (path !== '' && path.charAt(0) !== '!') {
                allExcluded = false
            }
        }
        if (allExcluded) {
            return <span className="ml-4 fw-6 cg-5">included</span>
        }
        return <span className="ml-4 fw-6 cr-5">excluded</span>
    }

    handleKeypress = (e): void => {
        if (e.key === 'Enter' && !e.target.value) {
            e.preventDefault()
        }
    }

    renderForm() {
        const sortedProviders: any[] = this.props.providers
            ? sortObjectArrayAlphabetically(this.props.providers, 'name')
            : []
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
                    <div className="">
                        <label className="form__label">Git Account*</label>
                        <ReactSelect
                            classNamePrefix="material-view__select-project"
                            className="m-0"
                            tabIndex={1}
                            isMulti={false}
                            isClearable={false}
                            options={sortedProviders}
                            getOptionLabel={(option) => `${option.name}`}
                            getOptionValue={(option) => `${option.id}`}
                            value={this.props.material.gitProvider}
                            styles={{
                                ...multiSelectStyles,
                                menuList: (base) => {
                                    return {
                                        ...base,
                                        position: 'relative',
                                        paddingBottom: '0px',
                                        maxHeight: '250px',
                                    }
                                },
                            }}
                            components={{
                                IndicatorSeparator: null,
                                Option: (props) => {
                                    props.selectProps.styles.option = getCustomOptionSelectionStyle()
                                    return (
                                        <components.Option {...props}>
                                            {props.data.url.includes('gitlab') ? (
                                                <GitLab className="mr-8 dc__vertical-align-middle icon-dim-20" />
                                            ) : null}
                                            {props.data.url.includes('github') ? (
                                                <GitHub className="mr-8 dc__vertical-align-middle icon-dim-20" />
                                            ) : null}
                                            {props.data.url.includes('bitbucket') ? (
                                                <BitBucket className="mr-8 dc__vertical-align-middle icon-dim-20" />
                                            ) : null}
                                            {props.data.url.includes('gitlab') ||
                                            props.data.url.includes('github') ||
                                            props.data.url.includes('bitbucket') ? null : (
                                                <Git className="mr-8 dc__vertical-align-middle icon-dim-20" />
                                            )}

                                            {props.label}
                                        </components.Option>
                                    )
                                },
                                MenuList: (props) => {
                                    return (
                                        <components.MenuList {...props}>
                                            {props.children}
                                            <NavLink
                                                to={`${URLS.GLOBAL_CONFIG_GIT}`}
                                                className="dc__border-top dc__react-select__bottom bcn-0 p-10 cb-5 dc__block fw-5 anchor cursor dc__no-decor"
                                            >
                                                <Add
                                                    className="icon-dim-20 fcb-5 mr-12 dc__vertical-align-bottom "
                                                    data-testid="add-git-account-option"
                                                />
                                                Add Git Account
                                            </NavLink>
                                        </components.MenuList>
                                    )
                                },
                                Control: (props) => {
                                    let value = ''

                                    if (props.hasValue) {
                                        value = props.getValue()[0].url
                                    }
                                    let showGit =
                                        value &&
                                        !value.includes('github') &&
                                        !value.includes('gitlab') &&
                                        !value.includes('bitbucket')
                                    return (
                                        <components.Control {...props}>
                                            {value.includes('github') ? <GitHub className="icon-dim-20 ml-8" /> : null}
                                            {value.includes('gitlab') ? <GitLab className="icon-dim-20 ml-8" /> : null}
                                            {value.includes('bitbucket') ? (
                                                <BitBucket className="icon-dim-20 ml-8" />
                                            ) : null}
                                            {showGit ? <Git className="icon-dim-20 ml-8" /> : null}
                                            {props.children}
                                        </components.Control>
                                    )
                                },
                            }}
                            onChange={(selected) => {
                                this.props.handleProviderChange(selected, this.props.material.url)
                            }}
                        />
                        {this.props.isError.gitProvider && (
                            <span className="form__error">
                                <img src={error} className="form__icon" />
                                {this.props.isError.gitProvider}
                            </span>
                        )}
                    </div>
                    <div>
                        <label className="form__label">Git Repo URL* (use {this.gitAuthType('host')})</label>
                        <input
                            className="form__input"
                            autoComplete={'off'}
                            autoFocus
                            name="Git Repo URL*"
                            type="text"
                            placeholder={this.gitAuthType('placeholder')}
                            value={`${this.props.material.url}`}
                            onChange={this.props.handleUrlChange}
                            data-testid={`git-repo-url-text-box`}
                        />
                        <span className="form__error">
                            {this.props.isError.url && (
                                <>
                                    <img src={error} className="form__icon" />
                                    {this.props.isError.url}
                                </>
                            )}
                        </span>
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
                <div className="flex left">
                    <Checkbox
                        isChecked={this.props.isExcludeRepoChecked}
                        value={'CHECKED'}
                        tabIndex={3}
                        onChange={this.props.handleExcludeRepoCheckbox}
                        rootClassName="fs-14 cn-9 mb-8 flex top dc_max-width__max-content"
                    >
                        <div className="ml-12">
                            <span className="mt-1 flex left">Exclude specific file/folder in this repo</span>
                        </div>
                    </Checkbox>
                    <span>
                        <TippyCustomized
                            theme={TippyTheme.white}
                            className="w-300 h-100 fcv-5"
                            placement="bottom"
                            Icon={QuestionFilled}
                            heading="Exclude file/folders"
                            infoText=""
                            showCloseButton={true}
                            additionalContent={this.tippyContent()}
                            trigger="click"
                            interactive={true}
                        >
                            <Question onClick={stopPropagation} className="icon-dim-16 ml-4 cursor" />
                        </TippyCustomized>
                    </span>
                </div>
                {this.props.isExcludeRepoChecked ? (
                    <div className="dc__border br-4 mt-8 ml-35">
                        <div className="p-8 dc__border-bottom">
                            <p className="fw-4 fs-13 mb-0-imp">
                                Enter file or folder paths to be included or excluded.
                                <a
                                    className="dc__link ml-4 cursor"
                                    onClick={this.props.handleLearnHowClick}
                                    rel="noopener noreferer"
                                    target="_blank"
                                >
                                    {!this.props.isLearnHowClicked ? 'Learn how' : 'Hide info'}
                                </a>
                            </p>
                            {this.props.isLearnHowClicked && (
                                <div className="ml-8">
                                    <div className="flex left">
                                        <div className="dc__bullet mr-6 ml-6"></div>
                                        <span className="fs-13 fw-4">{INCLUDE_EXCLUDE_COMMIT_INFO.infoList.lineOne.partOne}</span>
                                        <span className="bcn-1 br-2 p-2 dc__ff-monospace fs-13 fw-4 ml-4 dc__border">
                                            {INCLUDE_EXCLUDE_COMMIT_INFO.infoList.lineOne.partTwo}
                                        </span>
                                        <span className="ml-4 fs-13 fw-4">{INCLUDE_EXCLUDE_COMMIT_INFO.infoList.lineOne.partThree}</span>
                                        <span className="bcn-1 br-2 p-2 dc__ff-monospace fs-13 fw-4 ml-4 dc__border">
                                            {INCLUDE_EXCLUDE_COMMIT_INFO.infoList.lineOne.partFour}
                                        </span>
                                        <br />
                                    </div>
                                    <div className="flex left">
                                        <div className="dc__bullet mr-6 ml-6"></div>
                                        <span className="fs-13 fw-4">{INCLUDE_EXCLUDE_COMMIT_INFO.infoList.lineTwo}</span>
                                        <br />
                                    </div>
                                    <div className="flex left mt-2">
                                        <div className="dc__bullet mr-6 ml-6"></div>
                                        <span className="fs-13 fw-4">{INCLUDE_EXCLUDE_COMMIT_INFO.infoList.lineThree}</span>
                                        <br />
                                    </div>
                                    <div className="ml-10 mt-4 dc__ff-monospace fs-13 fw-4">
                                        {INCLUDE_EXCLUDE_COMMIT_INFO.example.lineOne}
                                        <br />
                                        {INCLUDE_EXCLUDE_COMMIT_INFO.example.lineTwo}
                                        <br />
                                    </div>
                                </div>
                            )}
                        </div>

                        <textarea
                            className="form__textarea dc__no-border-imp"
                            autoComplete={'off'}
                            autoFocus
                            placeholder={'Example: \nto include type /foldername \nto exclude type !/foldername'}
                            rows={3}
                            value={this.props.material.includeExcludeFilePath}
                            onKeyPress={this.handleKeypress}
                            onChange={this.props.handleFileChange}
                            data-testid="clone-directory-path"
                        />
                        {this.props.material.includeExcludeFilePath?.length > 0 && (
                            <div className="flex left h-36 p-8 bcy-1 dc__border-top">
                                <span className="fw-4 fs-13">
                                    <InfoOutlined className="icon-dim-16 mr-6 mt-6 fcn-6" />
                                </span>
                                {INFO_BAR.infoMessage}
                                {this.isIncludeExcludeOther()}
                            </div>
                        )}
                    </div>
                ) : (
                    ''
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
                                    <span className="mb-4 mt-4 flex left">Set checkout path</span>
                                ) : (
                                    <>
                                        <span className="mb-4 flex left" data-testid="set-clone-directory-checkbox">
                                            Set clone directory
                                            <Tippy
                                                className="default-tt w-200"
                                                arrow={false}
                                                placement="bottom"
                                                content={'Devtron will create the directory and clone the code in it'}
                                            >
                                                <Question className="icon-dim-16 ml-4" />
                                            </Tippy>
                                        </span>
                                        <div className="fs-12 cn-7">
                                            Eg. If your app needs code from multiple git repositories for CI
                                        </div>
                                    </>
                                )}
                            </div>
                        </Checkbox>
                        {this.props.isChecked ? (
                            <input
                                className="form__input ml-35"
                                autoComplete={'off'}
                                autoFocus
                                type="text"
                                placeholder="e.g. /abc"
                                value={this.props.material.checkoutPath}
                                onChange={this.props.handlePathChange}
                                data-testid="clone-directory-path"
                            />
                        ) : (
                            ''
                        )}
                        <span className="form__error ml-35">
                            {this.props.isError.checkoutPath && (
                                <>
                                    <img src={error} className="form__icon" /> {this.props.isError.checkoutPath}
                                </>
                            )}
                        </span>
                    </div>
                    <div className="pt-16 ">
                        <Checkbox
                            isChecked={this.props.material.fetchSubmodules}
                            value={'CHECKED'}
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
                                        content={'This will use credentials from default remote of parent repository.'}
                                    >
                                        <Question className="icon-dim-16 ml-4" />
                                    </Tippy>
                                </span>
                                <div className="fs-12 cn-7">
                                    Use this to pull submodules recursively while building the code
                                </div>
                            </div>
                        </Checkbox>
                    </div>
                </label>
                <div className="form__buttons">
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
                            <button
                                className="cta delete dc__m-auto ml-0"
                                type="button"
                                onClick={this.onClickDelete}
                                disabled={this.props.preventRepoDelete}
                                data-testid="git-repository-delete-button"
                            >
                                {this.state.deleting ? <Progressing /> : 'Delete'}
                            </button>
                        </ConditionalWrap>
                    )}
                    {this.props.isMultiGit ? (
                        <button
                            type="button"
                            className="cta cancel mr-16"
                            onClick={this.props.cancel}
                            data-testid="git-repository-cancel-button"
                        >
                            Cancel
                        </button>
                    ) : null}
                    <button
                        type="button"
                        className="cta"
                        disabled={this.props.isLoading}
                        onClick={this.props.save}
                        data-testid="git-repository-save-button"
                    >
                        {this.props.isLoading ? <Progressing /> : 'Save'}
                    </button>
                </div>
                {this.state.confirmation && (
                    <DeleteComponent
                        setDeleting={this.setDeleting}
                        deleteComponent={deleteMaterial}
                        payload={this.getMaterialPayload()}
                        title={this.props.material.name}
                        toggleConfirmation={this.toggleConfirmation}
                        component={DeleteComponentsName.GitRepo}
                        confirmationDialogDescription={
                            this.props.isMultiGit
                                ? DC_MATERIAL_VIEW__ISMULTI_CONFIRMATION_MESSAGE
                                : DC_MATERIAL_VIEW_ISSINGLE_CONFIRMATION_MESSAGE
                        }
                        reload={this.props.reload}
                    />
                )}
            </form>
        )
    }

    render() {
        return this.props.isCollapsed ? this.renderCollapsedView() : this.renderForm()
    }
}
