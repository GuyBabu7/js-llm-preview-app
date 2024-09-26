import { gql } from '@ww/js-core/lib/utils/graph-ql-client';

const OwnershipFragment = gql`
  fragment OwnershipFragment on Ownership {
    vessel {
      name
      imo
      complianceRisk {
        level
        program
      }
    }
  }
`;

const OwnershipCompanyFragment = gql`
  ${OwnershipFragment}
  fragment OwnershipCompanyFragment on Ownership {
    company {
      name
      countryEnum
      complianceRisk {
        level
        program
      }
      vesselsCount
      operates {
        ...OwnershipFragment
      }
      manages {
        ...OwnershipFragment
      }
      owns {
        ...OwnershipFragment
      }
      benefits {
        ...OwnershipFragment
      }
      commercialControls {
        ...OwnershipFragment
      }
      ismManages {
        ...OwnershipFragment
      }
      technicallyManages {
        ...OwnershipFragment
      }
    }
  }
`;

export const VesselCustomizedQuery = gql`
  ${OwnershipCompanyFragment}
  query VesselByIMO($imo: String!) {
    vesselByIMO(imo: $imo) {
      name
      imo
      flag
      insurer
      lastPortCall {
        polygon {
          properties {
            country
            name
          }
        }
        startDate
        endDate
      }
      reportedPort {
        ts
        port {
          properties {
            country
            name
          }
        }
      }
      complianceRisk {
        level
        program
        buildingBlocks {
          count
          level
          program
          name
          recentActivityStartDate
          recentActivityEndDate
        }
      }
      beneficialOwner {
        ...OwnershipCompanyFragment
      }
      owner {
        ...OwnershipCompanyFragment
      }
      manager {
        ...OwnershipCompanyFragment
      }
      technicalManager {
        ...OwnershipCompanyFragment
      }
      operator {
        ...OwnershipCompanyFragment
      }
      commercialController {
        ...OwnershipCompanyFragment
      }
      ismManager {
        ...OwnershipCompanyFragment
      }
      pscInspections {
        deficienciesInfo {
          category
          code
          element
        }
        inspectionDate
        inspectionPort
        inspectionResult
        deficiencyCategory
        deficientElement
        deficiencyCode
        deficienciesNum
        inspectionId
      }
    }
  }
`;
