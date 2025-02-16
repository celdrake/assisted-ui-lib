import { FeatureSupportLevel, FeatureSupportLevelId, SupportLevel } from '../api/types';
import { ArrayElementType } from './typescriptExtensions';

type Features = Required<ArrayElementType<FeatureSupportLevel['features']>>;
export type FeatureId =
  | FeatureSupportLevelId
  | Features['featureId']
  | 'ODF'
  | 'CNV'
  | 'NETWORK_TYPE_SELECTION';

export type FeatureIdToSupportLevel = {
  [id in FeatureId]?: SupportLevel;
};

export type FeatureSupportLevelsMap = {
  [id in string /* means OCP normalized version */]: FeatureIdToSupportLevel;
};

export type ClusterFeatureUsage = {
  [key: string]: {
    id: FeatureId;
    name: string;
    data?: { [key: string]: unknown };
  };
};

export type PreviewSupportLevel = 'tech-preview' | 'dev-preview';

export const isPreviewSupportLevel = (
  supportLevel: SupportLevel | undefined,
): supportLevel is PreviewSupportLevel => {
  return supportLevel === 'dev-preview' || supportLevel === 'tech-preview';
};
