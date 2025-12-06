import { MakerStatusEnum } from "../types/types";

export const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
        [MakerStatusEnum.PENDING]: "bg-yellow-100 text-yellow-800 border-yellow-200",
        [MakerStatusEnum.ACTIVE]: "bg-green-100 text-green-800 border-green-200",
        [MakerStatusEnum.SUSPENDED]: "bg-red-100 text-red-800 border-red-200",
        [MakerStatusEnum.DEACTIVATED]: "bg-gray-100 text-gray-800 border-gray-200",
    };

    const label = status === MakerStatusEnum.PENDING ? 'EM ANÁLISE' : status;

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${colors[status] || colors.DEACTIVATED}`}>
            {label}
        </span>
    );
};