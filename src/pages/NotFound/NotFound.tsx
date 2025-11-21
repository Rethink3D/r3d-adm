import { Link } from "react-router-dom";

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[60vh]">
      <h1 className="text-9xl font-bold text-blue-500 dark:text-blue-400">
        404
      </h1>
      <h2 className="text-4xl font-semibold text-texto-principal mt-4 mb-2">
        Página Não Encontrada
      </h2>
      <p className="text-texto-secundario text-lg mb-8">
        A página que você está procurando não existe ou foi movida.
      </p>
      <Link
        to="/"
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-transform duration-300 hover:scale-105"
      >
        Voltar para a Home
      </Link>
    </div>
  );
};

export default NotFound;
