// Header scroll effect
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
});

// Mobile menu
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');

burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  nav.classList.toggle('open');
  document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
});

nav.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    burger.classList.remove('open');
    nav.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// Scroll animations
const fadeEls = document.querySelectorAll(
  '.service-card, .testimonial-card, .about__card, .hero__stats .stat'
);

fadeEls.forEach(el => el.classList.add('fade-up'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

fadeEls.forEach(el => observer.observe(el));

// Contact form validation
const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formSuccess = document.getElementById('formSuccess');

function showError(fieldId, errorId, msg) {
  document.getElementById(fieldId).classList.add('error');
  document.getElementById(errorId).textContent = msg;
}

function clearError(fieldId, errorId) {
  document.getElementById(fieldId).classList.remove('error');
  document.getElementById(errorId).textContent = '';
}

function validateEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  let valid = true;

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();

  clearError('name', 'nameError');
  clearError('email', 'emailError');
  clearError('message', 'messageError');

  if (!name) { showError('name', 'nameError', 'Por favor ingresa tu nombre.'); valid = false; }
  if (!email) { showError('email', 'emailError', 'Por favor ingresa tu email.'); valid = false; }
  else if (!validateEmail(email)) { showError('email', 'emailError', 'Email inválido.'); valid = false; }
  if (!message) { showError('message', 'messageError', 'Por favor escribe tu mensaje.'); valid = false; }

  if (!valid) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando...';

  // Simulate sending — replace with real endpoint (fetch/FormSubmit/EmailJS)
  setTimeout(() => {
    form.reset();
    submitBtn.disabled = false;
    submitBtn.textContent = 'Enviar mensaje';
    formSuccess.classList.add('visible');
    setTimeout(() => formSuccess.classList.remove('visible'), 5000);
  }, 1200);
});
