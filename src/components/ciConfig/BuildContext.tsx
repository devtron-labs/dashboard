import React from "react";
import {TippyCustomized, TippyTheme} from "@devtron-labs/devtron-fe-common-lib";
import {USING_ROOT} from "./CIConfig.utils";
import {BuildContextProps} from "./types";
import { ReactComponent as QuestionFilled } from '../../assets/icons/ic-help.svg'
import { ReactComponent as Question } from '../../assets/icons/ic-help-outline.svg'

export default function BuildContext ({
    disable,
    setDisable,
    formState,
    configOverrideView,
    allowOverride,
    ciConfig,
    handleOnChangeConfig
} : BuildContextProps) {
    const getBuildContextAdditionalContent = ()=>{
        return (
            <div className="p-12 fs-13">
                {'To build all files from the root, use (.) as the build context, or set build context by referring a subdirectory path such as '}
                <span className= "build-context-highlight">{'/myfolder'}</span>
                {' or '}
                <span className= "build-context-highlight">{'/myfolder/buildhere'}</span>
                {' or URL such as '}
                <span className= "build-context-highlight">{'https://github.com/devtron-labs/ devtron.git'}</span>
            </div>
        )
    }
    const renderInfoCard = (): JSX.Element => {
        return (
            <TippyCustomized
                theme={TippyTheme.white}
                className="w-300 h-100 fcv-5"
                placement="right"
                Icon={QuestionFilled}
                heading={'Docker build context'}
                infoText='Specify the set of files to be built by referring to a specific subdirectory, relative to the root of your repository.'
                showCloseButton={true}
                trigger="click"
                interactive={true}
                documentationLinkText="View Documentation"
                additionalContent = {getBuildContextAdditionalContent()}
            >
                <div className="icon-dim-16 fcn-9 ml-8 cursor">
                    <Question />
                </div>
            </TippyCustomized>
        )
    }
    return (
        <div className="docker-file-container">

            <div className="flex left row ml-0 build-context-label mb-6">
                <span className="dc__required-field">Build context</span>
                {!configOverrideView || allowOverride ? (
                    <div className="flex row ml-0">
                        {renderInfoCard()}
                        <span
                            className="cursor cb-5 fcb-5 ml-8"
                            onClick={() => setDisable(!disable)}
                        >
                            {disable ? ' Set build context ' : ' Use root(.) '}
                        </span>
                    </div>
                ) : null}
            </div>

            <div className="w-100">
                {configOverrideView && !allowOverride ? (
                    <span className="fs-14 fw-4 lh-20 cn-9">
                        {ciConfig?.ciBuildConfig?.dockerBuildConfig?.buildContext === '.'
                            ? USING_ROOT
                            : ciConfig?.ciBuildConfig?.dockerBuildConfig?.buildContext}
                    </span>
                ) : (
                    <input
                        tabIndex={4}
                        type="text"
                        className="form__input h-36 w-100"
                        placeholder="Enter URL or path"
                        name="buildContext"
                        value={
                            configOverrideView && !allowOverride
                                ? ciConfig?.ciBuildConfig?.dockerBuildConfig?.buildContext || USING_ROOT
                                : disable
                                    ? USING_ROOT
                                    : formState.buildContext.value === USING_ROOT ? '.' : formState.buildContext.value
                        }
                        onChange={handleOnChangeConfig}
                        autoComplete={'off'}
                        autoFocus={!configOverrideView}
                        disabled={(configOverrideView && !allowOverride) || disable}
                    />
                )}
                {(configOverrideView ? allowOverride && !disable : !disable) && formState.buildContext.error && (
                    <label className="form__error">{formState.buildContext.error}</label>
                )}
            </div>
        </div>
    )
}