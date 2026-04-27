let calciBINs = document.querySelectorAll(".calciBIN");
let calciBIN = document.querySelector("#clear");
let backspaceBIN = document.querySelector("#backspace");
let equalToBIN = document.querySelector("#equalTo");
let display = document.querySelector("#display");
calciBINs.forEach((el) => {
  el.addEventListener("click", () => {
    display.value += el.value;
  });
});
const evaluate = () => {
  if (display.value !== "") {
    try {
      let result = math.evaluate(display.value);
      display.value = result;
    } catch (err) {
      display.value = "ERROR";
    }
  }
};

equalToBIN.addEventListener("click", evaluate);

calciBIN.addEventListener("click", () => {
  display.value = "";
});

backspaceBIN.addEventListener("click", () => {
  display.value = display.value.slice(0, -1);
});
