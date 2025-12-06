import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  getProductById,
  createProduct,
  updateProduct,
  uploadProductImage,
  deleteImage,
  getMakersForAdmin,
  getCategories,
} from "../services/apiWeb";
import {
  type Maker,
  type Image,
  type Category,
  MaterialTypeEnum,
  ProductTypeEnum,
  ProductStatusEnum
} from "../types/types";
import { PRODUCT_LIMITS, MAX_FILE_SIZE_MB, ALLOWED_TYPES } from "../../../constants/InputsLimits";
import { LoadingSpinner } from "../../../components/Icons";
import { useToast } from "../../../hooks/useToast";
import { ToggleSwitch } from "../../../components/ToggleSwitch";

const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const isEditing = Boolean(id);

  // Estados do Formulário
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [material, setMaterial] = useState<MaterialTypeEnum>(MaterialTypeEnum.PLA);
  const [price, setPrice] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [type, setType] = useState<ProductTypeEnum>(ProductTypeEnum.STANDARD);
  const [status, setStatus] = useState<ProductStatusEnum>(ProductStatusEnum.ACTIVE);
  const [isPersonalizable, setIsPersonalizable] = useState(false);
  const [makerId, setMakerId] = useState("");
  
  // Estados de Dados e Upload
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [availableMakers, setAvailableMakers] = useState<Maker[]>([]);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [productImages, setProductImages] = useState<Image[]>([]);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const finalPricePreview = useMemo(() => {
    const priceVal = parseFloat(price);
    const discountVal = parseFloat(discountPercentage);

    if (isNaN(priceVal)) return 0;
    if (isNaN(discountVal) || type === ProductTypeEnum.STANDARD) return priceVal;

    return priceVal - (priceVal * (discountVal / 100));
  }, [price, discountPercentage, type]);

  const fetchProductData = useCallback(async (productId: string) => {
    try {
      const productData = await getProductById(productId);
      setName(productData.name);
      setDescription(productData.description);
      setMaterial(productData.material);
      setPrice(String(productData.price));
      setDiscountPercentage(String(productData.discountPercentage || ""));
      setType(productData.type || ProductTypeEnum.STANDARD);
      setStatus(productData.status || ProductStatusEnum.ACTIVE);
      setIsPersonalizable(productData.isPersonalizable);
      setMakerId(productData.maker?.id || "");
      setSelectedCategories(new Set(productData.categories.map((cat) => cat.id)));
      setProductImages(productData.images || []);
    } catch (err: any) {
      addToast({ type: "error", title: "Erro", message: "Erro ao carregar produto: " + err.message });
    }
  }, [addToast]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [makersData, categoriesData] = await Promise.all([
          getMakersForAdmin(),
          getCategories(),
        ]);
        setAvailableMakers(makersData);
        setAvailableCategories(categoriesData);

        if (isEditing && id) {
          await fetchProductData(id);
        }
      } catch (err: any) {
        addToast({ type: "error", title: "Erro", message: "Erro ao carregar dados iniciais." });
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [id, isEditing, addToast, fetchProductData]);

  const handleCategoryToggle = (categoryId: string) => {
    const newSelection = new Set(selectedCategories);
    if (newSelection.has(categoryId)) {
      newSelection.delete(categoryId);
    } else {
      newSelection.add(categoryId);
    }
    setSelectedCategories(newSelection);
  };

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      addToast({ type: "warning", title: "Arquivo Inválido", message: `Formato ${file.type} não suportado.` });
      return false;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      addToast({ type: "warning", title: "Arquivo Grande", message: `Máximo ${MAX_FILE_SIZE_MB}MB.` });
      return false;
    }
    return true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).filter(validateFile);
      if (filesToUpload.length + newFiles.length > PRODUCT_LIMITS.MAX_IMAGES) {
        addToast({ type: "warning", message: `Limite de ${PRODUCT_LIMITS.MAX_IMAGES} imagens excedido.` });
        return;
      }
      setFilesToUpload((prev) => [...prev, ...newFiles]);
      event.target.value = ""; 
    }
  };

  const handleRemoveQueuedFile = (fileToRemove: File) => {
    setFilesToUpload(filesToUpload.filter((file) => file !== fileToRemove));
  };

  const handleImageUploadDirect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0 && id) {
      const newFiles = Array.from(event.target.files).filter(validateFile);
      
      if (productImages.length + newFiles.length > PRODUCT_LIMITS.MAX_IMAGES) {
        addToast({ type: "warning", message: "Limite de imagens excedido." });
        return;
      }

      try {
        addToast({ type: "info", message: "Enviando imagens..." });
        await Promise.all(newFiles.map((file) => uploadProductImage(id, file)));
        await fetchProductData(id);
        addToast({ type: "success", message: "Imagens enviadas com sucesso." });
      } catch (err: any) {
        addToast({ type: "error", title: "Erro no Upload", message: err.message });
      }
    }
  };

  const handleImageDelete = async (imageId: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta imagem?") && id) {
      try {
        await deleteImage(imageId);
        await fetchProductData(id);
        addToast({ type: "success", message: "Imagem removida." });
      } catch (err: any) {
        addToast({ type: "error", title: "Erro", message: err.message });
      }
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") { setPrice(""); return; }
    const val = parseFloat(value);
    if (isNaN(val) || val < 0 || val > PRODUCT_LIMITS.MAX_PRICE) return;
    setPrice(value);
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") { setDiscountPercentage(""); return; }
    const val = parseFloat(value);
    if (isNaN(val) || val < 0 || val > 100) return;
    setDiscountPercentage(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!makerId) {
      addToast({ type: "warning", message: "Selecione um maker." });
      return;
    }
    if (selectedCategories.size === 0) {
      addToast({ type: "warning", message: "Selecione pelo menos uma categoria." });
      return;
    }

    setIsSubmitting(true);
    try {
      const productData = {
        name,
        description,
        material,
        price: price,
        discountPercentage: type === ProductTypeEnum.PROMOTIONAL ? parseFloat(discountPercentage || "0") : 0,
        isPersonalizable,
        makerId,
        categoryIds: Array.from(selectedCategories),
        type,
        status
      };

      if (isEditing && id) {
        await updateProduct(id, productData);
        addToast({ type: "success", message: "Produto atualizado!" });
        navigate("/products");
      } else {
        const newProduct = await createProduct(productData);
        if (filesToUpload.length > 0) {
            addToast({ type: "info", message: "Enviando imagens..." });
            await Promise.all(filesToUpload.map((file) => uploadProductImage(newProduct.id, file)));
        }
        addToast({ type: "success", message: "Produto criado com sucesso!" });
        navigate("/products");
      }
    } catch (err: any) {
      addToast({ type: "error", title: "Erro ao salvar", message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><LoadingSpinner className="w-12 h-12 text-blue-600" /></div>;

  return (
    <div className="animate-fade-in pb-20">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        {isEditing ? "Editar Produto" : "Novo Produto"}
      </h1>
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* --- Detalhes Principais --- */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Detalhes do Produto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="name">Nome do Produto</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={PRODUCT_LIMITS.NAME}
                  className="w-full px-3 py-2 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <div className="flex justify-end mt-1 text-xs text-gray-500">{name.length}/{PRODUCT_LIMITS.NAME}</div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2" htmlFor="maker">Maker Responsável</label>
                <select
                  id="maker"
                  value={makerId}
                  onChange={(e) => setMakerId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="" disabled>Selecione um maker</option>
                  {availableMakers.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} (CPF: {m.cpf})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">Status</label>
                <div className="flex items-center gap-3 mt-2">
                    <ToggleSwitch 
                        checked={status === ProductStatusEnum.ACTIVE} 
                        onChange={(val) => setStatus(val ? ProductStatusEnum.ACTIVE : ProductStatusEnum.PAUSED)} 
                    />
                    <span className={`font-medium ${status === ProductStatusEnum.ACTIVE ? "text-green-600" : "text-gray-500"}`}>
                        {status === ProductStatusEnum.ACTIVE ? "Ativo (Visível)" : "Pausado (Oculto)"}
                    </span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="description">Descrição</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  maxLength={PRODUCT_LIMITS.DESCRIPTION}
                  className="w-full px-3 py-2 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
                <div className="flex justify-end mt-1 text-xs text-gray-500">{description.length}/{PRODUCT_LIMITS.DESCRIPTION}</div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2" htmlFor="material">Material Principal</label>
                <select
                  id="material"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value as MaterialTypeEnum)}
                  required
                  className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {Object.values(MaterialTypeEnum).map((mat) => (
                    <option key={mat} value={mat}>{mat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2" htmlFor="type">Tipo de Anúncio</label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as ProductTypeEnum)}
                  required
                  className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value={ProductTypeEnum.STANDARD}>Padrão</option>
                    <option value={ProductTypeEnum.PROMOTIONAL}>Promocional / Campanha</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2" htmlFor="price">Preço (R$)</label>
                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={handlePriceChange}
                  required
                  step="0.01"
                  className="w-full px-3 py-2 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {type === ProductTypeEnum.PROMOTIONAL && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <label className="block text-yellow-800 font-bold mb-1">Desconto (%)</label>
                      <input
                        type="number"
                        value={discountPercentage}
                        onChange={handleDiscountChange}
                        max="100"
                        placeholder="0"
                        className="w-full px-3 py-2 border border-yellow-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-yellow-500 outline-none"
                      />
                      <div className="mt-2 text-right">
                          <span className="text-xs text-gray-500 uppercase">Preço Final: </span>
                          <span className="font-bold text-green-600 text-lg">
                              R$ {finalPricePreview.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                      </div>
                  </div>
              )}

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer text-gray-900 w-fit p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <input
                    type="checkbox"
                    checked={isPersonalizable}
                    onChange={(e) => setIsPersonalizable(e.target.checked)}
                    className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  Este produto aceita personalização (cor, nome, tamanho)
                </label>
              </div>
            </div>
          </section>

          {/* --- Categorias --- */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Categorias</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto custom-scrollbar p-1">
              {availableCategories.map((cat) => {
                 const isSelected = selectedCategories.has(cat.id);
                 return (
                    <label key={cat.id} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer select-none transition-colors ${isSelected ? 'bg-blue-50 border-blue-500' : 'bg-white hover:bg-gray-50'}`}>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={isSelected}
                        onChange={() => handleCategoryToggle(cat.id)}
                      />
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                          {isSelected && <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                      </div>
                      <span className={isSelected ? 'text-blue-700 font-medium' : 'text-gray-700'}>{cat.name}</span>
                    </label>
                 )
              })}
            </div>
          </section>

          {/* --- Imagens --- */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Imagens</h2>
            
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <p className="mb-1 text-sm text-gray-500 font-semibold">Clique para fazer upload</p>
                    <p className="text-xs text-gray-500">JPG, PNG, WEBP (Max. {PRODUCT_LIMITS.MAX_IMAGES})</p>
                </div>
                <input type="file" multiple className="hidden" onChange={isEditing ? handleImageUploadDirect : handleFileSelect} accept="image/*" />
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                {/* Imagens do Servidor */}
                {productImages.map((img) => (
                    <div key={img.id} className="relative group aspect-square">
                        <img src={img.url} alt="Produto" className="w-full h-full object-cover rounded-lg border" />
                        <button
                            type="button"
                            onClick={() => handleImageDelete(img.id)}
                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                ))}
                {/* Imagens Locais (Fila) */}
                {!isEditing && filesToUpload.map((file, idx) => (
                    <div key={idx} className="relative group aspect-square">
                        <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover rounded-lg border opacity-80" />
                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] px-1 rounded">NOVO</div>
                        <button
                            type="button"
                            onClick={() => handleRemoveQueuedFile(file)}
                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                ))}
            </div>
          </section>

          <div className="flex items-center gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <LoadingSpinner className="w-5 h-5 text-white" />}
              {isSubmitting ? "Salvando..." : "Salvar Produto"}
            </button>
            <Link to="/products" className="text-gray-600 hover:underline">Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;