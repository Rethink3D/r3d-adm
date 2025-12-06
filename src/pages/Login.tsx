import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../services/firebase";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const idTokenResult = await user.getIdTokenResult(true);

      if (!idTokenResult.claims.admin) {
        await signOut(auth);
        throw new Error("ACESS_DENIED");
      }

      navigate("/dashboard");
      
    } catch (err: any) {
      console.error(err);
      let msg = "Erro ao fazer login.";
      
      if (err.message === "ACESS_DENIED") {
        msg = "Acesso negado. Esta conta não possui privilégios de administrador.";
      } else if (err.code === 'auth/invalid-credential') {
        msg = "Credenciais inválidas.";
      } else if (err.code === 'auth/user-not-found') {
        msg = "Usuário não encontrado.";
      } else if (err.code === 'auth/wrong-password') {
        msg = "Senha incorreta.";
      } else if (err.code === 'auth/too-many-requests') {
        msg = "Muitas tentativas. Tente novamente mais tarde.";
      }
      
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <div className="flex justify-center mb-4">
           <img src="/Logo-2-thin 1.png" alt="Logo" className="h-12" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-6 text-black">
          Acesso Administrativo
        </h1>
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 text-black"
              disabled={isLoading}
              required
            />
          </div>
    
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Senha
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 text-black"
              disabled={isLoading}
              required
            />
          </div>
         
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-red-600 text-sm text-center font-medium">{error}</p>
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center items-center"
            disabled={isLoading}
          >
             {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verificando...
                </>
             ) : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;