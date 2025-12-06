import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./pages/Layout";
import ProtectedRoute from "./pages/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Makers from "./modules/web/pages/Makers";
import MakerProducts from "./modules/web/pages/MakerProducts";
import Products from "./modules/web/pages/Products";
import MakerForm from "./modules/web/components/MakerForm";
import ProductForm from "./modules/web/components/ProductForm";
import NotFound from "./pages/NotFound/NotFound";
import Devolutions from "./modules/app/pages/Devolutions";

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

          <Route path="devolutions" element={<Devolutions />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;