// The white band at the top of each page: small label, title, subtitle
// and optional buttons on the right (passed as children).
function PageHeader({ label, title, subtitle, children }) {
  return (
    <header className="page-header">
      <div>
        {label && <p className="page-label">{label}</p>}

        <h1>{title}</h1>

        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>

      {children && <div className="page-actions">{children}</div>}
    </header>
  );
}

export default PageHeader;
