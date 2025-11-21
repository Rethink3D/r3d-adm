import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProducts, getMakerById } from "../services/api";
import type { Product, Maker } from "../types/types";

const MakerProducts: React.FC = () => {
  const { makerId } = useParams<{ makerId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [maker, setMaker] = useState<Maker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!makerId) return;

    const fetchMakerAndProducts = async () => {
      try {
        setLoading(true);
        const makerData = await getMakerById(makerId);
        setMaker(makerData);

        // O backend não tem um endpoint /makers/:id/products,
        // então filtramos todos os produtos no frontend.
        const allProducts = await getProducts();
        const filteredProducts = allProducts.filter(
          (p) => p.maker?.id === makerId
        );
        setProducts(filteredProducts);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMakerAndProducts();
  }, [makerId]);

  if (loading) return <p>Carregando...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!maker) return <p>Maker não encontrado.</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4 text-black">
        Produtos de: {maker.name}
      </h1>
      <div className="mb-6">
        <Link to="/makers" className="text-blue-600 hover:underline">
          &larr; Voltar para todos os makers
        </Link>
      </div>

      {products.length === 0 ? (
        <p>Este maker ainda não possui produtos cadastrados.</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nome do Produto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Preço
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">
                    R$ {product.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/products/edit/${product.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MakerProducts;
