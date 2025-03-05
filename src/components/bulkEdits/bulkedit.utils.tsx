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

import { CMandSecretImpactedObjects, DtOutputKeys, OutputTabType, CMandSecretOutputKeys } from './bulkEdits.type'
import { OutputDivider } from './constants'

export const OutputTabs: React.FC<OutputTabType> = ({ handleOutputTabs, outputName, value, name }) => {
    return (
        <label className="dc__tertiary-tab__radio flex fs-13">
            <input type="radio" name="status" checked={outputName === value} value={value} onClick={handleOutputTabs} />
            <div className="tertiary-output-tab cursor mr-12 pb-6" data-testid={`${name}-link`}>
                {name}
            </div>
        </label>
    )
}

const renderCmAndSecretResponseForOneApp = (CMandSecretOutputKeys: CMandSecretOutputKeys) => {
    return (
        <div>
            App Id: {CMandSecretOutputKeys.appId} <br />
            App Name: {CMandSecretOutputKeys.appName} <br />
            Environment Id: {CMandSecretOutputKeys.envId} <br />
            Names : {CMandSecretOutputKeys.names.join(', ')} <br />
            Message: {CMandSecretOutputKeys.message} <br />
            <br />
        </div>
    )
}

export const renderConfigMapOutput = (configMap) => {
    return (
        <div>
            <div>
                *CONFIGMAPS: <br />
                <br />
            </div>
            <div>
                #Message: <br />
                <br />
                {configMap?.message?.map((elm) => {
                    return (
                        <>
                            {elm}
                            <br />
                        </>
                    )
                })}
            </div>
            --------------------------
            <br />
            <div>
                #Failed Operations:
                <br />
                <br />
                {configMap?.failure == null ? (
                    <>No Result Found</>
                ) : (
                    <>
                        {configMap?.failure.map((elm) => {
                            return renderCmAndSecretResponseForOneApp(elm)
                        })}
                    </>
                )}
            </div>
            --------------------------
            <br />
            <div>
                #Successful Operations: <br />
                <br />
                {configMap?.successful == null ? (
                    <>No Result Found</>
                ) : (
                    <>
                        {configMap?.successful.map((elm) => {
                            return renderCmAndSecretResponseForOneApp(elm)
                        })}
                    </>
                )}
            </div>
            {OutputDivider}
        </div>
    )
}

export const renderDTResponseForOneApp = (DTOutputKeys: DtOutputKeys) => {
    return (
        <div>
            App Id: {DTOutputKeys.appId} <br />
            App Name: {DTOutputKeys.appName} <br />
            Environment Id: {DTOutputKeys.envId} <br />
            Message: {DTOutputKeys.message} <br />
            <br />
        </div>
    )
}

export const renderCMAndSecretImpObj = (CMandSecretImpactedObject: CMandSecretImpactedObjects) => {
    return (
        <div>
            App Id: {CMandSecretImpactedObject.appId} <br />
            App Name: {CMandSecretImpactedObject.appName} <br />
            Environment Id: {CMandSecretImpactedObject.envId} <br />
            Names : {CMandSecretImpactedObject.names.join(', ')} <br />
            <br />
        </div>
    )
}

export const renderDeploymentTemplateOutput = (deploymentTemplate) => {
    return (
        <div>
            <div>
                *DEPLOYMENT TEMPLATE: <br />
                <br />
            </div>
            <div>
                #Message: <br />
                <br />
                {deploymentTemplate?.message?.map((elm) => {
                    return (
                        <div>
                            {elm}
                            <br />
                        </div>
                    )
                })}
            </div>
            --------------------------
            <br />
            <div>
                #Failed Operations:
                <br />
                <br />
                {deploymentTemplate?.failure === null ? (
                    <>No Result Found</>
                ) : (
                    <>
                        {deploymentTemplate?.failure.map((elm) => {
                            return renderDTResponseForOneApp(elm)
                        })}
                    </>
                )}
                <br />
            </div>
            --------------------------
            <br />
            <div>
                #Successful Operations: <br />
                <br />
                {deploymentTemplate?.successful == null ? (
                    <>No Result Found</>
                ) : (
                    <>
                        {deploymentTemplate?.successful.map((elm) => {
                            return renderDTResponseForOneApp(elm)
                        })}
                    </>
                )}
            </div>
            {OutputDivider}
        </div>
    )
}

export const renderSecretOutput = (secret) => {
    return (
        <div>
            <div>
                *SECRETS: <br />
                <br />
            </div>
            <div>
                #Message: <br />
                <br />
                {secret?.message?.map((elm) => {
                    return (
                        <>
                            {elm}
                            <br />
                        </>
                    )
                })}
            </div>
            --------------------------
            <br />
            <div>
                #Failed Operations:
                <br />
                <br />
                {secret?.failure == null ? (
                    <>No Result Found</>
                ) : (
                    <>
                        {secret?.failure.map((elm) => {
                            return renderCmAndSecretResponseForOneApp(elm)
                        })}
                    </>
                )}
                <br />
            </div>
            --------------------------
            <br />
            <div>
                #Successful Operations: <br />
                <br />
                {secret?.successful == null ? (
                    <>No Result Found</>
                ) : (
                    <>
                        {secret?.successful.map((elm) => {
                            return renderCmAndSecretResponseForOneApp(elm)
                        })}
                    </>
                )}
            </div>
            {OutputDivider}
        </div>
    )
}
