/*---BARRA DE NAVEGACIÓN RESPONSIVA---*/
const nav = document.querySelector('#nav');
const abrir = document.querySelector('#abrir');
const cerrar = document.querySelector('#cerrar');

abrir.addEventListener('click', () => {
  nav.classList.add('active');
})

cerrar.addEventListener('click', () => {
  nav.classList.remove('active');
})

/*---REVISION FORMULARIO---*/
// Obtener referencias a los campos
const reservationForm = document.getElementById('reservationForm');
const nombreInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const dateInput = document.getElementById('date');
const timeInput = document.getElementById('time');
const guestsInput = document.getElementById('guests');
const btnReserva = document.getElementById('btn-reserva');

// Establecer min/max en el input date para guiar al usuario
function setDateBounds(){
  if(!dateInput) return;
  const hoy = new Date();
  const dd = String(hoy.getDate()).padStart(2,'0');
  const mm = String(hoy.getMonth()+1).padStart(2,'0');
  const yyyy = hoy.getFullYear();
  const min = `${yyyy}-${mm}-${dd}`;

  const unAno = new Date(hoy);
  unAno.setFullYear(unAno.getFullYear() + 1);
  const dd2 = String(unAno.getDate()).padStart(2,'0');
  const mm2 = String(unAno.getMonth()+1).padStart(2,'0');
  const yyyy2 = unAno.getFullYear();
  const max = `${yyyy2}-${mm2}-${dd2}`;

  dateInput.setAttribute('min', min);
  dateInput.setAttribute('max', max);
}

document.addEventListener('DOMContentLoaded', setDateBounds);

// Utilidades de validación
function esNombreValido(nombre){
  if(!nombre) return { ok:false, reason: 'Introduce tu nombre.' };
  const trimmed = nombre.trim();
  if(trimmed.length < 2) return { ok:false, reason: 'El nombre debe tener al menos 2 caracteres.' };
  // Permitir letras (incluidas acentuadas), espacios, guiones y apóstrofes
  const re = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/u;
  if(!re.test(trimmed)) return { ok:false, reason: 'El nombre solo puede contener letras, espacios, guiones o apóstrofes.' };
  return { ok:true };
}

function esEmailValido(email){
  if(!email) return { ok:false, reason: 'Introduce un correo electrónico.' };
  const trimmed = email.trim();
  // Validación razonable para emails (no RFC completo)
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if(!re.test(trimmed)) return { ok:false, reason: 'El correo electrónico no tiene un formato válido.' };
  return { ok:true };
}

function esFechaValida(fechaStr){
  if(!fechaStr) return { ok:false, reason: 'Introduce una fecha.' };
  const selected = new Date(fechaStr + 'T00:00:00'); // tratar como fecha local
  const hoy = new Date();
  hoy.setHours(0,0,0,0);

  // No permitir fechas pasadas
  if(selected < hoy) return { ok:false, reason: 'La fecha no puede ser anterior a hoy.' };

  // No permitir más de 1 año a partir de hoy
  const unAno = new Date(hoy);
  unAno.setFullYear(unAno.getFullYear() + 1);
  if(selected > unAno) return { ok:false, reason: 'La fecha no puede ser posterior a un año desde hoy.' };

  return { ok:true };
}

function esHoraValida(horaStr, fechaStr){
  if(!horaStr) return { ok:false, reason: 'Introduce una hora.' };
  // horaStr formato "HH:MM"
  const parts = horaStr.split(':');
  if(parts.length !== 2) return { ok:false, reason: 'Formato de hora inválido.' };
  const hh = Number(parts[0]);
  const mm = Number(parts[1]);
  if(Number.isNaN(hh) || Number.isNaN(mm) || hh < 0 || hh > 23 || mm < 0 || mm > 59) return { ok:false, reason: 'Formato de hora inválido.' };

  const minutos = hh * 60 + mm;
  const inicioTarde = 13 * 60; // 13:00
  const finTarde = 16 * 60; // 16:00
  const inicioNoche = 20 * 60; // 20:00
  const finNoche = 23 * 60; // 23:00

  const inTarde = minutos >= inicioTarde && minutos <= finTarde;
  const inNoche = minutos >= inicioNoche && minutos <= finNoche;

  if(!(inTarde || inNoche)) return { ok:false, reason: 'La hora debe estar entre 13:00-16:00 o 20:00-23:00.' };

  // Si la fecha es hoy, no permitir horas pasadas
  if(fechaStr){
    const selectedDate = new Date(fechaStr + 'T00:00:00');
    const ahora = new Date();
    // comparar si selectedDate es hoy
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    if(selectedDate.getTime() === hoy.getTime()){
      const ahoraMinutos = ahora.getHours() * 60 + ahora.getMinutes();
      if(minutos <= ahoraMinutos) return { ok:false, reason: 'La hora debe ser posterior a la hora actual.' };
    }
  }

  return { ok:true };
}

function esTelefonoValido(tlf){
  if(!tlf) return { ok:false, reason: 'Introduce un teléfono.' };
  // Normalizar: eliminar todo excepto dígitos
  const digits = tlf.replace(/\D/g, '');
  if(digits.length < 9) return { ok:false, reason: 'El teléfono debe tener al menos 9 dígitos.' };

  // Aceptar formatos nacionales (9 dígitos) o con código de país (por ejemplo 34 + 9 = 11)
  if(digits.length === 9){
    // Opcional: comprobar que comienza por 6,7,8 o 9 (España)
    if(!/^[6789]/.test(digits)) return { ok:false, reason: 'Número de teléfono local inválido (debe comenzar por 6,7,8 o 9).' };
    return { ok:true };
  }

  // Si tiene código de país, permitir entre 10 y 15 dígitos
  if(digits.length >= 10 && digits.length <= 15) return { ok:true };

  return { ok:false, reason: 'Formato de teléfono no reconocido.' };
}

function mostrarErrores(errores, firstInvalidElem){
  // Mostrar todos los errores en un alert simple; mejorar si se desea UI inline
  alert(errores.join('\n'));
  if(firstInvalidElem && typeof firstInvalidElem.focus === 'function'){
    firstInvalidElem.focus();
  }
}

// Manejar submit del formulario
if(reservationForm){
  reservationForm.addEventListener('submit', function(e){
    const errores = [];
    let firstInvalid = null;

    const nombreVal = esNombreValido(nombreInput.value);
    if(!nombreVal.ok){ errores.push(nombreVal.reason); if(!firstInvalid) firstInvalid = nombreInput; }

    const emailVal = esEmailValido(emailInput.value);
    if(!emailVal.ok){ errores.push(emailVal.reason); if(!firstInvalid) firstInvalid = emailInput; }

    const fechaVal = esFechaValida(dateInput.value);
    if(!fechaVal.ok){ errores.push(fechaVal.reason); if(!firstInvalid) firstInvalid = dateInput; }

    const horaVal = esHoraValida(timeInput.value, dateInput.value);
    if(!horaVal.ok){ errores.push(horaVal.reason); if(!firstInvalid) firstInvalid = timeInput; }

    const telVal = esTelefonoValido(phoneInput.value);
    if(!telVal.ok){ errores.push(telVal.reason); if(!firstInvalid) firstInvalid = phoneInput; }

    // Validar número de personas (ya tiene min/max en HTML, pero comprobamos)
    const guests = Number(guestsInput.value);
    if(Number.isNaN(guests) || guests < 1) { errores.push('Introduce un número de personas válido (mínimo 1).'); if(!firstInvalid) firstInvalid = guestsInput; }

    if(errores.length > 0){
      e.preventDefault();
      mostrarErrores(errores, firstInvalid);
      return false;
    }

    // Si pasa todas las validaciones, permitir envío
    return true;
  });
} else {
  console.warn('No se encontró el formulario de reservas (#reservationForm).');
}


(() => {
  /*--- CREACIÓN DE COOKIES ---*/
  const getCookie = (name) => {
    const value = " " + document.cookie;
    console.log("value", `==${value}==`);
    const parts = value.split(" " + name + "=");
    return parts.length < 2 ? undefined : parts.pop().split(";").shift();
  };

  const setCookie = function (name, value, expiryDays, domain, path, secure) {
    const exdate = new Date();
    exdate.setHours(
      exdate.getHours() +
        (typeof expiryDays !== "number" ? 365 : expiryDays) * 24
    );
    document.cookie =
      name +
      "=" +
      value +
      ";expires=" +
      exdate.toUTCString() +
      ";path=" +
      (path || "/") +
      (domain ? ";domain=" + domain : "") +
      (secure ? ";secure" : "");
  };
/*!--- CREACIÓN DE COOKIES ---*/
/*---BANNER DE COOKIES---*/
  const $cookiesBanner = document.querySelector(".cookies-banner");
  const $cookiesBannerButton = $cookiesBanner.querySelector("button");
  const cookieName = "cookiesBanner";
  const hasCookie = getCookie(cookieName);

  if (!hasCookie) {
    $cookiesBanner.classList.remove("hidden");
  }

  $cookiesBannerButton.addEventListener("click", () => {
    setCookie(cookieName, "closed");
    $cookiesBanner.remove();
  });
})();

/*---FILTRADO DE ALERGENOS---*/
$(document).ready(function() {
  const selectedAllergens = new Set();

  $('.category-btn').click(function() {
    const category = $(this).attr('data-category');

    if (category === 'all') {
      // Reiniciar: mostrar todo y limpiar selección
      selectedAllergens.clear();
      $('.category-btn').removeClass('active');
      $('.product-item').show();
    }

    // Alternar selección visual y lógica
    $(this).toggleClass('active');
    if ($(this).hasClass('active')) {
      selectedAllergens.add(category);
    } else {
      selectedAllergens.delete(category);
    }

    // Ocultar los platos que contengan alguno de los alérgenos seleccionados
    $('.product-item').each(function() {
      const itemCategories = ($(this).data('category'));
      const tieneAlergeno = [...selectedAllergens].some(a => itemCategories.includes(a));
      if (tieneAlergeno) {
        $(this).hide();
      } else {
        $(this).show();
      }
    });
  });
});

/*--- Añadir al carrito ---*/
$(document).ready(function() {
  const CART_KEY = "carritoRestaurante";

  function getCart() {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  }
  
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  $('.add-to-cart').off('click').on('click', function(e) {
    e.preventDefault();

    const $product = $(this).closest('.product-item');

    let name = $product.attr('data-name') || $product.data('name'); 
    let price = $product.attr('data-price') || $product.data('price');

    // Extraer precio del texto si no está en data-price
    if (!price) {
      const priceText = $product.find('.precio').text();
      price = priceText.replace('€', '').trim();
    }

    // Guardar data-* en el elemento para futuras extracciones
    try {
      $product.attr('data-name', name);
      $product.data('name', name);
    } catch (err) {
      console.warn('No se pudieron guardar data-* en el elemento:', err);
    }

    // Preparar item y añadir al carrito
    const item = { 
      name: String(name), 
      price: String(price),
    };
    
    let cart = getCart();
    cart.push(item);
    saveCart(cart);
    
    alert(`"${name}" añadido al carrito!`);
  });

  /*--- MOSTRAR CARRITO en página de reservas ---*/
  function mostrarCarritoEnReservas() {
    const cart = getCart();
    
    // Solo mostrar si estamos en la página de reservas y hay items en el carrito
    if (cart.length === 0) {
      return;
    }

    // Remover carrito existente si hay uno
    $('.carrito-resumen').remove();

    const cartContainer = $(`
      <div class="carrito-resumen mb-4 p-3 border rounded bg-light">
        <h4> Platos seleccionados para su reserva:</h4>
        <ul></ul>
        <strong class="total"></strong>
        <div class="mt-3">
          <button type="button" class="btn btn-sm btn-danger" id="vaciar-carrito">
            Vaciar carrito
          </button>
        </div>
      </div>
    `);

    // Rellenar lista
    const ul = cartContainer.find("ul");
    cart.forEach(item => ul.append(`<li>${item.name} - €${item.price}</li>`));

    // Calcular total
    const total = cart.reduce((sum, i) => sum + parseFloat(i.price || 0), 0).toFixed(2);
    cartContainer.find(".total").text(`Total: €${total}`);

    // Insertar antes del formulario de reservas
    $('#form-reserva').before(cartContainer);

    // Botón de vaciar
    $("#vaciar-carrito").off('click').on('click', function() {
      localStorage.removeItem(CART_KEY);
      cartContainer.remove();
      alert("Carrito vaciado.");
    });
  }

  // Mostrar carrito cuando la página cargue
  mostrarCarritoEnReservas();
});

/*--- CAPTCHA MATEMÁTICO ANTI-SPAM ---*/
class Captcha {
    constructor() {
        this.num1 = Math.floor(Math.random() * 10) + 1;
        this.num2 = Math.floor(Math.random() * 10) + 1;
        this.operators = ['+', '-', '*'];
        this.operator = this.operators[Math.floor(Math.random() * this.operators.length)];
        this.answer = this.calculateAnswer();
        this.attempts = 0;
        this.maxAttempts = 3;
    }

    calculateAnswer() {
        switch(this.operator) {
            case '+': return this.num1 + this.num2;
            case '-': return this.num1 - this.num2;
            case '*': return this.num1 * this.num2;
            default: return this.num1 + this.num2;
        }
    }

    generateQuestion() {
        return `¿Cuánto es ${this.num1} ${this.operator} ${this.num2}?`;
    }

    validate(userAnswer) {
        return parseInt(userAnswer) === this.answer;
    }

    generateHTML() {
        return `
            <div class="captcha-section mb-3 p-3 border rounded bg-light">
                <h5>Verificación Anti-Spam</h5>
                <label for="captcha-answer" class="form-label fw-bold">${this.generateQuestion()}</label>
                <input type="number" class="form-control" id="captcha-answer" required 
                       placeholder="Ingrese el resultado">
                <div class="form-text text-muted">
                    Resuelva esta operación matemática simple para demostrar que no es un robot.
                    <br>Intentos restantes: ${this.maxAttempts - this.attempts}
                </div>
                <div class="mt-2">
                    <button type="button" class="btn btn-sm btn-outline-secondary" id="refresh-captcha">
                         Nueva operación
                    </button>
                </div>
            </div>
        `;
    }
}

// Sistema principal del CAPTCHA
class CaptchaSystem {
    constructor() {
        this.captcha = null;
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;
        
        const form = document.getElementById('reservationForm');
        if (!form) {
            console.log('Formulario de reservas no encontrado, CAPTCHA no inicializado');
            return;
        }

        this.generateNewCaptcha();
        this.injectCaptchaIntoForm();
        this.setupEventListeners();
        this.isInitialized = true;
        
        console.log('CAPTCHA inicializado');
    }

    generateNewCaptcha() {
        this.captcha = new Captcha();
        // Guardar en sessionStorage para validación consistente
        sessionStorage.setItem('Captcha', JSON.stringify({
            answer: this.captcha.answer,
            attempts: this.captcha.attempts
        }));
    }

    injectCaptchaIntoForm() {
        const form = document.getElementById('reservationForm');
        const submitButton = form.querySelector('button[type="submit"]');
        
        // Remover CAPTCHA existente si hay uno
        const existingCaptcha = form.querySelector('.captcha-section');
        if (existingCaptcha) {
            existingCaptcha.remove();
        }

        // Insertar antes del botón de enviar
        submitButton.insertAdjacentHTML('beforebegin', this.captcha.generateHTML());
    }

    validateForm(e) {
        e.preventDefault();
        
        const captchaData = JSON.parse(sessionStorage.getItem('Captcha'));
        if (!captchaData) {
            alert('Error de verificación. Por favor, recargue la página.');
            return false;
        }

        const userAnswer = document.getElementById('captcha-answer').value;
        
        if (!userAnswer) {
            alert('Por favor, resuelva la operación matemática.');
            return false;
        }

        if (parseInt(userAnswer) === captchaData.answer) {
            // CAPTCHA correcto - permitir envío
            alert('Verificación exitosa. Enviando reserva...');
            sessionStorage.removeItem('mathCaptcha'); // Limpiar después de uso
            return true;
        } else {
            // CAPTCHA incorrecto
            this.captcha.attempts++;
            const remainingAttempts = this.captcha.maxAttempts - this.captcha.attempts;
            
            // Actualizar en sessionStorage
            sessionStorage.setItem('Captcha', JSON.stringify({
                answer: this.captcha.answer,
                attempts: this.captcha.attempts
            }));

            if (remainingAttempts <= 0) {
                alert('Demasiados intentos fallidos. Por favor, recargue la página.');
                this.blockForm();
                return false;
            } else {
                alert(`Respuesta incorrecta. Le quedan ${remainingAttempts} intentos.`);
                document.getElementById('captcha-answer').value = '';
                document.getElementById('captcha-answer').focus();
                this.updateAttemptsDisplay();
                return false;
            }
        }
    }

    updateAttemptsDisplay() {
        const formText = document.querySelector('.captcha-section .form-text');
        if (formText) {
            const remaining = this.captcha.maxAttempts - this.captcha.attempts;
            formText.innerHTML = `Resuelva esta operación matemática simple para demostrar que no es un robot.
                <br>Intentos restantes: ${remaining}`;
        }
    }

    blockForm() {
        const submitButton = document.querySelector('#reservationForm button[type="submit"]');
        const captchaInput = document.getElementById('captcha-answer');
        const refreshButton = document.getElementById('refresh-captcha');
        
        if (submitButton) submitButton.disabled = true;
        if (captchaInput) captchaInput.disabled = true;
        if (refreshButton) refreshButton.disabled = true;
    }

    refreshCaptcha() {
        this.generateNewCaptcha();
        this.injectCaptchaIntoForm();
        this.setupEventListeners(); // Re-conectar event listeners
    }

    setupEventListeners() {
        const form = document.getElementById('reservationForm');
        const refreshButton = document.getElementById('refresh-captcha');
        
        // Reemplazar el event listener del submit
        form.removeEventListener('submit', this.captchaSubmitHandler);
        this.captchaSubmitHandler = (e) => this.validateForm(e);
        form.addEventListener('submit', this.captchaSubmitHandler);
        
        // Botón de refrescar CAPTCHA
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.refreshCaptcha();
            });
        }
    }
}

// Instancia global del sistema CAPTCHA
const captchaSystem = new CaptchaSystem();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    captchaSystem.init();
});