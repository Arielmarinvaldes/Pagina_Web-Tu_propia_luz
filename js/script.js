const KEYS = {
    public: "pk_test_51Mbo9wLyHlZPnql8IQ5Ihy1bCqJi143wMzdA7G3mKcBQgdJt1OgfwBPLzKesST7J9xIWsqWWxD22icwZYgt0u6yR00sLNP7XUb",
    secret: "sk_test_51Mbo9wLyHlZPnql8kYZIEVfkqPdiRK0Ur05pSwJaHmO1Hi378EK1x8NfImlo80NSjz1YopBIZwdhSKwTECktCduL00d6CXMS3X"
  }
const $d = document;
const $tienda = $d.getElementById("tienda");
const $template = $d.getElementById("lampara-template").content;
const $fragment = $d.createDocumentFragment();
const options = { headers: {Authorization: `Bearer ${KEYS.secret}`}}
const FormatoDeMoneda = num => `€${num.slice(0, -2)}.${num.slice(-2)}`;

let products, prices;

Promise.all([
    fetch("https://api.stripe.com/v1/products", options),
    fetch("https://api.stripe.com/v1/prices", options)
])
.then(responses => Promise.all(responses.map(res => res.json())))

.then(json => {
    products = json[0].data;
    prices = json[1].data;
    prices.forEach(el => {
        let productData = products.filter(product => product.id === el.product);
        
        $template.querySelector(".lampara").setAttribute("data-price", el.id);
        $template.querySelector("img").src = productData[0].images[0];
        $template.querySelector("img").alt = productData[0].name;
        $template.querySelector("figcaption").innerHTML = `${productData[0].name} ${FormatoDeMoneda(el.unit_amount_decimal)} ${(el.currency).toUpperCase()}`;

        let $clone = $d.importNode($template, true);

        $fragment.appendChild($clone);
    });

    $tienda.appendChild($fragment);
})
.catch(error => {
    let message = error.statuText || "Ocurrió un error en la petición";

    $tienda.innerHTML = `Error: ${error.status}: ${message}`;
})

$d.addEventListener("click", e => {
    if (e.target.matches(".lampara *")) {
        let priceId = e.target.parentElement.getAttribute("data-price");

        Stripe(KEYS.public).redirectToCheckout({
            lineItems: [{
                price: priceId,
                quantity: 1
            }],
            mode: "payment",
            successUrl:"http://localhost:8000/success.html",
            cancelUrl:"http://localhost:8000/cancel.html"
        })
        .then(res => {
            if (res.error){
                $arepas.insertAdjacentElement("afterend", res.error.message)
            }
        })
    }
})
