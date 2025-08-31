export default function TestPage() {
  return (
    <div className="min-h-screen bg-blue-500 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-6">
          Teste de Estilização
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Card 1</h2>
            <p className="text-gray-600">
              Este é um teste para verificar se o Tailwind CSS está funcionando.
            </p>
          </div>

          <div className="bg-green-500 p-6 rounded-lg shadow-lg text-white">
            <h2 className="text-xl font-semibold mb-4">Card 2</h2>
            <p>Se você ver este card verde, o Tailwind está funcionando!</p>
          </div>

          <div className="bg-red-500 p-6 rounded-lg shadow-lg text-white">
            <h2 className="text-xl font-semibold mb-4">Card 3</h2>
            <p>Card vermelho para teste.</p>
          </div>
        </div>

        <div className="mt-8 bg-yellow-400 p-4 rounded-lg">
          <p className="text-center text-gray-800 font-medium">
            Se você vê esta barra amarela, o Tailwind CSS está funcionando
            corretamente!
          </p>
        </div>
      </div>
    </div>
  );
}
