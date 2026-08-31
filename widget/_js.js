/* ================================================================
   Outil de veille documentaire « Au Carré » — logique du widget
   Tables lues : Ressources, Balises, Utilisateurs
   Accès requis : full (création de ressource + bascule favori)
   ================================================================ */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const state = {
  space: "Commun",        // Commun | Personnel | Favoris
  query: "",
  tag: null,              // rowId de balise
  sort: "desc",
  meId: null,
  ready: false,
  R: [], B: [], U: [],    // lignes (objets)
};

/* --- utils ------------------------------------------------------- */

// fetchTable renvoie un format colonne -> tableau de lignes
function toRows(t) {
  if (!t || !t.id) return [];
  return t.id.map((id, i) => {
    const row = { id };
    for (const k in t) if (k !== "id") row[k] = t[k][i];
    return row;
  });
}

// RefList encodé ['L', id, id, ...] -> [id, id]
const refIds = v => (Array.isArray(v) ? v.slice(1) : []);

const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" });
function toMs(v) {
  if (v instanceof Date) return v.getTime();
  if (typeof v === "number") return v * 1000;
  if (typeof v === "string") return Date.parse(v);
  return 0;
}

function fatal(err) {
  const el = $("#fatal");
  $("#boot").hidden = true;
  $("#ui").hidden = true;
  el.hidden = false;
  el.textContent = "Erreur : " + (err && err.message ? err.message : String(err));
}

/* --- chargement ------------------------------------------------- */

let loading = false;
async function load() {
  if (loading) return;
  loading = true;
  try {
    const [R, B, U] = await Promise.all([
      grist.docApi.fetchTable("Ressources"),
      grist.docApi.fetchTable("Balises"),
      grist.docApi.fetchTable("Utilisateurs"),
    ]);
    state.R = toRows(R);
    state.B = toRows(B).filter(b => b.Actif !== false).sort((a, c) => (a.Nom > c.Nom ? 1 : -1));
    state.U = toRows(U).filter(u => u.Actif !== false).sort((a, c) => (a.Nom > c.Nom ? 1 : -1));

    if (!state.meId && state.U.length) state.meId = state.U[0].id;

    if (!state.ready) buildOnce();
    state.ready = true;
    $("#boot").hidden = true;
    $("#ui").hidden = false;
    render();
  } catch (e) {
    fatal(e);
  } finally {
    loading = false;
  }
}

/* --- construction unique des contrôles -------------------------- */

function buildOnce() {
  // sélecteur d'utilisateur courant
  const me = $("#me-select");
  me.innerHTML = state.U.map(u => `<option value="${u.id}">${esc(u.Nom)}</option>`).join("");
  me.value = state.meId;
  me.addEventListener("change", async () => {
    state.meId = Number(me.value);
    try { await grist.setOption("meId", state.meId); } catch (_) {}
    render();
  });

  // onglets d'espace
  $$("nav.spaces button").forEach(btn => {
    btn.addEventListener("click", () => {
      state.space = btn.dataset.space;
      $$("nav.spaces button").forEach(b =>
        b.setAttribute("aria-pressed", String(b === btn)));
      render();
    });
  });

  // recherche
  const q = $("#q");
  q.addEventListener("input", debounce(() => { state.query = q.value.trim().toLowerCase(); render(); }, 180));
  $("#q-clear").addEventListener("click", () => { q.value = ""; state.query = ""; render(); q.focus(); });

  // tri
  $("#sort").addEventListener("change", e => { state.sort = e.target.value; render(); });

  // chips de balises (filtre)
  const tf = $("#tagfilter");
  state.B.forEach(b => {
    const c = document.createElement("button");
    c.type = "button";
    c.className = "chip";
    c.textContent = "#" + b.Nom;
    c.setAttribute("aria-pressed", "false");
    c.addEventListener("click", () => {
      state.tag = state.tag === b.id ? null : b.id;
      $$(".chip", tf).forEach(x => x.setAttribute("aria-pressed",
        String(x === c && state.tag === b.id)));
      render();
    });
    tf.appendChild(c);
  });

  // balises du formulaire
  $("#f-bals").innerHTML = state.B.map(b =>
    `<label><input type="checkbox" name="bal" value="${b.id}"> #${esc(b.Nom)}</label>`).join("");

  // soumission du formulaire
  $("#form").addEventListener("submit", onSubmit);
}

/* --- rendu de la liste ----------------------------------------- */

function currentUser() { return state.U.find(u => u.id === state.meId) || null; }
function myFavIds()    { const u = currentUser(); return u ? refIds(u.Favoris) : []; }

function visibleRows() {
  const favs = myFavIds();
  let rows = state.R.filter(r => {
    if (state.space === "Commun"    && r.Visibilite !== "Commun") return false;
    if (state.space === "Personnel" && !(r.Visibilite === "Personnel" && r.Auteur === state.meId)) return false;
    if (state.space === "Favoris"   && !favs.includes(r.id)) return false;
    if (state.tag && !refIds(r.Balises).includes(state.tag)) return false;
    if (state.query) {
      const hay = (r.Recherche || (r.Titre + " " + r.Description)).toLowerCase();
      if (!hay.includes(state.query)) return false;
    }
    return true;
  });
  rows.sort((a, b) => {
    const d = toMs(a.Date_publication) - toMs(b.Date_publication);
    return state.sort === "asc" ? d : -d;
  });
  return rows;
}

function render() {
  const labels = { Commun: "Espace commun", Personnel: "Mon espace personnel", Favoris: "Mes favoris" };
  $("#liste-t").textContent = labels[state.space];
  $("#me-select").value = state.meId;

  const balName = new Map(state.B.map(b => [b.id, b.Nom]));
  const usrName = new Map(state.U.map(u => [u.id, u.Nom]));
  const favs = myFavIds();
  const rows = visibleRows();

  $("#count").textContent =
    rows.length + (rows.length > 1 ? " ressources" : " ressource") +
    (state.tag ? " · #" + balName.get(state.tag) : "");

  const ul = $("#cards");
  ul.innerHTML = "";
  rows.forEach(r => {
    const isFav = favs.includes(r.id);
    const li = document.createElement("li");
    li.className = "card";
    li.innerHTML = `
      <div class="top">
        <span class="type">${esc(r.Type || "Ressource")}</span>
        <button type="button" class="fav" aria-pressed="${isFav}"
          aria-label="${isFav ? "Retirer des favoris" : "Ajouter aux favoris"} : ${esc(r.Titre)}">★</button>
      </div>
      <h3>${r.Lien
        ? `<a href="${esc(r.Lien)}" target="_blank" rel="noopener">${esc(r.Titre)}</a>`
        : esc(r.Titre)}</h3>
      <p class="desc">${esc(r.Description || "")}</p>
      <div class="bals">${refIds(r.Balises).map(id =>
        `<span class="bal">#${esc(balName.get(id) || "?")}</span>`).join("")}</div>
      <p class="meta"><span>${esc(usrName.get(r.Auteur) || "—")}</span><span>${
        r.Date_publication ? dateFmt.format(toMs(r.Date_publication)) : ""}</span></p>`;
    li.querySelector(".fav").addEventListener("click", () => toggleFav(r.id));
    ul.appendChild(li);
  });

  $("#empty").hidden = rows.length !== 0;
}

/* --- écritures ------------------------------------------------- */

async function toggleFav(resId) {
  const u = currentUser();
  if (!u) return;
  const cur = myFavIds();
  const next = cur.includes(resId) ? cur.filter(i => i !== resId) : [...cur, resId];
  try {
    await grist.docApi.applyUserActions([
      ["UpdateRecord", "Utilisateurs", u.id, { Favoris: ["L", ...next] }],
    ]);
    await load();
  } catch (e) { fatal(e); }
}

async function onSubmit(ev) {
  ev.preventDefault();
  const f = ev.target;
  const msg = $("#form-msg");
  const titre = f.titre.value.trim();
  const description = f.description.value.trim();
  const lien = f.lien.value.trim();
  const bals = $$('input[name="bal"]:checked', f).map(c => Number(c.value));

  msg.className = "msg";
  if (!titre || !description) {
    msg.classList.add("err"); msg.textContent = "Titre et description sont obligatoires."; return;
  }
  if (!lien) {
    msg.classList.add("err");
    msg.textContent = "Ajoute un lien. (Pour joindre un fichier, ouvre la ressource dans Grist.)";
    return;
  }
  if (lien && !/^https?:\/\//i.test(lien)) {
    msg.classList.add("err"); msg.textContent = "Le lien doit commencer par http:// ou https://"; return;
  }

  const btn = f.querySelector(".submit");
  btn.disabled = true;
  try {
    await grist.docApi.applyUserActions([
      ["AddRecord", "Ressources", null, {
        Titre: titre,
        Description: description,
        Type: f.type.value,
        Lien: lien,
        Auteur: state.meId,
        Visibilite: f.perso.checked ? "Personnel" : "Commun",
        Balises: ["L", ...bals],
      }],
    ]);
    f.reset();
    msg.classList.add("ok");
    msg.textContent = "Ressource publiée.";
    if (f.perso.checked) state.space = "Personnel";
    await load();
  } catch (e) {
    msg.classList.add("err");
    msg.textContent = "Échec de la publication : " + (e.message || e);
  } finally {
    btn.disabled = false;
  }
}

/* --- helpers -------------------------------------------------- */

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function debounce(fn, ms) {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

/* --- démarrage ----------------------------------------------- */

grist.ready({ requiredAccess: "full" });
grist.onOptions(opts => {
  if (opts && opts.meId) state.meId = Number(opts.meId);
});
grist.onRecords(() => load());   // refetch à chaque changement du document
load();
