import React from 'react';
import { Alert, AlertVariant, Spinner } from '@patternfly/react-core';

interface VipStaticValueProps {
  vipValue: string | undefined;
  hasDhcpAllocation: boolean;
  hasMachineNetworkCidr: boolean;
  validationErrorMessage?: string;
}

const VirtualIpStaticValue = ({
  vipValue,
  hasDhcpAllocation,
  hasMachineNetworkCidr,
  validationErrorMessage,
}: VipStaticValueProps) => {
  if (hasDhcpAllocation && vipValue) {
    return <>{vipValue}</>;
  }
  if (hasDhcpAllocation && validationErrorMessage) {
    return (
      <Alert
        variant={AlertVariant.danger}
        title="The DHCP server failed to allocate the IP"
        isInline
      >
        {validationErrorMessage}
      </Alert>
    );
  }
  if (hasDhcpAllocation && hasMachineNetworkCidr) {
    return (
      <>
        <Spinner size="md" />
        <i> This IP is being allocated by the DHCP server</i>
      </>
    );
  }
  return <i>This IP will be allocated by the DHCP server</i>;
};

export default VirtualIpStaticValue;
