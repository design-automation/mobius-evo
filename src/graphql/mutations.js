/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createJob = /* GraphQL */ `
  mutation CreateJob(
    $input: CreateJobInput!
    $condition: ModelJobConditionInput
  ) {
    createJob(input: $input, condition: $condition) {
      id
      userID
      evalUrl
      genUrl
      expiration
      description
      max_designs
      population_size
      tournament_size
      survival_size
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
export const updateJob = /* GraphQL */ `
  mutation UpdateJob(
    $input: UpdateJobInput!
    $condition: ModelJobConditionInput
  ) {
    updateJob(input: $input, condition: $condition) {
      id
      userID
      evalUrl
      genUrl
      expiration
      description
      max_designs
      population_size
      tournament_size
      survival_size
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
export const deleteJob = /* GraphQL */ `
  mutation DeleteJob(
    $input: DeleteJobInput!
    $condition: ModelJobConditionInput
  ) {
    deleteJob(input: $input, condition: $condition) {
      id
      userID
      evalUrl
      genUrl
      expiration
      description
      max_designs
      population_size
      tournament_size
      survival_size
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
export const createGenEvalParam = /* GraphQL */ `
  mutation CreateGenEvalParam(
    $input: CreateGenEvalParamInput!
    $condition: ModelGenEvalParamConditionInput
  ) {
    createGenEvalParam(input: $input, condition: $condition) {
      id
      JobID
      GenID
      generation
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
export const updateGenEvalParam = /* GraphQL */ `
  mutation UpdateGenEvalParam(
    $input: UpdateGenEvalParamInput!
    $condition: ModelGenEvalParamConditionInput
  ) {
    updateGenEvalParam(input: $input, condition: $condition) {
      id
      JobID
      GenID
      generation
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
export const deleteGenEvalParam = /* GraphQL */ `
  mutation DeleteGenEvalParam(
    $input: DeleteGenEvalParamInput!
    $condition: ModelGenEvalParamConditionInput
  ) {
    deleteGenEvalParam(input: $input, condition: $condition) {
      id
      JobID
      GenID
      generation
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
