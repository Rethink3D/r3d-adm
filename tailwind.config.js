/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        fundo: {
          principal: "var(--cor-fundo-principal)",
          secundario: "var(--cor-fundo-secundario)",
        },
        texto: {
          principal: "var(--cor-texto-principal)",
          secundario: "var(--cor-texto-secundario)",
        },
        borda: {
          padrao: "var(--cor-borda)",
        },
        gradiente: {
          "logo-1": "var(--cor-gradiente-logo-1)",
          "logo-2": "var(--cor-gradiente-logo-2)",
        },
      },
      backgroundImage: {
        'gradiente-borda-botao': 'var(--gradiente-botoes)',
      },
    },
  },
  plugins: [],
};