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
/** @type {HTMLButtonElement | null} */
const loadButton = document.querySelector("#load-button");
if (loadButton === null) {
  throw new Error("#load-button not found");
}
/** @type {HTMLAnchorElement | null} */
const download = document.querySelector("#download-element");
if (download === null) {
  throw new Error("#download-element not found");
}
/** @type {HTMLInputElement | null} */
const upload = document.querySelector("#upload-element");
if (upload === null) {
  throw new Error("#upload-element not found");
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

loadButton.addEventListener("click", () => {
  upload.click();
});

upload.addEventListener("input", async () => {
  const files = upload.files;
  if (files === null) {
    return;
  }
  const file = [...files][0];
  const text = await file.text();
  let failed = 0;
  text.split("\n\n").forEach((line) => {
    const msgid = line.split("\n")[0].slice(7, -1);
    const msgstr = line.split("\n")[1].slice(8, -1);
    /** @type {HTMLInputElement | null} */
    const element = document.querySelector(`#${mainTableId(msgid)}`);
    if (element === null) {
      failed++;
      return;
    }
    element.value = msgstr;
  });
  if (failed !== 0) {
    alert(`Failed to recognize ${failed} key${failed === 1 ? "" : "s"}.`);
  }
});
