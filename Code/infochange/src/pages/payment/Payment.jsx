import { useState } from "react";
import { Link } from "react-router-dom";

import Banner from "./../../assets/payment_banner.png";
import CheckIcon from "bootstrap-icons/icons/check-lg.svg";

import "./payment.css";
import PaymentCompleted from "./steps/PaymentCompleted";
import ConfirmPayment from "./steps/ConfirmPayment";
import { CreditForm, PaypalForm } from "./steps/DataForm";
import SelectPayMethod from "./steps/SelectPayMethod";

export default function Payment(props) {
  const [step, setStep] = useState({ step: 3, data: { type: "paypal" } });

  const { cart } = props;

  const nextBtn = {
    name: ["Siguiente", "Siguiente", "Pagar", "Volver al menú"][step.step - 1],
    disabled: step.step == 1,
    handler: () => setStep({ step: step.step + 1, data: step.data }),
  };

  const backBtn = {
    name: "Volver",
    disabled: step.step <= 1 || step.step >= 4,
    handler: () => {
      setStep({ step: step.step - 1, data: step.data });
    },
  };

  return (
    <div
      style={{
        backgroundColor: "#52dee5",
      }}
    >
      <div className="container d-flex flex-column justify-content-center align-items-center vh-100">
        <div className="card p-2">
          <div className="card-body">
            <div className="container d-flex align-items-center">
              <img className="mb-3" src={Banner} width={"25%"} />

              <Link
                to={"/"}
                className={"ms-auto" + (step.step === 4 ? " d-none" : "")}
              >
                <button className="btn btn-outline-danger">
                  <i className="bi bi-x-lg me-2"></i>
                  <span className="d-sm-inline d-none">Cancelar pago</span>
                </button>
              </Link>
            </div>
            <div className="row mb-3">
              <div className="col-sm-4">
                <h4>Pasos del pago</h4>
                <ol className="list-group list-group-flush">
                  <li
                    className={
                      "list-group-item" + (step.step === 1 ? " active" : "")
                    }
                  >
                    1 - Seleccione tipo de pago
                    {doneCheck(1, step.step)}
                  </li>
                  <li
                    className={
                      "list-group-item" + (step.step === 2 ? " active" : "")
                    }
                  >
                    2 - Introduzca los datos requeridos
                    {doneCheck(2, step.step)}
                  </li>
                  <li
                    className={
                      "list-group-item" + (step.step === 3 ? " active" : "")
                    }
                  >
                    3 - Resumen de la compra
                    {doneCheck(3, step.step)}
                  </li>
                  <li
                    className={
                      "list-group-item" + (step.step === 4 ? " active" : "")
                    }
                  >
                    4 - Pago completado
                    {doneCheck(4, step.step)}
                  </li>
                </ol>
              </div>
              <div className="col-sm-8">
                <h4>Paso {step.step}</h4>
                <div className="mb-3">
                  {step.step === 1 ? (
                    <SelectPayMethod
                      creditHandler={() => {
                        console.log("works");
                        setStep({ step: 2, data: { type: "credit" } });
                      }}
                      paypalHandler={() =>
                        setStep({ step: 2, data: { type: "paypal" } })
                      }
                    />
                  ) : step.step === 2 ? (
                    dataForm(step.data)
                  ) : step.step === 3 ? (
                    <ConfirmPayment cart={cart} />
                  ) : (
                    <PaymentCompleted cart={cart} />
                  )}
                </div>
                <div className="container d-flex justify-content-around">
                  <button
                    className={
                      "btn btn-outline-secondary" +
                      (step.step === 4 ? " d-none" : "")
                    }
                    disabled={backBtn.disabled}
                    onClick={backBtn.handler}
                  >
                    {backBtn.name}
                  </button>
                  <button
                    className="btn btn-primary"
                    disabled={nextBtn.disabled}
                    onClick={nextBtn.handler}
                  >
                    {nextBtn.name}
                  </button>
                </div>
              </div>
            </div>
            <div className="progress">
              <div
                className="progress-bar"
                style={{ width: `${step.step * 25}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function doneCheck(step, actualStep) {
  if (step < actualStep) {
    return (
      <i
        className="bi bi-check"
        style={{ fontSize: "20px", color: "green" }}
      ></i>
    );
  }
}

function dataForm(data) {
  if (data.type === "credit") return <CreditForm />;
  else if (data.type === "paypal") return <PaypalForm />;
  return undefined;
}
