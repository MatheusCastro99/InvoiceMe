import { Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CreatePage from "./pages/CreatePage";
import EditPage from "./pages/EditPage";
import InvoicePage from "./pages/InvoicePage";
import PdfPage from "./pages/PdfPage";
import ProfilePage from "./pages/ProfilePage";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import companyLogo from "./assets/KenTechIcon.ico";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {fas} from "@fortawesome/free-solid-svg-icons"

const App = () => {
  return (
      <div className="main h-full">
        <nav className="bg-gray-800 sticky top-0">
          <div className="mx-auto p-2 flex justify-between items-center divBar">
            <Link to={"/"}><img src={companyLogo} className="logo inline-flex "></img></Link>
            <Link to="/"><h2 className="linkNav inline-flex transition ease-in-out duration-300 hover:scale-110">Ken-Tech Maintenance</h2></Link>
            <a href=""><FontAwesomeIcon icon={fas.faHouse} className="fa-xl white inline-flex transition ease-in-out duration-300 hover:scale-125" style={{color:"white"}}></FontAwesomeIcon></a>
          </div>
        </nav>
        <div className="container mx-auto p-2 h-full">
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="create" element={<CreatePage/>} />
          <Route path="edit/:id" element={<EditPage/>} />
          <Route path="invoice" element={<InvoicePage/>} />
          <Route path="pdfPage" element={<PdfPage/>} />
          <Route path="profilePage/:id" element={<ProfilePage/>} />
        </Routes>
        </div>
        <ToastContainer />
      </div>
  );
}

export default App;
