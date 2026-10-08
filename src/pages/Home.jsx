import { Link } from "react-router-dom";
import "./Home.css";

import TopNav from "../components/TopNav";

const steps = [
  {
    title: "Tell us about your car",
    text: "Enter your name, phone number and your car's details. No account needed.",
  },
  {
    title: "Pick a service center",
    text: "Choose a center, the service you need, and a date and time.",
  },
  {
    title: "Track your booking",
    text: "Use your booking number to see when it is confirmed and completed.",
  },
];

function Home() {
  return (
    <div className="home">
      <TopNav />

      <section className="home-hero">
        <div className="home-hero-inner">
          <p className="home-label">Car Repair Booking System</p>

          <h1>Book your car repair without the phone calls.</h1>

          <p className="home-lead">
            CarCare lets you choose a service center, pick a time that suits
            you, and follow your booking from request to completion.
          </p>

          <div className="home-actions">
            <Link to="/book" className="primary-btn">
              Book a service
            </Link>

            <Link to="/track" className="home-secondary">
              Track a booking
            </Link>
          </div>
        </div>
      </section>

      <section className="home-steps">
        <h2>How it works</h2>

        <div className="home-steps-grid">
          {steps.map((step, index) => (
            <div key={step.title} className="home-step">
              <span className="home-step-number">{index + 1}</span>

              <h3>{step.title}</h3>

              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="home-footer">Car Repair Booking System</footer>
    </div>
  );
}

export default Home;
