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
    renderizaResultado("fnc", formula);
    let formula_fnc = eliminaImplicacao(formula);
    while (formula_fnc != null){
        renderizaResultado("fnc", formula_fnc)
        formula_fnc = eliminaImplicacao(formula_fnc)
    }

    // FND
    renderizaResultado("fnd", formula);
    let formula_fnd = eliminaImplicacao(formula);
    while (formula_fnd != null){
        renderizaResultado("fnd", formula_fnd)
        formula_fnd = eliminaImplicacao(formula_fnd)
    }

    renderizaResultado("clausal", formula);
    renderizaResultado("horn", formula);

    //Testes

    //(\forall x (A(x) \to E(x))) \lor (\exists y (P(y) \land M(y))
    //(\exists x(A(x) \land E(x))) \land (\forall y (P(y) \to N(y)))
    //(\forall x(E(x) \to I(x))) \lor (\exists y(P(y) \land S(y)))
    //(\forall x(A(x) \to C(x))) \lor (\exists y(P(y) \land V(y))) 
    //\lnot(\forall x (P(x) \to \exists yQ(x,y)) \leftrightarrow \exists zR(z))
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
    //Tira espaços entre quantificadores e predicatos]
    formula = formula.replace(/\\(forall|exists)\s*(\w)\s*/g, "\\$1 $2");
    //Acha a implicação se ela existe e garda a posição
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
    
 }