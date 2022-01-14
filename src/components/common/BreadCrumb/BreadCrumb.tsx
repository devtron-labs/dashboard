import React, { useMemo, useEffect } from 'react'
import { useRouteMatch, useParams } from 'react-router'
import { Link } from 'react-router-dom';
import { useBreadcrumbContext } from './BreadcrumbStore'
import { ConditionalWrap } from '../helpers/Helpers';
export const BreadcrumbContext = React.createContext(null)


interface Breadcrumb {
    to: string;
    name: string;
    className?: string;
}

interface UseBreadcrumbState {
    breadcrumbs: Breadcrumb[];
    setCrumb: (props: { [key: string]: any; }) => void;
    resetCrumb: (props: string[]) => void;
}

interface AdvancedAlias {
    component: any;
    linked: boolean;
}

interface UseBreadcrumbProps {
    sep?: string;
    alias?: { [key: string]: AdvancedAlias | any; }
}

type UseBreadcrumbOptionalProps = UseBreadcrumbProps | null

export function useBreadcrumb(props?: UseBreadcrumbOptionalProps, deps?: any[]): UseBreadcrumbState {
    let sep = props?.sep || "/"
    deps = deps || []
    const { url, path } = useRouteMatch()
    const params = useParams()
    const { state, setState } = useBreadcrumbContext()

    useEffect(() => {
        if (!props || !props.alias) return
        setState(state => ({ ...state, alias: { ...state.alias, ...props.alias } }))
        return () => resetCrumb(Object.keys(props.alias))
    }, deps)

    function setCrumb(props) {
        setState(state => ({ ...state, alias: { ...state.alias, ...props } }))
    }

    function resetCrumb(props: string[]) {
        const tempAlias = props.reduce((agg, curr, idx) => {
            delete agg[curr]
            return agg
        }, state.alias)
        setState(state => ({ ...state, alias: tempAlias }))
    }

    let levels: Breadcrumb[] = useMemo(() => {
        const paths = path.split("/").filter(Boolean)
        const urls = url.split("/").filter(Boolean)
        return paths.map((path, idx) => {
            const crumb: Breadcrumb = { to: urls[idx], name: path }
            if (path.startsWith(":") && params[path.replace(":", "")]) {
                crumb.className = "param"
            }
            return crumb
        })
    }, [path, url])
    const { res: breadcrumbs } = useMemo(() => {
        return levels.reduce((agg, curr, idx) => {
            const { res, prefix } = agg
            const { to, name } = curr
            res.push({
                to:
                    !state.alias[name]?.component || (state.alias[name]?.component && state.alias[name]?.linked)
                        ? `${prefix}${to}`
                        : null,
                name: typeof state.alias[name] === 'object'
                    ? !!state.alias[name]?.component ? state.alias[name].component : null
                    : state.alias[name] || name,
                className: curr.className || '',
            });
            return { res, prefix: `${prefix}${curr.to}${sep}` }
        }, { res: [], prefix: "/" })
    }, [levels, state])

    return { breadcrumbs, setCrumb, resetCrumb }
}

interface Breadcrumbs {
    breadcrumbs: Breadcrumb[]
    sep?: string;
    className?: string;
};

export const BreadCrumb: React.FC<Breadcrumbs> = ({ breadcrumbs, sep = "/", className = "devtron-breadcrumb__item" }) => {
    const { url } = useRouteMatch()
    const filteredCrumbs = breadcrumbs.filter(crumb => !!crumb.name)
    return <React.Fragment>
        {filteredCrumbs.map((breadcrumb, idx) =>
            <React.Fragment key={idx}>
                <ConditionalWrap
                    condition={!!breadcrumb.to}
                    wrap={children => <Link className={`${url === breadcrumb.to ? 'active' : ''} ${className} ${breadcrumb.className || ""}`} to={breadcrumb.to}>
                        {children}
                    </Link>}
                >
                    {breadcrumb.name}
                </ConditionalWrap>

                {idx + 1 !== filteredCrumbs.length && breadcrumb.name && <span className={`${className}__separator cn-5`}>{sep}</span>}
            </React.Fragment>
        )}
    </React.Fragment>
}