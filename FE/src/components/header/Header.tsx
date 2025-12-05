import { Burger, Collapse, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link, useLocation, useNavigate } from "react-router-dom";
import classes from "./Header.module.css";

const links = [
  { link: "/gallery", label: "Галерея" },
  { link: "/profile", label: "Профиль" },
];

const Header = () => {
  const navigate = useNavigate();
  const [opened, { toggle }] = useDisclosure(false);
  const location = useLocation();

  const items = links.map((link) => (
    <Link
      key={link.label}
      to={link.link}
      className={classes.link}
      data-active={location.pathname === link.link || undefined}
    >
      {link.label}
    </Link>
  ));

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <>
      <header className={classes.header}>
        <div className={classes.inner}>
          <div className={classes.logo}>Ralo Ivan</div>

          <Group gap={5} visibleFrom="xs">
            {items}
          </Group>

          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="xs"
            size="sm"
            className={classes.burger}
          />
        </div>
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all duration-300"
        >
          Выйти
        </button>
      </header>
      <Collapse in={opened} className={classes.mobileCollapse}>
        <div className={classes.mobileMenu}>{items}</div>
      </Collapse>
    </>
  );
};

export default Header;
