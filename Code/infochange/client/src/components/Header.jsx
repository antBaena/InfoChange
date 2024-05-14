import { useState } from "react";
import banner from "../assets/banner.png";
import { Link } from "react-router-dom";
import { Person } from "react-bootstrap-icons";
import { useAuth } from "../pages/authenticator/AuthContext";

export default function Header() {
    const { getActualUser, doLogout } = useAuth();

    let items = [
        { link: "", name: "Inicio" },
        { link: "coins", name: "Monedas" },
        { link: "trading", name: "Trading" },
        { link: "dashboard", name: "Panel de control" },
    ];

    // Dropdown show?
    const [show, setShow] = useState(false);
    const user = getActualUser();
    if (user !== null && user.profile.name === "admin")
        items = [...items, { link: "admin", name: "Admin" }];

    return (
        <header>
            <nav className="navbar navbar-expand-lg bg-body-tertiary">
                <div className="container-fluid">
                    <a className="navbar-brand" href="#">
                        <img
                            src={banner}
                            alt="InfoChange"
                            width="200"
                            height="50"
                        />
                    </a>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarScroll"
                        aria-controls="navbarScroll"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarScroll">
                        <ul className="navbar-nav me-auto my-2 my-lg-0 navbar-nav-scroll">
                            {items.map((v) => item(v.link, v.name))}
                        </ul>
                        {user === null ? (
                            <div className="d-flex justify-content-between">
                                <Link to="/login">
                                    <button className="btn btn-outline-primary me-2">
                                        Iniciar Sesión
                                    </button>
                                </Link>
                                <Link to="/register">
                                    <button className="btn btn-primary">
                                        Registrarse
                                    </button>
                                </Link>
                            </div>
                        ) : (
                            <div className="d-flex justify-content-between">
                                <div className="dropdown me-2">
                                    <button
                                        className="btn btn-outline-primary dropdown-toggle d-flex align-items-center"
                                        role="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                        onClick={() => setShow(!show)}
                                    >
                                        <Person className="me-2 fs-4" />{" "}
                                        {user.profile.username}
                                    </button>

                                    <ul className="dropdown-menu">
                                        <li>
                                            <Link
                                                to={"/dashboard"}
                                                className="dropdown-item"
                                            >
                                                Panel de control
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                                <button
                                    className="btn btn-primary"
                                    onClick={doLogout}
                                >
                                    Cerrar Sesión
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
}

const item = (link, name) => {
    console.log(document.URL.split("/")[3].toLowerCase(), link.toLowerCase(), document.URL.split("/")[3].toLowerCase() === link.toLowerCase());
    return (
        <li key={link} className="nav-item">
            <Link
                className={
                    "nav-link text-dark" +
                    (document.URL.split("/")[3].toLowerCase() === link.toLowerCase() ? " active fw-bold" : "")
                }
                to={"/" + link}
            >
                {name}
            </Link>
        </li>
    );
};
