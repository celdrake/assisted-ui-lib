import React from 'react';
import { AlertGroup, AlertActionCloseButton, Alert } from '@patternfly/react-core';
import { AlertProps } from '../../features/alerts/alertsSlice';
import { useAlerts } from '../AlertsContextProvider';

const Alerts: React.FC<{ className?: string }> = ({ className }) => {
  const { alerts, removeAlert } = useAlerts();
  const onClose = (alert: AlertProps) => removeAlert(alert.key);

  if (alerts.length) {
    return (
      <AlertGroup className={className}>
        {alerts.map((alert) => (
          // eslint-disable-next-line react/jsx-key
          <Alert
            actionClose={<AlertActionCloseButton onClose={() => onClose(alert)} />}
            isInline
            {...alert}
          >
            {alert.message}
          </Alert>
        ))}
      </AlertGroup>
    );
  }
  return null;
};

export default Alerts;
