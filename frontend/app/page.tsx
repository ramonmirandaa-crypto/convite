export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-6xl font-bold mb-4 text-primary-600">
          Convite de Casamento
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Bem-vindo ao nosso sistema de convite digital
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <a
            href="/welcome"
            className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 px-8 rounded-lg transition-colors"
          >
            Bem-vindos
          </a>
          <a
            href="/rsvp"
            className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 px-8 rounded-lg transition-colors"
          >
            Confirmar Presença
          </a>
          <a
            href="/gifts"
            className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 px-8 rounded-lg transition-colors"
          >
            Lista de Presentes
          </a>
          <a
            href="/contact"
            className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 px-8 rounded-lg transition-colors"
          >
            Contato
          </a>
        </div>
      </div>
    </main>
  )
}