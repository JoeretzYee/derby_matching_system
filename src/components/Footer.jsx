import React from "react";

function Footer() {
  return (
    <footer className="bg-dark text-white py-3">
      <div className="container text-center">
        <p className="mb-0">
          &copy; {new Date().getFullYear()} Matching System. All Rights
          Reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
