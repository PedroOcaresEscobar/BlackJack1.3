

const modalHTML = `
    <section id="modal-cargarCreditos" style="display:none" class="cargarCreditos">
        <h4>Menu de Compra de creditos</h4>
        <div class="contenedor-pack" id="contenedorPacks"></div> 
        <p>Total: <span id="totalCompra">0</span> dólares</p>
        <button class="btn-rc" id="btnComprar">Comprar</button>
    </section>
    `;

    // Elige dónde insertar el modal (puedes reemplazar 'body' por otro elemento)
    document.body.insertAdjacentHTML('beforeend', modalHTML);     
const navbarHTML = `
    <nav class="navbar navbar-dark bg-dark fixed-top">
        <div class="container-fluid">
            <a class="navbar-brand" href="#">
                <img src="assen/LOGOBJ.png" alt="Logo Black Jack">
            </a>
            <div class="creditos" id="creditosJugador">Créditos: 0</div>
            <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasDarkNavbar" aria-controls="offcanvasDarkNavbar" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="offcanvas offcanvas-end text-bg-dark w-50" tabindex="-1" id="offcanvasDarkNavbar" aria-labelledby="offcanvasDarkNavbarLabel" data-bs-backdrop="false">
                <div class="offcanvas-header">
                    <h5 class="offcanvas-title" id="offcanvasDarkNavbarLabel">Bienvenido</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <div class="offcanvas-body">
                    <section id="modal-cargarCreditos" class="cargarCreditos">
                        <h4>Menu de Compra de creditos</h4>
                        <div class="contenedor-pack" id="contenedorPacks"></div> 
                        <div class="d-flex mt-3 total-compra-btn" role="search">
                            <div class="total-compra">
                                <p>Total: <span id="totalCompra">0</span> dólares</p>
                            </div>
                            <div class="total-compra" >
                                <button class="btn-rc" id="btnComprar">Comprar</button>
                            </div>
                            <div class="contenedor-lista-productos">
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </nav>
    `;

    document.body.insertAdjacentHTML('afterbegin', navbarHTML);



const numAsientos = 3;
const jugadoresHTML = `
  ${[...Array(numAsientos)].map((_, i) => `
    <div id="contenedor-cartas-${i + 1}" class="contenedor-cartas">
      <h7 id="estadoAsiento${i + 1}">Asiento ${i + 1}</h7>
      <div id="cartasAsiento${i + 1}" class="cartas-laCasa"></div>
      <button class="sentarse-btn" data-asiento="${i + 1}">Sentarse</button>
    </div>
  `).join('')}
`;

// Selecciona el contenedor existente
const contenedorJugadores = document.querySelector('.jugadores');

// Inserta el HTML dentro del contenedor
contenedorJugadores.insertAdjacentHTML('beforeend', jugadoresHTML); 
// Obtener el contenedor "mijuego"
const contenedorMijuego = document.querySelector('.mijuego');
// HTML para el contenedor "Tu Apuesta"
const tuApuestaHTML = `
<div class="tuApuesta">
  <span>TU APUESTA</span>
  <span class="apuesta" id="apuestaJugador">0</span>
  <button class="borrar" id="borrarApuesta">Borrar</button>
</div>
`;
// HTML para los botones de apuestas
const apuestaContainerHTML = `
<div class="apuesta-container" id="apuestaContainerJugador">
  <button class="apuesta-btn blanco" data-valor="5">5C</button>
  <button class="apuesta-btn rojo" data-valor="10">10C</button>
  <button class="apuesta-btn azul" data-valor="50">50C</button>
  <button class="apuesta-btn verde" data-valor="100">100C</button>
  <button class="apuesta-btn morada" data-valor="500">500C</button>
</div>
`;



// Insertar ambos contenedores dentro de "mijuego"
contenedorMijuego.insertAdjacentHTML('beforeend', apuestaContainerHTML);
contenedorMijuego.insertAdjacentHTML('beforeend', tuApuestaHTML);

let productosAdquiridos = [];
const bienvenidoElement = document.getElementById("offcanvasDarkNavbarLabel");
bienvenidoElement.textContent = `Bienvenido ${player.nombre}`; 