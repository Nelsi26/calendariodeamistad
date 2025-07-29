// === SELECCIÓN DE PERFIL ===
const profiles = document.querySelectorAll('.profile');
let activeProfile = {
  name: 'Keiry',
  color: 'color1',
  bgColor: '#fff9aecc',
  textColor: '#665c00'
};

profiles.forEach(profile => {
  profile.addEventListener('click', () => {
    profiles.forEach(p => p.classList.remove('active'));
    profile.classList.add('active');
    activeProfile.name = profile.dataset.name;
    activeProfile.color = profile.dataset.color;

    switch (activeProfile.color) {
      case 'color1':
        activeProfile.bgColor = '#fff9aecc'; activeProfile.textColor = '#665c00'; break;
      case 'color2':
        activeProfile.bgColor = '#cdb4dbcc'; activeProfile.textColor = '#4b3869'; break;
      case 'color3':
        activeProfile.bgColor = '#b9fbc0cc'; activeProfile.textColor = '#2d6a4f'; break;
      case 'color4':
        activeProfile.bgColor = '#ffccd5cc'; activeProfile.textColor = '#7a2e2e'; break;
    }
  });
});

// === CALENDARIO DINÁMICO ===
const startHour = 6;
const endHour = 24;
const calendarBody = document.getElementById('calendar-body');
let scheduleData = JSON.parse(localStorage.getItem('scheduleData')) || {};

function createCalendar() {
  calendarBody.innerHTML = '';
  for (let hour = startHour; hour < endHour; hour++) {
    for (let half = 0; half < 2; half++) {
      const tr = document.createElement('tr');
      if (half === 0) {
        const tdHour = document.createElement('td');
        tdHour.classList.add('hour');
        tdHour.rowSpan = 2;
        tdHour.textContent = `${hour.toString().padStart(2, '0')}:00`;
        tr.appendChild(tdHour);
      }

      for (let day = 1; day <= 7; day++) {
        const td = document.createElement('td');
        const key = `${day}-${hour}-${half * 30}`;
        td.dataset.key = key;

        const container = document.createElement('div');
        container.className = 'blocks-container';

        if (scheduleData[key]) {
          Object.entries(scheduleData[key]).forEach(([name, act]) => {
            const block = document.createElement('div');
            block.className = `block ${act.colorClass}`;
            block.style.backgroundColor = act.bgColor;
            block.style.color = act.textColor;

            const nameEl = document.createElement('span');
            nameEl.className = 'name';
            nameEl.textContent = name;

            const commentEl = document.createElement('span');
            commentEl.className = 'comment';
            commentEl.textContent = act.comment || '';

            block.appendChild(nameEl);
            if (act.comment) block.appendChild(commentEl);

            block.dataset.profile = name;
            container.appendChild(block);
          });
        }

        td.appendChild(container);
        td.addEventListener('click', e => {
          const clickedBlock = e.target.closest('.block');
          if (clickedBlock && clickedBlock.dataset.profile !== activeProfile.name) return;

          currentKey = key;
          const current = scheduleData[key]?.[activeProfile.name];
          commentInput.value = current?.comment || '';
          modal.show();
          commentInput.focus();
        });

        tr.appendChild(td);
      }

      calendarBody.appendChild(tr);
    }
  }
}

// === MODAL ===
const commentInput = document.getElementById('commentInput');
const cancelBtn = document.querySelector('.cancel');
const saveBtn = document.getElementById('saveBtn');
const deleteBtn = document.getElementById('deleteBtn');
let currentKey = null;

const modalElement = document.getElementById('activityModal');
const modal = new bootstrap.Modal(modalElement);

saveBtn.addEventListener('click', () => {
  const comment = commentInput.value.trim();
  if (!scheduleData[currentKey]) scheduleData[currentKey] = {};
  scheduleData[currentKey][activeProfile.name] = {
    comment,
    bgColor: activeProfile.bgColor,
    textColor: activeProfile.textColor,
    colorClass: activeProfile.color
  };
  saveAndRender();
});

deleteBtn.addEventListener('click', () => {
  if (scheduleData[currentKey]) {
    delete scheduleData[currentKey][activeProfile.name];
    if (Object.keys(scheduleData[currentKey]).length === 0) {
      delete scheduleData[currentKey];
    }
  }
  saveAndRender();
});

function saveAndRender() {
  localStorage.setItem('scheduleData', JSON.stringify(scheduleData));
  createCalendar();
  modal.hide();
  currentKey = null;
}

createCalendar();

// === SWIPE PARA OCULTAR/ MOSTRAR SIDEBAR EN MÓVIL ===
const sidebar = document.querySelector('.sidebar');
const calendar = document.querySelector('.calendar-container');

let touchStartX = 0;
let touchEndX = 0;

function handleGesture() {
  if (window.innerWidth >= 768) return; // Solo en móvil

  const swipeDistance = touchStartX - touchEndX;

  if (swipeDistance > 50) {
    // Swipe left -> ocultar sidebar
    sidebar.classList.add('hide-on-scroll');
    calendar.style.marginLeft = '0';
  } else if (swipeDistance < -50) {
    // Swipe right -> mostrar sidebar
    sidebar.classList.remove('hide-on-scroll');
    calendar.style.marginLeft = '160px';
  }
}

window.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

window.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleGesture();
});
