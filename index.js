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

    // FNC
    // Fórmula original
    renderizaResultado("fnc", formula);

    let fnc_formula = formula
    let fnd_formula = formula

    // Eliminando as bi-implicações
    let formula_temp = eliminaBiImplicacao(fnc_formula);
    while (formula_temp != null) {
        fnc_formula = formula_temp;
        renderizaResultado("fnc", fnc_formula);
        formula_temp = eliminaBiImplicacao(fnc_formula);
    }
    // Eliminando as implicações
    formula_temp = eliminaImplicacao(fnc_formula);
    while (formula_temp != null) {
        fnc_formula = formula_temp;
        renderizaResultado("fnc", fnc_formula);
        formula_temp = eliminaImplicacao(fnc_formula);
    }

    let mudou = true;
    while (mudou) {
        mudou = false;

        // 1. De Morgan
        let formula_temp = aplicaDeMorgan(fnc_formula);
        while (formula_temp != null) {
            fnc_formula = formula_temp;
            renderizaResultado("fnc", fnc_formula);
            formula_temp = aplicaDeMorgan(fnc_formula);
            mudou = true;
        }

        // 2. Negação de quantificadores
        formula_temp = revomeNegacaoQuantificador(fnc_formula);
        while (formula_temp != null) {
            fnc_formula = formula_temp;
            renderizaResultado("fnc", fnc_formula);
            formula_temp = revomeNegacaoQuantificador(fnc_formula);
            mudou = true;
        }

        // 3. Dupla negação
        formula_temp = removeDuplaNegacao(fnc_formula);
        while (formula_temp != null) {
            fnc_formula = formula_temp;
            renderizaResultado("fnc", fnc_formula);
            formula_temp = removeDuplaNegacao(fnc_formula);
            mudou = true;
        }
    }

    fnc_formula = renomeiaVariaveis(fnc_formula);
    renderizaResultado("fnc", fnc_formula)

    // FND
    renderizaResultado("fnd", formula);
    formula_temp = eliminaBiImplicacao(fnd_formula);
    while (formula_temp != null) {
        fnd_formula = formula_temp;
        renderizaResultado("fnd", fnd_formula);
        formula_temp = eliminaBiImplicacao(fnd_formula);
    }
    // Eliminando as implicações
    formula_temp = eliminaImplicacao(fnd_formula);
    while (formula_temp != null) {
        fnd_formula = formula_temp;
        renderizaResultado("fnd", fnd_formula);
        formula_temp = eliminaImplicacao(fnd_formula);
    }

    mudou = true;
    while (mudou) {
        mudou = false;

        // 1. De Morgan
        let formula_temp = aplicaDeMorgan(fnd_formula);
        while (formula_temp != null) {
            fnd_formula = formula_temp;
            renderizaResultado("fnd", fnd_formula);
            formula_temp = aplicaDeMorgan(fnd_formula);
            mudou = true;
        }

        // 2. Negação de quantificadores
        formula_temp = revomeNegacaoQuantificador(fnd_formula);
        while (formula_temp != null) {
            fnd_formula = formula_temp;
            renderizaResultado("fnd", fnd_formula);
            formula_temp = revomeNegacaoQuantificador(fnd_formula);
            mudou = true;
        }

        // 3. Dupla negação
        formula_temp = removeDuplaNegacao(fnd_formula);
        while (formula_temp != null) {
            fnd_formula = formula_temp;
            renderizaResultado("fnd", fnd_formula);
            formula_temp = removeDuplaNegacao(fnd_formula);
            mudou = true;
        }
    }

    fnd_formula = renomeiaVariaveis(fnd_formula);
    renderizaResultado("fnd", fnd_formula)

    renderizaResultado("clausal", formula);
    renderizaResultado("horn", formula);

    //Testes

    //(\forall x (A(x) \to E(x))) \lor (\exists y (P(y) \land M(y))
    //(\exists x(A(x) \land E(x))) \land (\forall y (P(y) \to N(y)))
    //(\forall x(E(x) \to I(x))) \lor (\exists y(P(y) \land S(y)))
    //(\forall x(A(x) \to C(x))) \lor (\exists y(P(y) \land V(y))) 
    //\lnot (\forall x (P(x) \to \exists yQ(x,y)) \leftrightarrow \exists zR(z))
    //(\exists xP(x) \to \forall yQ(y)) \land (\exists zR(z) \to \forall wS(w))
    //(\forall x(P(x) \to \exists yS(x, y))) \to (\lnot\forall z(P(z) \to D(z)))

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
        console.log("Não possui implicação");
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
    if (!b_possui_parenteses){
        pos_final_b = formula.length;
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
                
                //Verifica se há um predicato uma no inicio de A
                if ("ABCDEFGHIJKLMNOPQRSTUVWXYZ".includes(formula[pos_inicio_a - 1])){
                    pos_inicio_a = i - 1;
                }
                
                //Se houver quantificadores pula, para colocar negação na frente
                while ((formula.substring(pos_inicio_a - 9, pos_inicio_a - 2) === "\\exists") || (formula.substring(pos_inicio_a - 9, pos_inicio_a -2) === "\\forall")){
                    pos_inicio_a -= 9;
                }

                break;
            }
        }
    }
    //Verifica se há parenteses para casos de predicatos sem variaveis
    if (!a_possui_parenteses){
        pos_inicio_a = 0;
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
        console.log("Não possui bi-implicação");
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
    if (!b_tem_par) {
        pos_final_b = formula.length;
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
                if ("ABCDEFGHIJKLMNOPQRSTUVWXYZ".includes(formula[pos_inicio_a - 1])){
                    pos_inicio_a = i - 1;
                }
                while ((formula.substring(pos_inicio_a - 9, pos_inicio_a - 2) === "\\exists") || 
                       (formula.substring(pos_inicio_a - 9, pos_inicio_a - 2) === "\\forall")){
                    pos_inicio_a -= 9;
                }
                break;
            }
        }
    }

    if (!a_tem_par) {
        pos_inicio_a = 0;
    }

    // Define A e B
    let A = formula.substring(pos_inicio_a, pos_bi).trim();
    let B = formula.substring(pos_bi + tam_bi, pos_final_b).trim();

    let antes = formula.substring(0, pos_inicio_a);
    let depois = formula.substring(pos_final_b);

    // Substitui por ((A -> B) ∧ (B -> A))
    let sem_bi = `${antes}((${A} \\land ${B}) \\lor (\\lnot ${A} \\land \\lnot ${B}))${depois}`;

    return sem_bi;
}

function revomeNegacaoQuantificador(formula){
    let regex_quan;
    //Regex para encontrar quantificadores existenciais
    regex_quan = formula.match(/\\lnot\s*\\forall\s+(\w)\s*(.*)/);
    if (regex_quan) {
        let variavel = regex_quan[1];
        let predicado = regex_quan[2];
        return formula.replace(regex_quan[0], `\\exists ${variavel} \\lnot ${predicado}`);
    }

    //Regex para encontrar quantificadores universais
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