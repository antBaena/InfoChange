import { useEffect, useState } from "react";

import { Navigate } from "react-router-dom";

import {
    PersonFill,
    Wallet2,
    LayoutTextSidebar,
    Send,
    Gear
} from "react-bootstrap-icons";
import Profile from "./windows/Profile";
import Wallet from "./windows/Wallet";
import History from "./windows/history/History";
import Bizum from "./windows/bizum/Bizum";
import Configuration from "./windows/Configuration";

import { useAuth } from "../authenticator/AuthContext";
import { useAPI } from "../../context/APIContext";

function Dashboard() {
    const { getActualUser } = useAuth();
    const { doTradeHistory, doPaymentHistory, doBizumHistory, doBizumUsers, doSwap } = useAPI();

    const [page, setPage] = useState(0);
    const [tradeHistory, setTradeHistory] = useState(undefined);
    const [paymentHistory, setPaymentHistory] = useState(undefined);
    const [bizumUsers, setBizumUserList] = useState(undefined);
    const [bizumHistory, setBizumHistory] = useState(undefined);

    const loadTradeHistory = async () => {
        const response = await doTradeHistory();
        if (response !== undefined && response.data.status === "1")
            setTradeHistory(response.data.tradeHistory);
    };

    const loadPaymentHistory = async () => {
        const paymentHistory = await doPaymentHistory();
        if (paymentHistory !== undefined && paymentHistory.data.status === "1")
            setPaymentHistory(paymentHistory.data.paymentHistory);
    }

    const loadBizumUsersAndHistory = async () => {
        const responseUsers = await doBizumUsers();
        if (responseUsers !== undefined && responseUsers.data.status === "1") {
            const users = responseUsers.data.users;
            setBizumUserList(users);

            const bizumHistory = await doBizumHistory();
            if (bizumHistory !== undefined && bizumHistory.data.status === "1")
                setBizumHistory(bizumHistory.data.bizumHistory);
        }
    }

    useEffect(() => {
        loadTradeHistory();
        loadPaymentHistory();
        loadBizumUsersAndHistory();
    }, [getActualUser()]);

    const user = getActualUser();

    if (user === null) {
        return <Navigate to={"/login"} />;
    }

    let pages = [
        <Profile profile={user.profile} />,
        <Wallet wallet={user.wallet ?? {}} />,
        <History
            tradeHistory={tradeHistory}
            paymentHistory={paymentHistory}
            bizumHistory={bizumHistory}
            bizumUsers={bizumUsers}
            user={user}
        />,
        <Bizum user={user} bizumUsers={bizumUsers} reload={loadBizumUsersAndHistory} />,
        <Configuration profile={user.profile} swap={doSwap} />
    ];

    const labels = ["Perfil", "Cartera", "Historial", "Bizum", "Configuración"];

    return (
        <div className="container">
            <section className="card my-4">
                <h1 className="text-center">Panel de control</h1>
            </section>
            <section className="row align-items-start">
                <aside className="col-md-3 col-12 mb-4">
                    <div className="list-group">
                        <button
                            type="button"
                            className={`list-group-item list-group-item-action ${page === 0 ? "active" : ""
                                } d-flex align-items-center`}
                            onClick={() => setPage(0)}
                        >
                            <PersonFill className="me-3" /> Perfil
                        </button>
                        <button
                            type="button"
                            className={`list-group-item list-group-item-action ${page === 1 ? "active" : ""
                                } d-flex align-items-center`}
                            onClick={() => setPage(1)}
                        >
                            <Wallet2 className="me-3" />
                            Cartera
                        </button>
                        <button
                            type="button"
                            className={`list-group-item list-group-item-action ${page === 2 ? "active" : ""
                                } d-flex align-items-center`}
                            onClick={() => setPage(2)}
                        >
                            <LayoutTextSidebar className="me-3" />
                            Historial
                        </button>
                        <button
                            type="button"
                            className={`list-group-item list-group-item-action ${page === 3 ? "active" : ""
                                } d-flex align-items-center`}
                            onClick={() => setPage(3)}
                        >
                            <Send className="me-3" />
                            Bizum
                        </button>
                        <button
                            type="button"
                            className={`list-group-item list-group-item-action ${page === 4 ? "active" : ""
                                } d-flex align-items-center`}
                            onClick={() => setPage(4)}
                        >
                            <Gear className="me-3" />
                            Ajustes
                        </button>
                    </div>
                </aside>
                <main className="col-md-9 col-12 mb-3">
                    <div className="card">
                        <div className="card-header text-center">
                            {labels[page]}
                        </div>
                        {pages[page]}
                    </div>
                </main>
            </section>
        </div>
    );
}

export default Dashboard;
