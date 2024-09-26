import { removeEmptyValues } from '@ww/js-core/lib/utils/object';
import { internalGQLCallOnBehalfUser } from '@ww/node-utils/lib/utils/internalGraphqlCall';
import { ResolvedUser } from '@ww/gql-schema-types';
import { VesselCustomizedQuery } from '/gql/vessel.queries';

const logger = require('@ww/gql-base-service').logger.withContext(__filename);

export async function getVesselData({
  vesselImo,
  user,
}: {
  vesselImo: string;
  user: ResolvedUser;
}) {
  const startTime = performance.now();

  const customizedVesselQuery = await internalGQLCallOnBehalfUser(user, {
    query: VesselCustomizedQuery,
    variables: {
      imo: vesselImo,
    },
  });

  logger
    .withTags([`duration=${performance.now() - startTime} ms`])
    .debug(`Finished fetching vessel json data`);

  return customizedVesselQuery?.data;
}

export function filterVesselData(vesselData): Record<string, unknown> {
  const vesselOwnershipList = [
    'beneficialOwner',
    'owner',
    'manager',
    'technicalManager',
    'operator',
    'commercialController',
    'ismManager',
  ];

  const ownershipFields = [
    'operates',
    'manages',
    'owns',
    'benefits',
    'commercialControls',
    'ismManages',
    'technicallyManages',
  ];

  let newVesselData = { ...vesselData };

  // Remove vessels with low compliance risk
  vesselOwnershipList.forEach(ownership => {
    const company = newVesselData.vesselByIMO?.[ownership]?.company;

    ownershipFields.forEach(field => {
      if (company?.[field]) {
        let count = 0;
        for (let i = (company[field].length || 0) - 1; i >= 0; i--) {
          if (company[field][i].vessel?.complianceRisk?.level === 'Low') {
            company[field].splice(i, 1);
          } else {
            count++;
          }
        }

        company.vesselsCount = count;
      }
    });
  });
  newVesselData = removeEmptyValues(newVesselData);

  //
  // logger.debug(JSON.stringify(newVesselData));

  return newVesselData;
}
