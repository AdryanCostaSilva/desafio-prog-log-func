document.getElementById("formulaForm").addEventListener("submit", function(e){
    e.preventDefault();
    
    const formula = document.getElementById("entradaFormula").value;
    function renderizaResultado(divId, resultado) {
        const div = document.getElementById(divId);
        div.innerHTML = `\\[ ${resultado} \\]`;
        MathJax.typesetPromise([div]);
    }

    // No submit:
    renderizaResultado("fnc", formula);
    renderizaResultado("fnd", formula);
    renderizaResultado("clausal", formula);
    renderizaResultado("horn", formula);



 });
