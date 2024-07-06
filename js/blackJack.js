// Datos del juego cargados desde packs.json
let deck = [];
let suits = [];
let ranks = [];
let player = { nombre: '', creditos: 0, apuesta: 0, asiento: null };
let asientoOcupado = [];
let playerHand = [];
let dealerHand = [];

// Variables para la compra de créditos
let totalCompra = 0;
let creditosSeleccionados = 0;

// Obtener referencias a elementos del DOM (para la compra de créditos)
const btnCargar = document.querySelector('.btn-cargar');
const modalCargarCreditos = document.getElementById('modal-cargarCreditos');
const contenedorPacks = document.getElementById('contenedorPacks');
const totalCompraSpan = document.getElementById('totalCompra');
const btnComprar = document.getElementById('btnComprar');

// Guardar/cargar estados en localStorage
function guardarEstado() {
    localStorage.setItem('jugador', JSON.stringify(player));
    localStorage.setItem('asientoOcupado', JSON.stringify(asientoOcupado));
}

function cargarEstado() {
    const jugadorGuardado = localStorage.getItem('jugador');
    const asientoOcupadoGuardado = localStorage.getItem('asientoOcupado');
    if (jugadorGuardado) player = JSON.parse(jugadorGuardado);
    if (asientoOcupadoGuardado) asientoOcupado = JSON.parse(asientoOcupadoGuardado);
}

// Cargar datos del juego desde packs.json
async function cargarDatosJuego() {
    try {
        const response = await fetch('packs.json');
        const data = await response.json();

        suits = data.suits;
        ranks = data.ranks;
        player.creditos = data.creditosIniciales || 0;
        asientoOcupado = Array(data.numeroAsientos || 3).fill(false);

        // Ocultar modal de carga y mostrar botones de asiento
        document.getElementById('modalInicio').style.display = 'none';
        document.querySelector('.jugadores').style.display = 'grid';
        actualizarCreditos(); // Mostrar créditos iniciales
    } catch (error) {
        mostrarError('Error al cargar datos del juego. Por favor, inténtalo de nuevo más tarde.');
    }
}

// Funciones del juego
function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let rank of ranks) {
            deck.push({ rank, suit });
        }
    }
}

function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function dealCards() {
    try {
        if (!player.asiento) throw new Error("Debes sentarte en un asiento antes de repartir cartas.");
        if (player.creditos < player.apuesta) throw new Error("No tienes suficientes créditos para esta apuesta.");

        const cartasJugador = document.getElementById(`cartasAsiento${player.asiento}`);
        cartasJugador.innerHTML = ''; // Limpiar cartas anteriores

        playerHand = [deck.pop(), deck.pop()];
        dealerHand = [deck.pop(), deck.pop()];

        playerHand.forEach(card => cartasJugador.appendChild(crearCarta(card)));
        renderizarCartasDealer(false); // Mostrar solo la primera carta del dealer
        setTimeout(determinarGanador, 1000);
    } catch (error) {
        mostrarError(error.message);
    }
}

function MostrarCartas() {
    document.getElementById("cartasCasa").innerHTML = dealerHand.map(crearCarta).join('');
}

function crearCarta(card) {
    const cardElement = document.createElement("div");
    cardElement.className = `card ${card.suit.toLowerCase()}`;

    const rankElement = document.createElement("div");
    rankElement.className = "card-rank";
    rankElement.textContent = card.rank;
    cardElement.appendChild(rankElement);

    const suitElement = document.createElement("div");
    suitElement.className = "card-suit";
    suitElement.textContent = getSuitSymbol(card.suit);
    cardElement.appendChild(suitElement);

    return cardElement;
}

function getSuitSymbol(suit) {
    const suitSymbols = {
        "Picas": "♠",
        "Corazones": "♥",
        "Diamantes": "♦",
        "Tréboles": "♣"
    };
    return suitSymbols[suit] || "?";
}

function sentarseJugador(event) {
    const asiento = +event.target.dataset.asiento;

    if (!player.asiento) {
        if (!asientoOcupado[asiento - 1]) { 
            player.asiento = asiento;
            asientoOcupado[asiento - 1] = true;
            actualizarEstadoAsiento(asiento, `Ocupado por ${player.nombre}`);
            document.getElementById('apuestaContainerJugador').style.display = 'block';
            actualizarCreditos();
            guardarEstado();
        } else {
            mostrarError(`El asiento ${asiento} ya está ocupado.`);
        }
    } else if (player.asiento !== asiento) { 
        cambiarAsiento(asiento);
    } else { 
        levantarseAsiento(asiento);
    }
}

function cambiarAsiento(nuevoAsiento) {
    asientoOcupado[player.asiento - 1] = false;
    actualizarEstadoAsiento(player.asiento, `Asiento ${player.asiento}`);
    document.getElementById(`cartasAsiento${player.asiento}`).innerHTML = '';

    player.asiento = nuevoAsiento;
    asientoOcupado[nuevoAsiento - 1] = true;
    actualizarEstadoAsiento(nuevoAsiento, `Ocupado por ${player.nombre}`);
    document.getElementById(`cartasAsiento${nuevoAsiento}`).innerHTML = '';

    guardarEstado();
}

function levantarseAsiento(asiento) {
    player.asiento = null;
    asientoOcupado[asiento - 1] = false;
    actualizarEstadoAsiento(asiento, `Asiento ${asiento}`);
    document.getElementById(`cartasAsiento${asiento}`).innerHTML = '';
    document.getElementById('apuestaContainerJugador').style.display = 'none';
    actualizarCreditos();
    guardarEstado();
}

function actualizarEstadoAsiento(asiento, texto) {
    document.getElementById(`estadoAsiento${asiento}`).innerText = texto;
}

function ajustarApuesta(event) {
    try {
        const valorApuesta = parseInt(event.target.dataset.valor);
        
        // Verificar si la apuesta excede los créditos disponibles
        if (valorApuesta > player.creditos) {
            throw new Error("No tienes suficientes créditos.");
        }
        
        // Verificar si la nueva apuesta supera los créditos restantes
        if (player.apuesta + valorApuesta > player.creditos) {
            throw new Error("La apuesta no puede ser mayor que tus créditos disponibles.");
        }
        
        // Actualizar la apuesta del jugador
        player.apuesta += valorApuesta;

        // Actualizar la interfaz de usuario con los créditos y la apuesta actualizadas
        actualizarCreditos();
    } catch (error) {
        mostrarError(error.message);
    }
}
function agregarCreditos(creditos) {
    player.creditos += creditos;
    actualizarCreditos();
    guardarEstado();
}
function mostrarError(mensaje) {
    Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: mensaje
    });
}
function renderizarCartasDealer(mostrarTodas = true) {
    const cartasCasa = document.getElementById("cartasCasa");
    cartasCasa.innerHTML = ''; // Limpiar cartas anteriores

    if (mostrarTodas) {
        dealerHand.forEach(card => cartasCasa.appendChild(crearCarta(card)));
    } else {
        // Mostrar solo la primera carta y una carta boca abajo
        cartasCasa.appendChild(crearCarta(dealerHand[0]));
        const cardBack = document.createElement("div");
        cardBack.className = "card card-back";
        cartasCasa.appendChild(cardBack);
    }
}

function determinarGanador() {
    renderizarCartasDealer(true); // Mostrar todas las cartas del dealer

    const dealerScore = calcularPuntaje(dealerHand);
    const playerScore = calcularPuntaje(playerHand);

    let resultado = "";
    if (playerScore > 21) {
        player.creditos -= player.apuesta; // Descontar créditos si el jugador pierde
        resultado = "Perdiste. Te pasaste de 21.";
    } else if (dealerScore > 21 || playerScore > dealerScore) {
        player.creditos += player.apuesta * 2; // Duplicar y sumar créditos si el jugador gana
        resultado = `Ganaste! La casa se pasó de 21 o tu puntaje es mayor. Obtienes ${player.apuesta * 2} créditos.`;
    } else if (playerScore < dealerScore) {
        player.creditos -= player.apuesta; // Descontar créditos si el jugador pierde
        resultado = "Perdiste. La casa tiene un puntaje mayor.";
    } else {
        // No hacer nada con los créditos en caso de empate
        resultado = "Empate. Recuperas tu apuesta.";
    }

    player.apuesta = 0; // Reiniciar la apuesta
    actualizarCreditos();
    guardarEstado();

    Swal.fire({
        title: resultado,
        confirmButtonText: 'Jugar de nuevo'
    }).then(() => {
        // Limpiar el área de juego después de cada ronda
        document.getElementById(`cartasAsiento${player.asiento}`).innerHTML = '';
        document.getElementById("cartasCasa").innerHTML = '';
    });
}

function calcularPuntaje(hand) {
    let score = 0;
    let hasAce = false;
    for (let card of hand) {
        if (card.rank === "1") {
            hasAce = true;
            score += 11;
        } else if (["J", "Q", "K"].includes(card.rank)) {
            score += 10;
        } else {
            score += parseInt(card.rank);
        }
    }
    if (hasAce && score > 21) {
        score -= 10;
    }
    return score;
}

function actualizarCreditos() {
    document.getElementById("creditosJugador").innerText = `Créditos: ${player.creditos}`;
    document.getElementById("apuestaJugador").innerText = player.apuesta;
}

// Asignar el nombre del jugador al objeto 'player'
document.getElementById('btnAceptar').addEventListener('click', () => {
    player.nombre = document.getElementById('nombreJugador').value || 'Jugador 1'; 
    document.getElementById('modalInicio').style.display = 'none';
    cargarDatosJuego(); // Cargar datos después de obtener el nombre
});

// Eventos para los botones de apuesta y sentarse
document.querySelectorAll('.apuesta-btn').forEach(boton => boton.addEventListener('click', ajustarApuesta));
document.querySelectorAll('.sentarse-btn').forEach(boton => boton.addEventListener('click', sentarseJugador));

// Evento para el botón "Repartir Cartas"
document.getElementById('repartirCartasBtn').addEventListener('click', () => {
    if (player.apuesta === 0) {
        mostrarError("Debes realizar una apuesta antes de repartir cartas.");
        return; 
    }
    createDeck();
    shuffleDeck();
    dealCards();
});

// Funciones para la compra de créditos (dentro de blackJack.js)


async function cargarPacks() {
    try {
        const response = await fetch('packs.json');
        const data = await response.json();

        contenedorPacks.innerHTML = ''; // Limpiamos el contenedor antes de cargar nuevos packs

        data.packs.forEach(pack => {
            const packDiv = document.createElement('div');
            packDiv.classList.add('pack', pack.nombre.toLowerCase().replace(/\s+/g, '-'));
            packDiv.innerHTML = `
                <p>${pack.nombre}</p>
                <p>${pack.creditos} créditos</p>
                <p>${pack.precio} dólares</p>
                <button class="btn-quitar btn btn-danger" data-creditos="${pack.creditos}" data-precio="${pack.precio}">-</button>
                <input type="number" class="cantidad-packs" value="0" min="0" readonly>
                <button class="btn-adquirir btn btn-secondary" data-creditos="${pack.creditos}" data-precio="${pack.precio}">+</button>
            `;
            contenedorPacks.appendChild(packDiv);

            const inputCantidad = packDiv.querySelector('.cantidad-packs');

            // Evento para el botón "Agregar"
            packDiv.querySelector('.btn-adquirir').addEventListener('click', () => {
                const creditos = parseInt(pack.creditos);
                const precio = parseInt(pack.precio);
                creditosSeleccionados += creditos;
                totalCompra += precio;
                totalCompraSpan.innerText = totalCompra;

                inputCantidad.value = parseInt(inputCantidad.value) + 1;
            });

            // Evento para el botón "Quitar"
            packDiv.querySelector('.btn-quitar').addEventListener('click', () => {
                const creditos = parseInt(pack.creditos);
                const precio = parseInt(pack.precio);
                if (parseInt(inputCantidad.value) > 0) {
                    creditosSeleccionados -= creditos;
                    totalCompra -= precio;
                    totalCompraSpan.innerText = totalCompra;

                    inputCantidad.value = parseInt(inputCantidad.value) - 1;
                }
            });
        });

        // Evento para el botón "Comprar"
        document.getElementById('btnComprar').addEventListener('click', () => {
            const inputsCantidad = document.querySelectorAll('.cantidad-packs');
            inputsCantidad.forEach(input => {
                input.value = 0;
            });
            creditosSeleccionados = 0;
            totalCompra = 0;
            totalCompraSpan.innerText = totalCompra;
        });
    } catch (error) {
        mostrarError('Error al cargar los packs. Por favor, inténtalo de nuevo más tarde.');
    }
}




// Llama a cargarPacks() al cargar la página o cuando se abra el offcanvas
window.addEventListener('load', cargarPacks);
const offcanvasElement = document.getElementById('offcanvasDarkNavbar');
offcanvasElement.addEventListener('shown.bs.offcanvas', cargarPacks);


// Evento para ocultar el modal al hacer clic en el botón "Comprar" y transferir los créditos
btnComprar.addEventListener('click', () => {
    agregarCreditos(creditosSeleccionados); 
    creditosSeleccionados = 0; 
    totalCompra = 0; 
    totalCompraSpan.innerText = totalCompra; 
 
});

// Cargar el estado al iniciar
cargarEstado();

// Actualizar la interfaz con el estado cargado
if (player.asiento !== null) {
    document.getElementById(`estadoAsiento${player.asiento}`).innerText = `Ocupado por ${player.nombre}`;
    document.getElementById('apuestaContainerJugador').style.display = 'block';
}

actualizarCreditos(); // Actualizar créditos al inicio (después de cargar el estado)



const contenedorListaProductos = document.querySelector('.contenedor-lista-productos');





const borrarApuestaBtn = document.getElementById("borrarApuesta");

// Agregar un event listener al botón de borrar apuesta
borrarApuestaBtn.addEventListener("click", () => {
    // Reiniciar la apuesta del jugador a 0
    player.apuesta = 0;

    // Actualizar el elemento en el HTML que muestra la apuesta del jugador
    const apuestaJugadorElement = document.getElementById("apuestaJugador");
    apuestaJugadorElement.textContent = player.apuesta;

    // Aquí puedes realizar cualquier otra acción que necesites después de borrar la apuesta
});

document.addEventListener('DOMContentLoaded', () => {
    // Array para almacenar los productos adquiridos



   
});