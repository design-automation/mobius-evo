/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateJob = /* GraphQL */ `
  subscription OnCreateJob($owner: String) {
    onCreateJob(owner: $owner) {
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
export const onUpdateJob = /* GraphQL */ `
  subscription OnUpdateJob($owner: String) {
    onUpdateJob(owner: $owner) {
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
export const onDeleteJob = /* GraphQL */ `
  subscription OnDeleteJob($owner: String) {
    onDeleteJob(owner: $owner) {
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
export const onCreateGenEvalParam = /* GraphQL */ `
  subscription OnCreateGenEvalParam($owner: String) {
    onCreateGenEvalParam(owner: $owner) {
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
      updatedAt
      createdAt
    }
  }
`;
export const onUpdateGenEvalParam = /* GraphQL */ `
  subscription OnUpdateGenEvalParam($owner: String) {
    onUpdateGenEvalParam(owner: $owner) {
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
      updatedAt
      createdAt
    }
  }
`;
export const onDeleteGenEvalParam = /* GraphQL */ `
  subscription OnDeleteGenEvalParam($owner: String) {
    onDeleteGenEvalParam(owner: $owner) {
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
      updatedAt
      createdAt
    }
  }
`;
export const onCreateEvoSetting = /* GraphQL */ `
  subscription OnCreateEvoSetting {
    onCreateEvoSetting {
      id
      value
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateEvoSetting = /* GraphQL */ `
  subscription OnUpdateEvoSetting {
    onUpdateEvoSetting {
      id
      value
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteEvoSetting = /* GraphQL */ `
  subscription OnDeleteEvoSetting {
    onDeleteEvoSetting {
      id
      value
      createdAt
      updatedAt
    }
  }
`;
