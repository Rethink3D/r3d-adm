import { useState } from "react";
import { createCategory } from "../services/apiWeb";

interface CategoryManagerProps {
  onCategoryAdded: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({
  onCategoryAdded,
}) => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      setMessage({
        text: "O nome da categoria não pode ser vazio.",
        type: "error",
      });
      return;
    }

    try {
      await createCategory({
        name: categoryName,
        description: categoryDescription,
      });
      setCategoryName("");
      setCategoryDescription("");
      setMessage({
        text: `Categoria "${categoryName}" adicionada com sucesso!`,
        type: "success",
      });
      onCategoryAdded();
    } catch (err: any) {
      setMessage({
        text: "Erro ao adicionar categoria: " + err.message,
        type: "error",
      });
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-4 text-black">
        Gerenciar Categorias
      </h2>
      <form onSubmit={handleAddCategory} className="flex items-center gap-4">
        <input
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Nome da nova categoria"
          className="flex-grow px-4 py-2 border rounded-lg text-black"
        />
        <input
          type="text"
          value={categoryDescription}
          onChange={(e) => setCategoryDescription(e.target.value)}
          placeholder="Descrição da nova categoria"
          className="flex-grow px-4 py-2 border rounded-lg text-black"
        />
        <button
          type="submit"
          className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700"
        >
          Adicionar Categoria
        </button>
      </form>
      {message && (
        <p
          className={`mt-3 text-sm ${
            message.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
};

export default CategoryManager;
