import { useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Faith from "./pages/faith/faith";

import Settings from "./pages/settings/settings";
import Profile from "./pages/profile/profile";
import About from "./pages/about/about";
import Navbar from "./components/navBar/NavBar";
import Home from "./pages/home/home";

import "./App.css";

function App() {
  {
    /*
  // FOR LANDING PAGE AUDIO ONLY
  const audioRef = useRef(null);

  
  useEffect(() => {
    // FOR LANDING PAGE AUDIO ONLY------------------------------------------------
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        // Handle autoplay restrictions (browsers may block autoplay)
        console.log("Autoplay prevented:", error);
      });
    }
  }, []);
  // FOR LANDING PAGE AUDIO ONLY-----------------------------------------------
  */
  }
  return (
    <Router>
      <div className="App">
        {/* FOR LANDING PAGE AUDIO ONLY---------------------------------- 
        <audio ref={audioRef} src={audioFile} loop />
         FOR LANDING PAGE AUDIO ONLY---------------------------------- */}
        <Navbar />
        <Routes>
          {/*<Route path="/" element={<Landing />} />*/}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/faith-and-worship" element={<Faith />} />

          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
