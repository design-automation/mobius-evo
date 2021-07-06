/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getJob = /* GraphQL */ `
  query GetJob($id: ID!) {
    getJob(id: $id) {
      id
      userID
      evalUrl
      genUrl
      expiration
      description
      history
      run_settings
      other_settings
      max_designs
      population_size
      tournament_size
      mutation_sd
      createdAt
      endedAt
      run
      jobStatus
      owner
      errorMessage
      updatedAt
    }
  }
`;
export const listJobs = /* GraphQL */ `
  query ListJobs(
    $filter: ModelJobFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listJobs(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        userID
        evalUrl
        genUrl
        expiration
        description
        history
        run_settings
        other_settings
        max_designs
        population_size
        tournament_size
        mutation_sd
        createdAt
        endedAt
        run
        jobStatus
        owner
        errorMessage
        updatedAt
      }
      nextToken
    }
  }
`;
export const getGenEvalParam = /* GraphQL */ `
  query GetGenEvalParam($id: ID!) {
    getGenEvalParam(id: $id) {
      id
      JobID
      GenID
      generation
      survivalGeneration
      genUrl
      evalUrl
      evalResult
      live
      params
      score
      owner
      expirationTime
      errorMessage
      createdAt
      updatedAt
    }
  }
`;
export const listGenEvalParams = /* GraphQL */ `
  query ListGenEvalParams(
    $filter: ModelGenEvalParamFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listGenEvalParams(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        JobID
        GenID
        generation
        survivalGeneration
        genUrl
        evalUrl
        evalResult
        live
        params
        score
        owner
        expirationTime
        errorMessage
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const generationsByJobId = /* GraphQL */ `
  query GenerationsByJobId(
    $JobID: ID
    $owner: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelGenEvalParamFilterInput
    $limit: Int
    $nextToken: String
  ) {
    generationsByJobID(
      JobID: $JobID
      owner: $owner
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        JobID
        GenID
        generation
        survivalGeneration
        genUrl
        evalUrl
        evalResult
        live
        params
        score
        owner
        expirationTime
        errorMessage
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getEvoSetting = /* GraphQL */ `
  query GetEvoSetting($id: ID!) {
    getEvoSetting(id: $id) {
      id
      value
      createdAt
      updatedAt
    }
  }
`;
export const listEvoSettings = /* GraphQL */ `
  query ListEvoSettings(
    $filter: ModelevoSettingFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listEvoSettings(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        value
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
