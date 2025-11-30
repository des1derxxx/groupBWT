import { Outlet, useLocation } from "react-router-dom";
import Header from "./header/Header";

const Layout = () => {
  const location = useLocation();
  const hideHeaderPaths = ["/login", "/register"];
  const showHeader = !hideHeaderPaths.includes(location.pathname);

  return (
    <>
      {showHeader && <Header />}
      <main id="main">
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
