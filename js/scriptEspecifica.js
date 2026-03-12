document
  .getElementById("gerarEspecifica")
  .addEventListener("click", async function () {
    // Função para converter imagem em Base64
    async function getBase64Image(img) {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        try {
          resolve(canvas.toDataURL("image/png"));
        } catch (e) {
          reject(e);
        }
      });
    }

    // 1. Capturar valores dos inputs na página original ANTES de clonar
    // Isso garante que os atributos 'value' e o conteúdo das textareas estejam no DOM para o clone
    const inputs = document.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
      if (input.tagName === "SELECT") {
        input.setAttribute(
          "data-value",
          input.options[input.selectedIndex]?.text || "",
        );
      } else if (input.tagName === "TEXTAREA") {
        input.innerHTML = input.value; // Define o conteúdo interno para ser clonado
      } else {
        input.setAttribute("value", input.value);
      }
    });

    /* Clona SOMENTE o corpo */
    const content = document.getElementById("conteudo-word").cloneNode(true);

    // // 3. REMOÇÃO DO CABEÇALHO E BOTÃO DO CORPO
    // // Aqui removemos o que NÃO deve aparecer no texto do Word
    // const headerNoCorpo = content.querySelector("#header-only");
    // if (headerNoCorpo) {
    //   headerNoCorpo.remove(); // Remove o cabeçalho visual do clone que vai para o corpo
    // }

    // const btnNoCorpo = content.querySelector("#gerarEspecifica");
    // if (btnNoCorpo) {
    //   btnNoCorpo.remove(); // Remove o botão do clone
    // }

    // 4. Preparar a Logo em Base64 (pegando da página original)
    let logoBase64 = "";
    const pageLogo = document.querySelector("#header-only img");
    if (pageLogo) {
      try {
        logoBase64 = await getBase64Image(pageLogo);
      } catch (e) {
        console.error("Erro ao processar imagem:", e);
      }
    }

    // 5. Definir o conteúdo do Cabeçalho Nativo (XML Word)
    // Este conteúdo aparecerá no topo de todas as páginas do Word
    const headerContent = `
    
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
                <td align="right">
                    ${logoBase64 ? `<img src="${logoBase64}" width="180" style="width:180px;">` : ""}
                </td>
            </tr>
        </table>
        <div style="margin-top: 5pt;"></div>
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="line-height: 1pt;">
            <tr height="4">
                <td width="35%" bgcolor="#00FF00" style="background-color:#00FF00; height:4pt; font-size: 1pt;">&nbsp;</td>
                <td width="35%" bgcolor="#FFD000" style="background-color:#FFD000; height:4pt; font-size: 1pt;">&nbsp;</td>
                <td width="30%" bgcolor="#FF0000" style="background-color:#FF0000; height:4pt; font-size: 1pt;">&nbsp;</td>
            </tr>
        </table>
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 5pt;">
            <tr>
                <td bgcolor="#214A63" align="center" style="background-color:#214A63; padding: 10pt;">
                    <font color="#FFFFFF" face="Calibri, Arial" size="5"><b>ESPECIFICAÇÃO FUNCIONAL</b></font>
                </td>
            </tr>
        </table>
    `;

    // 6. Substituir inputs por texto no clone (para o corpo do documento)
    content.querySelectorAll("input, select, textarea").forEach((el) => {
      const val =
        el.tagName === "SELECT" ? el.getAttribute("data-value") : el.value;
      const span = document.createElement("span");
      span.textContent = val || "---";
      el.parentNode.replaceChild(span, el);
    });

    // 7. Montar o documento final com Namespaces XML da Microsoft
    const htmlDocument = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset='utf-8'>
            <style>
                <!--
                @page Section1 {
                    size: 595.3pt 841.9pt; /* A4 */
                    margin: 70.85pt 70.85pt 70.85pt 70.85pt;
                    mso-header-margin: 35.4pt;
                    mso-header: h1;
                }
                div.Section1 { page: Section1; }
                p.MsoHeader, li.MsoHeader, div.MsoHeader { margin:0in; margin-bottom:.0001pt; mso-pagination:widow-orphan; font-size:11.0pt; font-family:"Calibri","sans-serif"; }
                
                body { font-family: 'Calibri', sans-serif; }
                h3 { background-color: #D9E2F3; padding: 6pt; font-weight: bold; margin-top: 15pt; border: 1px solid #D9E2F3; color: #214A63; }
                .linha { margin-bottom: 5pt; border-bottom: 1px solid #EEE; padding: 5pt; }
                .linha label { font-weight: bold; color: #333; width: 150pt; display: inline-block; }
                .div_Escopo h3 { background-color: #E7E6E6; padding: 5pt; margin-top: 10pt; border: none; color: #333; }
                table.dados { width: 100%; border-collapse: collapse; margin-top: 10pt; }
                table.dados th, table.dados td { border: 1px solid #CCC; padding: 8pt; }
                -->
            </style>
        </head>
        <body>
            <div class="Section1">
            
                <!-- Definição do Cabeçalho Nativo (Fica guardado no XML do Word) -->
                <div style="mso-element:header; mso-hide:all" id="h1">
                  ${headerContent}
                </div>
                
                <!-- Conteúdo do Documento (Onde o #header-only foi removido) -->
                ${content.innerHTML}
            </div>
        </body>
        </html>
    `;

    // 8. Download
    const blob = new Blob(["\ufeff", htmlDocument], {
      type: "application/msword",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Especificacao_Funcional.doc";
    link.click();
  });
