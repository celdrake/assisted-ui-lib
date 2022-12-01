import React from 'react';
import {
  ApiVip,
  Cluster,
  FormikStaticField,
  IngressVip,
  selectMachineNetworkCIDR,
} from '../../../../common';
import VirtualIpStaticValue from './VirtualIpStaticValue';
import { OcmInputField } from '../../ui/OcmFormFields';
import { ProtocolVersion } from '../staticIp/data/dataTypes';

type VipField = 'apiVip' | 'ingressVip';

type VirtualIpFieldProps = {
  vipField: VipField;
  fieldName: string;
  fieldValue: ApiVip['ip'] | IngressVip['ip'];
  cluster: Cluster;
  hasDhcpAllocation: boolean;
  validationError: string;
  protocolVersion?: ProtocolVersion;
};

const getVipHelperSuffix = (
  vip?: string,
  vipDhcpAllocation?: boolean,
  vipDhcpAllocationFormValue?: boolean,
): string => {
  if (!vipDhcpAllocationFormValue) {
    return 'Make sure that the VIP is unique and not used by any other device on your network.';
  }
  if (vipDhcpAllocation && vip) {
    return 'This IP was allocated by the DHCP server.';
  }
  return '';
};

const getFieldLabel = (vipField: VipField, protocolVersion?: ProtocolVersion) => {
  const labels = {
    apiVip: 'API IP',
    ingressVip: 'Ingress IP',
  };
  const label = labels[vipField];
  switch (protocolVersion) {
    case undefined:
      return label;
    default:
      return `${label} ${protocolVersion === ProtocolVersion.ipv4 ? '(IPv4)' : '(IPv6)'}`;
  }
};

const VirtualIpField = ({
  cluster,
  vipField,
  fieldName,
  fieldValue,
  hasDhcpAllocation,
  validationError,
  protocolVersion,
}: VirtualIpFieldProps) => {
  const machineNetworkCidr = selectMachineNetworkCIDR(cluster);

  const ipFieldHelperText = getVipHelperSuffix(
    fieldValue,
    cluster.vipDhcpAllocation,
    hasDhcpAllocation,
  );

  const label = getFieldLabel(vipField, protocolVersion);

  if (!hasDhcpAllocation) {
    return (
      <OcmInputField label={label} name={fieldName} helperText={ipFieldHelperText} isRequired />
    );
  }

  return (
    <FormikStaticField
      name={fieldName}
      label={label}
      helperText={ipFieldHelperText}
      value={fieldValue || ''}
      isValid={!validationError}
      isRequired
    >
      <VirtualIpStaticValue
        vipValue={fieldValue || ''}
        hasDhcpAllocation
        hasMachineNetworkCidr={!!machineNetworkCidr}
        validationErrorMessage={validationError}
      />
    </FormikStaticField>
  );
};

export default VirtualIpField;
