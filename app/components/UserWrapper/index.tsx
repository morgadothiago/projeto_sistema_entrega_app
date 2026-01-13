/**
 * UserWrapper Component
 * Exibe informações do usuário com avatar e saldo
 * Versão corrigida com nome correto e balance dinâmico
 */

import React from 'react';
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '@/app/theme';
import { ApiResponse } from '@/app/types/ApiResponse';
import { moneyMask } from '@/app/utils/masks';
import { IMAGE_SIZES } from '@/app/utils/constants';

interface UserWrapperProps {
  deliveryMan: ApiResponse['DeliveryMan'];
  avatarSource?: ImageSourcePropType;
  /**
   * Saldo do usuário em centavos ou formato string
   */
  balance?: number | string;
  /**
   * Se true, exibe um loading no lugar do saldo
   */
  loadingBalance?: boolean;
  /**
   * URL do avatar do usuário (do backend)
   */
  avatarUrl?: string | null;
}

export default function UserWrapper({
  deliveryMan,
  avatarSource,
  balance,
  loadingBalance = false,
  avatarUrl,
}: UserWrapperProps) {
  // Formata o saldo para exibição
  const formattedBalance = React.useMemo(() => {
    if (loadingBalance) return 'Carregando...';
    if (balance === undefined || balance === null) return 'R$ 0,00';

    // Se já for string formatada, retorna
    if (typeof balance === 'string' && balance.includes('R$')) {
      return balance;
    }

    // Se for número, formata
    if (typeof balance === 'number') {
      return moneyMask(balance);
    }

    // Se for string com número, converte e formata
    const numBalance = parseFloat(balance as string);
    return isNaN(numBalance) ? 'R$ 0,00' : moneyMask(numBalance);
  }, [balance, loadingBalance]);

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Image
          source={
            avatarUrl
              ? { uri: avatarUrl }
              : avatarSource || require('@/app/assets/logo_marca.png')
          }
          style={styles.avatar}
          resizeMode="cover"
        />
      </View>
      <View style={styles.nameContainer}>
        <Text style={styles.userName} numberOfLines={1}>
          {deliveryMan?.name || 'Usuário'}
        </Text>
        <Text style={styles.balance} numberOfLines={1}>
          {formattedBalance}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: colors.primary,
    borderRadius: 10,
    marginVertical: 10,
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatar: {
    width: IMAGE_SIZES.AVATAR.WIDTH,
    height: IMAGE_SIZES.AVATAR.HEIGHT,
    borderRadius: 20,
    backgroundColor: colors.active,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    marginRight: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.buttons,
    flex: 1,
    marginRight: 8,
  },
  balance: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.buttons,
  },
});
