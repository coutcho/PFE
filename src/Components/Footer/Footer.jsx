import React from 'react';

function Footer() {
  return (
    <footer className="bg-dark text-light py-5 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-lg-8 mx-auto">
            <ul className="nav justify-content-center border-bottom pb-3 mb-4">
              <li className="nav-item">
                <a href="#" className="nav-link px-3 text-light hover-overlay">Home</a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link px-3 text-light">Features</a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link px-3 text-light">Pricing</a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link px-3 text-light">FAQs</a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link px-3 text-light">About</a>
              </li>
            </ul>
            <div className="text-center">
              <p className="mb-0">© 2024 Company, Inc. All rights reserved.</p>
              <div className="mt-3">
                <a href="#" className="text-light me-3"><i className="bi bi-facebook"></i></a>
                <a href="#" className="text-light me-3"><i className="bi bi-twitter"></i></a>
                <a href="#" className="text-light me-3"><i className="bi bi-instagram"></i></a>
                <a href="#" className="text-light"><i className="bi bi-linkedin"></i></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;