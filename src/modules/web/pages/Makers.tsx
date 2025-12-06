import { useEffect, useState, useCallback } from "react"; 
import { Link } from "react-router-dom";
import { deleteMaker, mergeMakers, getMakersForAdmin } from "../services/apiWeb";
import CategoryManager from "../components/CategoryManager";
import { type Maker, MakerStatusEnum } from "../types/types";
import { StatusBadge } from "../components/StatusBadge";
import { useToast } from "../../../hooks/useToast";
import { LoadingSpinner } from "../../../components/Icons";

const Makers: React.FC = () => {
    const [makers, setMakers] = useState<Maker[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMergeMode, setIsMergeMode] = useState(false);
    const [sourceId, setSourceId] = useState<string | null>(null);
    const [targetId, setTargetId] = useState<string | null>(null);
    const { addToast } = useToast();

    const fetchMakers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getMakersForAdmin();
            const sortedData = data.sort((a, b) => {
                const weight = { 
                    [MakerStatusEnum.PENDING]: 0, 
                    [MakerStatusEnum.ACTIVE]: 1, 
                    [MakerStatusEnum.SUSPENDED]: 2, 
                    [MakerStatusEnum.DEACTIVATED]: 3 
                };
                return weight[a.status] - weight[b.status];
            });
            setMakers(sortedData);
        } catch (err: any) {
            addToast({ type: "error", title: "Erro", message: err.message });
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchMakers();
    }, [fetchMakers]);

    const handleDelete = async (id: string) => {
        addToast({
            type: "warning",
            title: "Excluir Maker?",
            message: "Isso apagarÃ¡ todos os produtos deste maker permanentemente.",
            confirmLabel: "Sim, Excluir",
            onConfirm: async () => {
                try {
                    await deleteMaker(id);
                    setMakers(makers.filter((maker) => maker.id !== id));
                    addToast({ type: "success", message: "Maker excluído com sucesso." });
                } catch (err: any) {
                    addToast({ type: "error", title: "Erro", message: err.message });
                }
            }
        });
    };

    const handleMerge = async () => {
        if (!sourceId || !targetId) return;
        if (sourceId === targetId) {
            addToast({ type: "warning", message: "Origem e Destino não podem ser iguais." });
            return;
        }

        addToast({
            type: "warning",
            title: "Confirmar Fusão?",
            message: "Produtos serão movidos para o NOVO maker e a conta ANTIGA será desativada.",
            confirmLabel: "Confirmar Fusão",
            onConfirm: async () => {
                try {
                    setLoading(true);
                    await mergeMakers(sourceId, targetId);
                    addToast({ type: "success", message: "Migração realizada com sucesso!" });
                    setIsMergeMode(false);
                    setSourceId(null);
                    setTargetId(null);
                    fetchMakers(); // useCallback garante que podemos chamar aqui sem problemas
                } catch (err: any) {
                    addToast({ type: "error", title: "Falha na migração", message: err.message });
                    setLoading(false);
                }
            }
        });
    };

    const toggleMergeSelection = (id: string) => {
        if (sourceId === id) setSourceId(null);
        else if (targetId === id) setTargetId(null);
        else if (!sourceId) setSourceId(id);
        else if (!targetId) setTargetId(id);
    };

    if (loading) return <div className="flex justify-center p-10"><LoadingSpinner className="w-10 h-10 text-blue-600" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-black">Gerenciar Makers</h1>
                <div className="flex gap-2">
                    {!isMergeMode ? (
                        <>
                            <button 
                                onClick={() => setIsMergeMode(true)}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                            >
                                âš¡ Migrar Contas
                            </button>
                            <Link
                                to="/makers/new"
                                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                            >
                                Novo Maker
                            </Link>
                        </>
                    ) : (
                        <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg border border-blue-200 animate-fade-in">
                            <span className="text-sm text-blue-800 mr-2">
                                1. Selecione o <b>ANTIGO</b> (Origem) <br/>
                                2. Selecione o <b>NOVO</b> (Destino)
                            </span>
                            <button 
                                onClick={handleMerge}
                                disabled={!sourceId || !targetId}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirmar Fusão
                            </button>
                            <button 
                                onClick={() => {
                                    setIsMergeMode(false);
                                    setSourceId(null);
                                    setTargetId(null);
                                }}
                                className="text-gray-600 px-3 hover:text-gray-800"
                            >
                                Cancelar
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {isMergeMode && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Migração</th>}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome / CPF</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produtos</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {makers.map((maker) => {
                            const isSource = maker.id === sourceId;
                            const isTarget = maker.id === targetId;
                            
                            return (
                                <tr key={maker.id} className={isSource ? "bg-red-50" : isTarget ? "bg-green-50" : "hover:bg-gray-50"}>
                                    {isMergeMode && (
                                        <td className="px-6 py-4">
                                            <input 
                                                type="checkbox" 
                                                checked={isSource || isTarget}
                                                onChange={() => toggleMergeSelection(maker.id)}
                                                className="w-5 h-5 cursor-pointer"
                                            />
                                            {isSource && <span className="ml-2 text-xs font-bold text-red-600">ANTIGO</span>}
                                            {isTarget && <span className="ml-2 text-xs font-bold text-green-600">NOVO</span>}
                                        </td>
                                    )}
                                    <td className="px-6 py-4 text-black">
                                        <div className="font-medium">{maker.name}</div>
                                        <div className="text-xs text-gray-500 font-mono">{maker.cpf || 'Sem CPF'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-black">
                                        <StatusBadge status={maker.status} />
                                    </td>
                                    <td className="px-6 py-4">
                                         <Link to={`/makers/${maker.id}/products`} className="text-blue-600 hover:underline text-sm">
                                            {maker.products?.length || 0} produtos
                                         </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/makers/edit/${maker.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4 font-semibold">
                                            Editar
                                        </Link>
                                        <button onClick={() => handleDelete(maker.id)} className="text-red-600 hover:text-red-900 font-semibold">
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="mt-10">
                 <CategoryManager onCategoryAdded={() => {}} />
            </div>
        </div>
    );
};

export default Makers;