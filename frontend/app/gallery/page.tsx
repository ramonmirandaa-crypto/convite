export default function Gallery() {
  const photos = [
    { id: 1, title: 'Ensaio Pré-Casamento', description: 'Momentos especiais do nosso ensaio' },
    { id: 2, title: 'Noivado', description: 'O dia em que nos comprometemos' },
    { id: 3, title: 'Família', description: 'Nossas famílias unidas' },
    { id: 4, title: 'Amigos', description: 'Com nossos melhores amigos' },
    { id: 5, title: 'Viagem', description: 'Nossa viagem juntos' },
    { id: 6, title: 'Momentos', description: 'Momentos inesquecíveis' },
  ]

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        <h1 className="text-5xl font-bold mb-6 text-primary-600 text-center">
          Galeria de Fotos
        </h1>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <p className="text-lg text-gray-700 mb-8 text-center">
            Confira alguns dos nossos momentos mais especiais
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  <span className="text-6xl">📸</span>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{photo.title}</h3>
                  <p className="text-gray-600">{photo.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <a
          href="/"
          className="inline-block mt-8 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Voltar ao Início
        </a>
      </div>
    </main>
  )
}