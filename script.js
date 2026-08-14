document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('.card-link');
  links.forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const href = a.getAttribute('href');
      const card = a.querySelector('.card');
      if (card) {
        card.classList.add('card-anim');
      }
      document.body.classList.add('fade-out');
      setTimeout(() => {
        window.location.href = href;
      }, 220);
    });
  });

  requestAnimationFrame(() => {
    document.body.style.opacity = 1;
  });

  const form = document.getElementById('bookingForm');
  if (!form) return;

  const modal = document.getElementById('confirmModal');
  const confirmDetails = document.getElementById('confirmDetails');
  const copyBtn = document.getElementById('copyBtn');
  const closeModal = document.getElementById('closeModal');
  const clearBtn = document.getElementById('clearBtn');
  const whatsQuickBtn = document.getElementById('whatsQuickBtn');
  const sendWhatsBtn = document.getElementById('sendWhatsBtn');

  function showModal(text) {
    if (!modal || !confirmDetails) return;
    confirmDetails.textContent = text;
    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'flex';
  }

  function hideModal() {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
  }

  function openWhatsApp(message) {
    const phoneNumber = '5542998228254';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  function getSelectedServices() {
    return Array.from(form.querySelectorAll('input[name="service"]:checked')).map((input) => input.value);
  }

  function buildMessage(data) {
    return `Olá! Quero agendar um serviço.\nNome: ${data.name}\nTelefone: ${data.phone}\nServiços: ${data.service}\nData: ${data.date} ${data.time}\nEndereço: ${data.address}\nObservações: ${data.notes || 'Nenhuma'}`;
  }

  function isTimeAllowed(dateValue, timeValue) {
    if (!dateValue || !timeValue) return false;

    const [year, month, day] = dateValue.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayIndex = date.getDay();
    const [hours, minutes] = timeValue.split(':').map(Number);
    const totalMinutes = (hours * 60) + minutes;

    const weekdayWindow = totalMinutes >= 14 * 60 && totalMinutes <= 19 * 60;
    const weekendWindow = totalMinutes >= 10 * 60 && totalMinutes <= 20 * 60;

    const isWeekday = dayIndex >= 1 && dayIndex <= 5;
    const isWeekend = dayIndex === 0 || dayIndex === 6;

    return (isWeekday && weekdayWindow) || (isWeekend && weekendWindow);
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => form.reset());
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const selectedServices = getSelectedServices();
    const serviceText = selectedServices.length ? selectedServices.join(', ') : '';

    const data = {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      service: serviceText,
      date: form.date.value,
      time: form.time.value,
      address: form.address.value.trim(),
      notes: form.notes.value.trim(),
      createdAt: new Date().toISOString()
    };

    if (!data.name || !data.phone || !data.date || !data.time || !data.address || !data.service) {
      alert('Preencha todos os campos e selecione pelo menos um serviço para continuar.');
      return;
    }

    if (!isTimeAllowed(data.date, data.time)) {
      alert('Horário fora da disponibilidade atual. Seg. a sex.: 14:00 às 19:00 | sáb. e dom.: 10:00 às 20:00.');
      return;
    }

    try {
      const list = JSON.parse(localStorage.getItem('appointments') || '[]');
      list.push(data);
      localStorage.setItem('appointments', JSON.stringify(list));
    } catch (err) {
      console.warn('LocalStorage não disponível', err);
    }

    const summary = buildMessage(data);
    showModal(summary);
    openWhatsApp(summary);
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const text = confirmDetails.textContent;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          alert('Detalhes copiados para a área de transferência.');
        });
      } else {
        alert('Seu navegador não oferece cópia automática. Copie os detalhes manualmente.');
      }
    });
  }

  if (sendWhatsBtn) {
    sendWhatsBtn.addEventListener('click', () => {
      const text = confirmDetails.textContent || '';
      openWhatsApp(text);
    });
  }

  if (whatsQuickBtn) {
    whatsQuickBtn.addEventListener('click', () => {
      const name = form.name.value.trim();
      const phone = form.phone.value.trim();
      const selectedServices = getSelectedServices();
      const service = selectedServices.length ? selectedServices.join(', ') : '';
      const date = form.date.value;
      const time = form.time.value;
      const address = form.address.value.trim();
      const notes = form.notes.value.trim();

      if (!name || !phone || !date || !time || !address || !service) {
        alert('Preencha todos os campos obrigatórios e selecione pelo menos um serviço antes de enviar pelo WhatsApp.');
        return;
      }

      if (!isTimeAllowed(date, time)) {
        alert('Horário fora da disponibilidade atual. Seg. a sex.: 14:00 às 19:00 | sáb. e dom.: 10:00 às 20:00.');
        return;
      }

      const text = buildMessage({ name, phone, service, date, time, address, notes });
      openWhatsApp(text);
    });
  }

  if (closeModal) {
    closeModal.addEventListener('click', hideModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) hideModal();
    });
  }
});
