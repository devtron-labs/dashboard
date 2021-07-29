import React from 'react'
import { ReactComponent as BranchIcon } from '../../assets/icons/misc/branch.svg'
import { ReactComponent as PersonIcon } from '../../assets/icons/ic-person.svg';
import { ReactComponent as CalendarIcon } from '../../assets/icons/ic-calendar.svg';
import { ReactComponent as MessageIcon } from '../../assets/icons/ic-message.svg';
import { ReactComponent as CommitIcon } from '../../assets/icons/ic-commit.svg';

export function GitCommitInfo({ children, email, date, message }) {

    return <div className="p-12 bcn-0 br-4 mb-16 bw-1 en-2">
        {children}
        <GitCommitInfo.Author email={email} />
        <GitCommitInfo.Date date={date} />
        <GitCommitInfo.Message message={message} />
    </div>
};

function Author({ email }) {

    return <div className="flex left cn-7 fs-12 lh-1-5 mb-4">
        <PersonIcon className="icon-dim-16 mr-8" />
        {email}
    </div>
}

function Date({ date }) {

    return <div className="flex left cn-7 fs-12 lh-1-5 mb-4">
        <CalendarIcon className="icon-dim-16 mr-8" />
        {date}
    </div>
}

function Message({ message }) {

    return <div className="flex left mono cn-7 fs-12 lh-1-5">
        <MessageIcon className="icon-dim-16 mr-8" />{message}
    </div>
}

function Branch({ branch }) {

    return <span className="mono cn-7 fs-12 lh-1-5 br-4 bcn-1 mono pl-6 pr-6">
        <BranchIcon className="icon-dim-12 mr-8 vertical-align-middle" />{branch}
    </span>
}

function Commit({ commit, className = "" }) {

    return <span className="flex left mono lh-1-5 fs-12 fw-5 br-5 bcb-1 cb-5 pl-6 pr-6">
        <a href={"#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex left mr-4"
            onClick={(e) => e.stopPropagation()}>
            <CommitIcon className="icon-dim-16 mr-4" />
            {commit}
        </a>
    </span>
}

GitCommitInfo.Author = Author;
GitCommitInfo.Date = Date;
GitCommitInfo.Message = Message;
GitCommitInfo.Branch = Branch;
GitCommitInfo.Commit = Commit; 