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

import React, { useMemo, useEffect } from 'react'
import { Link, useRouteMatch, useParams } from 'react-router-dom'
import { useBreadcrumbContext } from './BreadcrumbStore'
import { ConditionalWrap } from '../Helper'
import { Breadcrumb, Breadcrumbs, UseBreadcrumbOptionalProps, UseBreadcrumbState } from './Types'

export const BreadcrumbContext = React.createContext(null)

export function useBreadcrumb(props?: UseBreadcrumbOptionalProps, deps?: any[]): UseBreadcrumbState {
    const sep = props?.sep || '/'
    deps = deps || []
    const { url, path } = useRouteMatch()
    const params = useParams()
    const { state, setState } = useBreadcrumbContext()

    useEffect(() => {
        if (!props || !props.alias) return
        setState((state) => ({ ...state, alias: { ...state.alias, ...props.alias } }))
        return () => resetCrumb(Object.keys(props.alias))
    }, deps)

    function setCrumb(props) {
        setState((state) => ({ ...state, alias: { ...state.alias, ...props } }))
    }

    function resetCrumb(props: string[]) {
        const tempAlias = props.reduce((agg, curr, idx) => {
            delete agg[curr]
            return agg
        }, state.alias)
        setState((state) => ({ ...state, alias: tempAlias }))
    }

    const levels: Breadcrumb[] = useMemo(() => {
        const paths = path.split('/').filter(Boolean)
        const urls = url.split('/').filter(Boolean)
        return paths.map((path, idx) => {
            const crumb: Breadcrumb = { to: urls[idx], name: path }
            if (path.startsWith(':') && params[path.replace(':', '')]) {
                crumb.className = 'param'
            }
            return crumb
        })
    }, [path, url])
    const { res: breadcrumbs } = useMemo(
        () =>
            levels.reduce(
                (agg, curr, idx) => {
                    const { res, prefix } = agg
                    const { to, name } = curr
                    res.push({
                        to:
                            !state.alias[name]?.component || (state.alias[name]?.component && state.alias[name]?.linked)
                                ? `${prefix}${to}`
                                : null,
                        name:
                            typeof state.alias[name] === 'object'
                                ? state.alias[name]?.component
                                    ? state.alias[name].component
                                    : null
                                : state.alias[name] || name,
                        className: curr.className || '',
                    })
                    return { res, prefix: `${prefix}${curr.to}${sep}` }
                },
                { res: [], prefix: '/' },
            ),
        [levels, state],
    )

    return { breadcrumbs, setCrumb, resetCrumb }
}

export const BreadCrumb: React.FC<Breadcrumbs> = ({
    breadcrumbs,
    sep = '/',
    className = 'dc__devtron-breadcrumb__item',
}) => {
    const { url } = useRouteMatch()
    const filteredCrumbs = breadcrumbs.filter((crumb) => !!crumb.name)
    return (
        <>
            {filteredCrumbs.map((breadcrumb, idx) => (
                <React.Fragment key={idx}>
                    <ConditionalWrap
                        condition={!!breadcrumb.to}
                        wrap={(children) => (
                            <Link
                                className={`${url === breadcrumb.to ? 'active' : ''} ${className} ${
                                    breadcrumb.className || ''
                                }`}
                                to={breadcrumb.to}
                            >
                                {children}
                            </Link>
                        )}
                    >
                        {breadcrumb.name}
                    </ConditionalWrap>

                    {idx + 1 !== filteredCrumbs.length && breadcrumb.name && (
                        <span className={`${className}__separator cn-5`}>{sep}</span>
                    )}
                </React.Fragment>
            ))}
        </>
    )
}
