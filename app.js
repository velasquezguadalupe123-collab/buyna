// Contact shown in the closing section. Fill these in to publish real contact details.
const CONTACTO = {
  whatsapp: "", // international format, digits only, e.g. "58414XXXXXXX"
  correo: "",
};

const TASA_EJEMPLO = 250;
const numero = new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const bs = (n) => `Bs ${numero.format(n)}`;
const usd = (n) => `$${numero.format(n)}`;
const azar = (lista) => lista[Math.floor(Math.random() * lista.length)];
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const hora = () => new Date().toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" });

/* ---------- Hero: live owner panel ---------- */
const CLIENTES = ["María G.", "José R.", "Andreína P.", "Luis M.", "Carla V.", "Daniel F.", "Valentina S.", "Gabriel T.", "Sofía L."];
const BANCOS = ["Banco de Venezuela", "Mercantil", "Banesco", "BNC", "Provincial"];
const feed = document.getElementById("hero-feed");
const panel = { usd: 0, ok: 0, rev: 0 };

function nuevoPago() {
  const binance = Math.random() < 0.3;
  const monto = binance ? Math.round(15 + Math.random() * 105) : Math.round((2500 + Math.random() * 19500) / 50) * 50;
  return {
    cliente: azar(CLIENTES),
    detalle: binance ? `Binance · ${hora()}` : `${azar(BANCOS)} · Ref. ${100000 + Math.floor(Math.random() * 900000)}`,
    texto: binance ? `${numero.format(monto)} USDT` : bs(monto),
    usd: binance ? monto : monto / TASA_EJEMPLO,
  };
}

function pintarPanel() {
  document.getElementById("hero-total").textContent = usd(panel.usd);
  document.getElementById("hero-bs").textContent = bs(panel.usd * TASA_EJEMPLO);
  document.getElementById("hero-ok").textContent = panel.ok;
  document.getElementById("hero-rev").textContent = panel.rev;
}

function agregarPago(pago, estadoInicial) {
  const li = document.createElement("li");
  li.className = "pago";
  li.innerHTML = `<div><div class="quien"></div><div class="det"></div></div><div class="der"><span class="monto"></span><span class="estado"></span></div>`;
  li.querySelector(".quien").textContent = pago.cliente;
  li.querySelector(".det").textContent = pago.detalle;
  li.querySelector(".monto").textContent = pago.texto;
  const estado = li.querySelector(".estado");
  feed.prepend(li);
  while (feed.children.length > 4) feed.lastElementChild.remove();

  const resolver = (final) => {
    estado.className = `estado ${final}`;
    estado.textContent = final === "confirmado" ? "Confirmado" : "Revisión";
    if (final === "confirmado") { panel.usd += pago.usd; panel.ok += 1; } else { panel.rev += 1; }
    pintarPanel();
  };

  if (estadoInicial) { resolver(estadoInicial); return; }
  estado.className = "estado verificando";
  estado.textContent = "Verificando";
  setTimeout(() => resolver(Math.random() < 0.9 ? "confirmado" : "revision"), 1300);
}

for (let i = 0; i < 3; i++) agregarPago(nuevoPago(), "confirmado");
setInterval(() => { if (!document.hidden) agregarPago(nuevoPago()); }, 2800);

/* ---------- Verification walkthrough ---------- */
const cascada = document.getElementById("cascada");
const pasos = [...cascada.querySelectorAll("li")];
const resultado = document.getElementById("cascada-resultado");
const botonesCascada = [document.getElementById("simular"), document.getElementById("simular-caida")];
let metodo = "pm";

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach((c) => c.classList.toggle("activo", c === chip));
    metodo = chip.dataset.metodo;
    document.getElementById("paso1-det").textContent = metodo === "pm" ? "Bs 4.500,00 · Ref. 482193" : "45,00 USDT · Orden 1928374650";
    pasos[1].querySelector("b").textContent = metodo === "pm" ? "Buyna consulta tu banco" : "Buyna consulta tu Binance";
    reiniciarCascada();
    resultado.textContent = 'Toca "Simular pago" para ver el recorrido.';
  });
});

function reiniciarCascada() {
  pasos.forEach((p) => p.classList.remove("activo", "listo", "caido", "saltado"));
  document.getElementById("paso2-det").textContent = "Primera fuente";
}

async function recorrer(conCaida) {
  botonesCascada.forEach((b) => (b.disabled = true));
  reiniciarCascada();
  resultado.textContent = "El cliente acaba de pagar…";
  pasos[0].classList.add("activo");
  await esperar(700);
  pasos[0].classList.replace("activo", "listo");
  pasos[1].classList.add("activo");
  resultado.textContent = "Buyna está consultando…";
  await esperar(900);
  if (conCaida) {
    pasos[1].classList.replace("activo", "caido");
    document.getElementById("paso2-det").textContent = "No respondió";
    pasos[2].classList.add("activo");
    resultado.textContent = "La primera fuente no respondió. Probando con la de respaldo…";
    await esperar(1000);
    pasos[2].classList.replace("activo", "listo");
  } else {
    pasos[1].classList.replace("activo", "listo");
    pasos[2].classList.add("saltado");
  }
  pasos[3].classList.add("listo");
  resultado.textContent = conCaida
    ? "Confirmado con la fuente de respaldo. Tú no tuviste que hacer nada."
    : "Confirmado en segundos. Ya aparece en tu panel y en la caja.";
  botonesCascada.forEach((b) => (b.disabled = false));
}

botonesCascada[0].addEventListener("click", () => recorrer(false));
botonesCascada[1].addEventListener("click", () => recorrer(true));

/* ---------- Staff view ---------- */
const cajaForm = document.getElementById("caja-form");
const cajaResultado = document.getElementById("caja-resultado");

function leerMonto(texto) {
  const t = texto.trim().replace(/\s|Bs/gi, "");
  if (t.includes(",")) return Number(t.replace(/\./g, "").replace(",", "."));
  if (/^\d{1,3}(\.\d{3})+$/.test(t)) return Number(t.replace(/\./g, ""));
  return Number(t);
}

cajaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const boton = cajaForm.querySelector("button");
  const ref = document.getElementById("caja-ref").value.replace(/\D/g, "");
  const monto = leerMonto(document.getElementById("caja-monto").value);
  boton.disabled = true;
  cajaResultado.className = "caja-resultado esperando";
  cajaResultado.innerHTML = "<b>Verificando…</b>Consultando con el banco.";
  await esperar(900);
  const coincide = ref.length >= 4 && "482193".endsWith(ref) && Math.abs(monto - 4500) < 0.01;
  if (coincide) {
    cajaResultado.className = "caja-resultado ok";
    cajaResultado.innerHTML = `<b>Pago confirmado</b>Bs 4.500,00 · Ref. 482193 · ${hora()}<br>Puedes entregar el pedido.`;
  } else {
    cajaResultado.className = "caja-resultado no";
    cajaResultado.innerHTML = "<b>Aún no aparece</b>Revisa la referencia y el monto, o espera unos minutos. No entregues el pedido todavía.";
  }
  boton.disabled = false;
});

/* ---------- Catalog ---------- */
const PRODUCTOS = [
  { nombre: "Cartera de mano rosa con asa redonda", desc: "Cartera estructurada con asa superior y cierre en contraste. Combínala con jeans y una blusa blanca para un look elegante de día.", precio: 35 },
  { nombre: "Zapatos deportivos azules", desc: "Livianos y cómodos para todo el día. Suela blanca y diseño versátil que funciona con ropa deportiva o casual.", precio: 48 },
  { nombre: "Franela verde de algodón", desc: "Corte clásico y cuello redondo. Un básico fresco para el día a día que combina con todo.", precio: 15 },
];
const fichaFoto = document.getElementById("ficha-foto");
const fichaEscribe = document.getElementById("ficha-escribe");
const fichaNombre = document.getElementById("ficha-nombre");
const fichaDesc = document.getElementById("ficha-desc");
const fichaUsd = document.getElementById("ficha-usd");
const fichaBs = document.getElementById("ficha-bs");
const tasaInput = document.getElementById("tasa");
const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let productoActual = 0;
let turno = 0;

function pintarPrecio() {
  const tasa = Number(tasaInput.value);
  document.getElementById("tasa-valor").textContent = numero.format(tasa);
  const p = PRODUCTOS[productoActual];
  fichaUsd.textContent = usd(p.precio);
  fichaBs.textContent = `· ${bs(p.precio * tasa)}`;
}

async function escribir(el, texto, miTurno) {
  if (reducido) { el.textContent = texto; return true; }
  el.classList.add("cursor");
  for (let i = 1; i <= texto.length; i++) {
    if (miTurno !== turno) return false;
    el.textContent = texto.slice(0, i);
    await esperar(14);
  }
  el.classList.remove("cursor");
  return true;
}

async function mostrarProducto(indice) {
  const miTurno = ++turno;
  productoActual = indice;
  document.querySelectorAll(".prod-op").forEach((b) => b.classList.toggle("activo", Number(b.dataset.prod) === indice));
  fichaFoto.innerHTML = document.querySelector(`.prod-op[data-prod="${indice}"]`).innerHTML;
  fichaNombre.textContent = "";
  fichaDesc.textContent = "";
  fichaNombre.classList.remove("cursor");
  fichaDesc.classList.remove("cursor");
  fichaEscribe.className = "ficha-escribe";
  fichaEscribe.textContent = "Buyna está escribiendo…";
  pintarPrecio();
  const p = PRODUCTOS[indice];
  if (!(await escribir(fichaNombre, p.nombre, miTurno))) return;
  if (!(await escribir(fichaDesc, p.desc, miTurno))) return;
  fichaEscribe.className = "ficha-escribe listo";
  fichaEscribe.textContent = "Listo para vender";
}

document.querySelectorAll(".prod-op").forEach((b) => b.addEventListener("click", () => mostrarProducto(Number(b.dataset.prod))));
tasaInput.addEventListener("input", pintarPrecio);
mostrarProducto(0);

/* ---------- Pricing calculator ---------- */
const tiendasInput = document.getElementById("tiendas");
function pintarCalculadora() {
  const n = Number(tiendasInput.value);
  document.getElementById("tiendas-valor").textContent = n;
  document.getElementById("precio-normal").textContent = `$${35 + 15 * (n - 1)}`;
  document.getElementById("precio-fund").textContent = `$${25 + 15 * (n - 1)}`;
}
tiendasInput.addEventListener("input", pintarCalculadora);
pintarCalculadora();

/* ---------- Contact ---------- */
const contacto = document.getElementById("contacto");
if (CONTACTO.whatsapp) {
  const a = document.createElement("a");
  a.className = "boton boton-blanco";
  a.href = `https://wa.me/${CONTACTO.whatsapp}?text=${encodeURIComponent("Hola, quiero ser tienda fundadora de Buyna.")}`;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.textContent = "Escríbenos por WhatsApp";
  contacto.append(a);
}
if (CONTACTO.correo) {
  const p = document.createElement("p");
  p.className = "contacto-dato";
  p.textContent = CONTACTO.correo;
  contacto.append(p);
}
if (!CONTACTO.whatsapp && !CONTACTO.correo) {
  const p = document.createElement("p");
  p.className = "contacto-dato";
  p.textContent = "Muy pronto publicaremos nuestro contacto.";
  contacto.append(p);
}

/* ---------- Scroll motion (content is visible at rest) ---------- */
if ("IntersectionObserver" in window && !reducido) {
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add(e.target.classList.contains("grafico") ? "crece" : "entra");
      observador.unobserve(e.target);
    });
  }, { threshold: 0.25 });
  document.querySelectorAll(".revela, .grafico").forEach((el) => observador.observe(el));
}
