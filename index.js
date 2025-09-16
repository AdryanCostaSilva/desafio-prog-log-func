document.getElementById("formulaForm").addEventListener("submit", function(e){
    e.preventDefault();
    
    const formula = document.getElementById("entradaFormula").value;
    function renderizaResultado(divId, resultado, limpar=false) {
        const div = document.getElementById(divId + "-passos");
        if (limpar) {
            div.innerHTML = "";
        }
        div.innerHTML += `\\[ ${resultado} \\]`;
        MathJax.typesetPromise([div]);
    }

    // Limpa as divs
    renderizaResultado("fnc", "", true);
    renderizaResultado("fnd", "", true);
    renderizaResultado("clausal", "", true);
    renderizaResultado("horn", "", true);

    // Renderizando a Fórmula original em cada bloco
    renderizaResultado("fnc", formula);
    renderizaResultado("fnd", formula);
    renderizaResultado("clausal", formula);
    renderizaResultado("horn", formula);
    //Forma Prenex
    let prenex_formula = formula;

    // Eliminando bi-implicacoes
    let formula_temp = eliminaBiImplicacao(prenex_formula);
    while (formula_temp != null) {
        prenex_formula = formula_temp;
        renderizaResultado("fnc", prenex_formula);
        renderizaResultado("fnd", prenex_formula);
        renderizaResultado("clausal", prenex_formula);
        renderizaResultado("horn", prenex_formula);
        formula_temp = eliminaBiImplicacao(prenex_formula);
    }
    // Eliminando as implicações
    formula_temp = eliminaImplicacao(prenex_formula);
    while (formula_temp != null) {
        prenex_formula = formula_temp;
        renderizaResultado("fnc", prenex_formula);
        renderizaResultado("fnd", prenex_formula);
        renderizaResultado("clausal", prenex_formula);
        renderizaResultado("horn", prenex_formula);
        formula_temp = eliminaImplicacao(prenex_formula);
    }

    let mudou = true;
    while (mudou) {
        mudou = false;

        // 1. De Morgan
        let formula_temp = aplicaDeMorgan(prenex_formula);
        while (formula_temp != null) {
            prenex_formula = formula_temp;
            renderizaResultado("fnc", prenex_formula);
            renderizaResultado("fnd", prenex_formula);
            renderizaResultado("clausal", prenex_formula);
            renderizaResultado("horn", prenex_formula);
            formula_temp = aplicaDeMorgan(prenex_formula);
            mudou = true;
        }

        // 2. Negação de quantificadores
        formula_temp = revomeNegacaoQuantificador(prenex_formula);
        while (formula_temp != null) {
            prenex_formula = formula_temp;
            renderizaResultado("fnc", prenex_formula);
            renderizaResultado("fnd", prenex_formula);
            renderizaResultado("clausal", prenex_formula);
            renderizaResultado("horn", prenex_formula);
            formula_temp = revomeNegacaoQuantificador(prenex_formula);
            mudou = true;
        }

        // 3. Dupla negação
        formula_temp = removeDuplaNegacao(prenex_formula);
        while (formula_temp != null) {
            prenex_formula = formula_temp;
            renderizaResultado("fnc", prenex_formula);
            renderizaResultado("fnd", prenex_formula);
            renderizaResultado("clausal", prenex_formula);
            renderizaResultado("horn", prenex_formula);
            formula_temp = removeDuplaNegacao(prenex_formula);
            mudou = true;
        }
    }

    // Renomeando variaveis iguais de quantificadores diferentes
    prenex_formula = renomeiaVariaveis(prenex_formula);
    renderizaResultado("fnc", prenex_formula);
    renderizaResultado("fnd", prenex_formula);
    renderizaResultado("clausal", prenex_formula);
    renderizaResultado("horn", prenex_formula);

    //Colocando todos os quantificadores no inicio da fórmula
    prenex_formula = prenexa(prenex_formula);
    renderizaResultado("fnc", prenex_formula);
    renderizaResultado("fnd", prenex_formula);
    renderizaResultado("clausal", prenex_formula);
    renderizaResultado("horn", prenex_formula);

    // FNC
    // Tranformando formula prenex em fnc (passa prenex como parametro para a primeira variavel de fnc_formula)
    let fnc_formula = analisaFormula(prenex_formula);
    fnc_formula = converteParaFnc(fnc_formula);
    fnc_formula = astParaLatex(fnc_formula);
    renderizaResultado("fnc", fnc_formula);
    renderizaResultado("fnc", `\\text{Forma Normal Conjuntiva}`);
    renderizaResultado("fnc", fnc_formula);

    // FND
    // Tranformando formula prenex em fnd (passa prenex como parametro para a primeira variavel de fnd_formula)
    let fnd_formula = analisaFormula(prenex_formula);
    fnd_formula = converteParaFnd(fnd_formula);
    fnd_formula = astParaLatex(fnd_formula);
    renderizaResultado("fnd", fnd_formula);
    renderizaResultado("fnd", `\\text{Forma Normal Disjuntiva}`);
    renderizaResultado("fnd", fnd_formula);

    // Forma Clausal
    let clausal_formula = analisaFormula(prenex_formula);
    clausal_formula = skolemiza(clausal_formula);
    clausal_formula = removerQuantificadoresUniversais(clausal_formula);
    clausal_formula = converteParaFnc(clausal_formula);
    clausal_formula = astParaLatex(clausal_formula);
    renderizaResultado("clausal", clausal_formula);
    renderizaResultado("clausal", `\\text{Forma Clausal}`);
    renderizaResultado("clausal", clausal_formula);

    // Verificação Horn - analisa a fórmula FNC para determinar se é Horn
    let horn_formula = analisaFormula(prenex_formula);
    horn_formula = skolemiza(horn_formula);
    horn_formula = removerQuantificadoresUniversais(horn_formula)
    horn_formula = converteParaFnc(horn_formula);
    horn_formula_latex = astParaLatex(horn_formula);
    renderizaResultado("horn", horn_formula_latex);
    const resultadoHorn = verificaHorn(horn_formula);

    // Adiciona o resultado da análise Horn
    if (resultadoHorn.isHorn) {
        renderizaResultado("horn", `\\text{Clausula de Horn}`);
        renderizaResultado("horn", horn_formula_latex);
    } else {
        renderizaResultado("horn", `\\text{Nao possui Clausula de Horn}`);
    }

 });

 function eliminaImplicacao(formula){
    //Remove comandos \big, \Big, \left, \right antes de processar
    formula = formula.replace(/\\left\(/g, " (")
                    .replace(/\\right\)/g, " )")
                    .replace(/\\big\(/g, " (")
                    .replace(/\\Big\(/g, " (")
                    .replace(/\\big\)/g, " )")
                    .replace(/\\Big\)/g, " )")
    //Tira espaços entre quantificadores e predicatos
    formula = formula.replace(/\\(forall|exists)\s*(\w)\s*/g, "\\$1 $2");
    //Acha a implicação se ela existe e guarda a posição
    let pos_implicacao;
    let tam_implicacao;
    if (formula.includes("\\to")) {
        pos_implicacao = formula.indexOf("\\to");
        tam_implicacao = 3
    } else if (formula.includes("\\implies")) {
        pos_implicacao = formula.indexOf("\\implies");
        tam_implicacao = 8
    } else {
        return null;
    }

    //Acha o objeto B entre ()
    let cont_chaves = 0;
    let b_possui_parenteses = false
    let pos_final_b = pos_implicacao;
    for (let i = pos_implicacao; i < formula.length; i++){
        if(formula[i] == "("){
            cont_chaves++;
            b_possui_parenteses = true;
        } else if( formula[i] == ")"){
            cont_chaves--;
            if (cont_chaves == 0){
                pos_final_b = i;
                break;
            }
        }

    }
    
    // Verifica se tem parenteses para formulas sem parenteses por exemplo P \to Q
    if (!b_possui_parenteses || cont_chaves != 0) {
        // Primeiro, verifica se a implicação está dentro de parênteses
        for (let i = pos_implicacao + tam_implicacao; i < formula.length; i++){
            if (formula[i] == ")") {
                pos_final_b = i - 1;
                break;
            }
            if ("ABCDEFGHIJKLMNOPQRSTUVWXYZ".includes(formula[i])) {
                pos_final_b = i + 1; // +1 para slice exclusivo
                break;
            }
        }
    }

    //Acha o objeto A entre ()
    cont_chaves = 0;
    let a_possui_parenteses = false;
    let pos_inicio_a = pos_implicacao;
    for (let i = pos_implicacao; i >= 0 ; i--){
        if(formula[i] == ")"){
            a_possui_parenteses = true;
            cont_chaves++;
        } else if( formula[i] == "("){
            cont_chaves--;
            if (cont_chaves == 0){
                pos_inicio_a = i;
                
                //Verifica se há um predicado completo antes
                let depois = formula.substring(0, pos_inicio_a);
                let predicatoMatch = depois.match(/([A-Z][a-zA-Z0-9_]*(?:\([^)]*\))?)$/);
                if (predicatoMatch) {
                    pos_inicio_a = pos_inicio_a - predicatoMatch[1].length;
                }
                
                //Se houver quantificadores pula, para colocar negação na frente
                while ((formula.substring(pos_inicio_a - 9, pos_inicio_a - 2) === "\\exists") || (formula.substring(pos_inicio_a - 9, pos_inicio_a -2) === "\\forall")){
                    pos_inicio_a -= 9;
                }
                break;
            }
        }
    }
    if (!a_possui_parenteses || cont_chaves != 0) {
        // Primeiro, verifica se a implicação está dentro de parênteses
        for (let i = pos_implicacao - 1; i >= 0; i--){
            if (formula[i] == "("){
                pos_inicio_a = i;
                break;
            }
            if ("ABCDEFGHIJKLMNOPQRSTUVWXYZ".includes(formula[i])) {
                pos_inicio_a = i;
                break;
            }
        }
    }


    //Define A e B, nega A e troca a implicacao por disjunção
    let A = formula.substring(pos_inicio_a, pos_implicacao).trim();
    let B = formula.substring(pos_implicacao + tam_implicacao, pos_final_b).trim();

    let antes = formula.substring(0, pos_inicio_a);

    let depois = formula.substring(pos_final_b);
    let sem_implicacao = antes + `\\lnot ${A} \\lor ${B}` + depois;

    return sem_implicacao;
 }

 function eliminaBiImplicacao(formula){
    //Remove comandos \big, \Big, \left, \right antes de processar
    formula = formula.replace(/\\left\(/g, " (")
                    .replace(/\\right\)/g, " )")
                    .replace(/\\big\(/g, " (")
                    .replace(/\\Big\(/g, " (")
                    .replace(/\\big\)/g, " )")
                    .replace(/\\Big\)/g, " )");

    //Tira espaços entre quantificadores e predicatos
    formula = formula.replace(/\\(forall|exists)\s*(\w)\s*/g, "\\$1 $2");

    //Acha a bi-implicação se ela existe e guarda a posição
    let pos_bi;
    let tam_bi;
    if (formula.includes("\\leftrightarrow")) {
        pos_bi = formula.indexOf("\\leftrightarrow");
        tam_bi = 15;
    } else if (formula.includes("\\iff")) {
        pos_bi = formula.indexOf("\\iff");
        tam_bi = 4;
    } else {
        return null;
    }

    // Encontra B
    let cont_chaves = 0;
    let b_tem_par = false;
    let pos_final_b = pos_bi;
    for (let i = pos_bi; i < formula.length; i++){
        if(formula[i] == "(") {
            b_tem_par = true; 
            cont_chaves++; 
        }
        else if(formula[i] == ")") {
            cont_chaves--;
            if (cont_chaves == 0) {
                pos_final_b = i + 1;
                break;
            }
        }
    }

    if (!b_tem_par || cont_chaves != 0) {
        // Caso B sem parênteses ou desequilibrado
        for (let i = pos_bi + 1; i < formula.length; i++){
            if (formula[i] == ")") { 
                pos_final_b = i; 
                break; 
            }
            if ("ABCDEFGHIJKLMNOPQRSTUVWXYZ".includes(formula[i])) {
                pos_final_b = i + 1;
                break;
            }
        }
    }

    // Encontra A
    cont_chaves = 0;
    let a_tem_par = false;
    let pos_inicio_a = pos_bi;
    for (let i = pos_bi; i >= 0; i--){
        if(formula[i] == ")"){ 
            a_tem_par = true;
            cont_chaves++;  
        }
        else if(formula[i] == "("){
            cont_chaves--;
            if (cont_chaves == 0){
                pos_inicio_a = i;
                //Verifica se há um predicado completo antes
                let depois = formula.substring(0, pos_inicio_a);
                let predicatoMatch = depois.match(/([A-Z][a-zA-Z0-9_]*(?:\([^)]*\))?)$/);
                if (predicatoMatch) {
                    pos_inicio_a = pos_inicio_a - predicatoMatch[1].length;
                }
                while ((formula.substring(pos_inicio_a - 9, pos_inicio_a - 2) === "\\exists") || 
                       (formula.substring(pos_inicio_a - 9, pos_inicio_a - 2) === "\\forall")){
                    pos_inicio_a -= 9;
                }
                break;
            }
        }
    }

    if (!a_tem_par || cont_chaves != 0) {
        // Caso A sem parênteses ou desequilibrado
        for (let i = pos_bi - 1; i >= 0; i--){
            if (formula[i] == "("){
                pos_inicio_a = i;
                break;
            }
            if ("ABCDEFGHIJKLMNOPQRSTUVWXYZ".includes(formula[i])){
                pos_inicio_a = i;
                break;
            }
        }
    }

    // Define A e B
    let A = formula.substring(pos_inicio_a, pos_bi).trim();
    let B = formula.substring(pos_bi + tam_bi, pos_final_b).trim();

    let antes = formula.substring(0, pos_inicio_a);
    let depois = formula.substring(pos_final_b);

    // Substitui por ((A e B) ou (¬B e ¬A))
    let sem_bi = `${antes}((${A} \\land ${B}) \\lor (\\lnot ${A} \\land \\lnot ${B}))${depois}`;

    return sem_bi;
}

function revomeNegacaoQuantificador(formula){
    let regex_quan;
    //Regex para encontrar quantificadores universais
    regex_quan = formula.match(/\\lnot\s*\\forall\s+(\w)\s*(.*)/);
    if (regex_quan) {
        let variavel = regex_quan[1];
        let predicado = regex_quan[2];
        return formula.replace(regex_quan[0], `\\exists ${variavel} \\lnot ${predicado}`);
    }

    //Regex para encontrar quantificadores existenciais
    regex_quan = formula.match(/\\lnot\s*\\exists\s+(\w)\s*(.*)/);
    if (regex_quan) {
        let variavel = regex_quan[1];
        let predicado = regex_quan[2];
        return formula.replace(regex_quan[0], `\\forall ${variavel} \\lnot ${predicado}`);
    }

    // Se não houver retorna null
    return null;
}

function aplicaDeMorgan(formula) {
    //Remove espaços repetidos e trocam por apenas um espaço
    formula = formula.replace(/\s+/g, " ");

    // Caso a negação não tenha espaço depois, coloca um espaço
    formula = formula.replace(/\\lnot(?!\s)/g, "\\lnot ");

    // Aplicação de deMorgan (colocando negação para dentro)
    let pos_neg = formula.indexOf("\\lnot (");
    if (pos_neg !== -1) {
        pos_neg += 7; 
        let cont_chaves = 1;
        let nova_formula = "";
        let inicio_elemento = pos_neg;
        
        // Utilizando inicio_elemento e o parametro i do for, encontra a posição de cada elemento, utilizando como delimitação os operadores
        for (let i = pos_neg; i < formula.length && cont_chaves > 0; i++) {
            if (formula[i] == "(") {
                cont_chaves++;
            } else if (formula[i] == ")") {
                cont_chaves--;
                if (cont_chaves == 0) {
                    // Ultimo elemento
                    let elemento = formula.substring(inicio_elemento, i).trim();
                    nova_formula += `\\lnot ${elemento}`;

                    let antes = formula.substring(0, pos_neg - 7);
                    let depois = formula.substring(i + 1);
                    formula = `${antes}(${nova_formula})${depois}`;
                    return formula;
                }
            } else if (cont_chaves == 1) { 
                //Quando encontra um operador nega o elemento que está no lado esquerdo dele
                if (formula.substring(i, i + 5) == "\\land") {
                    // Melhor: elemento = formula.substring(inicio_elemento, i).trim();
                    let elemento_atual = formula.substring(inicio_elemento, i).trim();
                    nova_formula += `\\lnot ${elemento_atual} \\lor `;
                    
                    // Pula o operador
                    i += 4;
                    inicio_elemento = i + 1;
                    
                } else if (formula.substring(i, i + 4) == "\\lor") {
                    let elemento_atual = formula.substring(inicio_elemento, i).trim();
                    nova_formula += `\\lnot ${elemento_atual} \\land `;
                    
                    // Pula o operador
                    i += 3;
                    inicio_elemento = i + 1;
                }
            }
        }
        
        // Refaz a nova formula
        let antes = formula.substring(0, pos_neg - 7);
        let depois_parentese = formula.indexOf(")", pos_neg);
        let depois = formula.substring(depois_parentese + 1);
        
        formula = `${antes}(${nova_formula})${depois}`;
        return formula;
    }
    // Se não ouver negação retorna null
    return null;
}

function removeDuplaNegacao(formula){
    formula = formula.replace(/\s+/g, " ");

    // Se houver dupla negação tiras duas
    if (formula.includes("\\lnot \\lnot")) {
            formula = formula.replace("\\lnot \\lnot", "");
            formula = formula.replace("\\lnot\\lnot", "");
            return formula;
        }
    return null;
}

function renomeiaVariaveis(formula) {
    //Letras para as possíveis váriaveis que poderão ser criadas
    const letras = "zyxwvutsrqponmlkjihgfedcba".split("");
    let usadas = new Set();
    
    //Verifica qual a próxima variável de letras disponível para ser usada
    function proximaVariavel() {
        for (let letra of letras) {
            if (!usadas.has(letra)) {
                usadas.add(letra);
                return letra;
            }
        }
        // Se chegar no final do alfabeto dá erro (muito improvável)
        throw new Error("Acabaram as variáveis disponíveis!");
    }
    
    // Encontra os quantificadores e armazena em uma array como objetos
    function encontraQuantificadores(formula) {
        const regex = /(\\forall|\\exists)\s+([a-z][a-z0-9_]*)/g;
        const quantificadores = [];
        let quant;
        
        while ((quant = regex.exec(formula)) !== null) {
            quantificadores.push({
                tipo: quant[1],
                variavel: quant[2],
                posicao: quant.index,
                texto_completo: quant[0]
            });
        }
        return quantificadores;
    }

    // Retorna o escopo que o quantificador abrange (inicio e fim)
    function encontraEscopoQuantificador(formula, posicao_quant) {
        let i = posicao_quant;
        // Pula quantificador
        while (i < formula.length && formula[i] !== '(') {
            i++;
        }
        
        // Para casos sem parenteses
        if (i >= formula.length || formula[i] !== '(') {
            return { inicio: i, fim: formula.length };
        }
        
        let cont_chaves = 1;
        let inicio = i;
        i++;
        
        while (i < formula.length && cont_chaves > 0) {
            if (formula[i] === '(') {
                cont_chaves++;
            } else if (formula[i] === ')') {
                cont_chaves--;
            }
            i++;
        }
        
        return { inicio: inicio, fim: i };
    }
    
    //Substitui a variaval apenas no escopo passado, depois junta antes + escopo + depois
    function substituiVariavelNoEscopo(formula, varivel_antiga, varivel_nova, escopo) {
        let parte1 = formula.substring(0, escopo.inicio);
        let parte2 = formula.substring(escopo.inicio, escopo.fim);
        let parte3 = formula.substring(escopo.fim);
        
        // Substitui a variável apenas na parte do escopo, usando regex para palavra completa
        const re_Var = new RegExp(`\\b${varivel_antiga}\\b`, 'g');
        parte2 = parte2.replace(re_Var, varivel_nova);
        
        return parte1 + parte2 + parte3;
    }
    
    function verificaConflitos(quantificadores) {
        const variaveis_vistas = new Map();
        const conflitos = [];
        
        for (let i = 0; i < quantificadores.length; i++) {
            const quant = quantificadores[i];
            // Se a váriavel já foi utilizada antes adiciona, adiciona a lista de conflitos
            if (variaveis_vistas.has(quant.variavel)) {
                conflitos.push({
                    indice: i,
                    variavel: quant.variavel,
                    primeiraOcorrencia: variaveis_vistas.get(quant.variavel)
                });
            } else {
                variaveis_vistas.set(quant.variavel, i);
            }
        }
        
        return conflitos;
    }
    
    let formula_atual = formula;
    let mudou = true;
    
    // Repete até não haver mais conflitos
    while (mudou) {
        mudou = false;
        
        // Coleta todas as variáveis já usadas
        usadas.clear();
        const quants_atuais = encontraQuantificadores(formula_atual);
        quants_atuais.forEach(q => usadas.add(q.variavel));
        
        // Encontra conflitos
        const conflitos = verificaConflitos(quants_atuais);
        
        if (conflitos.length > 0) {
            // Pega o primeiro conflito (segundo quantificador com variável repetida)
            const conflito = conflitos[0];
            const quant_conflitante = quants_atuais[conflito.indice];
            
            // Gera nova variável
            const nova_variavel = proximaVariavel();
            
            // Encontra o escopo do quantificador conflitante
            const escopo = encontraEscopoQuantificador(formula_atual, quant_conflitante.posicao);
            
            // Substitui a variável no quantificador
            const posicao_inicio_quant = quant_conflitante.posicao;
            const posicao_fim_quant = posicao_inicio_quant + quant_conflitante.texto_completo.length;
            
            formula_atual = formula_atual.substring(0, posicao_inicio_quant) + 
                          `${quant_conflitante.tipo} ${nova_variavel}` + 
                          formula_atual.substring(posicao_fim_quant);
            
            const diferenca_tamanho = nova_variavel.length - conflito.variavel.length;
            escopo.inicio += diferenca_tamanho;
            escopo.fim += diferenca_tamanho;
            
            // Substitui todas as ocorrências da variável no escopo
            formula_atual = substituiVariavelNoEscopo(formula_atual, conflito.variavel, nova_variavel, escopo);
            
            mudou = true;
        }
    }
    
    return formula_atual;
}

function prenexa(formula){
    let quantificadores = [];

    // Pega todos os quantificadores coloca em um array e tira eles da formula
    for (let i = 0; i < formula.length; i++){
        if ((formula.substring(i, i + 8) == "\\exists ") || (formula.substring(i, i + 8) == "\\forall ")){
            quantificadores.push(formula.substring(i, i + 9));
            let antes = formula.substring(0, i);
            let depois = formula.substring(i + 9);

            formula = `${antes}${depois}`;
            i--;
        }
    }

    // Coloca os quantificadores no começo da formula na ordem correta
    for (let i = quantificadores.length - 1; i >= 0; i--){
        let quantificador = quantificadores[i];
        formula = `${quantificador}${formula}`;
    }
    return formula;
}

// A classe Node representa cada nó na árvore sintatica (P,Q, not, and, or, forall, exists)
class Node {
    constructor(tipo, valor = null, filhos = []) {
        this.tipo = tipo;       
        this.valor = valor;     
        this.filhos = filhos;  
    }
}

// 2️⃣ Parser LaTeX -> AST com 
function analisaFormula(formula_str) {
    formula_str = formula_str.trim();

    // Extraindo os quantificadores do inicio
    const quantificadores = [];
    let regexQuant = /^\\(exists|forall) (\w+)/i;
    let match;
    while ((match = formula_str.match(regexQuant))) {
        quantificadores.push({ tipo: match[1].toUpperCase(), var: match[2] });
        formula_str = formula_str.slice(match[0].length).trim();
    }

    // De forma recursiva encontra elementos na fórmula e cria um nó para ele
    function analisaExpr(expr) {
        expr = expr.trim();

        // NOT
        if (expr.startsWith("\\lnot ")) {
            return new Node("NOT", null, [analisaExpr(expr.slice(6))]);
        }

        // Remover parênteses externos redundantes
        expr = removerParenteses(expr);

        let count = 0;
        for (let i = 0; i < expr.length; i++) {
            if (expr[i] === "(") count++;
            else if (expr[i] === ")") count--;
            else if (count === 0) {
                // AND
                if (expr.slice(i, i+6) === "\\land ") {
                    return new Node("AND", null, [analisaExpr(expr.slice(0,i).trim()), analisaExpr(expr.slice(i+6).trim())]);
                }
                // OR
                if (expr.slice(i, i+5) === "\\lor ") {
                    return new Node("OR", null, [analisaExpr(expr.slice(0,i).trim()), analisaExpr(expr.slice(i+5).trim())]);
                }
            }
        }

        // Literal
        return new Node("LITERAL", expr);
    }


    let astMatriz = analisaExpr(formula_str);

    for (let i = quantificadores.length - 1; i >= 0; i--) {
        astMatriz = new Node(quantificadores[i].tipo, quantificadores[i].var, [astMatriz]);
    }

    return astMatriz;
}

// Distribui as conjunções para transformar em FNC
function converteParaFnc(no) {
    if (!no) {
        return null;
    }

    if (no.tipo === "LITERAL") {
        return no;
    }

    if (no.tipo === "NOT") {
        return new Node("NOT", null, [converteParaFnc(no.filhos[0])]);
    }

    // Se for um AND, já está na forma correta
    if (no.tipo === "AND") {
        const esquerdo = converteParaFnc(no.filhos[0]);
        const direito = converteParaFnc(no.filhos[1]);
        return new Node("AND", null, [esquerdo, direito]);
    }

    if (no.tipo === "OR") {
        const esquerdo = converteParaFnc(no.filhos[0]);
        const direito = converteParaFnc(no.filhos[1]);

        // Se for uma disjunção de conjunções aplica a distribuição -> (A ou C) e (A ou D) e (B ou C) e (B ou D) 
        if (esquerdo.tipo === "AND" && direito.tipo === "AND") {
            const [A,B] = esquerdo.filhos;
            const [C,D] = direito.filhos;
            return new Node("AND", null, [
                new Node("AND", null, [new Node("OR", null, [A,C]), new Node("OR", null, [A,D])]),
                new Node("AND", null, [new Node("OR", null, [B,C]), new Node("OR", null, [B,D])])
            ]);
        } 
        // Se apenas o lado esquerdo é AND aplica distribuição -> (A ou C) e (B ou C)
        else if (esquerdo.tipo === "AND") {
            const [A,B] = esquerdo.filhos;
            return new Node("AND", null, [new Node("OR", null, [A,direito]), new Node("OR", null, [B,direito])]);
        } 
        // Se apenas o lado direito é AND aplica distribuição -> (A ou C) e (A ou D)
        else if (direito.tipo === "AND") {
            const [C,D] = direito.filhos;
            return new Node("AND", null, [new Node("OR", null, [esquerdo,C]), new Node("OR", null, [esquerdo,D])]);
        } 
        // Se nenhum dos lados é AND então já está na forma certa
        else {
            return new Node("OR", null, [esquerdo,direito]);
        }
    }

    if (no.tipo === "EXISTS" || no.tipo === "FORALL") {
        return new Node(no.tipo, no.valor, [converteParaFnc(no.filhos[0])]);
    }

    return no;
}

// Distribui as disjunções para transformar em FND
function converteParaFnd(no) {
    if (!no) {
        return null;
    };

    if (no.tipo === "LITERAL") {
        return no;
    }

    if (no.tipo === "NOT") {
        return new Node("NOT", null, [converteParaFnd(no.filhos[0])]);
    }

    // Se for OR então já está na forma correta
    if (no.tipo === "OR") {
        const esquerdo = converteParaFnd(no.filhos[0]);
        const direito = converteParaFnd(no.filhos[1]);
        return new Node("OR", null, [esquerdo, direito]);
    }


    if (no.tipo === "AND") {
        const esquerdo = converteParaFnd(no.filhos[0]);
        const direito = converteParaFnd(no.filhos[1]);

        // Se ambos os lados são OR, aplica distributividade -> (A e C) ou (A e D) ou (B e C) ou ( B e D)
        if (esquerdo.tipo === "OR" && direito.tipo === "OR") {
            const [A,B] = esquerdo.filhos;
            const [C,D] = direito.filhos;
            return new Node("OR", null, [
                new Node("OR", null, [new Node("AND", null, [A,C]), new Node("AND", null, [A,D])]),
                new Node("OR", null, [new Node("AND", null, [B,C]), new Node("AND", null, [B,D])])
            ]);
        } 
        // Se só o lado esquedo é OR, aplica distributividade (A e C) ou (B e C)
        else if (esquerdo.tipo === "OR") {
            const [A,B] = esquerdo.filhos;
            return new Node("OR", null, [new Node("AND", null, [A,direito]), new Node("AND", null, [B,direito])]);
        } 
        // Se só o lado direito é OR, aplica distributividade (A e C) ou (A e D)
        else if (direito.tipo === "OR") {
            const [C,D] = direito.filhos;
            return new Node("OR", null, [new Node("AND", null, [esquerdo,C]), new Node("AND", null, [esquerdo,D])]);
        } 
        // Se nenhum dos lados são OR, então já está na forma certa
        else {
            return new Node("AND", null, [esquerdo,direito]);
        }
    }

    if (no.tipo === "EXISTS" || no.tipo === "FORALL") {
        return new Node(no.tipo, no.valor, [converteParaFnd(no.filhos[0])]);
    }

    return no;
}

// Remove parenteses redundantes na formula
function removerParenteses(formula) {
    formula = formula.trim();
    while (formula.startsWith("(") && formula.endsWith(")")) {
        let count = 0;
        let valido = true;
        // Verifica se parenteses externos englobam toda a formula
        for (let i = 0; i < formula.length; i++) {
            if (formula[i] === "(") count++;
            else if (formula[i] === ")") count--;
            // Se fecha antes do fim, não engloba tudo
            if (count === 0 && i < formula.length - 1) {
                valido = false;
                break;
            }
        }
        if (valido) {
            formula = formula.slice(1, -1).trim();
        } else {
            break;
        }
    }
    return formula;
}

// Converte os termos das operações OR em uma lista de termos
function coletarOr(node, termos = []) {
    if (!node) {
        return termos;
    }
    if (node.tipo === "OR") {
        // se tiver filhos aninhados pega recursivamente
        coletarOr(node.filhos[0], termos);
        coletarOr(node.filhos[1], termos);
    } else {
        termos.push(node);
    }
    return termos;
}

// Converte os termos das operações AND em uma lista de termos
function coletarAnd(node, termos = []) {
    if (!node){
        return termos;
    }
    if (node.tipo === "AND") {
        // se tiver filhos aninhados pega recursivamente
        coletarAnd(node.filhos[0], termos);
        coletarAnd(node.filhos[1], termos);
    } else {
        termos.push(node);
    }
    return termos;
}

// Converte a árvore sintática em Latex para poder redenrizar 
function astParaLatex(no) {
    if (!no) {
        return "";
    }

    switch(no.tipo) {
        case "LITERAL":
            return no.valor;
        case "NOT":
            const subformula = astParaLatex(no.filhos[0]);
            if (no.filhos[0].tipo === "AND" || no.filhos[0].tipo === "OR") {
                return `\\lnot (${subformula})`;
            }
            return `\\lnot ${subformula}`;
        //Para cada nó da conjunção, converte para latex e adiciona parenteses se necessário
        case "AND": {
            const clausulas = coletarAnd(no).map(n => {
                if (n.tipo === "OR" || n.tipo === "AND") {
                    return `(${astParaLatex(n)})`;
                }
                return astParaLatex(n);
            });
            return `${clausulas.join(" \\land ")}`;
        }
        //Para cada nó da conjunção, converte para latex e adiciona parenteses se necessário
        case "OR": {
            const termos = coletarOr(no).map(n => {
                if (n.tipo === "AND" || n.tipo === "OR") {
                    return `(${astParaLatex(n)})`;
                }
                return astParaLatex(n);
            });
            return `${termos.join(" \\lor ")}`;
        }
        case "EXISTS":
            const conteudoExists = astParaLatex(no.filhos[0]);
            //Adiciona parenteses se operação composta
            if (no.filhos[0].tipo === "AND" || no.filhos[0].tipo === "OR") {
                return `\\exists ${no.valor} (${conteudoExists})`;
            }
            return `\\exists ${no.valor} ${conteudoExists}`;
        case "FORALL":
            const conteudoForall = astParaLatex(no.filhos[0]);
            //Adiciona parenteses se operação composta
            if (no.filhos[0].tipo === "AND" || no.filhos[0].tipo === "OR") {
                return `\\forall ${no.valor} (${conteudoForall})`;
            }
            return `\\forall ${no.valor} ${conteudoForall}`;
        default:
            return "";
    }
}

// Skolemização - Remove quantificadores existenciais substituindo por funções/constantes de Skolem
function skolemiza(no, variaveisUniversais = [], contadorSkolem = { valor: 1 }) {
    if (!no) {
        return null;
    }

    switch (no.tipo) {
        case "LITERAL":
            return no;

        case "NOT":
            return new Node("NOT", null, [skolemiza(no.filhos[0], variaveisUniversais, contadorSkolem)]);
        // Aplica skolemização em ambos os lados da conjunção
        case "AND":
            const esquerdoAnd = skolemiza(no.filhos[0], variaveisUniversais, contadorSkolem);
            const direitoAnd = skolemiza(no.filhos[1], variaveisUniversais, contadorSkolem);
            return new Node("AND", null, [esquerdoAnd, direitoAnd]);
        // Aplica skolemização em ambos os lados da disjunção
        case "OR":
            const esquerdoOr = skolemiza(no.filhos[0], variaveisUniversais, contadorSkolem);
            const direitoOr = skolemiza(no.filhos[1], variaveisUniversais, contadorSkolem);
            return new Node("OR", null, [esquerdoOr, direitoOr]);

        case "FORALL":
            // Adiciona a variável universal ao escopo e continua recursivamente
            const novasVariaveisUniversais = [...variaveisUniversais, no.valor];
            return new Node("FORALL", no.valor, [
                skolemiza(no.filhos[0], novasVariaveisUniversais, contadorSkolem)
            ]);

        case "EXISTS":
            // Remove o quantificador existencial e substitui a variável
            const varExistencial = no.valor;
            let termoSkolem;

            if (variaveisUniversais.length === 0) {
                // Sem variáveis universais no escopo = usa constante de Skolem
                termoSkolem = `c_{${contadorSkolem.valor}}`;
            } else {
                // Com variáveis universais no escopo = usa função de Skolem
                const parametros = variaveisUniversais.join(',');
                termoSkolem = `f_{${contadorSkolem.valor}}(${parametros})`;
            }
            
            contadorSkolem.valor++;

            // Aplica skolemização recursivamente na matriz e depois substitui
            const matrizSkolemizada = skolemiza(no.filhos[0], variaveisUniversais, contadorSkolem);
            return substituirVariavel(matrizSkolemizada, varExistencial, termoSkolem);

        default:
            return no;
    }
}

// Função auxiliar para substituir uma variável por um termo em toda a fórmula
function substituirVariavel(no, variavelOriginal, novoTermo) {
    if (!no) {
        return null;
    }

    switch (no.tipo) {
        case "LITERAL":
            // Substitui a variável no literal se necessário
            return new Node("LITERAL", 
                no.valor.replace(new RegExp(`\\b${variavelOriginal}\\b`, 'g'), novoTermo)
            );

        case "NOT":
            return new Node("NOT", null, [
                substituirVariavel(no.filhos[0], variavelOriginal, novoTermo)
            ]);
        // Aplica substituição em ambos os lados da conjunção
        case "AND":
            return new Node("AND", null, [
                substituirVariavel(no.filhos[0], variavelOriginal, novoTermo),
                substituirVariavel(no.filhos[1], variavelOriginal, novoTermo)
            ]);
        // Aplica substituição em ambos os lados da disjunção
        case "OR":
            return new Node("OR", null, [
                substituirVariavel(no.filhos[0], variavelOriginal, novoTermo),
                substituirVariavel(no.filhos[1], variavelOriginal, novoTermo)
            ]);

        case "FORALL":
        case "EXISTS":
            // Se a variável do quantificador é a mesma que estamos substituindo,
            // não descemos na árvore (escopo local)
            if (no.valor === variavelOriginal) {
                return no;
            }
            // Se a variavel for diferente, continua
            return new Node(no.tipo, no.valor, [
                substituirVariavel(no.filhos[0], variavelOriginal, novoTermo)
            ]);

        default:
            return no;
    }
}

function removerQuantificadoresUniversais(no) {
    if (!no) {
        return null;
    }

    switch (no.tipo) {
        case "FORALL":
            // Remove o quantificador universal e retorna apenas a matriz
            return removerQuantificadoresUniversais(no.filhos[0]);
            
        case "EXISTS":
            // Não deveria haver EXISTS após skolemização, mas por segurança
            return new Node("EXISTS", no.valor, [removerQuantificadoresUniversais(no.filhos[0])]);
            
        case "NOT":
            return new Node("NOT", null, [removerQuantificadoresUniversais(no.filhos[0])]);
        // Aplica remoção em ambos os lados da conjunção    
        case "AND":
            return new Node("AND", null, [
                removerQuantificadoresUniversais(no.filhos[0]),
                removerQuantificadoresUniversais(no.filhos[1])
            ]);
        // Aplica remoção em ambos os lados da disjunção
        case "OR":
            return new Node("OR", null, [
                removerQuantificadoresUniversais(no.filhos[0]),
                removerQuantificadoresUniversais(no.filhos[1])
            ]);
            
        case "LITERAL":
        default:
            return no;
    }
}

// Função para verificar se uma fórmula é Horn
function verificaHorn(no) {
    if (!no) {
        return { isHorn: true };
    }

    // Se não for AND no topo, verificamos como cláusula única
    if (no.tipo !== "AND") {
        const literaisPositivos = contarLiteraisPositivos(no);
        return { isHorn: literaisPositivos <= 1 };
    }

    // Verica cada clausula da conjuncao separadamente
    const clausulas = coletarAnd(no);
    
    for (let i = 0; i < clausulas.length; i++) {
        const clausula = clausulas[i];
        const literaisPositivos = contarLiteraisPositivos(clausula);
        
        // Se alguma cláusula tem mais de 1 literal positivo, não é Horn
        if (literaisPositivos > 1) {
            return { isHorn: false };
        }
    }

    // Se todas as cláusulas têm menos que 1, ou exatamente 1 literal positivo, é horn
    return { isHorn: true };
}

// Função auxiliar que conta literais positivos em uma cláusula
function contarLiteraisPositivos(no) {
    if (!no) {
        return 0;
    }

    switch (no.tipo) {
        case "LITERAL":
            // Verifica se é literal positivo ou negativo, se negativo retorna 0, se positivo retorna 1
            if (no.valor.startsWith("\\lnot")) {
                return 0;
            }
            return 1;

        case "NOT":
            // Se for um literal negado, retorna 0
            if (no.filhos[0] && no.filhos[0].tipo === "LITERAL") {
                return 0;
            }
            return contarLiteraisPositivos(no.filhos[0]);

        case "OR":
            // Soma os literais positivos de ambos os lados da disjunção
            const esquerdoOr = contarLiteraisPositivos(no.filhos[0]);
            const direitoOr = contarLiteraisPositivos(no.filhos[1]);
            return esquerdoOr + direitoOr;

        case "AND":
            const esquerdoAnd = contarLiteraisPositivos(no.filhos[0]);
            const direitoAnd = contarLiteraisPositivos(no.filhos[1]);
            return esquerdoAnd + direitoAnd;

        case "FORALL":
        case "EXISTS":
            // Não afeta na contagem de literais
            return contarLiteraisPositivos(no.filhos[0]);

        default:
            return 0;
    }
}