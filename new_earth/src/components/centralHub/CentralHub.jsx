import React from "react";
import { Link } from "react-router-dom";
import "./CentralHub.css";
import goldCross from "../../assets/goldcross.png";

const CentralHub = () => {
  const navigationPages = [
    "Faith & Worship",
    "Education & Knowledge",
    "Family & Community Life",
    "Governance & Justice",
    "Economy & Work",
    "Health & Well-being",
    "Agriculture & Food Security",
    "Technology & Innovation",
    "Art & Music",
    "Service & Charity",
    "Environment & Creation Care",
    "Defense & Safety",
  ];

  return (
    <div className="central-hub">
      {/* Central gold cross with glowing circle */}
      <div className="central-element">
        <div className="glowing-circle">
          <a
            href="https://www.bible.com"
            target="_blank"
            rel="noopener noreferrer"
            className="gold-cross-link"
          >
            <img src={goldCross} alt="Gold Cross" className="gold-cross" />
          </a>
        </div>
      </div>

      {/* 12 Navigation circles */}
      <div className="navigation-circles">
        {navigationPages.slice(0, 12).map((pageName, index) => {
          // Create URL-friendly paths from page names
          const path = `/${pageName
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/&/g, "and")}`;

          return (
            <Link
              key={pageName}
              to={path}
              className={`nav-circle nav-circle-${index + 1}`}
            >
              <span className="nav-label">{pageName}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CentralHub;
