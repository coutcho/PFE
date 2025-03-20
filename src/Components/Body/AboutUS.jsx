import 'bootstrap/dist/css/bootstrap.min.css';
import './aboutus.css'
import '@fortawesome/fontawesome-free/css/all.min.css';

function AboutUS() {
  return (
    <div className="container-fluid p-0">
      {/* Hero Section */}
      <div className="bg-primary text-white py-5">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h1 className="display-4 fw-bold">À propos de nous</h1>
              <p className="lead">Votre partenaire de confiance dans la recherche de la maison parfaite depuis 1995</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container my-5">
        <div className="row">
          <div className="col-lg-6">
            <h2 className="mb-4">Notre Histoire</h2>
            <p className="lead">Avec plus de 25 ans d'expérience sur le marché immobilier, LuxuryHomes Realty aide les familles à trouver la maison de leurs rêves et les investisseurs à prendre des décisions immobilières judicieuses.</p>
            <p>Nous sommes fiers de notre connaissance approfondie du marché local, de notre engagement envers l'excellence et de notre approche personnalisée pour répondre aux besoins de chaque client.</p>
          </div>
          <div className="col-lg-6">
            <div className="bg-light p-4 rounded ms-lg-5">
              <h3 className="mb-3">Pourquoi nous choisir ?</h3>
              <ul className="list-unstyled">
                <li className="mb-3">
                  <i className="fas fa-check-circle text-primary me-2"></i>
                  Connaissance experte du marché
                </li>
                <li className="mb-3">
                  <i className="fas fa-check-circle text-primary me-2"></i>
                  Service personnalisé
                </li>
                <li className="mb-3">
                  <i className="fas fa-check-circle text-primary me-2"></i>
                  Équipe primée
                </li>
                <li className="mb-3">
                  <i className="fas fa-check-circle text-primary me-2"></i>
                  Réseau immobilier étendu
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="row mt-5">
          <div className="col-12">
            <h2 className="text-center mb-5">Notre Équipe de Direction</h2>
          </div>
          <div className="col-lg-4 mb-4">
            <div className="card text-center">
              <div className="card-body">
                <i className="fas fa-user-circle fa-4x text-primary mb-3"></i>
                <h5 className="card-title">John Smith</h5>
                <p className="card-text text-muted">PDG et Fondateur</p>
                <p className="card-text">Plus de 20 ans d'expertise immobilière</p>
              </div>
            </div>
          </div>
          <div className="col-lg-4 mb-4">
            <div className="card text-center">
              <div className="card-body">
                <i className="fas fa-user-circle fa-4x text-primary mb-3"></i>
                <h5 className="card-title">Sarah Johnson</h5>
                <p className="card-text text-muted">Directrice des Ventes</p>
                <p className="card-text">Plus de 15 ans d'expérience en vente</p>
              </div>
            </div>
          </div>
          <div className="col-lg-4 mb-4">
            <div className="card text-center">
              <div className="card-body">
                <i className="fas fa-user-circle fa-4x text-primary mb-3"></i>
                <h5 className="card-title">Michael Brown</h5>
                <p className="card-text text-muted">Gestionnaire Immobilier</p>
                <p className="card-text">Plus de 12 ans en gestion immobilière</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="row mt-5 text-center bg-light py-5 rounded">
          <div className="col-md-3 mb-3">
            <h3 className="display-4 fw-bold text-primary">500+</h3>
            <p className="text-muted">Propriétés Vendues</p>
          </div>
          <div className="col-md-3 mb-3">
            <h3 className="display-4 fw-bold text-primary">1000+</h3>
            <p className="text-muted">Clients Satisfaits</p>
          </div>
          <div className="col-md-3 mb-3">
            <h3 className="display-4 fw-bold text-primary">25+</h3>
            <p className="text-muted">Années d'Expérience</p>
          </div>
          <div className="col-md-3 mb-3">
            <h3 className="display-4 fw-bold text-primary">50+</h3>
            <p className="text-muted">Agents Experts</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUS;