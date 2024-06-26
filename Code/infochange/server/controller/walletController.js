const initModels = require("../models/init-models");
const sequelize = require("sequelize");
const models = initModels(sequelize);
const { Op } = require("sequelize");
const Coins = require("../assets/Coins.json");
const Symbols = require("../assets/Symbols.json");
const utils = require("../utils/utils");
const { getPrices } = require("../controller/APIController");
const walletController = {};
const tradingComision = 0.00065;
walletController.bizum = async (req, res) => {
  if (!req.session.user) {
    res.json(utils.error("UNAUTHORIZED", "No ha iniciado sesión"));
  } else {
    const userid = req.body.userid;
    const amount = req.body.amount;
    const coin = "USDT";

    if (!userid || !amount)
      return res.json(utils.error("MISSING_PARAMETERS", "Faltan parámetros."));

    if (isNaN(amount) || amount < 0)
      return res.json(utils.error("INVALID_AMOUNT", "Cantidad inválida."));

    const sentAmount = parseFloat(parseFloat(amount).toFixed(8));
    try {
      const senderWallet = await models.wallet.findOne({
        where: {
          coin: {
            [Op.like]: coin,
          },
          user: req.session.user.ID,
        },
      });
      const currentDollarAmount = !senderWallet
        ? -1
        : parseFloat(parseFloat(senderWallet.quantity).toFixed(8));

      if (currentDollarAmount < sentAmount)
        return res.json(
          utils.error("INSUFFICIENT_BALANCE", `No tienes suficientes ${coin}.`)
        );

      const newBizumerAmount = currentDollarAmount - sentAmount;

      if (newBizumerAmount === 0) {
        await senderWallet.destroy();
      } else {
        const fixed = parseFloat(newBizumerAmount.toFixed(8));
        await senderWallet.update({
          quantity: fixed,
        });
      }
      const receiverWallet = await models.wallet.findOne({
        where: {
          coin: {
            [Op.like]: coin,
          },
          user: userid,
        },
      });

      if (receiverWallet) {
        const newAmount =
          parseFloat(receiverWallet.quantity) +
          parseFloat(sentAmount.toFixed(8));
        await receiverWallet.update({
          quantity: newAmount,
        });
      } else {
        await models.wallet.create({
          user: userid,
          coin: coin,
          quantity: parseFloat(sentAmount.toFixed(8)),
        });
      }
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
      const day = ("0" + currentDate.getDate()).slice(-2);
      const hours = ("0" + currentDate.getHours()).slice(-2);
      const minutes = ("0" + currentDate.getMinutes()).slice(-2);
      const seconds = ("0" + currentDate.getSeconds()).slice(-2);

      const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

      await models.bizum_history.create({
        sender: req.session.user.ID,
        receiver: userid,
        quantity: parseFloat(sentAmount.toFixed(2)),
        date: formattedDate,
      });

      res.json({
        status: "1",
      });
    } catch (e) {
      res.json(utils.error("ERROR", `Ha ocurrido un error inesperado: ${e}`));
      utils.applog(e, "ERROR");
    }
  }
};

walletController.wallet = async (req, res) => {
  if (!req.session.user) {
    res.json(utils.error("UNAUTHORIZED", "No ha iniciado sesión"));
  } else {
    try {
      const result = await models.wallet.findAll({
        attributes: ["coin", "quantity"],
        where: {
          user: req.session.user.ID,
        },
      });
      res.json({
        status: "1",
        wallet: result,
      });
    } catch (e) {
      res.json(utils.error("ERROR", `Ha ocurrido un error inesperado: ${e}`));
    }
  }
};

walletController.trade = async (req, res) => {
  if (!req.session.user) {
    return res.json(
      utils.error("NOT_LOGGED", "No existe una sesión del usuario.")
    );
  }

  const symbol = Object.values(Symbols.symbols).find(
    (s) => s.symbol === req.body.symbol
  );

  const quantity = parseFloat(req.body.quantity);
  const type = req.body.type;

  if (symbol.length === 0) {
    return res.json(
      utils.error(
        "INVALID_SYMBOL",
        "No se ha encontrado el símbolo especificado."
      )
    );
  }

  if (isNaN(quantity) || quantity <= 0) {
    return res.json(
      utils.error("INVALID_QUANTITY", "La cantidad introducida no es válida.")
    );
  }

  const symbolPriceObject = Object.values(getPrices()).find(
    (p) => p.symbol === symbol.symbol
  );
  if (!symbolPriceObject) {
    return res.json(
      utils.error(
        "NO_SERVER_PRICE",
        "El servidor no dispone de los precios actualmente. Inténtalo de nuevo más tarde."
      )
    );
  }
  const symbolPrice = symbolPriceObject.price;
  const paidAmount = parseFloat(quantity.toFixed(8));

  const removeAsset = type === "BUY" ? symbol.quoteAsset : symbol.baseAsset;
  const addAsset = type === "BUY" ? symbol.baseAsset : symbol.quoteAsset;
  const paidAssetName =
    type === "BUY" ? symbol.quoteAssetName : symbol.baseAssetName;
  try {
    const cantidadCompra = await models.wallet.findOne({
      attributes: ["quantity"],
      where: {
        coin: {
          [Op.like]: removeAsset,
        },
        user: req.session.user.ID,
      },
    });

    const currentAmount = !cantidadCompra
      ? -1
      : parseFloat(cantidadCompra.quantity.toFixed(8));
    if (currentAmount < paidAmount) {
      return res.json(
        utils.error(
          "INSUFFICIENT_BALANCE",
          `No tienes suficientes ${paidAssetName}.`
        )
      );
    }

    const comission = parseFloat((paidAmount * tradingComision).toFixed(8));

    const receivedAmount =
      type === "BUY"
        ? (paidAmount - comission) / symbolPrice
        : (paidAmount - comission) * symbolPrice;

    const updatedAmount = currentAmount - paidAmount;

    if (updatedAmount === 0) {
      const result = await models.wallet.findOne({
        where: {
          coin: removeAsset,
          user: req.session.user.ID,
        },
      });
      await result.destroy();
    } else {
      const result = await models.wallet.findOne({
        where: {
          coin: removeAsset,
          user: req.session.user.ID,
        },
      });
      await result.update({
        quantity: updatedAmount.toFixed(8),
      });
    }
    const cantidad = await models.wallet.findOne({
      where: {
        coin: addAsset,
        user: req.session.user.ID,
      },
    });
    const currentQuoteAmount = !cantidad
      ? -1
      : parseFloat(cantidad.quantity.toFixed(8));
    if (currentQuoteAmount >= 0) {
      const result = await models.wallet.findOne({
        where: {
          coin: {
            [Op.like]: addAsset,
          },
          user: req.session.user.ID,
        },
      });
      utils.applog(JSON.stringify(result), "DEBUG");
      const updatedquantity =
        result.quantity + parseFloat(receivedAmount.toFixed(8));
      utils.applog(updatedquantity.toString(), "DEBUG");
      await result.update({
        quantity: updatedquantity.toString(),
      });
      utils.applog("JSON.stringify(result)", "DEBUG");
    } else {
      await models.wallet.create({
        user: req.session.user.ID,
        coin: addAsset,
        quantity: receivedAmount.toFixed(8),
      });
    }
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = ("0" + (currentDate.getMonth() + 1)).slice(-2); // Agrega un cero inicial si es necesario
    const day = ("0" + currentDate.getDate()).slice(-2); // Agrega un cero inicial si es necesario
    const hours = ("0" + currentDate.getHours()).slice(-2); // Agrega un cero inicial si es necesario
    const minutes = ("0" + currentDate.getMinutes()).slice(-2); // Agrega un cero inicial si es necesario
    const seconds = ("0" + currentDate.getSeconds()).slice(-2); // Agrega un cero inicial si es necesario

    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    await models.trade_history.create({
      user: req.session.user.ID,
      symbol: symbolPriceObject.symbol,
      type: type,
      paid_amount: paidAmount.toFixed(8),
      amount_received: receivedAmount.toFixed(8),
      comission: comission.toFixed(8),
      date: formattedDate,
      price: symbolPrice,
    });

    res.json({
      status: "1",
      comission: comission,
      paidAmount: paidAmount,
      receivedAmount: receivedAmount,
    });
  } catch (e) {
    res.json(
      utils.error("SELECT_ERROR", "Se ha producido un error inesperado")
    );
  }
};

walletController.payment = async (req, res) => {
  if (!req.session.user) {
    res.json(utils.error("NOT_LOGGED", "No existe una sesión del usuario."));
  } else if (!req.body.cart || !req.body.cart.type || !req.body.cart.quantity) {
    res.json(
      utils.error(
        "MALFORMED_REQUEST",
        "La petición no se ha formulado correctamente"
      )
    );
  } else {
    const cart = req.body.cart;

    const coin = await models.wallet.findAll({
      attributes: ["coin"],
      where: {
        coin: {
          [Op.like]: cart.type,
        },
        user: req.session.user.ID,
      },
    });

    if (coin.length === 0) {
      await models.wallet.create({
        user: req.session.user.ID,
        coin: cart.type,
        quantity: cart.quantity,
      });
    } else {
      const wallet = await models.wallet.findOne({
        where: {
          coin: {
            [Op.like]: cart.type,
          },
          user: req.session.user.ID,
        },
      });
      wallet.update({
        quantity: wallet.quantity + parseFloat(cart.quantity),
      });
    }
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
    const day = ("0" + currentDate.getDate()).slice(-2);
    const hours = ("0" + currentDate.getHours()).slice(-2);
    const minutes = ("0" + currentDate.getMinutes()).slice(-2);
    const seconds = ("0" + currentDate.getSeconds()).slice(-2);

    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    await models.payment_history.create({
      user: req.session.user.ID,
      type: "PAY",
      quantity: cart.quantity,
      date: formattedDate,
      method: req.body.method.type.toUpperCase(),
      info: req.body.method.info,
    });

    res.json({
      status: 1,
      feedback: "OK",
    });
  }
};

walletController.withdraw = async (req, res) => {
  try {
    if (!req.session.user) {
      res.json(utils.error("NOT_LOGGED", "No existe una sesión del usuario."));
    } else if (
      !req.body.cart ||
      !req.body.cart.type ||
      !req.body.cart.quantity
    ) {
      res.json(
        utils.error(
          "MALFORMED_REQUEST",
          "La petición no se ha formulado correctamente"
        )
      );
    } else {
      const cart = req.body.cart;

      cart.quantity = parseFloat(cart.quantity);

      const wallet = await models.wallet.findOne({
        where: {
          coin: {
            [Op.like]: cart.type,
          },
          user: req.session.user.ID,
        },
      });

      if (!wallet || wallet.quantity < cart.quantity) {
        utils.applog(wallet.quantity >= cart.quantity, "TEST");
        res.json({
          status: 0,
          feedback: "No tiene suficiente saldo.",
        });
      } else {
        const newQuantity =
          parseFloat(wallet.quantity) - parseFloat(cart.quantity);
        await wallet.update({
          quantity: newQuantity,
        });

        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
        const day = ("0" + currentDate.getDate()).slice(-2);
        const hours = ("0" + currentDate.getHours()).slice(-2);
        const minutes = ("0" + currentDate.getMinutes()).slice(-2);
        const seconds = ("0" + currentDate.getSeconds()).slice(-2);

        const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

        await models.payment_history.create({
          user: req.session.user.ID,
          type: "WITHDRAW",
          quantity: cart.quantity,
          date: formattedDate,
          method: req.body.method.type.toUpperCase(),
          info: req.body.method.info,
        });

        res.json({
          status: 1,
          feedback: "OK",
        });
      }
    }
  } catch (e) {
    res.json(utils.error("ERROR", `Ha ocurrido un error inesperado: ${e}`));
  }
};

module.exports = walletController;
