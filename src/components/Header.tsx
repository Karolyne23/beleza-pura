export default function Header() {
  return (
    <header className="w-full bg-white shadow p-4 flex justify-between items-center fixed top-0 left-0 md:ml-64 z-10">
      <h1 className="text-lg font-semibold text-[#A06D52]">Bem-vindo(a)</h1>
      <div className="flex items-center gap-2">
        <img src="https://i.pravatar.cc/40" alt="Avatar" className="w-10 h-10 rounded-full" />
        <span className="font-medium">Nome da Usuária</span>
      </div>
    </header>
  );
}
