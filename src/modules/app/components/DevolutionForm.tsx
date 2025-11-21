import React, { useState } from "react";
import { type DevolutionResponseDTO } from "../types/types";
import { OrderStatusEnum } from "../../../types/types";
import { updateDevolutionStatus } from "../services/apiApp";
import { LoadingSpinner } from "../../../components/Icons";

interface DevolutionFormProps {
    data: DevolutionResponseDTO;
    onUpdateSuccess: () => void;
}

const DevolutionForm: React.FC<DevolutionFormProps> = ({
    data,
    onUpdateSuccess,
}) => {
    const [productQuantities, setProductQuantities] = useState<
        Map<string, number>
    >(new Map(data.products.map((p) => [p.id, p.quantity])));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const makerInfo = data.products[0]?.product.maker;

    const handleQuantityChange = (
        productItemId: string,
        newQuantity: number
    ) => {
        const originalItem = data.products.find((p) => p.id === productItemId);
        if (!originalItem) return;

        const clampedQuantity = Math.max(
            0,
            Math.min(newQuantity, originalItem.quantity)
        );
        setProductQuantities(
            new Map(productQuantities.set(productItemId, clampedQuantity))
        );
    };

    const handleSubmit = async (decision: "approve" | "deny") => {
        setIsSubmitting(true);
        setError(null);

        let status: OrderStatusEnum;
        let productsToRefund: {
            productToDevolutionId: string;
            quantity: number;
        }[] = [];

        if (decision === "deny") {
            status = OrderStatusEnum.DONE;
            productsToRefund = [];
        } else {
            status = OrderStatusEnum.REFUND_IN_PROCESS;
            productQuantities.forEach((quantity, productToDevolutionId) => {
                if (quantity > 0) {
                    productsToRefund.push({ productToDevolutionId, quantity });
                }
            });
        }

        try {
            await updateDevolutionStatus({
                devolutionId: data.id,
                status: status,
                products: productsToRefund,
            });
            onUpdateSuccess();
        } catch (err: any) {
            setError(
                err.message || "Ocorreu um erro ao processar a solicitação."
            );
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            {/* --- Seção de Informações Básicas --- */}
            <section className="border-b pb-4 mb-4">
                <h2 className="text-2xl font-bold text-black mb-4">
                    Analisar Devolução
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    <div className="md:col-span-2">
                        <strong className="text-gray-600 block">
                            Nº Pedido:
                        </strong>
                        <span className="text-gray-900 text-base">
                            {data.orderId}
                        </span>
                    </div>

                    <div>
                        <strong className="text-gray-600 block">
                            Cliente:
                        </strong>
                        <span className="text-gray-900">{data.contact}</span>
                    </div>

                    <div>
                        <strong className="text-gray-600 block">Maker:</strong>
                        {makerInfo ? (
                            <div className="flex items-center gap-3 mt-1">
                                <img
                                    src={makerInfo.imageUrl}
                                    alt={makerInfo.name}
                                    className="w-10 h-10 rounded-full object-cover border"
                                />
                                <div>
                                    <span className="text-gray-900 font-semibold block">
                                        {makerInfo.name}
                                    </span>
                                    <span className="text-gray-700 block">
                                        {makerInfo.email}
                                    </span>
                                    <span className="text-gray-700 block">
                                        {makerInfo.phone}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <span className="text-gray-900">
                                Não disponível
                            </span>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <strong className="text-gray-600 block">
                            Motivo da Devolução:
                        </strong>
                        <p className="text-gray-900 bg-gray-50 p-2 rounded border">
                            {data.reason}
                        </p>
                    </div>
                </div>
            </section>

            {/* --- Seção de Imagens --- */}
            <section className="border-b pb-4 mb-4">
                <h3 className="text-xl font-semibold text-black mb-3">
                    Imagens Enviadas
                </h3>
                {data.images.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {data.images.map((imageUrl, index) => (
                            <a
                                key={index}
                                href={imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative group"
                            >
                                <img
                                    src={imageUrl}
                                    alt={`Imagem ${index + 1} da devolução`}
                                    className="w-full h-32 object-cover rounded-md border"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-opacity">
                                    <span className="text-white opacity-0 group-hover:opacity-100">
                                        Ver
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">
                        Nenhuma imagem foi enviada.
                    </p>
                )}
            </section>

            {/* --- Seção de Produtos --- */}
            <section>
                <h3 className="text-xl font-semibold text-black mb-3">
                    Produtos Solicitados para Devolução
                </h3>
                <div className="space-y-4">
                    {data.products.map((item) => (
                        <div
                            key={item.id}
                            className="flex flex-col md:flex-row items-center gap-4 bg-gray-50 p-3 rounded-lg border"
                        >
                            <div className="flex-1">
                                <p className="font-bold text-black">
                                    {item.product.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Preço unitário: R$ {item.price}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <label
                                    htmlFor={`qty-${item.id}`}
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Qtde. Solicitada:
                                    <span className="text-lg font-bold text-black ml-2">
                                        {item.quantity}
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    id={`qty-${item.id}`}
                                    value={productQuantities.get(item.id) || 0}
                                    onChange={(e) =>
                                        handleQuantityChange(
                                            item.id,
                                            parseInt(e.target.value, 10)
                                        )
                                    }
                                    max={item.quantity}
                                    min={0}
                                    className="w-20 px-2 py-1 border rounded-lg text-black text-center"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- Seção de Ações --- */}
            <footer className="mt-6 pt-6 border-t">
                {error && (
                    <p className="text-red-500 mb-4 text-center">{error}</p>
                )}
                <div className="flex flex-col sm:flex-row justify-end gap-4">
                    <button
                        onClick={() => handleSubmit("deny")}
                        disabled={isSubmitting}
                        className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <LoadingSpinner className="w-6 h-6" />
                        ) : (
                            "Negar Devolução"
                        )}
                    </button>
                    <button
                        onClick={() => handleSubmit("approve")}
                        disabled={isSubmitting}
                        className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <LoadingSpinner className="w-6 h-6" />
                        ) : (
                            "Aprovar (Total/Parcial)"
                        )}
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default DevolutionForm;
