import { removeEmptyValues } from '@ww/js-core/lib/utils/object';
import { internalGQLCallOnBehalfUser } from '@ww/node-utils/lib/utils/internalGraphqlCall';
import { ResolvedUser } from '@ww/gql-schema-types';
import { VesselCustomizedQuery } from '/gql/vessel.queries';
import { writeFile } from 'fs/promises';

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
    if (company === null) {
      return;
    }

    const vesselsMap = new Map<string, Object>();
    ownershipFields.forEach(field => {
      if (company?.[field]) {
        for (let i = (company[field].length || 0) - 1; i >= 0; i--) {
          //
          // if (
          //   company[field][i].vessel?.imo !== newVesselData.vesselByIMO.imo &&
          //   company[field][i].vessel?.complianceRisk?.level === 'Low'
          // ) {
          //   company[field].splice(i, 1);
          // } else if (!vesselsMap.has(company[field][i].vessel?.imo)) {
          //   vesselsMap.set(company[field][i].vessel.imo, company[field][i].vessel);
          // }

          if (
            company[field][i].vessel?.imo === newVesselData.vesselByIMO.imo ||
            company[field][i].vessel?.complianceRisk?.level !== 'Low'
          ) {
            if (!vesselsMap.has(company[field][i].vessel?.imo)) {
              vesselsMap.set(company[field][i].vessel.imo, company[field][i].vessel);
            }
          }
        }

        delete company[field];
      }
    });

    company.vesselsList = [];
    vesselsMap.forEach(vessel => {
      company.vesselsList.push(vessel);
    });
  });

  newVesselData = removeEmptyValues(newVesselData);

  try {
    writeFile(`processSummaryInput/vessel_json.txt`, JSON.stringify(newVesselData));
  } catch (err) {
    logger.debug(err);
  }

  //
  // logger.debug(JSON.stringify(newVesselData));

  return newVesselData;
}
