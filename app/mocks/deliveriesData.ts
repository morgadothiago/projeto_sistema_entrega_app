export const deliveriesData = [
  {
    id: "1",
    description: "Entrega de documentos para o cliente A",
    date: "2024-07-21",
    status: "completed",
    day: "sunday",
  },
  {
    id: "2",
    description: "Coleta de pacote no centro de distribuição",
    date: "2024-07-22",
    status: "pending",
    day: "monday",
  },
  {
    id: "3",
    description: "Entrega de refeição para o cliente B",
    date: "2024-07-23",
    status: "in_progress",
    day: "tuesday",
  },
  {
    id: "4",
    description: "Entrega de eletrônicos para o cliente C",
    date: "2024-07-24",
    status: "completed",
    day: "wednesday",
  },
  {
    id: "5",
    description: "Coleta de devolução no cliente D",
    date: "2024-07-25",
    status: "pending",
    day: "thursday",
  },
  {
    id: "6",
    description: "Entrega de flores para o cliente E",
    date: "2024-07-26",
    status: "completed",
    day: "friday",
  },
  {
    id: "7",
    description: "Entrega de bolo de aniversário",
    date: "2024-07-27",
    status: "in_progress",
    day: "saturday",
  },
  {
    id: "8",
    description: "Entrega de documentos para o cliente F",
    date: "2024-07-21",
    status: "completed",
    day: "sunday",
  },
  {
    id: "9",
    description: "Coleta de pacote no centro de distribuição",
    date: "2024-07-22",
    status: "pending",
    day: "monday",
  },
  {
    id: "10",
    description: "Entrega de refeição para o cliente G",
    date: "2024-07-23",
    status: "in_progress",
    day: "tuesday",
  },
  {
    id: "11",
    description: "Entrega de eletrônicos para o cliente H",
    date: "2024-07-24",
    status: "completed",
    day: "wednesday",
  },
  {
    id: "12",
    description: "Coleta de devolução no cliente I",
    date: "2024-07-25",
    status: "pending",
    day: "thursday",
  },
  {
    id: "13",
    description: "Entrega de flores para o cliente J",
    date: "2024-07-26",
    status: "completed",
    day: "friday",
  },
  {
    id: "14",
    description: "Entrega de bolo de aniversário",
    date: "2024-07-27",
    status: "in_progress",
    day: "saturday",
  },
];

export type DeliveryItem = {
  id: string;
  description: string;
  date: string;
  status: "pending" | "in_progress" | "completed";
  day: string;
};