import React, { useEffect, useState, useCallback } from 'react';
import { getDevolutions } from '../services/apiApp';
import type { DevolutionResponseDTO } from '../../app/types/types';
import { LoadingSpinner } from '../../../components/Icons';
import DevolutionCard from '../components/DevolutionCard';
import DevolutionForm from '../components/DevolutionForm';

const Devolutions: React.FC = () => {
  const [devolutions, setDevolutions] = useState<DevolutionResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDevolutionId, setSelectedDevolutionId] = useState<string | null>(
    null,
  );

  const fetchDevolutions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDevolutions();
      data.sort(
        (a, b) =>
          new Date(b.creationTime).getTime() -
          new Date(a.creationTime).getTime(),
      );
      setDevolutions(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar devoluções');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevolutions();
  }, [fetchDevolutions]);

  const selectedDevolution = devolutions.find(
    (dev) => dev.id === selectedDevolutionId,
  );

  const handleUpdate = () => {
    setSelectedDevolutionId(null);
    fetchDevolutions();
  };

  if (loading && devolutions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black">Gerenciar Devoluções</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna da Lista de Devoluções */}
        <div className="lg:col-span-4 h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar space-y-4 pr-2">
          {loading && <p>Atualizando lista...</p>}
          {devolutions.length === 0 && !loading ? (
            <p className="text-gray-500">Nenhuma devolução pendente.</p>
          ) : (
            devolutions.map((dev) => (
              <DevolutionCard
                key={dev.id}
                data={dev}
                isSelected={selectedDevolutionId === dev.id}
                onSelect={() => setSelectedDevolutionId(dev.id)}
              />
            ))
          )}
        </div>

        {/* Coluna do Formulário de Detalhe */}
        <div className="lg:col-span-8">
          {selectedDevolution ? (
            <DevolutionForm
              key={selectedDevolution.id}
              data={selectedDevolution}
              onUpdateSuccess={handleUpdate}
            />
          ) : (
            <div className="flex justify-center items-center h-full bg-white shadow-md rounded-lg p-8">
              <p className="text-gray-500">
                Selecione uma devolução ao lado para ver os detalhes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Devolutions;