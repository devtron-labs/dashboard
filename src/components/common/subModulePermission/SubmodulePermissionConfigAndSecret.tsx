import React from 'react'
import { CustomInput, Checkbox, CHECKBOX_VALUE } from '../../common'

function SubmodulePermissionConfigAndSecret({
    selectedTab,
    volumeMountPath,
    setVolumeMountPath,
    isExternalValues,
    isSubPathChecked,
    setIsSubPathChecked,
    isChartVersion309OrBelow,
    isFilePermissionChecked,
    setIsFilePermissionChecked,
}) {
    return (
        <div>
            {' '}
            {selectedTab === 'Data Volume' ? (
                <div className="form__row flex">
                    <CustomInput
                        value={volumeMountPath.value}
                        autoComplete="off"
                        tabIndex={5}
                        label={'Volume mount path*'}
                        placeholder={'Enter mount path'}
                        helperText={'keys are mounted as files to volume'}
                        error={volumeMountPath.error}
                        onChange={(e) => setVolumeMountPath({ value: e.target.value, error: '' })}
                    />
                </div>
            ) : null}
            {isExternalValues && selectedTab === 'Data Volume' ? (
                <div className="mb-16">
                    <Checkbox
                        isChecked={isSubPathChecked}
                        onClick={(e) => {
                            e.stopPropagation()
                        }}
                        rootClassName=""
                        // disabled={isChartVersion309OrBelow}
                        value={CHECKBOX_VALUE.CHECKED}
                        onChange={(e) => setIsSubPathChecked(!isSubPathChecked)}
                    >
                        <span className="mr-5">
                            Set SubPath (same as
                            <a
                                href="https://kubernetes.io/docs/concepts/storage/volumes/#using-subpath"
                                className="ml-5 mr-5 anchor"
                                target="_blank"
                                rel="noopener noreferer"
                            >
                                subPath
                            </a>
                            for volume mount)<br></br>
                            {isSubPathChecked ? (
                                <span className="mb-0 cn-5 fs-11">Keys will be used as filename for subpath</span>
                            ) : null}
                            {isChartVersion309OrBelow ? (
                                <span className="fs-12 fw-5">
                                    <span className="cr-5">Supported for Chart Versions 3.10 and above.</span>
                                    <span className="cn-7 ml-5">Learn more about </span>
                                    <a
                                        href="https://docs.devtron.ai/user-guide/creating-application/deployment-template"
                                        rel="noreferrer noopener"
                                        target="_blank"
                                    >
                                        Deployment Template &gt; Chart Version
                                    </a>
                                </span>
                            ) : null}
                        </span>
                    </Checkbox>
                </div>
            ) : (
                ''
            )}
            {selectedTab === 'Data Volume' ? (
                <div className="mb-16">
                    <Checkbox
                        isChecked={isFilePermissionChecked}
                        onClick={(e) => {
                            e.stopPropagation()
                        }}
                        rootClassName=""
                        value={CHECKBOX_VALUE.CHECKED}
                        disabled={isChartVersion309OrBelow}
                        onChange={(e) => setIsFilePermissionChecked(!isFilePermissionChecked)}
                    >
                        <span className="mr-5">
                            {' '}
                            Set File Permission (same as
                            <a
                                href="https://kubernetes.io/docs/concepts/configuration/secret/#secret-files-permissions"
                                className="ml-5 mr-5 anchor"
                                target="_blank"
                                rel="noopener noreferer"
                            >
                                defaultMode
                            </a>
                            for secrets in kubernetes)<br></br>
                            {isChartVersion309OrBelow ? (
                                <span className="fs-12 fw-5">
                                    <span className="cr-5">Supported for Chart Versions 3.10 and above.</span>
                                    <span className="cn-7 ml-5">Learn more about </span>
                                    <a
                                        href="https://docs.devtron.ai/user-guide/creating-application/deployment-template"
                                        rel="noreferrer noopener"
                                        target="_blank"
                                    >
                                        Deployment Template &gt; Chart Version
                                    </a>
                                </span>
                            ) : null}
                        </span>
                    </Checkbox>
                </div>
            ) : (
                ''
            )}
        </div>
    )
}

export default SubmodulePermissionConfigAndSecret
