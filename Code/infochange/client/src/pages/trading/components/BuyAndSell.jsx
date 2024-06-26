import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useTrading } from "../context/TradingContext";
import { useAuth } from "../../authenticator/AuthContext";
import { useAPI } from "../../../context/APIContext";
import { BorderBottom } from "react-bootstrap-icons";

function BuyAndSell({ style = 1 }) {
  const [action, setAction] = useState(1);

  const navigate = useNavigate();

  const MAXVALUE = 1000000000000;

  const { getActualPair, getActualPairPrice } = useTrading();
  const { getAuthStatus, getActualUserWallet } = useAuth();
  const { doTrade } = useAPI();

  useEffect(() => {
    if (getAuthStatus() !== "-2" && getAuthStatus() !== "1") style = 0;
  }, [getAuthStatus()]);

  const actualUserWallet = getActualUserWallet();

  const getWalletAmount = (symbol) => {
    let balance = 0;

    if (actualUserWallet !== null) {
      const search = Object.values(actualUserWallet).filter(
        (w) => w.coin === symbol
      );
      if (search.length > 0) balance = search[0].quantity;
    }
    return parseFloat(balance.toFixed(8));
  };
  const tradingComision = 0.00065;

  const getBaseAsset = () => getActualPair()?.baseAsset || "";
  const showBaseAsset =
    style === 0 ? getActualPair().baseAssetName : getActualPair().baseAsset;

  const getQuoteAsset = () => getActualPair()?.quoteAsset || "";
  const showQuoteAsset = style === 0 ? "$" : " " + getActualPair().quoteAsset;
  const showQuoteDecimals = style === 0 ? 2 : 8;

  const [buyQuoteAssetInput, setBuyQuoteAssetInput] = useState("");
  const [buyBaseAssetInput, setBuyBaseAssetInput] = useState("");
  const [sellBaseAssetInput, setSellBaseAssetInput] = useState("");
  const [sellQuoteAssetInput, setSellQuoteAssetInput] = useState("");

  const [buyRangeValue, setBuyRangeValue] = useState(0);
  const [sellRangeValue, setSellRangeValue] = useState(0);

  const countDecimals = (number) => {
    const decimalIndex = number.indexOf(".");
    return decimalIndex === -1 ? 0 : number.length - decimalIndex - 1;
  };

  const updateInputValues = (
    value,
    setValueFunc,
    oppositeSetValueFunc,
    action,
    assetChanged
  ) => {
    const valueTrim = value.trim();
    const parsedValue = parseFloat(valueTrim);

    if (
      valueTrim.length == 0 ||
      (!isNaN(valueTrim) &&
        parsedValue >= 0 &&
        countDecimals(valueTrim) <= 8 &&
        parsedValue <= MAXVALUE)
    ) {
      setValueFunc(valueTrim);
      const oppositeValue =
        assetChanged === "BASE"
          ? valueTrim * getActualPairPrice()
          : valueTrim / getActualPairPrice();
      oppositeSetValueFunc(
        valueTrim.length == 0 ? "" : oppositeValue.toFixed(8)
      );

      const amountDisp = getWalletAmount(
        action === "BUY" ? getQuoteAsset() : getBaseAsset()
      );

      let rangeValue;
      if (amountDisp > 0) {
        if (action === "BUY" && assetChanged === "QUOTE")
          rangeValue = (100 * valueTrim) / amountDisp;
        else if (action === "BUY" && assetChanged === "BASE")
          rangeValue = (100 * valueTrim * getActualPairPrice()) / amountDisp;
        else if (action === "SELL" && assetChanged === "BASE")
          rangeValue = (100 * valueTrim) / amountDisp;
        else if (action === "SELL" && assetChanged === "QUOTE")
          rangeValue = (100 * (valueTrim / getActualPairPrice())) / amountDisp;

        rangeValue = Math.round(100 * rangeValue) / 100;
      } else {
        rangeValue = 1000;
      }

      if (action === "BUY")
        setBuyRangeValue(value.length == 0 ? 0 : rangeValue);
      else setSellRangeValue(value.length == 0 ? 0 : rangeValue);
    }
  };

  const handleBuyQuoteAsset = (event) =>
    updateInputValues(
      event.target.value,
      setBuyQuoteAssetInput,
      setBuyBaseAssetInput,
      "BUY",
      "QUOTE"
    );
  const handleBuyBaseAsset = (event) =>
    updateInputValues(
      event.target.value,
      setBuyBaseAssetInput,
      setBuyQuoteAssetInput,
      "BUY",
      "BASE"
    );
  const handleSellBaseAsset = (event) =>
    updateInputValues(
      event.target.value,
      setSellBaseAssetInput,
      setSellQuoteAssetInput,
      "SELL",
      "BASE"
    );
  const handleSellQuoteAsset = (event) =>
    updateInputValues(
      event.target.value,
      setSellQuoteAssetInput,
      setSellBaseAssetInput,
      "SELL",
      "QUOTE"
    );

  const handleRangeChange = (event, setValueFunc, asset, action) => {
    const rangeValue = parseInt(event.target.value);
    const newValue = (rangeValue / 100) * getWalletAmount(asset);

    setValueFunc(rangeValue);

    if (action === "BUY")
      updateInputValues(
        newValue == 0 ? "" : newValue.toFixed(8),
        setBuyQuoteAssetInput,
        setBuyBaseAssetInput,
        "BUY",
        "QUOTE"
      );
    else
      updateInputValues(
        newValue == 0 ? "" : newValue.toFixed(8),
        setSellBaseAssetInput,
        setSellQuoteAssetInput,
        "SELL",
        "BASE"
      );
  };

  const clearAmountInputs = () => {
    setBuyRangeValue(0);
    setSellRangeValue(0);
    updateInputValues("", setSellBaseAssetInput, setSellQuoteAssetInput);
    updateInputValues("", setBuyQuoteAssetInput, setBuyBaseAssetInput);
  };

  useEffect(() => {
    clearAmountInputs();
  }, [getActualPair(), actualUserWallet]);

  const showJustCloseModal = (title, message) => {
    const modal = new bootstrap.Modal(
      document.getElementById("just-close-modal")
    );
    const modalTitle = document.getElementById("just-close-modal-title");
    const modalBody = document.getElementById("just-close-modal-body");

    modalTitle.innerHTML = title;
    modalBody.innerHTML = message;

    modal.show();
  };

  const showTradeConfirmationModal = (title, message, onConfirm) => {
    const modal = new bootstrap.Modal(
      document.getElementById("trade-confirmation-modal")
    );
    const modalTitle = document.getElementById(
      "trade-confirmation-modal-title"
    );
    const modalBody = document.getElementById("trade-confirmation-modal-body");
    const tradeConfirmationButton = document.getElementById(
      "trade-confirmation-button"
    );

    tradeConfirmationButton.onclick = () => {
      modal.hide();
      onConfirm();
    };
    modalTitle.innerHTML = title;
    modalBody.innerHTML = message;

    modal.show();
    tradeConfirmationButton.focus();
  };

  const showTradeDoneToast = (title, message) => {
    const toast = new bootstrap.Toast(document.getElementById("trade-toast"), {
      autohide: true,
    });
    const toastTitle = document.getElementById("trade-toast-title");
    const toastBody = document.getElementById("trade-toast-body");

    toastTitle.innerHTML = title;
    toastBody.innerHTML = message;

    toast.show();
  };

  const performTransaction = async (paidAmount, action) => {
    const baseAsset = getBaseAsset();
    const quoteAsset = getQuoteAsset();

    const comission = paidAmount * tradingComision;
    const receivedAmount =
      (paidAmount - comission) *
      (action === "BUY" ? 1 / getActualPairPrice() : getActualPairPrice());
    const symbol = action === "BUY" ? quoteAsset : baseAsset;

    if (
      getActualPairPrice() <= 0 ||
      isNaN(receivedAmount) ||
      isNaN(paidAmount) ||
      paidAmount <= 0
    ) {
      showJustCloseModal(
        "Error",
        "El monto de la transacción introducido no es válido"
      );
      return;
    }

    if (getWalletAmount(symbol) < parseFloat(paidAmount.toFixed(8))) {
      showJustCloseModal(
        "Error",
        `No tienes suficientes ${action === "BUY" ? showQuoteAsset : showBaseAsset
        } `
      );
      return;
    }

    const transac = async () =>
      await doTransaction(paidAmount, receivedAmount, comission, action);
    if (style == 0) {
      if (action == "BUY")
        showTradeConfirmationModal(
          "¡ATENCIÓN!",
          `Estás a punto de comprar <b>${receivedAmount.toFixed(
            8
          )} ${showBaseAsset}</b>. ¿Estás seguro?`,
          transac
        );
      else
        showTradeConfirmationModal(
          "¡ATENCIÓN!",
          `Estás a punto de vender <b>${paidAmount.toFixed(
            8
          )} ${showBaseAsset}</b>. ¿Estás seguro?`,
          transac
        );
    } else transac();
  };

  const doTransaction = async (
    paidAmount,
    receivedAmount,
    comission,
    action
  ) => {
    const loadingScreen = document.getElementById("loading-screen");

    loadingScreen.style.display = "block";
    const response = await doTrade(getActualPair().symbol, paidAmount, action);
    loadingScreen.style.display = "none";

    if (response !== undefined && response.data.status === "1") {
      if (action === "BUY") {
        showTradeDoneToast(
          `Compra realizada con éxito`,
          `Has comprado <b>${response.data.receivedAmount.toFixed(
            8
          )} ${showBaseAsset}</b> por <b>${response.data.paidAmount.toFixed(
            showQuoteDecimals
          )}${showQuoteAsset}
                    </b> y has pagado <b> ${response.data.comission.toFixed(
            showQuoteDecimals
          )}${showQuoteAsset}</b> de comisión.`
        );
      } else {
        showTradeDoneToast(
          `Venta realizada con éxito`,
          `Has vendido <b>${response.data.paidAmount
          } ${showBaseAsset}</b> por <b>${response.data.receivedAmount.toFixed(
            showQuoteDecimals
          )}${showQuoteAsset}
                    </b> y has pagado <b>${response.data.comission.toFixed(
            8
          )} ${showBaseAsset}</b> de comisión.`
        );
      }
    } else {
      console.log(
        "Algo ha salido mal con el trade... (Hacer aqui un toast)",
        response
      );
    }
  };

  const onBuy = async () => {
    if (
      document.getElementById("just-close-modal").classList.contains("show") ||
      document
        .getElementById("trade-confirmation-modal")
        .classList.contains("show")
    )
      return;

    const paidAmount = parseFloat(buyQuoteAssetInput);
    await performTransaction(paidAmount, "BUY");
  };

  const onSell = async () => {
    if (
      document.getElementById("just-close-modal").classList.contains("show") ||
      document
        .getElementById("trade-confirmation-modal")
        .classList.contains("show")
    )
      return;

    const paidAmount = parseFloat(sellBaseAssetInput);
    await performTransaction(paidAmount, "SELL");
  };

  const notLoggedButton = (
    <button
      className="btn w-100 mb-2"
      style={{
        backgroundColor: "#4F4F4F",
        fontWeight: "bold",
        cursor: "default",
      }}
    >
      <span
        style={{ color: "#ffbb00", cursor: "pointer" }}
        onClick={() => navigate("/login")}
      >
        Inicia sesión
      </span>
      <span className="text-white"> o </span>
      <span
        style={{ color: "#ffbb00", cursor: "pointer" }}
        onClick={() => navigate("/register")}
      >
        Regístrate ahora
      </span>
    </button>
  );

  const trunc = (number, n) =>
    Math.trunc(number * Math.pow(10, n)) / Math.pow(10, n);

  const swapButton = (
    <div className="col d-md-none d-flex justify-content-center align-items-center flex-md-row flex-column mb-3">
      <ul
        className="nav nav-tabs nav-justified w-100"
        id="myTab"
        role="tablist"
      >
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${action === 1
              ? "active bg-primary text-white"
              : "text-dark"
              }`}
            type="button"
            role="tab"
            aria-controls="myTab"
            aria-selected={action === 1}
            onClick={() => {
              setAction(1);
            }}
          >
            Comprar
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${action === 0
              ? "active bg-primary text-white"
              : "text-dark"
              }`}
            type="button"
            role="tab"
            aria-controls="myTab"
            aria-selected={action === 0}
            onClick={() => {
              setAction(0);
            }}
          >
            Vender
          </button>
        </li>
      </ul>
    </div>
  );

  return (
    <>
      <div
        className={`col-md border border-4 rounded me-1 ${action === 0 ? "d-md-block d-none" : ""
          }`}
      >
        <div className="mt-1 mb-1 d-flex flex-column row align-items-center justify-content-between">
          {swapButton}
          <div className="d-flex justify-content-start flex-sm-row flex-column">
            <div className="me-1">Disponible:</div>
            <div>
              {trunc(
                getWalletAmount(getQuoteAsset()),
                showQuoteDecimals
              ).toFixed(showQuoteDecimals)}
              {showQuoteAsset}
            </div>
          </div>
        </div>
        <div className="input-group input-group-sm">
          <label htmlFor="buyAmount" className="visually-hidden">
            Cantidad a comprar
          </label>
          <input
            type="text"
            id="buyAmount"
            className="form-control"
            placeholder="Cantidad a comprar"
            value={buyQuoteAssetInput}
            onChange={handleBuyQuoteAsset}
          />
          <span className="input-group-text" id="inputGroup-sizing-sm">
            {showQuoteAsset}
          </span>
        </div>
        {style === 1 && (
          <>
            <label htmlFor="buyRange" className="visually-hidden">
              Rango de compra
            </label>
            <input
              type="range"
              id="buyRange"
              className="form-range"
              value={buyRangeValue}
              onChange={(event) =>
                handleRangeChange(
                  event,
                  setBuyRangeValue,
                  getQuoteAsset(),
                  "BUY"
                )
              }
            />
            <div className="input-group input-group-sm">
              <label htmlFor="buyTotal" className="visually-hidden">
                Total sin comisiones
              </label>
              <input
                type="text"
                id="buyTotal"
                className="form-control"
                placeholder="Total (sin comisiones)"
                value={buyBaseAssetInput}
                onChange={handleBuyBaseAsset}
              />
              <span className="input-group-text" id="inputGroup-sizing-sm">
                {showBaseAsset}
              </span>
            </div>
          </>
        )}
        <div className="row mt-1 mb-1 d-flex justify-content-between">
          <div className="col-lg-6">
            {style === 0 && (
              <span>
                Recibes: {(buyBaseAssetInput * 1).toFixed(8)} {showBaseAsset}
              </span>
            )}
          </div>
          <div className="col-lg-6 d-flex justify-content-lg-end">
            <span className="text-end">
              Comisión:{" "}
              {(buyQuoteAssetInput * tradingComision).toFixed(
                showQuoteDecimals
              )}
              {showQuoteAsset}
            </span>
          </div>
        </div>
        {getAuthStatus() !== "1" ? (
          notLoggedButton
        ) : (
          <button className="btn btn-success w-100 mb-2" onClick={onBuy}>
            Comprar {showBaseAsset}
          </button>
        )}
      </div>
      <div
        className={`col-md border border-4 rounded ms-md-2 ${action === 1 ? "d-md-block d-none" : ""
          }`}
      >
        <div className="mt-1 mb-1 d-flex flex-column row align-items-center justify-content-between">
          {swapButton}
          <div className="d-flex justify-content-start flex-sm-row flex-column">
            <div className="me-1">Disponible:</div>
            <div>
              {trunc(getWalletAmount(getBaseAsset()), 8).toFixed(8)}{" "}
              {showBaseAsset}
            </div>
          </div>
        </div>
        <div>
          <div className="input-group input-group-sm">
            <label htmlFor="sellAmount" className="visually-hidden">
              Cantidad a vender
            </label>
            <input
              type="text"
              id="sellAmount"
              className="form-control"
              placeholder="Cantidad a vender"
              value={sellBaseAssetInput}
              onChange={handleSellBaseAsset}
            />
            <span className="input-group-text" id="inputGroup-sizing-sm">
              {showBaseAsset}
            </span>
          </div>
          {style === 1 && (
            <>
              <label htmlFor="sellRange" className="visually-hidden">
                Rango de venta
              </label>
              <input
                type="range"
                id="sellRange"
                className="form-range"
                value={sellRangeValue}
                onChange={(event) =>
                  handleRangeChange(
                    event,
                    setSellRangeValue,
                    getBaseAsset(),
                    "SELL"
                  )
                }
              />
              <div className="input-group input-group-sm">
                <label htmlFor="sellTotal" className="visually-hidden">
                  Total sin comisiones
                </label>
                <input
                  type="text"
                  id="sellTotal"
                  className="form-control"
                  placeholder="Total (sin comisiones)"
                  value={sellQuoteAssetInput}
                  onChange={handleSellQuoteAsset}
                />
                <span className="input-group-text" id="inputGroup-sizing-sm">
                  {showQuoteAsset}
                </span>
              </div>
            </>
          )}
          <div className="row mt-1 mb-1 d-flex justify-content-between">
            <div className="col-lg-6">
              {style === 0 && (
                <span>
                  Recibes:{" "}
                  {(sellQuoteAssetInput * 1).toFixed(showQuoteDecimals)}$
                </span>
              )}
            </div>
            <div className="col-lg-6 d-flex justify-content-lg-end">
              <span className="text-end">
                Comisión: {(sellBaseAssetInput * tradingComision).toFixed(8)}{" "}
                {showBaseAsset}
              </span>
            </div>
          </div>
          {getAuthStatus() !== "1" ? (
            notLoggedButton
          ) : (
            <button className="btn btn-danger w-100 mb-2" onClick={onSell}>
              Vender {showBaseAsset}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default BuyAndSell;
