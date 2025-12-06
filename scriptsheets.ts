const submissions: { nome: string; email: string }[] = [];

const handleExport = () => {
  if (submissions.length === 0) {
    alert("Não há dados para exportar.");
    return;
  }

  const headers = "Nome,Email\n";

  const csvContent = submissions
    .map((entry) => `"${entry.nome}","${entry.email}"`)
    .join("\n");

  const csvData = headers + csvContent;
  const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "dados_formulario.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
