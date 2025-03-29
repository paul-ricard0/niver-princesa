const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
const mailInput = document.getElementById("mail");

document.addEventListener("DOMContentLoaded", () => {
  // Get carousel elements
  const carouselWrapper = document.querySelector(".carousel-wrapper");
  const carouselContainer = document.querySelector(".carousel-container");
  const pauseBtn = document.querySelector(".pause-btn");
  const playBtn = document.querySelector(".play-btn");

  // Carousel configuration
  const isMobile = window.innerWidth < 768;
  const slideWidth = isMobile ? 100 : 20;
  const imgsUrl = [
    "url(./imgs/img01.jpeg)",
    "url(./imgs/img08.jpeg)",
    "url(./imgs/img09.png)",
    "url(./imgs/img02.jpg)",
    "url(./imgs/img12.jpg)",
    "url(./imgs/img10.png)",
    "url(./imgs/img13.jpg)",
    "url(./imgs/img03.jpeg)",
    "url(./imgs/img04.jpeg)",
    "url(./imgs/img11.jpg)",
    "url(./imgs/img05.jpeg)",
    "url(./imgs/img06.jpeg)",
    "url(./imgs/img07.jpg)",
  ];

  // Create initial slides
  for (let i = 0; i < imgsUrl.length; i++) {
    createSlide(imgsUrl[i]);
  }

  // Clone the first set of slides and append them to create the infinite loop effect
  const slides = document.querySelectorAll(".carousel-slide");
  slides.forEach((slide) => {
    const clone = slide.cloneNode(true);
    carouselWrapper.appendChild(clone);
  });

  // Function to create a slide
  function createSlide(imgUrl) {
    const slide = document.createElement("div");
    slide.classList.add(
      "carousel-slide",
      "flex",
      "items-center",
      "justify-center",
      "rounded-lg",
      "min-h-96"
    );
    slide.style.backgroundImage = imgUrl;
    slide.style.backgroundSize = "cover";
    carouselWrapper.appendChild(slide);
  }

  // Animation variables
  let animationId;
  let position = 0;
  const speed = 2.3; // Pixels per frame - lower is slower
  const slideWidthPx = carouselContainer.offsetWidth * (slideWidth / 100);
  const totalWidth = slideWidthPx * imgsUrl.length;

  // Animate the carousel
  function animateCarousel() {
    position -= speed;

    // When we've scrolled past all original slides, reset to beginning
    if (Math.abs(position) >= totalWidth) {
      position = 0;
    }

    carouselWrapper.style.transform = `translateX(${position}px)`;
    animationId = requestAnimationFrame(animateCarousel);
  }

  // Start animation
  animationId = requestAnimationFrame(animateCarousel);

  // Pause when not visible
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else if (playBtn.classList.contains("hidden")) {
      animationId = requestAnimationFrame(animateCarousel);
    }
  });

  // Handle window resize
  window.addEventListener("resize", () => {
    const newSlideWidthPx = carouselContainer.offsetWidth * (slideWidth / 100);
    const ratio = newSlideWidthPx / slideWidthPx;
    position *= ratio;
    const newTotalWidth = newSlideWidthPx * imgsUrl.length;
  });

  const clearTable = () => {
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = ""; // Clear the table body
  };

  const getPresenceList = async () => {
    clearTable();
    try {
      const response = await fetch(
        "https://niver-princesa-fastapi.onrender.com/convidados",
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      const presenceList = data.map((guest) => ({
        name: guest.name,
      }));

      const tbody = document.querySelector("tbody");
      presenceList.forEach((guest) => {
        const tr = document.createElement("tr");
        tr.className = "border-b-2 border-gray-400";
        tr.style.marginTop = "12px";

        const td = document.createElement("td");
        td.className = "w-full flex items-center";

        const span = document.createElement("span");
        span.className =
          "text-ellipsis whitespace-nowrap overflow-hidden w-full text-center";
        span.textContent = guest.name;

        td.appendChild(span);
        tr.appendChild(td);
        tbody.appendChild(tr);
      });
    } catch (error) {
      console.error("Error fetching presence list:", error);
      return [];
    }
  };

  const addPresence = async () => {
    try {
      const response = await fetch(
        "https://niver-princesa-fastapi.onrender.com/convidados",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({
            name: nameInput.value,
            phone: phoneInput.value,
            email: mailInput.value,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Guest added:", data);
      nameInput.value = ''
      phoneInput.value = ''
      mailInput.value = ''
      getPresenceList();
      alert("Prenseça CONFIRMADA! 🩷")
    } catch (error) {
      console.error("Error adding guest:", error);
    }
  };

  const confirmButton = document.querySelector("#confirm-button");
  confirmButton.addEventListener("click", (event) => {
    event.preventDefault(); // Prevent the default form submission
    addPresence();
  });

  getPresenceList();

  phoneInput.addEventListener("input", (event) => {
    const input = event.target;
    const formattedValue = phoneMask(input.value);
    input.value = formattedValue;
  });

  const phoneMask = (value) => {
    if (!value) return "";
    value = value.replace(/\D/g, "");
    value = value.replace(/(\d{2})(\d)/, "($1) $2");
    value = value.replace(/(\d)(\d{4})$/, "$1-$2");
    return value;
  };
});
