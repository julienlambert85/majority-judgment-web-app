import { Candidate, Grade, Vote } from './type';
import { URL_SERVER } from './constants';

export const api = {
  routesServer: {
    setElection: 'elections',
    getElection: 'elections/:slug',
    getResults: 'results/:slug',
    voteElection: 'ballots',
  },
};

export interface GradePayload {
  name: string;
  description: string;
  id: number;
  value: number;
}

export interface CandidatePayload {
  name: string;
  description: string;
  id: number;
  image: string;
}

export interface ErrorMessage {
  loc: Array<string>;
  msg: string;
  type: string;
  ctx: any;
}

export interface ErrorPayload {
  detail: Array<ErrorMessage>;
}

export interface HTTPPayload {
  status: number;
  msg: string;
}

export interface ElectionPayload {
  name: string;
  description: string;
  ref: string;
  date_start: string;
  date_end: string;
  hide_results: boolean;
  force_close: boolean;
  restricted: boolean;
  grades: Array<GradePayload>;
  candidates: Array<CandidatePayload>;
}

export interface ElectionCreatedPayload extends ElectionPayload {
  invites: Array<string>;
  admin: string;
  num_voters: number;
}

export interface ElectionUpdatedPayload extends ElectionPayload {
  invites: Array<string>;
  num_voters: number;
  status?: number;
}

export interface ResultsPayload extends ElectionPayload {
  status: number;
  ranking: { [key: string]: number };
  merit_profile: { [key: number]: Array<number> };
}

export interface VotePayload {
  id: string;
  candidate: CandidatePayload;
  grade: GradePayload;
}

export interface BallotPayload {
  votes: Array<VotePayload>;
  election: ElectionPayload;
  token: string;
}

export const createElection = async (
  name: string,
  candidates: Array<Candidate>,
  grades: Array<Grade>,
  description: string,
  numVoters: number,
  hideResults: boolean,
  forceClose: boolean,
  restricted: boolean,
  randomOrder: boolean,
  successCallback: Function = null,
  failureCallback: Function = console.log
) => {
  /**
   * Create an election from its title, its candidates and a bunch of options
   */
  const endpoint = new URL(api.routesServer.setElection, URL_SERVER);

  if (!restricted && numVoters > 0) {
    throw Error('Set the election as not restricted!');
  }

  try {
    const req = await fetch(endpoint.href, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description: JSON.stringify({
          description: description,
          randomOrder: randomOrder,
        }),
        candidates,
        grades,
        num_voters: numVoters,
        hide_results: hideResults,
        force_close: forceClose,
        restricted,
      }),
    });
    if (req.ok && req.status === 200) {
      if (successCallback) {
        const payload = await req.json();
        successCallback(payload);
        return payload;
      }
    } else if (failureCallback) {
      try {
        const payload = await req.json();
        failureCallback(payload);
      } catch (e) {
        failureCallback(req.statusText);
      }
    }
  } catch (e) {
    return failureCallback && failureCallback(e);
  }
};

export const updateElection = async (
  ref: string,
  name: string,
  candidates: Array<Candidate>,
  grades: Array<Grade>,
  description: string,
  numVoters: number,
  hideResults: boolean,
  forceClose: boolean,
  restricted: boolean,
  randomOrder: boolean,
  token: string
): Promise<ElectionUpdatedPayload | HTTPPayload> => {
  /**
   * Create an election from its title, its candidates and a bunch of options
   */
  const endpoint = new URL(api.routesServer.setElection, URL_SERVER);

  try {
    const req = await fetch(endpoint.href, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ref,
        name,
        description: JSON.stringify({
          description: description,
          randomOrder: randomOrder,
        }),
        candidates,
        grades,
        num_voters: numVoters,
        hide_results: hideResults,
        force_close: forceClose,
        restricted,
      }),
    });
    if (!req.ok || req.status !== 200) {
      const payload = await req.json();
      return { status: req.status, msg: payload };
    }
    const payload = await req.json();
    return { status: 200, ...payload };
  } catch (e) {
    console.error(e);
    return { status: 400, msg: 'Unknown API error' };
  }
};

export const getResults = async (
  pid: string
): Promise<ResultsPayload | HTTPPayload> => {
  /**
   * Fetch results from external API
   */

  const endpoint = new URL(
    api.routesServer.getResults.replace(new RegExp(':slug', 'g'), pid),
    URL_SERVER
  );

  try {
    const response = await fetch(endpoint.href);
    if (response.status != 200) {
      const payload = await response.json();
      return { status: response.status, msg: payload };
    }
    const payload = await response.json();
    return { ...payload, status: response.status };
  } catch (error) {
    console.error(error);
    return { status: 400, msg: 'Unknown API error' };
  }
};

export const getElection = async (
  pid: string
): Promise<ElectionPayload | HTTPPayload> => {
  /**
   * Fetch data from external API
   */
  const path = api.routesServer.getElection.replace(
    new RegExp(':slug', 'g'),
    pid
  );
  const endpoint = new URL(path, URL_SERVER);

  try {
    const response = await fetch(endpoint.href);

    if (response.status != 200) {
      const payload = await response.json();
      return { status: response.status, msg: payload };
    }
    const payload = await response.json();
    return { ...payload, status: response.status };
  } catch (error) {
    return { status: 400, msg: 'Unknown API error' };
  }
};

export const castBallot = (
  votes: Array<Vote>,
  election: ElectionPayload,
  token?: string
) => {
  /**
   * Save a ballot on the remote database
   */

  const endpoint = new URL(api.routesServer.voteElection, URL_SERVER);

  const payload = {
    election_ref: election.ref,
    votes: votes.map((v) => ({
      candidate_id: election.candidates[v.candidateId].id,
      grade_id: election.grades[v.gradeId].id,
    })),
  };

  if (!election.restricted) {
    return fetch(endpoint.href, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } else {
    if (!token) {
      throw Error('Missing token');
    }
    return fetch(endpoint.href, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  }
};

export const UNKNOWN_ELECTION_ERROR = 'E1:';
export const ONGOING_ELECTION_ERROR = 'E2:';
export const NO_VOTE_ERROR = 'E3:';
export const ELECTION_NOT_STARTED_ERROR = 'E4:';
export const ELECTION_FINISHED_ERROR = 'E5:';
export const INVITATION_ONLY_ERROR = 'E6:';
export const UNKNOWN_TOKEN_ERROR = 'E7:';
export const USED_TOKEN_ERROR = 'E8:';
export const WRONG_ELECTION_ERROR = 'E9:';
export const API_ERRORS = [
  UNKNOWN_TOKEN_ERROR,
  ONGOING_ELECTION_ERROR,
  NO_VOTE_ERROR,
  ELECTION_NOT_STARTED_ERROR,
  ELECTION_FINISHED_ERROR,
  INVITATION_ONLY_ERROR,
  UNKNOWN_TOKEN_ERROR,
  USED_TOKEN_ERROR,
  WRONG_ELECTION_ERROR,
];

export const apiErrors = (error: string): string => {
  const errorCode = `${error.split(':')[0]}:`;

  if (API_ERRORS.includes(errorCode)) {
    return `error.${error.split(':')[0].toLowerCase()}`;
  } else {
    return 'error.catch22';
  }
};