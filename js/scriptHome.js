// ============================================================
//  CONFIGURAÇÃO SUPABASE
//  Substitua as constantes abaixo pelas suas credenciais
// ============================================================
const SUPABASE_URL = "https://kondbzlavytcmyhwxmqn.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvbmRiemxhdnl0Y215aHd4bXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNzEyODEsImV4cCI6MjA4ODg0NzI4MX0.2ujdxoM2MpMltYRb8WWYxvY0q92L0v0OwdqcS6yhCnE";
const TABELA = "CENARIOS_TESTE";
const COLUNA_PROCESSO = "ID_PROCES";

// ============================================================
//  FUNÇÃO UTILITÁRIA — busca cenários no Supabase por processo
// ============================================================
async function fetchCenariosSupabase(processoId) {
  const url = `${SUPABASE_URL}/rest/v1/${TABELA}?${COLUNA_PROCESSO}=eq.${processoId}&select=*`;
  console.log("URL chamada:", url); // 👈 e isso

  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Erro ao buscar dados: ${response.status} ${response.statusText}`,
    );
  }

  return await response.json(); // retorna array de objetos
}

// ============================================================

const page = document.body.id;

if (page === "homePage") initHome();
if (page === "cenarioTestehtml") initCenarioTeste();

// ============================ HOME ============================

function initHome() {
  const pageHome = document.getElementById("homePage");
  const process = pageHome.querySelector("#processo");

  document.addEventListener("DOMContentLoaded", () => {
    // pageHome.querySelector("#sistema").addEventListener("click", () => {
    //   selectSystem(pageHome);
    // });

    selectSystem(pageHome);

    pageHome.querySelector("#cTeste").addEventListener("click", () => {
      if (
        process.value == "default" ||
        process.value == "" ||
        process.value == null
      ) {
        alert("Selecione um processo!");
        return;
      } else {
        const procId = process.value;
        const procDesc = process.options[process.selectedIndex].text;
        const url = `pages/cenarioTeste.html?processo=${procId}&desc=${encodeURIComponent(procDesc)}`;
        window.open(url, "_blank");
      }
    });
  });

  pageHome.querySelector("#especProj").addEventListener("click", () => {
    if (
      process.value == "default" ||
      process.value == "" ||
      process.value == null
    ) {
      alert("Selecione um processo!");
      return;
    } else {
      const procId = process.value;
      const procDesc = process.options[process.selectedIndex].text;
      const url = `especificaProjeto.html?processo=${procId}&desc=${encodeURIComponent(procDesc)}`;
      window.open(url, "_blank");
    }
  });
}

function selectSystem(pageHome) {
  const system = pageHome.querySelector("#sistema");
  const divTipo = pageHome.querySelector("#divTipo");
  const tipo = pageHome.querySelector("#tipo");
  const divProces = pageHome.querySelector("#divProces");
  const proces = pageHome.querySelector("#processo");
  const divConsulta = pageHome.querySelector("#divConsulta");
  const consulta = pageHome.querySelector("#consulta");

  // Evento ao mudar SISTEMA
  system.addEventListener("change", () => {
    const sistemaSelecionado = system.value;

    if (!sistemaSelecionado || sistemaSelecionado === "default") {
      divTipo.style.display = "none";
      divProces.style.display = "none";
      tipo.value = "";
      proces.value = "";
      return;
    }

    divTipo.style.display = "flex";
    divProces.style.display = "none";
    tipo.value = "";
    proces.value = "";
  });

  // Evento ao mudar TIPO
  tipo.addEventListener("change", () => {
    const sistemaSelecionado = system.value;
    const tipoSelecionado = tipo.value;

    if (!tipoSelecionado || tipoSelecionado === "default") {
      divProces.style.display = "none";
      proces.value = "";
      return;
    }

    if (tipoSelecionado == "processo") {
      divProces.style.display = "flex";
      divConsulta.style.display = "none";
      proces.value = "";

      [...proces.options].forEach((option) => {
        if (!option.dataset.tipo) {
          option.hidden = false;
          return;
        }
        option.hidden = option.dataset.tipo !== sistemaSelecionado;
      });
    } else if (tipoSelecionado == "consulta") {
      divProces.style.display = "none";
      proces.value = "";

      divConsulta.style.display = "flex";
      consulta.value = "";

      [...consulta.options].forEach((option) => {
        if (!option.dataset.tipo) {
          option.hidden = false;
          return;
        }
        option.hidden = option.dataset.tipo !== sistemaSelecionado;
      });
    }
  });
}

// ====================== CENÁRIO DE TESTE ======================

function initCenarioTeste() {
  let cenarios = [];
  let statusTable = false;

  const params = new URLSearchParams(window.location.search);

  const procesCenario = {
    id: params.get("processo"),
    descProces: params.get("desc"),
  };

  console.log("processo:", procesCenario);

  const pageCTest = document.getElementById("cenarioTestehtml");
  const textH1 = pageCTest.querySelector("#head h1");
  const tabela = pageCTest.querySelector("#tabelaCenarios");
  const tbodyPre = document.getElementById("preCondicoesBody");
  const btnAddPre = document.querySelector(".btn-add-pre");

  if (procesCenario) {
    textH1.textContent += procesCenario.descProces;

    // ---------- Pré-condições ----------
    btnAddPre.addEventListener("click", () => {
      const index = tbodyPre.children.length + 1;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${index}</td>
        <td><input type="text" /></td>
        <td>
          <button type="button" class="btn-delete">
            <i class="ph ph-trash"></i>
          </button>
        </td>
      `;
      tbodyPre.appendChild(tr);
    });

    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn-delete");
      if (!btn) return;

      const tr = btn.closest("tr");
      const tbody = tr.closest("tbody");

      tr.remove();

      if (tbody.id === "preCondicoesBody") {
        [...tbody.children].forEach((row, i) => {
          row.children[0].textContent = i + 1;
        });
      }

      if (tbody.closest("#tabelaCenarios")) {
        [...tbody.querySelectorAll("tr")].forEach((row, i) => {
          row.children[1].textContent = i + 1;
        });
      }
    });

    if (!tabela) {
      console.log("Tabela não encontrada");
    } else {
      fetchCenariosSupabase(procesCenario.id)
        .then((data) => {
          console.log("Dados retornados:", data);
          console.log("procesCenario.id:", procesCenario.id);
          cenarios = data;
          statusTable = renderTabela(procesCenario.id, pageCTest, cenarios);
        })
        .catch((err) => {
          console.error("Erro ao buscar cenários:", err);
          alert("Não foi possível carregar os cenários. Verifique o console.");
        });
    }
  }

  pageCTest.querySelector("#gerarCena").addEventListener("click", () => {

    const numTicket = document.getElementById("inputTicket").value;

    if (statusTable == false) {
      alert("Nenhum cenário encontrado!");

    } else if (numTicket == "") {
      alert("Favor preencher o número do Ticket Movidesk.");

    } else {
      printCenario(pageCTest, procesCenario.descProces);
    }
    
  });

  initModalAdicionarCenario(procesCenario);
}

// ====================== RENDERIZA TABELA ======================

function renderTabela(processo, page, cenarios) {
  const tbody = page.querySelector("#tabelaCenarios tbody");
  tbody.innerHTML = "";

  let statusTable;

  const filtrados = cenarios.filter(
    (cenario) => cenario.ID_PROCES === processo,
  );

  if (filtrados.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9">Nenhum cenário encontrado</td></tr>`;
    return (statusTable = false);
  }

  filtrados.forEach((cenario, index) => {
    const tr = document.createElement("tr");

    const aceiteArray = Array.isArray(cenario.CRITERIO_ACEITE)
      ? cenario.CRITERIO_ACEITE
      : (cenario.CRITERIO_ACEITE || "").split("\n").filter(Boolean);

    const passosArray = Array.isArray(cenario.PASSOS)
      ? cenario.PASSOS
      : (cenario.PASSOS || "").split("\n").filter(Boolean);

    tr.innerHTML = `
      <td><button class="btn-delete"><i class="bi bi-trash3"></i></button></td>
      <td>${index + 1}</td>
      <td style="text-align: left; padding-left: 16px;">${cenario.CENARIO ?? ""}</td>
      <td>
        <ul style="text-align: left; padding-left: 16px;">${aceiteArray.map((item) => `<li>${item}</li>`).join("")}</ul>
      </td>
      <td>
        <ul style="text-align: left; padding-left: 16px;">${passosArray.map((p) => `<li>${p}</li>`).join("")}</ul>
      </td>
      <td>${cenario.PRIORIDADE ?? ""}</td>
      <td>${cenario.DIFICULDADE ?? ""}</td>
      <td>${cenario.EVIDENCIAS ?? ""}</td>
      <td>${cenario.STATUS ?? ""}</td>
    `;

    tbody.appendChild(tr);
  });

  return (statusTable = true);
}

// ====================== GERAR EXCEL ======================
// (restante do código — printCenario — permanece sem alterações)
function printCenario(page, descProces) {
  if (typeof XLSX === "undefined") {
    console.error("Biblioteca XLSX não encontrada.");
    return;
  }

  const wb = XLSX.utils.book_new();
  const ws_data = [];

  /* =======================
  CAPTURA DO HEAD
  ======================= */
  const headDiv = page.querySelector("#head");

  const titulo = headDiv.querySelector("h1").innerText || "";
  const ticket = headDiv.querySelector("#inputTicket")?.value || "";
  const dev = headDiv.querySelector("#devResp")?.value || "";
  const rawDate = headDiv.querySelector('input[type="date"]')?.value || "";
  const data = rawDate ? rawDate.split("-").reverse().join("/") : "";

  const nameFile = "CenarioTeste_" + ticket + " - " + descProces + ".xlsx";

  /* =======================
     PRÉ-CONDIÇÕES
  ======================= */
  const preCondicoes = [];
  const preCondicoesBody = page.querySelector("#preCondicoesBody");

  if (preCondicoesBody) {
    preCondicoesBody.querySelectorAll("tr").forEach((tr, i) => {
      const input = tr.querySelector("input");
      if (input && input.value.trim()) {
        preCondicoes.push(`${i + 1}. ${input.value}`);
      }
    });
  }

  /* =======================
     MONTA O HEAD NO EXCEL
  ======================= */
  ws_data.push([titulo]);
  ws_data.push([`Ticket Movidesk: ${ticket}`]);
  ws_data.push([`Dev Responsável: ${dev}`]);
  ws_data.push([`Data: ${data}`]);
  ws_data.push([]);

  const rowPreCondTitle = ws_data.length;

  if (preCondicoes.length) {
    ws_data.push(["Pré-Condições"]);
    preCondicoes.forEach((pc) => ws_data.push([pc]));
    ws_data.push([]);
  }

  /* =======================
     TABELA DE CENÁRIOS
  ======================= */
  const tabela = page.querySelector("#tabelaCenarios");

  const headers = Array.from(tabela.querySelectorAll("thead th"))
    .slice(1)
    .map((th) => th.innerText);

  const rowHeaderTable = ws_data.length;
  ws_data.push(headers);

  tabela.querySelectorAll("tbody tr").forEach((tr) => {
    const row = Array.from(tr.querySelectorAll("td"))
      .slice(1)
      .map((td) => {
        const ol = td.querySelector("ol");
        if (ol) {
          return Array.from(ol.querySelectorAll("li"))
            .map((li, i) => `${i + 1}. ${li.innerText}`)
            .join("\n");
        }
        return td.innerText;
      });
    ws_data.push(row);
  });

  const ws = XLSX.utils.aoa_to_sheet(ws_data);

  /* =======================
     MERGES
  ======================= */
  ws["!merges"] = [];

  const lastCol = headers.length - 1;

  // Head
  for (let i = 0; i <= 4; i++) {
    ws["!merges"].push({ s: { r: i, c: 0 }, e: { r: i, c: lastCol } });
  }

  ws["!rows"] = [];
  ws["!rows"][0] = { hpt: 42 };
  ws["!rows"][1] = { hpt: 24 };
  ws["!rows"][2] = { hpt: 24 };
  ws["!rows"][3] = { hpt: 24 };
  ws["!rows"][5] = { hpt: 24 };

  // Pré-Condições
  if (preCondicoes.length) {
    // Merge do título + itens
    for (
      let r = rowPreCondTitle;
      r <= rowPreCondTitle + preCondicoes.length;
      r++
    ) {
      ws["!merges"].push({ s: { r, c: 0 }, e: { r, c: lastCol } });
      ws["!rows"][r] = { hpt: 21 };
    }

    const rowAfterPreCond = rowPreCondTitle + preCondicoes.length + 1;

    ws["!merges"].push({
      s: { r: rowAfterPreCond, c: 0 },
      e: { r: rowAfterPreCond, c: lastCol },
    });
    ws["!rows"][rowAfterPreCond] = { hpt: 27 };
  }

  /* =======================
     LARGURA DAS COLUNAS
  ======================= */
  ws["!cols"] = [
    { wch: 8 },
    { wch: 68 },
    { wch: 85 },
    { wch: 55 },
    { wch: 25 },
    { wch: 15 },
    { wch: 55 },
    { wch: 15 },
  ];

  /* =======================
     ESTILOS
  ======================= */
  const range = XLSX.utils.decode_range(ws["!ref"]);

  // Intervalo das Pré-Condições
  const firstPreCondRow = rowPreCondTitle;
  const lastPreCondRow = rowPreCondTitle + preCondicoes.length;
  const rowAfterPreCond = lastPreCondRow + 1;

  for (let R = 0; R <= range.e.r; ++R) {
    for (let C = 0; C <= range.e.c; ++C) {
      const cell = XLSX.utils.encode_cell({ r: R, c: C });

      if (!ws[cell]) continue;

      ws[cell].s = {
        font: { sz: 11 },
        alignment: { vertical: "center", horizontal: "center", wrapText: true },
        border: {
          top: { style: "thin", color: { rgb: "D9D9D9" } },
          bottom: { style: "thin", color: { rgb: "D9D9D9" } },
          left: { style: "thin", color: { rgb: "D9D9D9" } },
          right: { style: "thin", color: { rgb: "D9D9D9" } },
        },
      };

      // Pré-Condições (título + itens)
      if (R >= firstPreCondRow && R <= lastPreCondRow) {
        ws[cell].s.border = {};
        ws[cell].s.alignment.horizontal = "left";
      }

      // Linha em branco logo abaixo das Pré-Condições
      if (R === rowAfterPreCond) {
        ws[cell].s.border = {};
      }

      // Título
      if (R === 0) {
        ws[cell].s = {
          font: { bold: true, sz: 14 },
          fill: { fgColor: { rgb: "DCE6F1" } },
          alignment: { horizontal: "center", vertical: "center" },
        };
      }

      // Head
      if (R >= 1 && R <= 3) {
        ws[cell].s = {
          font: { bold: true, sz: 12 },
          alignment: { horizontal: "left", vertical: "center" },
        };
      }

      // Título Pré-Condições
      if (ws_data[R]?.[0] === "Pré-Condições") {
        ws[cell].s = {
          font: { bold: true, sz: 12 },
          fill: { fgColor: { rgb: "DCE6F1" } },
          alignment: { vertical: "center", horizontal: "left" },
        };
      }

      // Cabeçalho da tabela
      if (R === rowHeaderTable) {
        ws[cell].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "DCE6F1" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "D9D9D9" } },
            bottom: { style: "thin", color: { rgb: "D9D9D9" } },
            left: { style: "thin", color: { rgb: "D9D9D9" } },
            right: { style: "thin", color: { rgb: "D9D9D9" } },
          },
        };
        ws["!rows"][R] = { hpt: 21 };
      }

      if (R > rowHeaderTable && (C === 2 || C === 3)) {
        ws[cell].s.alignment.horizontal = "left";
      }
    }
  }

  XLSX.utils.book_append_sheet(wb, ws, "Cenarios");
  XLSX.writeFile(wb, nameFile);
}

function initModalAdicionarCenario(procesCenario) {
  const overlay = document.getElementById("overlayModal");
  const btnAbrir = document.getElementById("btnAbrirModal");
  const btnFechar = document.getElementById("btnFecharModal");
  const btnCancelar = document.getElementById("btnCancelarModal");
  const btnSalvar = document.getElementById("btnSalvarCenario");
  const btnAddPasso = document.getElementById("btnAddPasso");
  const passosLista = document.getElementById("modalPassosLista");

  const idProces = document.getElementById("modalIdProces");
  const proces = document.getElementById("modalProcesso");
  idProces.value = procesCenario.id;
  proces.value = procesCenario.descProces;

  // Abre o modal
  btnAbrir.addEventListener("click", () => {
    resetModal();
    overlay.classList.add("aberto");
  });

  // Fecha o modal
  [btnFechar, btnCancelar].forEach((btn) =>
    btn.addEventListener("click", () => overlay.classList.remove("aberto")),
  );

  // Fecha ao clicar fora
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.classList.remove("aberto");
  });

  // Adiciona linha de passo
  btnAddPasso.addEventListener("click", () => adicionarPasso());

  // Salvar no Supabase
  btnSalvar.addEventListener("click", async () => {
    const idProces = document.getElementById("modalIdProces").value.trim();
    const proces = document.getElementById("modalProcesso").value.trim();
    const cenario = document.getElementById("modalCenario").value.trim();
    const criterioAceite = document.getElementById("modalCriterioAceite").value.trim();
    const prioridade = document.getElementById("modalPrioridade").value;
    const dificuldade = document.getElementById("modalDificuldade").value;

    // Monta string de passos com numeração
    const passosInputs = passosLista.querySelectorAll(".passo-item input");
    const passosTexto = Array.from(passosInputs)
      .map((inp, i) => `${i + 1}. ${inp.value.trim()}`)
      .filter((p) => p.replace(/^\d+\.\s*/, "") !== "")
      .join("\n");

    // Validação
    if (
      !cenario ||
      !criterioAceite ||
      !prioridade ||
      !dificuldade ||
      !passosTexto
    ) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    removeCaractEspeciais(cenario,criterioAceite,passosTexto);


  const cenarioTratado       = removeCaractEspeciais(cenario);
  const criterioAceiteTratado = removeCaractEspeciais(criterioAceite);
  const passosTextoTratado   = removeCaractEspeciais(passosTexto);


    const novoRegistro = {
      ID_PROCES: idProces,
      PROCESSO: proces,
      CENARIO: cenarioTratado,
      CRITERIO_ACEITE: criterioAceiteTratado,
      PASSOS: passosTextoTratado,
      PRIORIDADE: prioridade,
      DIFICULDADE: dificuldade,
      EVIDENCIA: "Evidencias da movimentacao correta da solicitacao",
      STATUS: "Pendente",
    };



    btnSalvar.textContent = "Salvando...";
    btnSalvar.disabled = true;

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABELA}`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(novoRegistro),
      });

      if (!response.ok) {
        const erro = await response.text();
        throw new Error(erro);
      }

      overlay.classList.remove("aberto");

      // Recarrega a tabela
      fetchCenariosSupabase(procesCenario.id).then((data) => {
        renderTabela(
          procesCenario.id,
          document.getElementById("cenarioTestehtml"),
          data,
        );
      });
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Erro ao salvar o cenário. Veja o console para mais detalhes.");
    } finally {
      btnSalvar.textContent = "Salvar";
      btnSalvar.disabled = false;
    }
  });

  // ---------- funções auxiliares ----------

  function adicionarPasso(valor = "") {
    const index = passosLista.children.length + 1;
    const div = document.createElement("div");
    div.className = "passo-item";
    div.innerHTML = `
      <span>${index}.</span>
      <input type="text" placeholder="Descreva o passo" value="${valor}" />
      <button type="button" class="btn-remove-passo" title="Remover">
        <i class="ph ph-trash"></i>
      </button>
    `;

    div.querySelector(".btn-remove-passo").addEventListener("click", () => {
      div.remove();
      renumerarPassos();
    });

    passosLista.appendChild(div);
  }

  function renumerarPassos() {
    passosLista.querySelectorAll(".passo-item").forEach((item, i) => {
      item.querySelector("span").textContent = `${i + 1}.`;
    });
  }

  function resetModal() {
    document.getElementById("modalCenario").value = "";
    document.getElementById("modalCriterioAceite").value = "";
    document.getElementById("modalPrioridade").value = "";
    document.getElementById("modalDificuldade").value = "";
    passosLista.innerHTML = "";
    adicionarPasso(); // começa com 1 passo vazio
  }
}



function removeCaractEspeciais(texto) {
  return texto
    .normalize("NFD")                        // separa letras dos acentos
    .replace(/[\u0300-\u036f]/g, "")         // remove os acentos
    .replace(/[^a-zA-Z0-9\s.,;:!?\-\n<>]/g, "") // remove caracteres especiais
    .trim();
}