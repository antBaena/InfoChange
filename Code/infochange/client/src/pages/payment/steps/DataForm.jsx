import { useRef, useState } from "react";
import { Tooltip, OverlayTrigger, Button } from "react-bootstrap";
import { InfoCircle } from "react-bootstrap-icons";

export function PaypalForm(props) {
    const { dataHandler, backHandler, data } = props;
    const [fieldError, setError] = useState("");

    const email = useRef(null);
    const password = useRef(null);

    return (
        <div>
            <h3 className="fs-6">
                Introduzca los datos de su cuenta de Paypal
            </h3>
            <div className="container">
                <div className="mb-3 py-1">
                    <label htmlFor="emailInput" className="form-label">
                        Correo Electrónico
                    </label>
                    <input
                        ref={email}
                        id="emailInput"
                        type="text"
                        defaultValue={
                            data.info !== undefined ? data.info.email : ""
                        }
                        className="form-control"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="passwordInput" className="form-label">
                        Contraseña
                    </label>
                    <input
                        id="passwordInput"
                        ref={password}
                        type="password"
                        className="form-control"
                    />
                </div>
                {fieldError ? (
                    <div className="alert alert-danger">
                        <p>{fieldError}</p>
                    </div>
                ) : undefined}
                <div className="row">
                    <div className="col mb-3">
                        <button
                            className="btn btn-outline-secondary w-100"
                            onClick={backHandler}
                        >
                            Volver
                        </button>
                    </div>
                    <div className="col">
                        <button
                            className="btn btn-primary w-100"
                            onClick={() => {
                                if (
                                    email.current.value &&
                                    password.current.value
                                ) {
                                    dataHandler({
                                        email: email.current.value,
                                        password: password.current.value,
                                    });
                                } else {
                                    setError(
                                        "Debe rellenar todos los campos del formulario para continuar con el pago"
                                    );
                                }
                            }}
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function IBANForm(props) {
    const { dataHandler, backHandler, data } = props;

    const owner = useRef(null);
    const iban = useRef(null);

    const [fieldError, setError] = useState("");

    return (
        <div>
            <h3 className="fs-6">Introduzca los datos de la tarjeta</h3>
            <div className="container">
                <div className="mb-3">
                    <label htmlFor="ownerInput" className="form-label">
                        Titular de la cuenta
                    </label>
                    <input
                        id="ownerInput"
                        ref={owner}
                        type="text"
                        defaultValue={
                            data.info !== undefined ? data.info.cardNumber : ""
                        }
                        className="form-control"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="ibanInput" className="form-label">
                        IBAN de la cuenta
                    </label>
                    <input
                        id="ibanInput"
                        ref={iban}
                        type="text"
                        defaultValue={
                            data.info !== undefined ? data.info.expDate : ""
                        }
                        className="form-control"
                    />
                </div>
                {fieldError ? (
                    <div className="alert alert-danger">
                        <p>{fieldError}</p>
                    </div>
                ) : undefined}
                <div className="row">
                    <div className="col mb-3">
                        <button
                            className="btn btn-outline-secondary w-100"
                            onClick={backHandler}
                        >
                            Volver
                        </button>
                    </div>
                    <div className="col">
                        <button
                            className="btn btn-primary w-100"
                            onClick={() => {
                                if (owner.current.value && iban.current.value) {
                                    dataHandler({
                                        owner: owner.current.value,
                                        iban: iban.current.value,
                                    });
                                } else {
                                    setError(
                                        "Debe rellenar todos los campos del formulario para continuar con el pago"
                                    );
                                }
                            }}
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function CreditForm(props) {
    const { dataHandler, backHandler, data } = props;

    const creditCard = useRef(null);
    const expDate = useRef(null);
    const cvv = useRef(null);

    const [fieldError, setError] = useState("");

    return (
        <div>
            <h3 className="fs-6">Introduzca los datos de la tarjeta</h3>
            <div className="container">
                <div className="mb-3">
                    <label htmlFor="cardInput" className="form-label">
                        Número de tarjeta
                    </label>
                    <input
                        id="cardInput"
                        ref={creditCard}
                        maxLength={16}
                        type="text"
                        defaultValue={
                            data.info !== undefined ? data.info.cardNumber : ""
                        }
                        className="form-control"
                    />
                </div>
                <div className="row g-3">
                    <div className="col-md-6 col-12">
                        <label htmlFor="dateInput" className="form-label">
                            Fecha de expiración
                        </label>
                        <input
                            id="dateInput"
                            ref={expDate}
                            type="month"
                            defaultValue={
                                data.info !== undefined ? data.info.expDate : ""
                            }
                            className="form-control"
                        />
                    </div>
                    <div className="col-md-6 col-12">
                        <div className="mb-3">
                            <label htmlFor="cvvInput" className="form-label">
                                Código de Seguridad{" "}
                                <OverlayTrigger
                                    placement="bottom"
                                    overlay={
                                        <Tooltip>
                                            <InfoCircle /> El código de
                                            seguridad es un código de 3 dígitos
                                            que se encuentra en el reverso de la
                                            tarjeta de crédito
                                        </Tooltip>
                                    }
                                >
                                    {({ reference, ...triggerHandler }) => (
                                        <InfoCircle
                                            ref={reference}
                                            {...triggerHandler}
                                        />
                                    )}
                                </OverlayTrigger>
                            </label>
                            <input
                                ref={cvv}
                                id="cvvInput"
                                type="text"
                                maxLength="3"
                                className="form-control"
                            />
                        </div>
                    </div>
                </div>
                {fieldError ? (
                    <div className="alert alert-danger">
                        <p>{fieldError}</p>
                    </div>
                ) : undefined}
                <div className="row">
                    <div className="col mb-3">
                        <button
                            className="btn btn-outline-secondary w-100"
                            onClick={backHandler}
                        >
                            Volver
                        </button>
                    </div>
                    <div className="col">
                        <button
                            className="btn btn-primary w-100"
                            onClick={() => {
                                if (
                                    creditCard.current.value &&
                                    expDate.current.value &&
                                    cvv.current.value
                                ) {
                                    dataHandler({
                                        cardNumber: creditCard.current.value,
                                        expDate: expDate.current.value,
                                        cvv: cvv.current.value,
                                    });
                                } else {
                                    setError(
                                        "Debe rellenar todos los campos del formulario para continuar con el pago"
                                    );
                                }
                            }}
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
