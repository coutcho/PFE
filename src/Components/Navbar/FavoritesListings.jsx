import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../Body/FavoritesContext'; // Ajuster le chemin si nécessaire
import PropertyCard from '../Body/PropertyCard';

function FavoritesPage() {
  const navigate = useNavigate();
  const { favorites } = useFavorites();

  const handleGoToSearch = () => {
    navigate('/listings');
  };

  const handleCardClick = (id) => {
    navigate(`/listing/${id}`);
  };

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center">
      <div className="container py-5">
        <h1 className="mb-4 text-center">Favoris</h1>
        
        {favorites.length === 0 ? (
          <div className="text-center">
            <h3 className="mb-4">
              Enregistrez tous vos logements favoris en un seul endroit.
            </h3>
            <button
              className="btn btn-warning btn-lg"
              onClick={handleGoToSearch}
            >
              Voir les Annonces
            </button>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {favorites.map((property) => (
              <div key={property.id} className="col">
                <PropertyCard 
                  property={property} 
                  onClick={() => handleCardClick(property.id)} // Passer le gestionnaire onClick
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FavoritesPage;