import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./pages/Layout";
import ProtectedRoute from "./pages/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Makers from "./pages/Makers";
import MakerProducts from "./pages/MakerProducts";
import Products from "./pages/Products";
import MakerForm from "./pages/components/MakerForm";
import ProductForm from "./pages/components/ProductForm";
import NotFound from "./pages/NotFound/NotFound";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          <Route path="dashboard" element={<Dashboard />} />
          
          <Route path="makers" element={<Makers />} />
          <Route path="makers/new" element={<MakerForm />} />
          <Route path="makers/edit/:id" element={<MakerForm />} />
          <Route path="makers/:makerId/products" element={<MakerProducts />} />

          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;