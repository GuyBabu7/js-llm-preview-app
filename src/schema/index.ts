import {
  ComplianceVesselActivityBuildingBlockEnum,
  DateTimeScalar,
  ObjectIdScalar,
  PositiveIntScalar,
  MAIOutputLanguageCodeEnum,
} from '@ww/gql-base-service/lib/schema/common';
import * as VesselSchema from './vessel';

export default [
  DateTimeScalar,
  ObjectIdScalar,
  PositiveIntScalar,
  ComplianceVesselActivityBuildingBlockEnum,
  MAIOutputLanguageCodeEnum,
  VesselSchema,
];
