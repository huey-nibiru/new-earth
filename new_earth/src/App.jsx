import { useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Art from "./pages/art/art";
import Faith from "./pages/faith/faith";
import Education from "./pages/education/education";
import Family from "./pages/family/family";
import Governance from "./pages/governance/governance";
import Economy from "./pages/economy/economy";
import Health from "./pages/health/health";
import Agriculture from "./pages/agriculture/agriculture";
import Technology from "./pages/technology/technology";
import Service from "./pages/service/service";
import Environment from "./pages/environment/environment";
import Defense from "./pages/defense/defense";
import Settings from "./pages/settings/settings";
import About from "./pages/about/about";
import Navbar from "./components/navBar/NavBar";
import Home from "./pages/home/home";
import Landing from "./pages/landing/landing";
import audioFile from "./assets/Endless ᐸ3 - Machinedrum.mp3";
import "./App.css";

function App() {
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
  // FOR LANDING PAGE AUDIO ONLY------------------------------------------------

  return (
    <Router>
      <div className="App">
        {/* FOR LANDING PAGE AUDIO ONLY---------------------------------- */}
        <audio ref={audioRef} src={audioFile} loop />
        {/* FOR LANDING PAGE AUDIO ONLY---------------------------------- */}
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          {/* <Route path="/" element={<Home />} /> */}
          <Route path="/about" element={<About />} />
          <Route path="/faith-and-worship" element={<Faith />} />
          <Route path="/education-and-knowledge" element={<Education />} />
          <Route path="/family-and-community-life" element={<Family />} />
          <Route path="/governance-and-justice" element={<Governance />} />
          <Route path="/economy-and-work" element={<Economy />} />
          <Route path="/health-and-well-being" element={<Health />} />
          <Route
            path="/agriculture-and-food-security"
            element={<Agriculture />}
          />
          <Route path="/technology-and-innovation" element={<Technology />} />
          <Route path="/art-and-music" element={<Art />} />
          <Route path="/service-and-charity" element={<Service />} />
          <Route
            path="/environment-and-creation-care"
            element={<Environment />}
          />
          <Route path="/defense-and-safety" element={<Defense />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
