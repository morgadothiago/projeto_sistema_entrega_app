import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';
import { logger } from '../utils/logger';

const WEBSOCKET_URL = process.env.EXPO_PUBLIC_WEBSOCKET_URL || 'http://localhost:2000/gps';
const LOCATION_UPDATE_INTERVAL = 10000; // 10 segundos

export interface DeliveryTrackingOptions {
  deliveryCode: string;
  enabled: boolean;
}

export function useDeliveryTracking({ deliveryCode, enabled }: DeliveryTrackingOptions) {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);

  // Função para enviar localização
  const sendLocation = useCallback(async () => {
    if (!socketRef.current?.connected || !deliveryCode) {
      logger.warn('Socket não conectado ou código de entrega ausente', {
        context: 'useDeliveryTracking',
      });
      return;
    }

    try {
      // Pega localização atual
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const payload = {
        code: deliveryCode,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      logger.info('Enviando localização', {
        context: 'useDeliveryTracking',
        data: payload,
      });

      socketRef.current.emit('location', payload);
    } catch (error: any) {
      logger.error('Erro ao enviar localização', error, {
        context: 'useDeliveryTracking',
      });

      setError('Erro ao obter localização. Verifique as permissões.');
    }
  }, [deliveryCode]);

  // Verifica e solicita permissão de localização
  const requestLocationPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);

      if (status !== Location.PermissionStatus.GRANTED) {
        setError('Permissão de localização negada');
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Erro ao solicitar permissão de localização', error, {
        context: 'useDeliveryTracking',
      });
      setError('Erro ao solicitar permissão de localização');
      return false;
    }
  }, []);

  // Conecta ao WebSocket
  useEffect(() => {
    if (!enabled || !token || !deliveryCode) {
      return;
    }

    logger.info('Iniciando rastreamento de entrega', {
      context: 'useDeliveryTracking',
      data: { deliveryCode, enabled },
    });

    // Verifica permissão de localização
    requestLocationPermission().then((hasPermission) => {
      if (!hasPermission) {
        logger.warn('Permissão de localização não concedida', {
          context: 'useDeliveryTracking',
        });
        return;
      }

      // Cria conexão Socket.IO
      const socket = io(WEBSOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      socketRef.current = socket;

      // Event listeners
      socket.on('connect', () => {
        logger.info('WebSocket conectado', { context: 'useDeliveryTracking' });
        setIsConnected(true);
        setError(null);

        // Envia primeira localização imediatamente
        sendLocation();

        // Configura intervalo para enviar localização periodicamente
        intervalRef.current = setInterval(() => {
          sendLocation();
        }, LOCATION_UPDATE_INTERVAL);
      });

      socket.on('connect_error', (err) => {
        logger.error('Erro de conexão WebSocket', err, {
          context: 'useDeliveryTracking',
        });
        setError('Erro de conexão. Tentando reconectar...');
        setIsConnected(false);
      });

      socket.on('disconnect', (reason) => {
        logger.warn('WebSocket desconectado', {
          context: 'useDeliveryTracking',
          data: { reason },
        });
        setIsConnected(false);

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      });

      socket.on('error', (err) => {
        logger.error('Erro no WebSocket', err, {
          context: 'useDeliveryTracking',
        });
        setError('Erro no servidor. Tente novamente.');
      });

      // Listener para resposta de erro do servidor
      socket.on('exception', (error: any) => {
        logger.error('Erro do servidor WebSocket', error, {
          context: 'useDeliveryTracking',
        });
        setError(error?.message || 'Erro no servidor');
      });
    });

    // Cleanup
    return () => {
      logger.info('Encerrando rastreamento de entrega', {
        context: 'useDeliveryTracking',
      });

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      setIsConnected(false);
    };
  }, [enabled, token, deliveryCode, requestLocationPermission, sendLocation]);

  // Função manual para enviar localização (útil para testes)
  const forceSendLocation = useCallback(() => {
    sendLocation();
  }, [sendLocation]);

  return {
    isConnected,
    error,
    locationPermission,
    forceSendLocation,
  };
}
