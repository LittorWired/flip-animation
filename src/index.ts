import "./styles.css";

// Calculate 1vh value in pixels
// based on window inner height
var vh = window.innerHeight * 0.01;

// Set the CSS variable to the root element
// Which is equal to 1vh
document.documentElement.style.setProperty("--vh", vh + "px");

type Store = {
  footerHeaderTimer: number | null;
  allowMove: boolean;
  isSidebarOpen: boolean;
  hasSmallBreakPoint: boolean;
  mcuHeight: number;
  mcuWidth: number;
  scaleRatio: number;
  rootHeight: number;
  rootWidth: number;
};

const fakeStore: Store = {
  rootHeight: 0,
  rootWidth: 0,
  footerHeaderTimer: null,
  allowMove: true,
  isSidebarOpen: false,
  hasSmallBreakPoint: false,
  mcuHeight: 0,
  mcuWidth: 0,
  scaleRatio: 1
};

const TRANSITION_TIME = window
  .getComputedStyle(document.documentElement)
  .getPropertyValue("--transition-timing-ms");

const header = document.querySelector(".header") as HTMLDivElement;
const footer = document.querySelector(".footer") as HTMLDivElement;
const mcuEl = document.querySelector(".mcu") as HTMLDivElement;
const sideBar = document.querySelector(".sidebar") as HTMLDivElement;
const appDiv = document.querySelector("#app") as HTMLDivElement;

// get sidebar width and height to use for mcu flip animate
const { width: sideBarWidth = 400 } = sideBar.getBoundingClientRect();
const { width: appWidth, height: appHeight } = appDiv.getBoundingClientRect();

// const WINDOW_WIDTH = window.innerWidth;
const SMALL_BREAK_POINT = 400;
fakeStore.hasSmallBreakPoint = appWidth <= SMALL_BREAK_POINT;

// set rootHeight and width
fakeStore.rootHeight = appHeight;
fakeStore.rootWidth = appWidth;

// set mcuHeight, mcuWidth, scaleRatio
const videoAspectRatio = 9 / 16;

fakeStore.mcuHeight = (appWidth - sideBarWidth) * videoAspectRatio;
fakeStore.mcuWidth = appWidth - sideBarWidth;
fakeStore.scaleRatio = appWidth / fakeStore.mcuWidth;

// const scaleRatio = appHeight / mcuHeight;

// at small break point 400px
if (fakeStore.hasSmallBreakPoint) {
  mcuEl.style.translate = "0 -50%";
  mcuEl.style.width = "100%";
  sideBar.style.maxWidth = "100%";
} else {
  mcuEl.style.translate = `${sideBarWidth / 2}px -50%`;

  mcuEl.style.scale = String(fakeStore.scaleRatio);

  // LOGGER
  console.log({
    scaleRatio: fakeStore.scaleRatio,
    appHeight: fakeStore.rootHeight,
    mcuHeight: fakeStore.mcuHeight
  });
}

const flipMCU = () => {
  // fit mcu into the remaining space between header/header and sidebar open

  // from - sidebar is closed and not visible
  if (!fakeStore.isSidebarOpen) {
    mcuEl.style.translate = `${sideBarWidth / 2}px -50%`;
    mcuEl.style.scale = String(fakeStore.scaleRatio);
    mcuEl.style.transition = ` translate ${TRANSITION_TIME} linear,  scale ${TRANSITION_TIME} linear`;
  } else {
    // to - sidebar is open
    mcuEl.style.translate = `0% -50%`;
    mcuEl.style.scale = `1 1`;
    mcuEl.style.transition = `translate ${TRANSITION_TIME} linear ${TRANSITION_TIME}, scale ${TRANSITION_TIME} linear ${TRANSITION_TIME}`;
  }
};

// toggle siderbar and mcu positions if show/hide sidebar
[header, footer].forEach((el) => {
  el.querySelector("button")?.addEventListener("click", () => {
    // set sidebar state
    fakeStore.isSidebarOpen = !fakeStore.isSidebarOpen;

    // only need to flip mcu on widths larger than 400
    if (!fakeStore.hasSmallBreakPoint) {
      mcuEl.style.willChange = "translate, scale";
      flipMCU();
    }
    // sidebar hide/show
    sideBar.classList.toggle("sidebar-open");

    // show header footer if sidebar open
    if (fakeStore.isSidebarOpen) {
      footer.classList.add("active-footer");
      header.classList.add("active-header");
      if (fakeStore.footerHeaderTimer)
        clearTimeout(fakeStore.footerHeaderTimer);
    }

    // once sidebar is closed set the header/footer timer again
    if (!fakeStore.isSidebarOpen) {
      if (fakeStore.footerHeaderTimer)
        clearTimeout(fakeStore.footerHeaderTimer);
      //
      fakeStore.footerHeaderTimer = setTimeout(() => {
        fakeStore.allowMove = true;
        footer.classList.toggle("active-footer");
        header.classList.toggle("active-header");
      }, 1000);
    }
  });
});

// show / hide header footer
const footerHeaderTimer = () => {
  if (fakeStore.footerHeaderTimer !== null) {
    clearTimeout(fakeStore.footerHeaderTimer);
  }
  fakeStore.footerHeaderTimer = setTimeout(() => {
    fakeStore.allowMove = true;
    footer.classList.toggle("active-footer");
    header.classList.toggle("active-header");
  }, 1000);
};

appDiv.addEventListener("mousemove", () => {
  if (Boolean(fakeStore.isSidebarOpen)) return;

  footerHeaderTimer();

  if (!Boolean(fakeStore.allowMove)) return;
  fakeStore.allowMove = false;
  footer.classList.toggle("active-footer");
  header.classList.toggle("active-header");
});

//*** GENERIC STREAM FROM VIDEO CAM */
const constraints = {
  audio: false,
  video: { width: 1280, height: 720 }
};

navigator.mediaDevices
  .getUserMedia(constraints)
  .then((mediaStream) => {
    const video = document.querySelector("video") as HTMLVideoElement;
    video.srcObject = mediaStream;
    video.onloadedmetadata = () => {
      video.play();
    };
  })
  .catch((err) => {
    console.error(`${err.name}: ${err.message}`);
  });
