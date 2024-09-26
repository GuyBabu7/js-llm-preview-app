/* eslint-disable class-methods-use-this */

import { factory } from '@ww/gql-base-service/lib/decorators/gql.decorators';
import { Context } from '@ww/gql-schema-types';
import { VesselSummaryGenerator } from '/helpers/vessel/vessel.summary';

const { query } = factory(__filename);

export default class VesselSchema {
  @query
  public async vesselSummary(_, { vesselImo }: { vesselImo: string }, ctx: Context) {
    const { user } = ctx;

    return new VesselSummaryGenerator(user, vesselImo).generateSummary();
  }
}
