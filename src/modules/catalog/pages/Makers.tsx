import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMakers, deleteMaker } from "../services/apiCatalog";
import CategoryManager from "../components/CategoryManager";
import type { Maker } from "../types/types";

const Makers: React.FC = () => {
  const [makers, setMakers] = useState<Maker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchMakers = async () => {
      try {
        const data = await getMakers();
        setMakers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMakers();
  }, []);

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "Tem certeza que deseja excluir este maker? Isso também excluirá seus produtos."
      )
    ) {
      try {
        await deleteMaker(id);
        setMakers(makers.filter((maker) => maker.id !== id));
      } catch (err: any) {
        alert(`Erro ao excluir: ${err.message}`);
      }
    }
  };

  const handleCategoryAdded = () => {
    console.log("Uma nova categoria foi adicionada.");
  };

  if (loading) return <p>Carregando makers...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black">Gerenciar Makers</h1>
        <Link
          to="/makers/new"
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          Novo Maker
        </Link>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Produtos
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {makers.map((maker) => (
              <tr key={maker.id}>
                <td className="px-6 py-4 whitespace-nowrap text-black">
                  {maker.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    to={`/makers/${maker.id}/products`}
                    className="text-blue-600 hover:underline"
                  >
                    Ver Produtos
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    to={`/makers/edit/${maker.id}`}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(maker.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CategoryManager onCategoryAdded={handleCategoryAdded} />
    </div>
  );
};

export default Makers;
