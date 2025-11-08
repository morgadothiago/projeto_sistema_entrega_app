import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { DeliveryItem } from "@/app/mocks/deliveriesData";
import { colors } from "@/app/theme";

interface DeliveryCardProps {
  item: DeliveryItem;
}

const DeliveryCard: React.FC<DeliveryCardProps> = ({ item }) => {
  const getStatusColor = (status: DeliveryItem['status']) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'in_progress':
        return colors.info;
      default:
        return colors.text;
    }
  };

  return (
    <View style={styles.deliveryCard}>
      <Text style={styles.deliveryDescription}>{item.description}</Text>
      <View style={styles.detailsRow}>
        <Text style={styles.deliveryDate}>{item.date}</Text>
        <Text style={[styles.deliveryStatus, { color: getStatusColor(item.status) }]}>
          {item.status.replace('_', ' ')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  deliveryCard: {
    backgroundColor: colors.secondary,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deliveryDescription: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 5,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deliveryDate: {
    fontSize: 14,
    color: colors.subText,
  },
  deliveryStatus: {
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
});

export default DeliveryCard;