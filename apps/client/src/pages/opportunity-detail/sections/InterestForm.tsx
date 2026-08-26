import "./InterestForm.css";
export function InterestForm() {
  return (
    <section className="section interest-concept">
      <div className="shell interest-grid">
        <div>
          <p className="eyebrow">Register interest</p>
          <h2>When this experience is live, we’ll help you take the next step.</h2>
        </div>
        <form className="interest-form">
          <label>Name<input disabled placeholder="Your name" /></label>
          <label>Email<input disabled placeholder="you@example.com" /></label>
          <label>Phone<input disabled placeholder="Your phone number" /></label>
          <label>Budget<select disabled><option>Select a range</option></select></label>
          <label>Preferred contact method<select disabled><option>Select a preference</option></select></label>
          <label>Timeline<select disabled><option>Select a timeline</option></select></label>
          <button className="button button--primary" disabled>Register interest</button>
        </form>
      </div>
    </section>
  );
}
