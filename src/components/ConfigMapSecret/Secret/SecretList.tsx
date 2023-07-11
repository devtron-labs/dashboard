import React, { useState, useEffect, useRef } from 'react'
import {
    RadioGroup,
    Info,
    ToastBody,
    CustomInput,
    isVersionLessThanOrEqualToTarget,
    isChartRef3090OrBelow,
} from '../../common'
import {
    showError,
    Progressing,
    DeleteDialog,
    Checkbox,
    CHECKBOX_VALUE,
    InfoColourBar,
    not,
} from '@devtron-labs/devtron-fe-common-lib'
import ReactSelect from 'react-select'
import { useParams } from 'react-router'
import { updateSecret, deleteSecret, getSecretKeys } from '../../secrets/service'
import { getAppChartRef } from '../../../services/service'
import {
    overRideSecret,
    deleteSecret as deleteEnvironmentSecret,
    unlockEnvSecret,
} from '../../EnvironmentOverride/service'
import { toast } from 'react-toastify'
import { KeyValueInput, useKeyValueYaml, validateKeyValuePair } from '../../configMaps/ConfigMap'
import { getSecretList } from '../../../services/service'
import CodeEditor from '../../CodeEditor/CodeEditor'
import { DOCUMENTATION, MODES, PATTERNS, ROLLOUT_DEPLOYMENT, URLS } from '../../../config'
import YAML from 'yaml'
import { ReactComponent as KeyIcon } from '../../../assets/icons/ic-key.svg'
import addIcon from '../../../assets/icons/ic-add.svg'
import arrowTriangle from '../../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as Trash } from '../../../assets/icons/ic-delete.svg'
import { ReactComponent as InfoIcon } from '../../../assets/icons/info-filled.svg'
import { KeyValueFileInput } from '../../util/KeyValueFileInput'
import '../ConfigMap.scss'
import { decode } from '../../../util/Util'
import {
    dataHeaders,
    getTypeGroups,
    GroupHeading,
    groupStyle,
    sampleJSONs,
    SecretOptions,
    hasHashiOrAWS,
    hasESO,
    CODE_EDITOR_RADIO_STATE,
    DATA_HEADER_MAP,
    CODE_EDITOR_RADIO_STATE_VALUE,
    VIEW_MODE,
    secretValidationInfoToast,
    handleSecretDataYamlChange,
} from './secret.utils'
import { EsoData, SecretFormProps } from '../../deploymentConfig/types'
import { NavLink } from 'react-router-dom'
import { INVALID_YAML_MSG } from '../../../config/constantMessaging'
import { ConfigMapSecretContainer, ListComponent, Tab } from '../ConfigMapSecret.components'
import InfoIconWithTippy from '../InfoIconWithTippy'

export default function SecretList() {
    const [appChartRef, setAppChartRef] = useState<{ id: number; version: string; name: string }>()
    const [list, setList] = useState(null)
    const [secretLoading, setSecretLoading] = useState(true)

    useEffect(() => {
        init()
    }, [])
    const { appId } = useParams<{ appId }>()

    async function init() {
        try {
            const appChartRefRes = await getAppChartRef(appId)
            const { result } = await getSecretList(appId)
            if (Array.isArray(result.configData)) {
                result.configData = result.configData.map((config) => {
                    if (config.data) {
                        config.data = decode(config.data) //doesnt do anything because data.value will be empty
                    }
                    return config
                })
            }
            setAppChartRef(appChartRefRes.result)
            setList(result)
        } catch (err) {
            showError(err)
        } finally {
            setSecretLoading(false)
        }
    }

    function update(index, result) {
        try {
            setList((list) => {
                let configData = list.configData
                if (result === null) {
                    //delete
                    configData.splice(index, 1)
                    list.configData = [...configData]
                    return { ...list }
                } else if (typeof index !== 'number' && Array.isArray(result.configData)) {
                    //insert after create success
                    configData.unshift({
                        ...result.configData[0],
                        data:
                            result.configData[0].externalType === ''
                                ? decode(result.configData[0].data)
                                : result.configData[0].data,
                    })
                    list.configData = [...configData]
                    return { ...list }
                } else {
                    //unlock
                    configData[index] =
                        result && Array.isArray(result.configData) && result.configData.length > 0
                            ? result.configData[0]
                            : null
                    list.configData[index] = {
                        ...list.configData[index],
                        data:
                            result.configData[0].externalType === ''
                                ? decode(result.configData[0].data)
                                : result.configData[0].data,
                    }
                    return { ...list }
                }
            })
        } catch (err) {}
    }

    if (secretLoading) return <Progressing pageLoader />
    return (
        <div className="form__app-compose">
            <h1 className="form__title form__title--artifacts flex left">
                Secrets
                <InfoIconWithTippy
                    infoText="A Secret is an object that contains sensitive data such as passwords, OAuth tokens, and SSH keys."
                    documentationLink={DOCUMENTATION.APP_CREATE_SECRET}
                />
            </h1>
            <ConfigMapSecretContainer
                key="Add Secret"
                componentType="secret"
                title="Add Secret"
                appChartRef={appChartRef}
                appId={appId}
                id={list?.id ?? 0}
                update={update}
            />
            {list?.configData?.map((cs, idx) => (
                <ConfigMapSecretContainer
                    key={cs.name}
                    componentType="secret"
                    title={cs.name}
                    data={cs}
                    appChartRef={appChartRef}
                    appId={appId}
                    id={list.id}
                    update={update}
                    index={idx}
                />
            ))}
        </div>
    )
}
