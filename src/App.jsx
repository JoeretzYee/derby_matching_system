import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-vh-100 bg-blue d-flex flex-column">
      <Header />
      <main className="flex-grow-1 flex-shrink-0 flex-auto">
        <br />
        <div className="container ">
          <div className="row d-flex align-items-center">
            {/* Select Dropdown */}
            <div className="col-auto">
              <select
                className="form-select"
                style={{ width: "300px" }} // Set a fixed width for the select dropdown
                aria-label="Default select example"
              >
                <option selected>Open this select menu</option>
                <option value="1">One</option>
                <option value="2">Two</option>
                <option value="3">Three</option>
              </select>
            </div>

            {/* Buttons aligned to the right */}
            <div className="col d-flex justify-content-end">
              <button className="btn btn-md btn-primary me-2">Add</button>
              <button className="btn btn-md btn-success">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
