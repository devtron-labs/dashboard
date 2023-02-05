import React,{ useState } from 'react'
import { useHistory, useRouteMatch, useParams } from 'react-router'
import { List } from '../common'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'
import { DockerForm } from './DockerForm'

export function CollapsedList({
    id = '',
    pluginId = null,
    registryUrl = '',
    registryType = '',
    awsAccessKeyId = '',
    awsSecretAccessKey = '',
    awsRegion = '',
    isDefault = false,
    active = true,
    username = '',
    password = '',
    reload,
    connection = '',
    cert = '',
    ipsConfig = {
        id: 0,
        credentialType: '',
        credentialValue: '',
        appliedClusterIdsCsv: '',
        ignoredClusterIdsCsv: '',
    },
    clusterOption,
    ...rest
}) {
    const [collapsed, toggleCollapse] = useState(true)
    const history = useHistory()
    const { path } = useRouteMatch()
    const params = useParams<{ id: string }>()

    const setToggleCollapse = () => {
        if (id === null && params.id !== '0') {
            history.push(`${path.replace(':id', '0')}`)
        } else if (id && params.id !== id) {
            history.push(`${path.replace(':id', id)}`)
        } else {
            history.push(`${path.replace('/:id', '')}`)
        }
    }

    return (
        <article className={`collapsed-list collapsed-list--docker collapsed-list--${id ? 'update' : 'create dashed'}`}>
            <List onClick={setToggleCollapse} className={`${!id && !collapsed ? 'no-grid-column' : ''}`}>
                {id && (
                    <List.Logo>
                        <div className={'dc__registry-icon ' + registryType}></div>
                    </List.Logo>
                )}
                {!id && collapsed && (
                    <List.Logo>
                        <Add className="icon-dim-24 fcb-5 dc__vertical-align-middle" />
                    </List.Logo>
                )}

                <div className="flex left">
                    <List.Title
                        style={{ color: !id && !collapsed ? 'var(--N900)' : '' }}
                        title={id || 'Add Container Registry'}
                        subtitle={registryUrl}
                        tag={isDefault ? 'DEFAULT' : ''}
                    />
                </div>
                {id && (
                    <List.DropDown
                        onClick={setToggleCollapse}
                        className="rotate"
                        style={{ ['--rotateBy' as any]: `${Number(!collapsed) * 180}deg` }}
                    />
                )}
            </List>
            {(params.id === id || (!id && params.id === '0')) && (
                <DockerForm
                    {...{
                        id,
                        pluginId,
                        registryUrl,
                        registryType,
                        awsAccessKeyId,
                        awsSecretAccessKey,
                        awsRegion,
                        isDefault,
                        active,
                        username,
                        password,
                        reload,
                        toggleCollapse,
                        connection,
                        cert,
                        ipsConfig,
                        clusterOption,
                        setToggleCollapse,
                    }}
                />
            )}
        </article>
    )
}
