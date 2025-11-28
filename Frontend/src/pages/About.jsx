// src/components/About.jsx
import React from "react";
import "./about.css";

// Import local images from assets folder
import p1 from "../assets/p1.jpg";
import p2 from "../assets/p2.jpg";
import p3 from "../assets/p3.jpg";
import p4 from "../assets/p4.jpg";
import p5 from "../assets/p5.jpg";
import p6 from "../assets/p6.jpg";

const About = () => {
  return (
    <div>

      {/* Hero Section */}
      <header className="hero">
        <div className="hero-content">
          <h1>About ChildGuard</h1>
          <p>Protecting Children, Building Futures</p>
        </div>
      </header>

      {/* Mission Section */}
      <section className="section mission">
        <div className="content">
          <h2>Our Mission</h2>
          <p>
            ChildGuard is a community-driven platform designed to protect children 
            from child labor and support their education through sponsorships. We connect 
            parents, volunteers, sponsors, and NGOs to create a safe and bright future 
            for every child.
          </p>
        </div>
        <img src={p1} alt="Children in classroom, symbolizing educational support" />
      </section>

      {/* Vision Section */}
      <section className="section vision">
        <img src={p2} alt="Community volunteers engaging with children" />
        <div className="content">
          <h2>Our Vision</h2>
          <p>
            A world where no child is deprived of education due to poverty. We envision 
            a society empowered with awareness, compassion, and digital tools to fight 
            child labor effectively.
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section className="services">
        <h2>What We Do</h2>

        <div className="cards">

          <div className="card">
            <img src={p3} alt="Child learning with sponsor support" />
            <h3>Educational Sponsorship</h3>
            <p>We connect deserving children with sponsors who support their education.</p>
          </div>

          <div className="card">
            <img src={p4} alt="Child labor awareness campaign" />
            <h3>Child Labor Reporting</h3>
            <p>Anonymous reporting system to help reduce child labor in communities.</p>
          </div>

          <div className="card">
            <img src={p5} alt="Volunteers helping children" />
            <h3>Volunteer Participation</h3>
            <p>Volunteers support NGOs with field visits and awareness campaigns.</p>
          </div>

          <div className="card">
            <img src={p6} alt="Children participating in educational activities" />
            <h3>Community Engagement</h3>
            <p>Empowering children and families through workshops and programs.</p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 ChildGuard — Protecting Children, Building Futures</p>
      </footer>

    </div>
  );
};

export default About;
