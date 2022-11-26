/**
 * This file provides the paths to the pages
 */
import {getWindowUrl} from './utils';


export const CREATE_ELECTION = '/admin/new/';
export const BALLOT = '/ballot/';
export const VOTE = '/vote/';
export const RESULTS = '/result/';

export const getUrlVote = (electionId: string | number, token?: string): URL => {
  const origin = getWindowUrl();
  if (token)
    return new URL(`/${VOTE}/${electionId}/${token}`, origin);
  return new URL(`/${VOTE}/${electionId}`, origin);
}

export const getUrlResults = (electionId: string | number): URL => {
  const origin = getWindowUrl();
  return new URL(`/${RESULTS}/${electionId}`, origin);
}

export const getUrlAdmin = (electionId: string | number, adminToken: string): URL => {
  const origin = getWindowUrl();
  return new URL(`/admin/${electionId}?t=${adminToken}`, origin);
}
