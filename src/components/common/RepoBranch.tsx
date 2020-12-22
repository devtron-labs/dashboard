
import React,{useState} from 'react'
import { ReactComponent as Branch } from '../../assets/icons/misc/branch.svg'
import {createGitCommitUrl, not} from './index'
import moment from 'moment'
import { ReactComponent as PersonIcon } from '../../assets/icons/ic-person.svg';
import { ReactComponent as CalendarIcon } from '../../assets/icons/ic-calendar.svg';
import { ReactComponent as MessageIcon } from '../../assets/icons/ic-message.svg';
import { ReactComponent as CommitIcon } from '../../assets/icons/ic-commit.svg';
import { ReactComponent as DropDownIcon } from '../../assets/icons/appstatus/ic-dropdown.svg';
import {GitTriggers, CiMaterial} from '../app/details/cIDetails/types'
import { Moment12HourFormat } from '../../config';

function getGitIcon(repoUrl){
    for(let gitProvider of ['github', 'gitlab', 'bitbucket']){
        if(repoUrl.includes(gitProvider)){
            return `${gitProvider}`
        }
    }
    return 'git'
}

export function RepoBranch({repoUrl = "", branch = "", style = {}, ...props}){
    repoUrl = repoUrl.replace(".git", "")
    const tokens = repoUrl.split("/")
    const {length, [length - 1]: repo} = tokens
    return (
        <div {...props} style={{ display: 'grid', gridTemplateColumns: '20px 1fr', gridColumnGap: '18px', ...style, }}>
            <div className={getGitIcon(repoUrl)}>
            </div>
            <div className="flex column left">
                <div className="repo fs-12 cn-9 fw-6">
                    /{repo}
                </div>
                <div className="branch flex left fs-14 cn-7 mono">
                    <Branch className="icon-dim-12"/>{branch}
                </div>
            </div>
        </div>
    )
}

export const GitCommitDetailCard: React.FC<{ gitTrigger: GitTriggers; ciMaterial: CiMaterial }> = ({
    gitTrigger,
    ciMaterial,
}) => {
    const [changes, showChanges] = useState(false);
    return (
        <div className="flex column left">
            <div className="material-history__header">
                <a
                    href={createGitCommitUrl(ciMaterial?.url, gitTrigger?.Commit)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="commit-hash mono fs-14"
                    onClick={(e) => e.stopPropagation()}
                >
                    <CommitIcon className="icon-dim-16 mr-4" />
                    {gitTrigger?.Commit}
                </a>
            </div>
            <div className="fs-12 cn-7 flex mb-8 mt-12 ml-16">
                <PersonIcon className="mr-8" /> Author: {gitTrigger?.Author}
            </div>
            <div className="fs-12 cn-7 flex mb-12 ml-16">
                <CalendarIcon className="mr-8" /> Date: {moment(gitTrigger?.Date).format(Moment12HourFormat)}
            </div>
            <div className="flex left top mb-12 ml-16">
                <div className="icon-dim-16 mt-4">
                    <MessageIcon />
                </div>
                <div className="cn-7 mono fs-14 ml-16">{gitTrigger?.Message}</div>
            </div>
            {changes && (
                <div className="material-history__all-changes w-100 mono fs-14">
                    {gitTrigger?.Changes.map((change, index) => {
                        return <div key={index}>{change}</div>;
                    })}
                </div>
            )}
            {gitTrigger?.Changes?.length && (
                <div
                    className="pointer flex right pl-16 pr-16 fs-12 fw-6 cn-7 w-100"
                    style={{ height: '36px', borderTop: '1px solid var(--N200)' }}
                    onClick={(e) => showChanges(not)}
                >
                    {changes ? 'Hide changes' : 'Show changes'}
                    <DropDownIcon className="rotate" style={{ ['--rotateBy' as any]: changes ? '180deg' : '0deg' }} />
                </div>
            )}
        </div>
    );
};