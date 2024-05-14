import React, { useState, useEffect } from "react";

import axios, { AxiosResponse } from "axios"
import { Cart } from "../@types/payment";
import { APIContextType } from "../@types/APIContextType";

import { useAuth } from "../pages/authenticator/AuthContext";

import Symbols from "../data/Symbols.json";
import CoinMarketCapData from "../data/CoinMarketCapData.json";

const APIContext = React.createContext<APIContextType | null>(null);

const SERVER_URL = "http://localhost:1024"

export const APIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { doAction, doAuth } = useAuth();

    const [symbols, setSymbols] = useState(Symbols.symbols);
    const reloadPricesTime = 10000;


    function getPair(symbol) {
        return Object.values(symbols).filter(s => s.symbol == symbol)[0];
    }

    function getPairPrice(symbol) {
        const pair = getPair(symbol);

        return pair === undefined || pair["price"] === undefined ? -1 : pair["price"];
    }

    function getTokenInfo(token) {
        return CoinMarketCapData["data"][token.toUpperCase()][0];
    }

    function filterPairs(regex = "", quoteRegex = "") {
        if (symbols == null)
            return [];

        return Object.values(symbols).filter(s =>
            (s.baseAssetName.toUpperCase().startsWith(regex.toUpperCase()) || s.symbol.startsWith(regex.toUpperCase()))
            && s.quoteAsset.startsWith(quoteRegex));
    }

    useEffect(() => {
        const loadPrices = async () => {
            try {
                const responsePrices = await axios.get('http://localhost:1024/prices');
                const dataPrices = responsePrices.data;

                console.log("Updating prices " + new Date().toLocaleString());
                const symbolsWithPrice = Symbols.symbols.map(s => {
                    const priceData = dataPrices.find(price => price.symbol === s.symbol);
                    const price = priceData ? parseFloat(priceData.price).toFixed(s.decimalPlaces) : "-";

                    return {
                        ...s,
                        price: price
                    };
                });

                setSymbols(symbolsWithPrice);
            } catch (error) {
                console.error('Error fetching prices:', error);
            }
        };

        loadPrices();

        const intervalId = setInterval(() => {
            loadPrices();
        }, reloadPricesTime);

        return () => clearInterval(intervalId);
    }, []);

    const get = async (url: String) =>
        await axios.get(SERVER_URL + url, {
            withCredentials: true,
        });

    const post = async (url: String, parameters: Object) =>
        await axios.post(SERVER_URL + url, parameters, {
            withCredentials: true,
        });


    async function trade(symbol, quantity, type) {
        const response = await post("/trade", {
            symbol: symbol,
            quantity: quantity,
            type: type,
        });
        if (response.data.status === "1") await doAuth();

        return response;
    }

    const buyProduct = async (buy: Cart) => await post("/payment", buy);
    const doTradeHistory = async () => await doAction(async () => await get("/trade_history"));
    const doTrade = async (symbol, quantity, type) => await doAction(() => trade(symbol, quantity, type));

    return (
        <APIContext.Provider value={{
            buyProduct,
            doTradeHistory,
            doTrade,
            getPair,
            getPairPrice,
            getTokenInfo,
            filterPairs,
        }}>
            {children}
        </APIContext.Provider>
    );
}

export const useAPI: () => APIContextType | null = () => React.useContext(APIContext);