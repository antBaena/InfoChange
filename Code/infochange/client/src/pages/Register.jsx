import { Link, redirect, useNavigate } from "react-router-dom";
import Countries from "./../assets/countries.json";
import { useRef, useState } from "react";
import "./login.css";
import Users from "./../data/users.json";
import { useAuth } from "./authenticator/AuthContext";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";
import * as formik from "formik";
import * as yup from "yup";

export default function Register() {
  const [country, setCountry] = useState(Countries[0]);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { doRegister } = useAuth();
  const { doCheckEmail } = useAuth();
  const name = useRef(null);
  const surname = useRef(null);
  const user = useRef(null);
  const email = useRef(null);
  const phone = useRef(null);
  const _document = useRef(null);
  const address = useRef(null);
  const postalCode = useRef(null);
  const password = useRef(null);

  const checkEmailExists = async (email) => {
    const response = await doCheckEmail(email);
    const status =
      response !== undefined && response.data !== undefined
        ? response.data.status
        : "";

    if (status === "0") {
      console.log(response.data.message);
      return true;
    } else if (status === "1") {
      console.log(response.data.message);
      return false;
    } else if (status === "-1") {
      console.log(response.data.message);
      return true;
    }
  };

  const registerUser = async (user) => {
    console.log(user);
    const response = await doRegister(user);
    const status =
      response !== undefined && response.data !== undefined
        ? response.data.status
        : "";

    if (status === "-1") {
      setError(response.data.cause);
    } else if (status === "0") {
      setError("Usuario o contraseña incorrecta");
    } else if (status === "1") {
      navigate("/dashboard");
    } else {
      console.log(response);
      setError("Error desconocido (por ahora)");
    }
  };
  const { Formik } = formik;
  let emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const schema = yup.object().shape({
    firstName: yup.string().required("Por favor, ingrese su nombre"),
    lastName: yup.string().required("Por favor, ingrese sus apellidos"),
    email: yup
      .string()
      .matches(emailRegex, "Formato de correo electrónico inválido")
      .required("Por favor, ingrese su correo electronico")
      .test(
        "unique-email",
        "Este correo electrónico ya está registrado",
        async function (value) {
          return !(await checkEmailExists(value));
        }
      ),
    username: yup.string().required(),
    city: yup.string().required(),
    state: yup.string().required(),
    terms: yup
      .bool()
      .required()
      .oneOf([true], "Debe aceptar los terminos para continuar"),
  });
  // Example starter JavaScript for disabling form submissions if there are invalid fields

  return (
    <Formik
      validationSchema={schema}
      onSubmit={console.log}
      initialValues={{
        firstName: "",
        lastName: "",
        email: "",
        username: "",
        city: "",
        state: "",
        zip: "",
        file: null,
        terms: false,
      }}
      // initialErrors={{
      //   firstName: "Aaaaaaaaa",
      //   lastName: "",
      //   email: "",
      //   username: "",
      // }}
    >
      {({ handleSubmit, handleChange, values, touched, errors }) => (
        <div className=" anim_gradient">
          <div className="container-fluid vh-100 ">
            <div className="row justify-content-center align-items-center">
              <div className="col-5 bg-light rounded-2 my-5 bg-tertiary">
                <Form className="mx-5  my-5" noValidate onSubmit={handleSubmit}>
                  <h3>Informacion Personal</h3>
                  <Row className="mb-5">
                    <Form.Group as={Col} md="4" controlId="validationFormik01">
                      <Form.Label>Nombre</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={values.firstName}
                        onChange={handleChange}
                        isInvalid={!!errors.firstName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.firstName}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} md="8" controlId="validationFormik02">
                      <Form.Label>Apellidos</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={values.lastName}
                        onChange={handleChange}
                        isInvalid={!!errors.lastName}
                      />

                      <Form.Control.Feedback type="invalid">
                        {errors.lastName}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Row>
                  <Row className="mb-5">
                    <Form.Group as={Col} md="12" controlId="validationFormik01">
                      <Form.Label>Correo Electronico</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        isValid={touched.email && !errors.email}
                        isInvalid={!!errors.email}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Row>
                  <Row className="mb-3">
                    <Form.Group as={Col} md="6" controlId="validationFormik03">
                      <Form.Label>City</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="City"
                        name="city"
                        value={values.city}
                        onChange={handleChange}
                        isInvalid={!!errors.city}
                      />

                      <Form.Control.Feedback type="invalid">
                        {errors.city}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} md="3" controlId="validationFormik04">
                      <Form.Label>State</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="State"
                        name="state"
                        value={values.state}
                        onChange={handleChange}
                        isInvalid={!!errors.state}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.state}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group as={Col} md="3" controlId="validationFormik05">
                      <Form.Label>Zip</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Zip"
                        name="zip"
                        value={values.zip}
                        onChange={handleChange}
                        isInvalid={!!errors.zip}
                      />

                      <Form.Control.Feedback type="invalid">
                        {errors.zip}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Check
                      required
                      name="terms"
                      label="Agree to terms and conditions"
                      onChange={handleChange}
                      isInvalid={!!errors.terms}
                      feedback={errors.terms}
                      feedbackType="invalid"
                      id="validationFormik0"
                    />
                  </Form.Group>
                  <Button type="submit">Submit form</Button>
                </Form>
              </div>
            </div>
          </div>
        </div>
      )}
    </Formik>
  );
}
