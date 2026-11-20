import { Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CreatePage from "./pages/CreatePage";
import EditPage from "./pages/EditPage";
import InvoicePage from "./pages/InvoicePage";
import PdfPage from "./pages/PdfPage";
import ProfilePage from "./pages/ProfilePage";
import SignInPage from "./pages/SignInPage";
import RequireAuth from "./components/RequireAuth";
import { useAuth } from "./utils/useAuth";
import { Button } from "@mui/material";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import companyLogo from "./assets/InvoiceMeIcon.ico";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import { faHouse } from "@fortawesome/free-solid-svg-icons"

const App = () => {
  const { status, name, signOut } = useAuth();

  return (
      <div className="main h-full">
        <nav className="bg-gray-800 sticky top-0">
          <div className="mx-auto p-2 flex justify-between items-center divBar">
            <Link to={"/"}><img src={companyLogo} className="logo inline-flex "></img></Link>
            <Link to="/"><h2 className="linkNav inline-flex transition ease-in-out duration-300 hover:scale-110">InvoiceMe Solutions</h2></Link>
            <div className="flex items-center gap-4">
              {status === "signedIn" && (
                <>
                  <span className="hidden max-w-40 truncate text-sm font-medium text-white sm:inline" title={name}>{name}</span>
                  <Button variant="outlined" size="small" className="border-white! text-white! hover:bg-white/10! normal-case! font-medium! whitespace-nowrap" onClick={signOut}>Sign out</Button>
                </>
              )}
              <a href=""><FontAwesomeIcon icon={faHouse} className="fa-xl white inline-flex transition ease-in-out duration-300 hover:scale-125" style={{color:"white"}}></FontAwesomeIcon></a>
            </div>
          </div>
        </nav>
        <div className="container mx-auto p-2 h-full">
        <Routes>
          <Route path="signin" element={<SignInPage/>} />
          <Route element={<RequireAuth/>}>
            <Route index element={<HomePage />} />
            <Route path="create" element={<CreatePage/>} />
            <Route path="edit/:id" element={<EditPage/>} />
            <Route path="invoice" element={<InvoicePage/>} />
            <Route path="pdfPage" element={<PdfPage/>} />
            <Route path="profilePage/:id" element={<ProfilePage/>} />
          </Route>
        </Routes>
        </div>
        <ToastContainer />
      </div>
  );
}

export default App;
