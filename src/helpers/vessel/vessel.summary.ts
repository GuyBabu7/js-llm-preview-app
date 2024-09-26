/* eslint-disable class-methods-use-this */

import { ResolvedUser } from '@ww/gql-schema-types';
import FeatureFlags from '@ww/js-core/lib/constants/featureFlags';
import { filterVesselData, getVesselData } from '/helpers/vessel/vessel.helper';
import { LLMModel } from '/LLMInfra/constants';
import { VESSEL_SUMMARY_SYSTEM_PROMPT } from '/constants/vessel.llm';
import { SummaryGenerator } from '/helpers/common/summary-generator';

export class VesselSummaryGenerator extends SummaryGenerator {
  private readonly vesselImo: string;

  constructor(user: ResolvedUser, vesselImo: string) {
    super({
      user,
      requiredFeatureFlag: FeatureFlags.maiExpertVesselSummary,
      systemPrompt: VESSEL_SUMMARY_SYSTEM_PROMPT,
      summaryLLMModel: LLMModel.CLAUDE_3_5_SONNET_MODEL,
    });
    this.vesselImo = vesselImo;
  }

  protected override async fetchSummaryInput() {
    return getVesselData({
      user: this.user,
      vesselImo: this.vesselImo,
    });
  }

  protected override processSummaryInput(vesselData) {
    return filterVesselData(vesselData);
  }
}
