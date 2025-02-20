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

import { Link } from 'react-router-dom'

import { CMSecretExternalType, InfoColourBar, CMSecretComponentType, Icon } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as InfoIcon } from '@Icons/info-filled.svg'
import { URLS } from '@Config/routes'
import { DOCUMENTATION } from '@Config/constants'

import { EXTERNAL_INFO_TEXT } from './constants'

export const renderESOInfo = (isESO: boolean) =>
    isESO ? (
        <InfoColourBar
            classname="info_bar"
            message={
                <p className="m-0 cn-9 fs-13 fw-4 lh-20">
                    <Link
                        to={`${URLS.CHARTS_DISCOVER}?appStoreName=external-secret`}
                        className="anchor"
                        target="_blank"
                    >
                        External Secrets Operator
                    </Link>
                    &nbsp;<span>should be installed in the target cluster.</span>&nbsp;
                    <a
                        className="anchor"
                        href={DOCUMENTATION.EXTERNAL_SECRET}
                        rel="noreferrer noopener"
                        target="_blank"
                    >
                        Learn more
                    </a>
                </p>
            }
            Icon={InfoIcon}
            iconSize={20}
        />
    ) : null

export const renderExternalInfo = (
    externalType: CMSecretExternalType,
    external: boolean,
    componentType: CMSecretComponentType,
    className?: string,
) =>
    externalType === CMSecretExternalType.KubernetesSecret ||
    (componentType === CMSecretComponentType.ConfigMap && external) ? (
        <InfoColourBar
            classname={`info_bar ${className || ''}`}
            message={
                <div className="flex column left">
                    <h4 className="m-0 lh-20 dc__info-title">{EXTERNAL_INFO_TEXT[componentType].title}</h4>
                    <p className="m-0 lh-20 dc__info-subtitle">{EXTERNAL_INFO_TEXT[componentType].infoText}</p>
                </div>
            }
            Icon={InfoIcon}
            iconSize={20}
        />
    ) : null

export const renderChartVersionBelow3090NotSupportedText = () => (
    <span className="fs-12 fw-4">
        <span className="cr-5">Supported for Chart Versions 3.10 and above.</span>&nbsp;
        <span className="cn-7">Learn more about</span>&nbsp;
        <a
            className="dc__link"
            href={DOCUMENTATION.APP_ROLLOUT_DEPLOYMENT_TEMPLATE}
            rel="noreferrer noopener"
            target="_blank"
        >
            Deployment Template &gt; Chart Version
        </a>
    </span>
)

export const renderYamlInfoText = () => (
    <p className="m-0 py-6 px-10 flex left dc__gap-6 fs-12 lh-20 cn-8 bg__secondary dc__border-top-n1 dc__bottom-radius-4">
        <Icon name="ic-info-filled" color={null} size={16} />
        <span>
            GUI Recommended for multi-line data. Boolean and numeric values must be wrapped in double quotes Eg.
            &quot;true&quot;, &quot;123&quot;
        </span>
    </p>
)

export const externalTypeSecretCodeEditorDataHeaders: Record<
    | Extract<
          CMSecretExternalType,
          | CMSecretExternalType.ESO_GoogleSecretsManager
          | CMSecretExternalType.ESO_AWSSecretsManager
          | CMSecretExternalType.ESO_AzureSecretsManager
          | CMSecretExternalType.ESO_HashiCorpVault
      >
    | 'default',
    JSX.Element
> = {
    [CMSecretExternalType.ESO_GoogleSecretsManager]: (
        <div>
            #Sample Data
            <br />
            #secretKey: Name of the secret
            <br />
            #key: GCP secret name
            <br />
            #secretAccessKeySecretRef.name: The secret name which would be used for authentication
            <br />
            #secretAccessKeySecretRef.key: Key name containing SA key
            <br />
            #projectID: GCP Project ID where secret is created
            <br />
        </div>
    ),
    [CMSecretExternalType.ESO_AWSSecretsManager]: (
        <div>
            #Sample Data <br />
            #accessKeyIDSecretRef.name: Name of secret created that would be used for authentication <br />
            #region: The region where Secret is created <br />
            #secretKey: Name of the secret created. <br />
            #key: AWS Secrets Manager secret name <br />
            #property: AWS Secrets Manager secret key <br />
        </div>
    ),
    [CMSecretExternalType.ESO_AzureSecretsManager]: (
        <div>
            #Sample Data <br />
            #tenantId: azure tenant ID <br />
            #vaultUrl: URL of your vault instance <br />
            #authSecretRef.name: Name of secret created that would be used for authentication <br />
            #secretKey: Name of the secret <br />
            #key: Azure Key vault secret name <br />
        </div>
    ),
    [CMSecretExternalType.ESO_HashiCorpVault]: (
        <div>
            #Sample Data <br />
            #vault.server: Server URL where vault is running <br />
            #vault.path: Path where secret is stored <br />
            #tokenSecretRef.name: The secret name which would be used for authentication <br />
            #tokenSecretRef.key: Key name containing token <br />
            #secretKey: Name of the secret <br />
            #key: Vault secret name <br />
            #property: Vault secret key <br />
        </div>
    ),
    default: (
        <div>
            # Sample Data
            <br /># key: Secret key in backend
            <br /># name: Name for this key in the generated secret
            <br /># property: Property to extract if secret in backend is a JSON object(optional)
            <br /># isBinary: Set this to true if configuring an item for a binary file stored(optional)
            <br />
        </div>
    ),
}
