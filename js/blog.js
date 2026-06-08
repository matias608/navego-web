// Filtros del blog
const filterBtns = document.querySelectorAll('.filter-btn');
const postCards  = document.querySelectorAll('.posts-grid .post-card');
const featured   = document.querySelector('.post-featured');
const emptyMsg   = document.getElementById('blogEmpty');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('filter-btn--active'));
    btn.classList.add('filter-btn--active');

    const filter = btn.dataset.filter;

    // post destacado
    if (featured) {
      const show = filter === 'all' || featured.dataset.category === filter;
      featured.style.display = show ? 'block' : 'none';
    }

    // tarjetas
    let visible = 0;
    postCards.forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.style.display = match ? 'flex' : 'none';
      if (match) visible++;
    });

    if (emptyMsg) emptyMsg.style.display = visible === 0 ? 'block' : 'none';
  });
});

// Animación de entrada en las tarjetas
const animEls = document.querySelectorAll('.post-card, .post-featured');
const obs = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 70);
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

animEls.forEach(el => { el.classList.add('fade-up'); obs.observe(el); });
