import React from 'react';
import { type DevolutionResponseDTO } from '../types/types';
import { OrderStatusEnum } from '../../../types/types';

const StatusBadge: React.FC<{ status: OrderStatusEnum | null }> = ({
  status,
}) => {
  let bgColor = 'bg-gray-200';
  let textColor = 'text-gray-800';

  switch (status) {
    case OrderStatusEnum.REFUND_IN_ANALYSIS:
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      break;
    case OrderStatusEnum.REFUND_IN_PROCESS:
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      break;
    case OrderStatusEnum.REFUNDED: 
    case OrderStatusEnum.DONE: 
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    default:
      break;
  }

  return (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full ${bgColor} ${textColor}`}
    >
      {status ? status.replace(/_/g, ' ').toUpperCase() : 'N/A'}
    </span>
  );
};

interface DevolutionCardProps {
  data: DevolutionResponseDTO;
  isSelected: boolean;
  onSelect: () => void;
}

const DevolutionCard: React.FC<DevolutionCardProps> = ({
  data,
  isSelected,
  onSelect,
}) => {
  const formattedDate = new Date(data.creationTime).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div
      onClick={onSelect}
      className={`bg-white p-4 rounded-lg shadow-md cursor-pointer transition-all duration-200 border-2 ${
        isSelected
          ? 'border-blue-500 shadow-lg'
          : 'border-transparent hover:shadow-lg'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-black truncate pr-2">
          Pedido: {data.orderId}
        </h3>
        <StatusBadge status={data.orderStatus} />
      </div>

      <p className="text-sm text-gray-700 mb-3 line-clamp-2">
        <span className="font-semibold">Motivo:</span> {data.reason}
      </p>

      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>{data.contact}</span>
        <span>{formattedDate}</span>
      </div>
    </div>
  );
};

export default DevolutionCard;