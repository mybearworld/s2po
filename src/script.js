// @ts-check

import { messages } from "./messages.js";

/** @type {HTMLTableElement | null} */
const mainTable = document.querySelector("#main-table");
if (mainTable === null) {
  throw new Error("#main-table not found");
}
/** @type {HTMLFormElement | null} */
const mainForm = document.querySelector("#main-form");
if (mainForm === null) {
  throw new Error("#main-form not found");
}
/** @type {HTMLAnchorElement | null} */
const download = document.querySelector("#download-element");
if (download === null) {
  throw new Error("#download-element not found");
}

/** @param {string} name */
const createRow = (name) => {
  const id = mainTableId(name);
  const row = document.createElement("tr");
  const keyColumn = document.createElement("td");
  const keyLabel = document.createElement("label");
  keyLabel.htmlFor = id;
  keyLabel.append(name);
  keyColumn.append(keyLabel);
  const valueColumn = document.createElement("td");
  const valueInput = document.createElement("input");
  valueInput.placeholder = name;
  valueInput.dataset.name = name;
  valueInput.id = id;
  valueColumn.append(valueInput);
  row.append(keyColumn, valueColumn);
  return row;
};

/** @param {string} name */
const mainTableId = (name) => {
  return (
    "main-table-field-" +
    name
      .replace(/[A-Z]/g, (letter) => `capital-${letter.toLowerCase()}`)
      .replace(/[^a-z0-9\-]+/g, (characters) => `-${characters.length}-`)
      .replace(/^-|-$/g, "")
  );
};

messages.forEach((message) => {
  mainTable.append(createRow(message));
});

mainForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const file = [...mainForm.querySelectorAll("input")]
    .map((element) => {
      return `msgid "${element.dataset.name}"\nmsgstr "${element.value}"`;
    })
    .join("\n\n");
  download.href = `data:text/plain,${encodeURIComponent(file)}`;
  download.click();
});
