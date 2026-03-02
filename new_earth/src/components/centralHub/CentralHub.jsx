import React from "react";
import { Link } from "react-router-dom";
import "./CentralHub.css";
import goldCross from "../../assets/goldcross.png";

const CentralHub = () => {
  return (
    <div className="central-hub">
      {/* Central gold cross with glowing circle */}
      <div className="central-element">
        <div className="glowing-circle">
          <Link to="/faith-and-worship" className="gold-cross-link">
            <img src={goldCross} alt="Gold Cross" className="gold-cross" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CentralHub;
