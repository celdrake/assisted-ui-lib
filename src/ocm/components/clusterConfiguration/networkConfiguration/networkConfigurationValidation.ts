import * as Yup from 'yup';
import {
  Cluster,
  clusterNetworksValidationSchema,
  dualStackValidationSchema,
  getDefaultNetworkType,
  HostSubnets,
  isDualStack,
  isSNO,
  machineNetworksValidationSchema,
  NetworkConfigurationValues,
  serviceNetworkValidationSchema,
  IPv4ValidationSchema,
  sshPublicKeyValidationSchema,
  vipValidationSchema,
  IPV4_STACK,
  DUAL_STACK,
  ClusterDefaultConfig,
  ApiVip,
  MachineNetwork,
  ServiceNetwork,
  ClusterNetwork,
  macAddressValidationSchema,
  IngressVip,
  Ip,
  NewNetworkConfigurationValues,
} from '../../../../common';

export const selectVips = (
  ipList?: ApiVip[] | IngressVip[],
  ip?: string,
): ApiVip[] | IngressVip[] => {
  if (ipList && ipList.length > 0) {
    return ipList;
  }
  return ip ? [{ ip }] : [];
};

export const selectVip = (ipList?: ApiVip[] | IngressVip[], ip?: string): Ip | undefined => {
  const vips = selectVips(ipList, ip);

  if (vips.length > 0) {
    return vips[0].ip;
  }
  return '';
};

export const getNetworkInitialValues = (
  cluster: Cluster,
  defaultNetworkValues: Pick<
    ClusterDefaultConfig,
    | 'clusterNetworksIpv4'
    | 'clusterNetworksDualstack'
    | 'serviceNetworksIpv4'
    | 'serviceNetworksDualstack'
  >,
): NewNetworkConfigurationValues => {
  const isSNOCluster = isSNO(cluster);
  const isDualStackType = isDualStack(cluster);

  return {
    apiVips: selectVips(cluster.apiVips, cluster.apiVip),
    ingressVips: selectVips(cluster.ingressVips, cluster.ingressVip),
    sshPublicKey: cluster.sshPublicKey || '',
    vipDhcpAllocation: cluster.vipDhcpAllocation,
    managedNetworkingType: cluster.userManagedNetworking ? 'userManaged' : 'clusterManaged',
    networkType: cluster.networkType || getDefaultNetworkType(isSNOCluster, isDualStackType),
    machineNetworks: cluster.machineNetworks || [],
    stackType: isDualStackType ? DUAL_STACK : IPV4_STACK,
    clusterNetworks:
      cluster.clusterNetworks ||
      (isDualStackType
        ? defaultNetworkValues.clusterNetworksDualstack
        : defaultNetworkValues.clusterNetworksIpv4),
    serviceNetworks:
      cluster.serviceNetworks ||
      (isDualStackType
        ? defaultNetworkValues.serviceNetworksDualstack
        : defaultNetworkValues.serviceNetworksIpv4),
  };
};

const getDualStackNetworksValidation = (
  networks: MachineNetwork[] | ServiceNetwork[] | ClusterNetwork[] | undefined,
  networkLabel: string,
) => ({
  is: IPV4_STACK,
  then: IPv4ValidationSchema,
  otherwise: networks && networks.length >= 2 && dualStackValidationSchema(networkLabel),
});

export const getNetworkConfigurationValidationSchema = (
  initialValues: NetworkConfigurationValues,
  hostSubnets: HostSubnets,
) =>
  Yup.lazy<NetworkConfigurationValues>((values) => {
    return Yup.object<NetworkConfigurationValues>().shape({
      // apiVip: vipValidationSchema(hostSubnets, values, initialValues.apiVip),
      // ingressVip: vipValidationSchema(hostSubnets, values, initialValues.ingressVip),
      // TODO needs work
      // TODO needs work
      apiVips: Yup.array()
        .of(
          Yup.object().shape({
            ip: Yup.string(),
          }),
        )
        .min(0)
        .max(2), // TODO check if dual stack vs single stack for max??
      ingressVips: Yup.array()
        .of(
          Yup.object().shape({
            ip: Yup.string(),
          }),
        )
        .min(0)
        .max(2),
      sshPublicKey: sshPublicKeyValidationSchema,
      machineNetworks:
        values.managedNetworkingType === 'userManaged'
          ? Yup.array()
          : machineNetworksValidationSchema.when(
              'stackType',
              getDualStackNetworksValidation(values.machineNetworks, 'machine network'),
            ),
      clusterNetworks: clusterNetworksValidationSchema.when(
        'stackType',
        getDualStackNetworksValidation(values.clusterNetworks, 'cluster network'),
      ),
      serviceNetworks: serviceNetworkValidationSchema.when(
        'stackType',
        getDualStackNetworksValidation(values.serviceNetworks, 'service network'),
      ),
    });
  });
