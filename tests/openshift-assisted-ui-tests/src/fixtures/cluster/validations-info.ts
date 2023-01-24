import isArray from 'lodash/isArray';
import merge from 'lodash/merge';

const addOrUpdateValidationInfo = (prevValidationGroup, newValidationGroup) => {
  const isNewValidationId = () =>
    prevValidationGroup.find((prev) => {
      return newValidationGroup.find((next) => prev.id === next.id);
    }) === undefined;

  if (isArray(prevValidationGroup) && isNewValidationId()) {
    return prevValidationGroup.concat(newValidationGroup);
  }
  return prevValidationGroup;
};

const upgradeValidationsInfo = (prevValidationInfo, newValidationInfo) => {
  return merge(prevValidationInfo, newValidationInfo, addOrUpdateValidationInfo);
};

export { upgradeValidationsInfo };
