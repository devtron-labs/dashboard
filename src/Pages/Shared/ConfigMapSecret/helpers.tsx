import { NavLink } from 'react-router-dom'

import { InfoColourBar } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as InfoIcon } from '@Icons/info-filled.svg'
import { URLS } from '@Config/routes'
import { DOCUMENTATION } from '@Config/constants'

import { EXTERNAL_INFO_TEXT } from './constants'
import { CMSecretComponentType, CMSecretExternalType } from './types'

export const renderESOInfo = (isESO: boolean) =>
    isESO ? (
        <InfoColourBar
            classname="info_bar cn-9 lh-20"
            message={
                <div className="fs-13 fw-4 lh-18">
                    <NavLink
                        to={`${URLS.CHARTS_DISCOVER}?appStoreName=external-secret`}
                        className="dc__link"
                        target="_blank"
                    >
                        External Secrets Operator
                    </NavLink>
                    &nbsp;should be installed in the target cluster.&nbsp;
                    <a
                        className="dc__link"
                        href={DOCUMENTATION.EXTERNAL_SECRET}
                        rel="noreferrer noopener"
                        target="_blank"
                    >
                        Learn more
                    </a>
                </div>
            }
            Icon={InfoIcon}
            iconSize={20}
        />
    ) : null

export const renderExternalInfo = (renderCondition: boolean, componentType: CMSecretComponentType) =>
    renderCondition ? (
        <InfoColourBar
            classname="info_bar cn-9 lh-20"
            message={
                <div className="flex column left">
                    <div className="dc__info-title">{EXTERNAL_INFO_TEXT[componentType].title}</div>
                    <div className="dc__info-subtitle">{EXTERNAL_INFO_TEXT[componentType].infoText}</div>
                </div>
            }
            Icon={InfoIcon}
            iconSize={20}
        />
    ) : null

export const renderYamlInfoText = () => (
    <p className="m-0 py-6 px-10 flex left dc__gap-6 fs-12 lh-20 cn-8 bcn-50 dc__border-top-n1">
        <InfoIcon className="icon-dim-16" />
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
