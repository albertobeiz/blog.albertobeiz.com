import Container from './container';

export default function Footer() {
  const listNames = ['Videojuegos', 'TV', 'Películas'];
  return (
    <footer className="bg-accent-1 border-t border-accent-2">
      <Container>
        <div className="py-8 flex flex-col lg:flex-row items-center">
          <div className="flex flex-col text-left">
            <h3 className="text-xl font-semibold text-left mb-1">Top 2022</h3>
            {listNames.map((listName) => (
              <a
                key={listName}
                href={`/top/${listName.toLowerCase()}`}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {listName}
              </a>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row justify-center items-center lg:pl-4 lg:w-1/2"></div>
        </div>
      </Container>
    </footer>
  );
}
