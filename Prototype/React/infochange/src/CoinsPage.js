import React from "react";
import { useCoins } from "./contexts/CoinContext";
import Coins from "./data/Coins.json";

function CoinsPage() {
    const { getTokenInfo, getSymbols } = useCoins();
    const faviconUrl = process.env.PUBLIC_URL + '/favicon.ico';

    /*const topCoins = [
        "BTC",
        "ETH",
        "BNB",
        "SOL",
        "XRP",
        "DOGE",
        "ADA",
        "AVAX",
        "SHIB",
        "DOT"
    ];

    const coinsObject = topCoins.map(coin => {
        const coinInfo = getTokenInfo(coin);

        return (
            <div className="d-flex align-items-center">
                <a href={"./price/" + coin.toUpperCase() + "USDT"} className="text-decoration-none">
                    <div className="container mt-2">
                        <img src={coinInfo == null ? "" : coinInfo.logo} className="img-fluid me-2 img-thumbnail"
                            style={{ width: '50px', height: '50px' }} onError={(e) => { e.target.src = faviconUrl; }} alt="Logo" />
                        <span className="text-dark h5 m-0">
                            {coinInfo == null ? coin : coinInfo.name}
                        </span>
                        <span className="text-secondary h6 m-0 ms-2">
                            {coin}
                        </span>
                    </div>
                </a>
            </div>);
    });*/

    const allSymbols = getSymbols();

    let coinsObject = "";
    if (allSymbols != null) {
        const uniqueBaseAssets = {};
        const allSymbolsUSDT = Object.values(allSymbols)
            .filter(s => s.symbol.includes("USDT"))
            .reduce((uniqueSymbols, symbol) => {
                if (!uniqueBaseAssets[symbol.baseAsset]) {
                    uniqueBaseAssets[symbol.baseAsset] = true;
                    uniqueSymbols.push(symbol);
                }
                return uniqueSymbols;
            }, [])
            .sort((a, b) => parseFloat(b.price) - parseFloat(a.price));

        coinsObject = allSymbolsUSDT.map(symbol => {
            const coin = symbol.baseAsset;
            const coinInfo = getTokenInfo(coin);

            if (symbol != null) {
                return (
                    <div className="d-flex align-items-center" key={coin}>
                        <a href={"./price/" + coin.toUpperCase() + "USDT"} className="text-decoration-none">
                            <div className="container mt-2">
                                <img
                                    src={coinInfo ? coinInfo.logo : ""}
                                    className="img-fluid me-2 img-thumbnail"
                                    style={{ width: '50px', height: '50px' }}
                                    onError={(e) => { e.target.src = faviconUrl; }}
                                    alt="Logo"
                                />
                                <span className="text-dark h5 m-0">
                                    {coinInfo ? coinInfo.name : coin}
                                </span>
                                <span className="text-secondary h6 m-0 ms-2">
                                    {coin}
                                </span>
                                <span className="text-success h5 m-0 ms-2">
                                    ${parseFloat(symbol.price).toFixed(2)}
                                </span>
                            </div>
                        </a>
                    </div>
                );
            } else {
                return null;
            }
        });
    }




    return (
        <div>
            <header className="header bg-primary text-white py-3">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            <a href="/" style={{ color: 'inherit', textDecoration: 'none' }} className="text-nowrap">
                                <span className="h1 m-0">InfoChange</span>
                            </a>
                        </div>
                    </div>
                </div>
            </header>
            <div className="container mt-3">
                {coinsObject}
            </div>
        </div>
    )
}

export default CoinsPage;