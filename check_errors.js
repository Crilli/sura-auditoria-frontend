const jsdom = require("jsdom");
const { JSDOM } = jsdom;

JSDOM.fromURL("http://localhost:4200", {
  runScripts: "dangerously",
  resources: "usable",
  pretendToBeVisual: true
}).then(dom => {
  dom.window.console.error = (...args) => {
    console.log("BROWSER ERROR:", ...args);
  };
  dom.window.console.warn = (...args) => {
    console.log("BROWSER WARN:", ...args);
  };
  dom.window.console.log = (...args) => {
    console.log("BROWSER LOG:", ...args);
  };
  dom.window.addEventListener("error", (event) => {
    console.error("UNHANDLED ERROR:", event.error);
  });
  dom.window.addEventListener("unhandledrejection", (event) => {
    console.error("UNHANDLED REJECTION:", event.reason);
  });
  
  setTimeout(() => {
    console.log("Done checking.");
    process.exit(0);
  }, 5000);
}).catch(err => {
  console.error("JSDOM Error:", err);
});
