async function loadList() {
  const res = await fetch("../list.json");
  const list = await res.json();

  const c = document.querySelector("#file-list");
  c.innerHTML = "";

  list.forEach(f => {
    const b = document.createElement("button");
    b.textContent = f;
    b.onclick = () => loadTex(f);
    c.appendChild(b);
  });
}

async function loadTex(filename) {
  const res = await fetch(`../tex/${filename}`);
  const text = await res.text();

  const blocks = parseTexToBlocks(text);

  const ed = document.querySelector("#editor");
  ed.innerHTML = "";

  blocks.forEach(b => ed.appendChild(b));
}

document.querySelector("#save-btn").onclick = () => {
  const tex = blocksToTex();
  alert("Simulación de guardado. TEX generado:\n\n" + tex);
};

loadList();
