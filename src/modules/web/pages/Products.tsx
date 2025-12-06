import { useEffect, useState, useCallback } from "react"; // [1] Import useCallback
import { Link } from "react-router-dom";
import { getProducts, deleteProduct, updateProductStatus } from "../services/apiWeb";
import { type Product, ProductStatusEnum, ProductTypeEnum } from "../types/types";
import { useToast } from "../../../hooks/useToast";
import { LoadingSpinner } from "../../../components/Icons";
import { ToggleSwitch } from "../../../components/ToggleSwitch";

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  const { addToast } = useToast();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err: any) {
      addToast({ type: "error", title: "Erro", message: err.message });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    addToast({
        type: "warning",
        title: "Excluir Produto?",
        message: "Tem certeza que deseja excluir este produto?",
        confirmLabel: "Excluir",
        onConfirm: async () => {
            try {
                await deleteProduct(id);
                setProducts(products.filter((p) => p.id !== id));
                addToast({ type: "success", message: "Produto excluído." });
            } catch (err: any) {
                addToast({ type: "error", title: "Erro", message: err.message });
            }
        }
    });
  };

  const handleStatusToggle = async (product: Product) => {
    const newStatus = product.status === ProductStatusEnum.ACTIVE 
        ? ProductStatusEnum.PAUSED 
        : ProductStatusEnum.ACTIVE;

    setUpdatingId(product.id);
    try {
        await updateProductStatus(product.id, newStatus);
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
        addToast({ type: "success", message: `Produto ${newStatus === 'ACTIVE' ? 'Ativado' : 'Pausado'}` });
    } catch (err: any) {
        addToast({ type: "error", title: "Erro", message: err.message });
    } finally {
        setUpdatingId(null);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><LoadingSpinner className="w-10 h-10 text-blue-600" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black">Gerenciar Produtos</h1>
        <Link
          to="/products/new"
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 shadow-sm"
        >
          Novo Produto
        </Link>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-x-auto border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Maker</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-black font-medium">{product.name}</td>
                <td className="px-6 py-4 text-gray-600">{product.maker?.name || "N/A"}</td>
                <td className="px-6 py-4 text-black">R$ {Number(product.price).toFixed(2)}</td>
                <td className="px-6 py-4">
                    {product.type === ProductTypeEnum.PROMOTIONAL ? (
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">Promocional</span>
                    ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">Padrão</span>
                    )}
                </td>
                <td className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                        {updatingId === product.id ? (
                            <LoadingSpinner className="w-5 h-5 text-blue-500" />
                        ) : (
                            <ToggleSwitch 
                                checked={product.status === ProductStatusEnum.ACTIVE} 
                                onChange={() => handleStatusToggle(product)} 
                            />
                        )}
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    to={`/products/edit/${product.id}`}
                    className="text-indigo-600 hover:text-indigo-900 mr-4 font-semibold"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-900 font-semibold"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;