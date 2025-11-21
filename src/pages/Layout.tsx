import { NavLink, Outlet, useNavigate } from "react-router-dom";

const Layout: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        navigate("/login");
    };

    const linkClasses =
        "block px-4 py-2 rounded-md text-gray-700 hover:bg-gray-200";
    const activeLinkClasses = "bg-blue-500 text-white hover:bg-blue-500";

    return (
        <div className="flex min-h-screen bg-gray-50">
            <aside className="w-64 bg-white border-r p-4">
                <div className="flex flex-col justify-center items-center">
                    <img src="/Logo-2-thin 1.png" alt="" />
                    <h1 className="text-2xl font-bold mb-8 text-black">
                        Admin R3D
                    </h1>
                </div>
                <nav className="flex flex-col gap-2">
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            `${linkClasses} ${
                                isActive ? activeLinkClasses : ""
                            }`
                        }
                    >
                        Dashboard
                    </NavLink>
                    <NavLink
                        to="/makers"
                        className={({ isActive }) =>
                            `${linkClasses} ${
                                isActive ? activeLinkClasses : ""
                            }`
                        }
                    >
                        Makers
                    </NavLink>
                    <NavLink
                        to="/products"
                        className={({ isActive }) =>
                            `${linkClasses} ${
                                isActive ? activeLinkClasses : ""
                            }`
                        }
                    >
                        Produtos
                    </NavLink>
                    <NavLink
                        to="/devolutions"
                        className={({ isActive }) =>
                            `${linkClasses} ${
                                isActive ? activeLinkClasses : ""
                            }`
                        }
                    >
                        Devoluções
                    </NavLink>
                </nav>
                <div className="mt-auto pt-8">
                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 rounded-md text-red-600 hover:bg-red-100"
                    >
                        Sair
                    </button>
                </div>
            </aside>
            <main className="flex-1 p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
