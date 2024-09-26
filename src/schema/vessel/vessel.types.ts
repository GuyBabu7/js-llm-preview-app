import { gql } from '@ww/gql-base-service/lib/apollo-server';

export default gql`
  type VesselSummary {
    summary: String
  }

  extend type Query {
    """
    Query - returns summary on a single vessel by vesselImo
    """
    vesselSummary(vesselImo: String!): VesselSummary! @injectFeatureFlags
  }
`;
