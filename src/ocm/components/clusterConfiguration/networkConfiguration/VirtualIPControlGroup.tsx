import React from 'react';
import { useSelector } from 'react-redux';
import { Grid, Tooltip } from '@patternfly/react-core';
import { FieldArray, useFormikContext } from 'formik';
import {
  Cluster,
  FeatureSupportLevelBadge,
  getFormikArrayItemFieldName,
  NETWORK_TYPE_SDN,
  NewNetworkConfigurationValues,
  stringToJSON,
  ValidationsInfo,
} from '../../../../common';
import { selectCurrentClusterPermissionsState } from '../../../selectors';
import { OcmCheckbox, OcmCheckboxField } from '../../ui/OcmFormFields';
import VirtualIpField from './VirtualIpField';
import { selectVip } from './networkConfigurationValidation';
import { ProtocolVersion } from '../staticIp/data/dataTypes';

export type VirtualIPControlGroupProps = {
  cluster: Cluster;
  isVipDhcpAllocationDisabled?: boolean;
};

// TODO real selector in the correct place
const getVipValidationsById = (validationsInfoString?: Cluster['validationsInfo']) => {
  const validationsInfo = stringToJSON<ValidationsInfo>(validationsInfoString) || {};
  const failedDhcpAllocationMessageStubs = [
    'VIP IP allocation from DHCP server has been timed out', // TODO(jtomasek): remove this one once it is no longer in backend
    'IP allocation from the DHCP server timed out.',
  ];
  return (validationsInfo.network || []).reduce(
    (lookup, validation) => {
      if (['api-vip-defined', 'ingress-vip-defined'].includes(validation.id)) {
        const ipField = validation.id === 'api-vip-defined' ? 'apiVip' : 'ingressVip';
        const hasError =
          validation.status === 'failure' &&
          failedDhcpAllocationMessageStubs.find((stub) => validation.message.match(stub));

        if (hasError) {
          lookup[ipField] = validation.message;
        }
      }
      return lookup;
    },
    {
      apiVip: '',
      ingressVip: '',
    },
  );
};

const apiVipFieldName = 'apiVips';
const ingressVipFieldName = 'ingressVips';

export const VirtualIPControlGroup = ({
  cluster,
  isVipDhcpAllocationDisabled,
}: VirtualIPControlGroupProps) => {
  const { values, setFieldValue } = useFormikContext<NewNetworkConfigurationValues>();
  const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);

  const clusterApiVip = selectVip(cluster.apiVips, cluster.apiVip);
  const clusterIngressVip = selectVip(cluster.ingressVips, cluster.ingressVip);

  const hasFilledIPv6Vips = values.apiVips.length > 1; // TODO better
  const [areIpv6VipsEnabled, setAreIpv6VipsEnabled] = React.useState<boolean>(hasFilledIPv6Vips);

  const enableAllocation = values.networkType === NETWORK_TYPE_SDN;

  // TODO does it change for dual-stack??? is there a way to determine which one it is??
  const vipValidationErrors = React.useMemo(
    () => getVipValidationsById(cluster.validationsInfo),
    [cluster.validationsInfo],
  );

  React.useEffect(() => {
    if (!isViewerMode && !enableAllocation) {
      setFieldValue('vipDhcpAllocation', false);
    }
  }, [enableAllocation, isViewerMode, setFieldValue]);

  const onChangeDhcp = React.useCallback(
    (hasDhcp: boolean) => {
      // We need to sync the values back to the form
      setFieldValue('apiVips', hasDhcp ? [] : clusterApiVip);
      setFieldValue('ingressVips', hasDhcp ? [] : clusterIngressVip);
    },
    [clusterApiVip, clusterIngressVip, setFieldValue],
  );

  const isDualStack = values.stackType === 'dualStack';
  const hasFilledIpv4Fields = React.useMemo(() => {
    return (
      values.apiVips.length >= 1 &&
      !!values.apiVips[0].ip &&
      values.ingressVips.length >= 1 &&
      !!values.ingressVips[0].ip
    );
  }, [values.apiVips, values.ingressVips]);
  const hasDhcpAllocation = !!values.vipDhcpAllocation;

  const testCheckbox = React.useCallback((doCheck) => {
    // TODO needs to trim the values of the ipvs back to only ipv4
    setAreIpv6VipsEnabled(doCheck);
  }, []);

  return (
    <>
      {!isVipDhcpAllocationDisabled && (
        <OcmCheckboxField
          onChange={onChangeDhcp}
          label={
            <>
              <Tooltip
                hidden={enableAllocation}
                content={
                  "A cluster with OVN networking type cannot use 'allocate IPs via DHCP server'"
                }
              >
                <span>Allocate IPs via DHCP server</span>
              </Tooltip>
              <FeatureSupportLevelBadge
                featureId="VIP_AUTO_ALLOC"
                openshiftVersion={cluster.openshiftVersion}
              />
            </>
          }
          name="vipDhcpAllocation"
          isDisabled={!enableAllocation}
        />
      )}

      <FieldArray
        name={'clusterVips'}
        validateOnChange={false}
        render={() => (
          <Grid hasGutter>
            <VirtualIpField
              vipField={'apiVip'}
              fieldName={`${getFormikArrayItemFieldName(apiVipFieldName, 0)}.ip`}
              fieldValue={values.apiVips?.length > 0 ? values.apiVips[0].ip : ''}
              protocolVersion={isDualStack ? ProtocolVersion.ipv4 : undefined}
              cluster={cluster}
              hasDhcpAllocation={hasDhcpAllocation}
              validationError={vipValidationErrors.apiVip}
            />
            <VirtualIpField
              vipField={'ingressVip'}
              fieldName={`${getFormikArrayItemFieldName(ingressVipFieldName, 0)}.ip`}
              fieldValue={values.ingressVips?.length > 0 ? values.ingressVips[0].ip : ''}
              protocolVersion={isDualStack ? ProtocolVersion.ipv4 : undefined}
              cluster={cluster}
              hasDhcpAllocation={hasDhcpAllocation}
              validationError={vipValidationErrors.ingressVip}
            />
            {isDualStack && (
              <Tooltip
                content={
                  'After you define API and Ingress IPs for IPv4, you can also define them for IPv6'
                }
                hidden={hasFilledIpv4Fields}
                position={'top-start'}
              >
                <OcmCheckbox
                  id={'useDualStackIpv6Vips'}
                  label={'Use IPv6 API and Ingress IPs'}
                  description={'Some description'}
                  isChecked={areIpv6VipsEnabled}
                  isDisabled={!hasFilledIpv4Fields}
                  onChange={testCheckbox}
                />
              </Tooltip>
            )}
            {areIpv6VipsEnabled && (
              <>
                <VirtualIpField
                  vipField={'apiVip'}
                  fieldName={`${getFormikArrayItemFieldName(apiVipFieldName, 1)}.ip`}
                  fieldValue={values.apiVips.length > 1 ? values.apiVips[1].ip : ''}
                  cluster={cluster}
                  protocolVersion={ProtocolVersion.ipv6}
                  hasDhcpAllocation={hasDhcpAllocation}
                  validationError={vipValidationErrors.apiVip}
                />
                <VirtualIpField
                  vipField={'ingressVip'}
                  fieldName={`${getFormikArrayItemFieldName(ingressVipFieldName, 1)}.ip`}
                  fieldValue={values.ingressVips.length > 1 ? values.ingressVips[1].ip : ''}
                  cluster={cluster}
                  protocolVersion={ProtocolVersion.ipv6}
                  hasDhcpAllocation={hasDhcpAllocation}
                  validationError={vipValidationErrors.ingressVip}
                />
              </>
            )}
          </Grid>
        )}
      />
    </>
  );
};
