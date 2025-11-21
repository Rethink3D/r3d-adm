const Dashboard: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl text-black font-bold mb-4">
        Painel de Administração
      </h1>
      <p className="text-gray-600">
        Bem-vindo ao painel de administração da Rethink3D Web. Utilize o menu
        lateral para gerenciar makers e produtos.
      </p>
      <div className="flex flex-col items-center pt-20">
        <img src="/Logo-2-thin 1.png" alt="" />
      </div>
    </div>
  );
};

export default Dashboard;
