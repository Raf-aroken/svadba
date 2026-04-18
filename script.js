    const STORAGE_KEY = "wedding-vk-2026-data";
    const ADMIN_PASSWORD = "wedding2026";

    const defaultData = {
      yesCount: 0,
      noCount: 0,
      wishes: [],
      visits: 0,
      lastAction: null
    };

    function loadData() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { ...defaultData };
        return { ...defaultData, ...JSON.parse(raw) };
      } catch (err) {
        return { ...defaultData };
      }
    }

    function saveData(data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    const data = loadData();
    data.visits += 1;
    saveData(data);
    const LOCAL_FALLBACK_IMAGE = "./67bd928ce56ed3.10244216.jpg";

    function startCountdown() {
      const weddingDate = new Date("2026-08-22T17:00:00+04:00");
      const ids = {
        days: document.getElementById("days"),
        hours: document.getElementById("hours"),
        minutes: document.getElementById("minutes"),
        seconds: document.getElementById("seconds")
      };

      function updateTimer() {
        const now = new Date();
        const diff = weddingDate - now;
        if (diff <= 0) {
          ids.days.textContent = "0";
          ids.hours.textContent = "0";
          ids.minutes.textContent = "0";
          ids.seconds.textContent = "0";
          return;
        }

        const totalSeconds = Math.floor(diff / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        ids.days.textContent = String(days);
        ids.hours.textContent = String(hours).padStart(2, "0");
        ids.minutes.textContent = String(minutes).padStart(2, "0");
        ids.seconds.textContent = String(seconds).padStart(2, "0");
      }

      updateTimer();
      setInterval(updateTimer, 1000);
    }

    const sections = document.querySelectorAll(".section");
    const tabButtons = document.querySelectorAll(".tab-btn");

    function openTab(tabName) {
      sections.forEach((section) => {
        section.classList.toggle("active", section.id === `tab-${tabName}`);
      });
      tabButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.tab === tabName);
      });
    }

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const target = button.dataset.tab;
        if (!target) return;
        openTab(target);
      });
    });

    function updateAdminView() {
      document.getElementById("stat-yes").textContent = data.yesCount;
      document.getElementById("stat-no").textContent = data.noCount;
      document.getElementById("stat-wishes").textContent = data.wishes.length;
      document.getElementById("stat-visits").textContent = data.visits;

      const entries = document.getElementById("entries");
      entries.innerHTML = "";

      if (!data.wishes.length) {
        entries.innerHTML = '<div class="entry muted">Пока нет отправленных пожеланий.</div>';
        return;
      }

      const latest = [...data.wishes].slice(-10).reverse();
      latest.forEach((wish) => {
        const item = document.createElement("div");
        item.className = "entry";
        item.innerHTML = `
          <div><b>${escapeHtml(wish.name)}</b> ${wish.emoji || ""}</div>
          <div>${escapeHtml(wish.message)}</div>
          <div class="muted">${new Date(wish.createdAt).toLocaleString("ru-RU")}</div>
        `;
        entries.appendChild(item);
      });
    }

    function enableImageFallback() {
      const images = document.querySelectorAll("img");
      images.forEach((img) => {
        img.addEventListener("error", () => {
          if (img.dataset.fallbackApplied === "1") return;
          img.dataset.fallbackApplied = "1";
          img.src = LOCAL_FALLBACK_IMAGE;
        });
      });
    }

    function escapeHtml(value) {
      return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    document.getElementById("btn-yes").addEventListener("click", () => {
      data.yesCount += 1;
      data.lastAction = "yes";
      saveData(data);
      alert("Спасибо! Ваш ответ 'Приду' сохранен.");
      updateAdminView();
    });

    document.getElementById("btn-no").addEventListener("click", () => {
      data.noCount += 1;
      data.lastAction = "no";
      saveData(data);
      alert("Спасибо за ответ! Мы сохранили, что вы не сможете прийти.");
      updateAdminView();
    });

    let selectedEmoji = "❤️";
    const emojiButtons = document.querySelectorAll(".emoji-btn");

    emojiButtons.forEach((btn) => {
      if (btn.dataset.emoji === selectedEmoji) btn.classList.add("active");
      btn.addEventListener("click", () => {
        selectedEmoji = btn.dataset.emoji;
        emojiButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    document.getElementById("wish-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const nameInput = document.getElementById("guest-name");
      const messageInput = document.getElementById("guest-message");
      const name = nameInput.value.trim();
      const message = messageInput.value.trim();

      if (!name || !message) return;

      data.wishes.push({
        name,
        emoji: selectedEmoji,
        message,
        createdAt: new Date().toISOString()
      });
      saveData(data);
      updateAdminView();

      nameInput.value = "";
      messageInput.value = "";
      document.getElementById("wish-success").style.display = "block";
      setTimeout(() => {
        document.getElementById("wish-success").style.display = "none";
      }, 2200);
    });

    document.getElementById("admin-login-btn").addEventListener("click", () => {
      const entered = document.getElementById("admin-password").value;
      if (entered !== ADMIN_PASSWORD) {
        alert("Неверный пароль.");
        return;
      }
      document.getElementById("admin-login-block").classList.add("hidden");
      document.getElementById("admin-panel").classList.remove("hidden");
      updateAdminView();
    });

    document.getElementById("export-btn").addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "wedding-analytics.json";
      a.click();
      URL.revokeObjectURL(url);
    });

    openTab("events");
    enableImageFallback();
    startCountdown();
    updateAdminView();
