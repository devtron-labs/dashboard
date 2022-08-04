import React, { Component } from 'react';
import ErrorImage from '../../../../assets/img/ic-empty-error@2x.png';
import EmptyStateImage from '../../../../assets/img/app-not-deployed.png';
import EmptyState from '../../../EmptyState/EmptyState';
import NoResults from '../../../../assets/img/empty-noresult@2x.png'

interface EmptyStateCIMaterialProps {
  isRepoError: boolean;
  isBranchError: boolean;
  gitMaterialName: string;
  sourceValue: string;
  repoUrl: string;
  branchErrorMsg: string;
  repoErrorMsg: string;
  isMaterialLoading: boolean;
  onRetry: (...args) => void;
  anyCommit: boolean;
  isWebHook?: boolean;
  noSearchResults?: boolean
  noSearchResultsMsg?: string
  toggleWebHookModal?: () => void;
  clearSearch?: () => void
}

export class EmptyStateCIMaterial extends Component<EmptyStateCIMaterialProps> {

  getData(): { img, title, subtitle, cta } {
    if (this.props.isRepoError) {
      return {
        img: <img src={ErrorImage} alt="no commits found" className="empty-state__img--ci-material" />,
        title: <h1 className="empty__title">{this.props.repoErrorMsg}</h1>,
        subtitle: <a href={`${this.props.repoUrl}`} rel="noopener noreferrer" target="_blank" className="">{this.props.repoUrl}</a>,
        cta: null
      }
    }
    else if (this.props.isBranchError) {
      return {
        img: <img src={ErrorImage} alt="no commits found" className="empty-state__img--ci-material" />,
        title: <h1 className="empty__title">{this.props.branchErrorMsg}</h1>,
        subtitle: <a href={this.props.repoUrl} rel="noopener noreferrer" target="_blank" className="">{this.props.repoUrl}</a>,
        cta: null,
      }
    }
    else if (this.props.noSearchResults)  {
      return {
        img: <img src={NoResults} alt="no commits found" className="empty-state__img--ci-material" />,
        title: <h1 className="empty__title" style={{wordBreak: 'break-all'}}>{this.props.noSearchResultsMsg}</h1>,
        subtitle: `Please check the commit hash and try again. Make sure you enter the complete commit hash.`,
        cta: <button type="button" className="cta ghosted small" onClick={this.props.clearSearch}>Clear search</button>,
      }
    }
    else if (!this.props.anyCommit) {
      return {
        img: <img src={EmptyStateImage} alt="no commits found" className="empty-state__img--ci-material" />,
        title: <h1 className="empty__title">No material found</h1>,
        subtitle: `We could not find any matching data for provided configurations`,
        cta: null,
      }
    }
    else {
      return {
        img: <img src={ErrorImage} alt="no commits found" className="empty-state__img--ci-material" />,
        title: <h1 className="empty__title">Failed to fetch</h1>,
        subtitle: `Sorry! We could not fetch available materials. Please try again.`,
        cta: <button type="button" className="cta ghosted small" onClick={this.props.onRetry}>Retry</button>,
      }
    }
  }

  render() {
    let { title, subtitle, img, cta } = this.getData();
    if (this.props.isMaterialLoading) {
      return <EmptyState>
        <EmptyState.Loading text={"Fetching repository. This might take few minutes"} />
      </EmptyState>
    }
    else {
      return (
          <EmptyState>
              <EmptyState.Image>{img}</EmptyState.Image>
              <EmptyState.Title>{title}</EmptyState.Title>
              <EmptyState.Subtitle className="mb-0">{subtitle}</EmptyState.Subtitle>
              <EmptyState.Button>{cta}</EmptyState.Button>
              {this.props.isWebHook && (
                  <EmptyState.Button>
                      <span className="learn-more__href cursor" onClick={this.props.toggleWebHookModal}>
                          View all incoming webhook payloads
                      </span>
                  </EmptyState.Button>
              )}
          </EmptyState>
      )
    }
  }
}