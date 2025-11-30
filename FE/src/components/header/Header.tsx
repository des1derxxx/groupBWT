import { Burger, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link, useLocation } from "react-router-dom";
import classes from "./Header.module.css";

const links = [
  { link: "/gallery", label: "Галерея" },
  { link: "/profile", label: "Профиль" },
];

const Header = () => {
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

  return (
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
    </header>
  );
};

export default Header;
