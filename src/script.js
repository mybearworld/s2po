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
  const [title, pattern] = specialWordsValidation(name);
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
  valueInput.title = title;
  valueInput.pattern = pattern;
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

/**
 * @param {string} name
 * @returns {[string, string]}
 */
const specialWordsValidation = (name) => {
  const specialWords = [...name.matchAll(/[%@]\S*/g)];
  if (specialWords.length === 0) {
    return ["", ""];
  }
  return [
    specialWords.length === 1
      ? `This string must include ${specialWords[0][0]}`
      : `This string must include ${specialWords
          .map((word) => word[0])
          .join(", ")} in that order.`,
    "^[^@%]*?" +
      specialWords
        .map((word) => word[0].replace(/\./, "\\."))
        .join("\\s[^@%]+?\\s") +
      "[^@%]*?$",
  ];
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
  upload.value = "";
  /** @type {string[]} */
  const failed = [];
  text.split("\n\n").forEach((line) => {
    const msgid = line.match(/^msgid "(.+?)"$/m)?.[1];
    if (msgid === undefined) {
      return;
    }
    const msgstr = line.match(/^msgstr "(.+?)"$/m)?.[1];
    if (msgstr === undefined) {
      return;
    }
    /** @type {HTMLInputElement | null} */
    const element = document.querySelector(`#${mainTableId(msgid)}`);
    if (element === null) {
      failed.push(msgid);
      return;
    }
    element.value = msgstr;
  });
  if (failed.length !== 0) {
    alert(
      `Failed to recognize ${failed.length} key${
        failed.length === 1 ? "" : "s"
      }:\n\n${failed.join("\n")}`
    );
  }
});
