import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  getMakerById,
  createMaker,
  updateMaker,
  getCategories,
  uploadMakerProfileImage,
  deleteImage,
} from "../../services/api";
import type {
  Category,
  Image,
} from "../../types/types";
import {
  MakerStatusEnum,
  ContactTypeEnum,
} from "../../types/types"; 

const MakerForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [acceptsPersonalization, setAcceptsPersonalization] = useState(false);
  const [status, setStatus] = useState<MakerStatusEnum>(MakerStatusEnum.ACTIVE);
  const [contacts, setContacts] = useState<
    { type: string; contactInfo: string }[]
  >([{ type: "EMAIL", contactInfo: "" }]);
  const [availableCategories, setAvailableCategories] = useState<Category[]>(
    []
  );
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );
  const [profileImage, setProfileImage] = useState<Image | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchMakerData = async (makerId: string) => {
    try {
      const makerData = await getMakerById(makerId);
      setName(makerData.name);
      setDescription(makerData.description);
      setAcceptsPersonalization(makerData.acceptsPersonalization);
      setStatus(makerData.status);
      setContacts(
        makerData.contacts.length > 0
          ? makerData.contacts
          : [{ type: "EMAIL", contactInfo: "" }]
      );
      setSelectedCategories(new Set(makerData.categories.map((cat) => cat.id)));
      setProfileImage(makerData.profileImage || null);
    } catch (err: any) {
      setError("Erro ao recarregar dados do maker: " + err.message);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const categoriesData = await getCategories();
        setAvailableCategories(categoriesData);
        if (isEditing && id) {
          await fetchMakerData(id);
        }
      } catch (err: any) {
        setError("Erro ao carregar dados. " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [id, isEditing]);

  const handleContactChange = (
    index: number,
    field: "type" | "contactInfo",
    value: string
  ) => {
    const newContacts = [...contacts];
    newContacts[index][field] = value;
    setContacts(newContacts);
  };

  const addContactField = () => {
    setContacts([...contacts, { type: "EMAIL", contactInfo: "" }]);
  };

  const removeContactField = (index: number) => {
    if (contacts.length > 1) {
      setContacts(contacts.filter((_, i) => i !== index));
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newSelection = new Set(selectedCategories);
    if (newSelection.has(categoryId)) {
      newSelection.delete(categoryId);
    } else {
      newSelection.add(categoryId);
    }
    setSelectedCategories(newSelection);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFileToUpload(event.target.files[0]);
    }
  };

  const handleImageDelete = async (imageId: string) => {
    if (
      window.confirm("Tem certeza que deseja remover a imagem de perfil?") &&
      id
    ) {
      try {
        await deleteImage(imageId);
        await fetchMakerData(id);
      } catch (err: any) {
        setError("Erro ao deletar imagem: " + err.message);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const makerData = {
        name,
        description,
        acceptsPersonalization,
        status,
        contacts: contacts.filter((c) => c.contactInfo.trim() !== ""),
        categoryIds: Array.from(selectedCategories),
      };
      if (isEditing && id) {
        await updateMaker(id, makerData);
        if (fileToUpload) await uploadMakerProfileImage(id, fileToUpload);
      } else {
        const newMaker = await createMaker(makerData);
        if (fileToUpload)
          await uploadMakerProfileImage(newMaker.id, fileToUpload);
      }
      navigate("/makers");
    } catch (err: any) {
      setError("Erro ao salvar maker: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p>Carregando formulário...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        {isEditing ? "Editar Maker" : "Novo Maker"}
      </h1>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
              Informações Básicas
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  className="block text-gray-700 font-bold mb-2"
                  htmlFor="name"
                >
                  Nome do Maker
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg text-gray-900"
                />
              </div>
              <div>
                <label
                  className="block text-gray-700 font-bold mb-2"
                  htmlFor="description"
                >
                  Descrição
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg text-gray-900"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Aceita personalização?
                </label>
                <div className="mt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-gray-900 w-fit">
                    <input
                      type="checkbox"
                      checked={acceptsPersonalization}
                      onChange={(e) =>
                        setAcceptsPersonalization(e.target.checked)
                      }
                      className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    Sim, aceita encomendas personalizadas
                  </label>
                </div>
              </div>
            </div>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
              Contatos
            </h2>
            <div className="space-y-2">
              {contacts.map((contact, index) => (
                <div key={index} className="flex items-center gap-2">
                  <select
                    value={contact.type}
                    onChange={(e) =>
                      handleContactChange(index, "type", e.target.value)
                    }
                    className="border rounded-lg px-3 py-2 text-gray-900"
                  >
                    {Object.values(ContactTypeEnum).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={contact.contactInfo}
                    onChange={(e) =>
                      handleContactChange(index, "contactInfo", e.target.value)
                    }
                    placeholder="Informação de Contato"
                    className="flex-grow px-3 py-2 border rounded-lg text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => removeContactField(index)}
                    className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
                    disabled={contacts.length === 1}
                  >
                    -
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addContactField}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4 hover:bg-blue-600 transition-colors"
            >
              + Adicionar Contato
            </button>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
              Imagem de Perfil
            </h2>
            {isEditing && profileImage && (
              <div className="mb-4 relative w-40 h-40 group">
                <img
                  src={profileImage.url}
                  alt="Perfil do Maker"
                  className="w-40 h-40 object-cover rounded-full"
                />
                <button
                  type="button"
                  onClick={() => handleImageDelete(profileImage.id)}
                  className="absolute top-1 right-1 bg-red-600 text-white w-8 h-8 flex items-center justify-center rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  X
                </button>
              </div>
            )}
            <div>
              <label
                className="block text-gray-700 font-bold mb-2"
                htmlFor="profileImage"
              >
                {isEditing && profileImage
                  ? "Trocar Imagem de Perfil"
                  : "Adicionar Imagem de Perfil"}
              </label>
              <input
                type="file"
                id="profileImage"
                onChange={handleFileSelect}
                accept="image/png, image/jpeg"
                className="w-full text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {fileToUpload && (
                <div className="mt-4">
                  <p className="text-sm font-bold text-gray-700 mb-2">
                    Nova imagem:
                  </p>
                  <img
                    src={URL.createObjectURL(fileToUpload)}
                    alt="Preview"
                    className="w-40 h-40 object-cover rounded-full"
                  />
                </div>
              )}
            </div>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
              Categorias
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {availableCategories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center gap-2 cursor-pointer text-gray-900"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.has(cat.id)}
                    onChange={() => handleCategoryToggle(cat.id)}
                    className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          </section>
          <section>
            <div>
              <label
                className="block text-gray-700 font-bold mb-2"
                htmlFor="status"
              >
                Status do Maker
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as MakerStatusEnum)}
                className="w-auto px-3 py-2 border rounded-lg text-gray-900 bg-white"
              >
                {Object.values(MakerStatusEnum).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </section>
          <div className="flex items-center gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting
                ? "Salvando..."
                : isEditing
                ? "Salvar Alterações"
                : "Criar Maker"}
            </button>
            <Link to="/makers" className="text-gray-600 hover:underline">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MakerForm;
