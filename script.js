"use strict";

const productsContainer = document.querySelector(".products");
const cart = document.querySelector(".cart");
const currency = document.querySelector("#currency");

let currencies = [];
let euroExchangeRates = {};

let productsInList = [];
let productsInCart = [];

function setProductsInList(value) {
  productsInList = value;
  renderCatalog();
}

function setProductsInCart(value) {
  productsInCart = value;
  renderCart();
}

//EXCHANGE RATE API REQUEST
const req = new XMLHttpRequest();
req.open(
  "GET",
  `http://api.exchangeratesapi.io/v1/latest?access_key=79abc1fd3a6bce415bdca62cd4e4af35&symbols=USD,EUR,GBP`
);
req.send();
req.addEventListener("load", function () {
  const exchangeData = JSON.parse(this.responseText);
  euroExchangeRates = exchangeData.rates;
  currencies = [
    {
      value: "$",
      name: "USD",
      selected: false,
    },
    {
      value: "£",
      name: "GBP",
      selected: false,
    },
    {
      value: "€",
      name: "EUR",
      selected: true,
    },
  ];
  renderCurrencyPicker();
});

//PRODUCT DATA API REQUEST
const request = new XMLHttpRequest();
request.open("GET", "http://private-32dcc-products72.apiary-mock.com/product");
request.send();
request.addEventListener("load", function () {
  const data = JSON.parse(this.responseText);
  setProductsInList(data.map((item) => ({ ...item, euroPrice: item.price })));
});

function renderCatalog() {
  let catalogueString = "";
  for (const [i, product] of productsInList.entries()) {
    const htmlProd = `
      <article class="product" id=product--${i}>
      <div class="product__data">
          <span id="name--${i}">${product.name} </span>
          <button id="btnP--${i}" class="product__btn float--right">Add to cart</button>
          <span class="float--right price" id="price--${i}">Price: ${currency.value} ${product.price}</span>
      </div>
      </article>
  `;
    catalogueString += htmlProd;
  }
  productsContainer.innerHTML = catalogueString;

  for (const [i, product] of productsInList.entries())
    document
      .querySelector(`#btnP--${i}`)
      .addEventListener("click", function () {
        setProductsInList(
          productsInList.filter((prod) => prod.id != product.id)
        );
        setProductsInCart([...productsInCart, { ...product, quantity: 1 }]);
      });
}

function renderCart() {
  let cartString = "";
  for (const [i, product] of productsInCart.entries()) {
    const htmlCart = `
      <article class="product" id=product--${i}>
      <div class="product__data">
          <span id="nameC--${i}">${product.name} ${
      product.description ? "⁽ⁱ⁾" : ""
    } </span>
          <span id="description--${i}" class="description" style="display:none;">${
      product.description
    }</span>
          <button id="btnC--${i}" class="product__btn float--right">X</button>
          <span id="totalValue--${i}" class="price float--right"> ${
      currency.value
    } ${(product.price * product.quantity).toFixed(2)}</span>
      <button id="incrementQuantity--${i}" class="float--right">+</button>
      <span class="float--right margin bold">${product.quantity}</span>
      <button id="decrementQuantity--${i}" class="float--right">-</button>
      </div>
      </article>
    `;
    cartString += htmlCart;
  }
  cart.innerHTML =
    cartString +
    `<span class="float--right white"> <span class="bold">Total:</span> ${
      currency.value
    } ${productsInCart
      .reduce((prev, curr) => prev + curr.price * curr.quantity, 0)
      .toFixed(2)}</span>`;

  for (const [i, product] of productsInCart.entries()) {
    document
      .querySelector(`#decrementQuantity--${i}`)
      .addEventListener("click", function () {
        if (product.quantity <= 1) return;
        product.quantity--;
        renderCart();
      });
    document
      .querySelector(`#incrementQuantity--${i}`)
      .addEventListener("click", function () {
        product.quantity++;
        renderCart();
      });
    document
      .querySelector(`#btnC--${i}`)
      .addEventListener("click", function () {
        delete product.quantity;
        productsInList.push(product);
        productsInList.sort((a, b) => a.id - b.id);
        productsInCart = productsInCart.filter((prod) => prod.id != product.id);
        renderCatalog();
        renderCart();
      });
    if (product.description) {
      document
        .querySelector(`#nameC--${i}`)
        .addEventListener("mouseover", function () {
          document.getElementById(`description--${i}`).style.display = "block";
        });
      document
        .getElementById(`nameC--${i}`)
        .addEventListener("mouseout", function () {
          document.getElementById(`description--${i}`).style.display = "none";
        });
    }
  }
}

function renderCurrencyPicker() {
  let currenciesString = "";
  for (const [i, currency] of currencies.entries()) {
    const htmlCurrency = `<option id="currency--${i}" value="${
      currency.value
    }" ${currency.selected ? "selected" : ""}>
        ${currency.name}
      </option>`;
    currenciesString += htmlCurrency;
  }
  currency.innerHTML = currenciesString;

  productsInList.forEach((product) => {
    const rate =
      euroExchangeRates[currencies.find((currency) => currency.selected).name];
    if (rate) {
      product.price = (product.euroPrice * rate).toFixed(2);
    }
  });

  productsInCart.forEach((product) => {
    const rate =
      euroExchangeRates[currencies.find((currency) => currency.selected).name];
    if (rate) {
      product.price = (product.euroPrice * rate).toFixed(2);
    }
  });

  renderCatalog();
  renderCart();
}

currency.addEventListener("change", function (e) {
  currencies.forEach((currency) => {
    if (currency.value === e.target.value) currency.selected = true;
    else currency.selected = false;
  });
  renderCurrencyPicker();
});
