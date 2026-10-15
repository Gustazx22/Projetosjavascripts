
    const produtos = [
    { id: 1, nome: "Cerveja Pilsen 600ml", preco: 12.00 },
    { id: 2, nome: "Porcao de Fritas", preco: 25.00 },
    { id: 3, nome: "Refrigerante", preco: 6.00 },
    { id: 4, nome: "Suco Natural", preco: 8.00 }
];

const carrinho = [];

function mostrarCardapio() {
    const areaCardapio = document.getElementById("cardapio");

    areaCardapio.innerHTML = "";

    produtos.forEach(function(produto) {
        areaCardapio.innerHTML += `
            <div class="produto">
                <h3>${produto.nome}</h3>
                <p>Preco: R$ ${produto.preco.toFixed(2).replace(".", ",")}</p>
                <button onclick="adicionarCarrinho(${produto.id})">
                    Adicionar
                </button>
            </div>
        `;
    });
}

mostrarCardapio();



const produtosSalvos = localStorage.getItem("produtos");


if (!produtosSalvos) {
    localStorage.setItem("produtos", JSON.stringify(produtos));
}


const fiadosSalvos = localStorage.getItem("fiados");

const fiados = fiadosSalvos
    ? JSON.parse(fiadosSalvos)
    : [];


const vendasSalvas = localStorage.getItem("vendas");

const vendas = vendasSalvas
    ? JSON.parse(vendasSalvas)
    : [];

function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}



function adicionarCarrinho(idProduto) {

    
    const produto = produtos.find(function(item) {
        return item.id === idProduto;
    });

    
    if (!produto) {
        return;
    }

    
    const itemCarrinho = carrinho.find(function(item) {
        return item.id === idProduto;
    });

    if (itemCarrinho) {

        // Aumenta a quantidade se o item já existir
        itemCarrinho.quantidade++;

    } else {

        // Adiciona um novo objeto ao carrinho
        carrinho.push({
            id: produto.id,
            nome: produto.nome,
            preco: produto.preco,
            quantidade: 1
        });
    }

    // Atualiza a comanda na tela
    mostrarCarrinho();
}




function calcularTotal() {
    let total = 0;

    carrinho.forEach(function(item) {
        total += item.preco * item.quantidade;
    });

    return total;
}




function mostrarCarrinho() {
    const areaCarrinho = document.getElementById("carrinho");
    const campoTotal = document.getElementById("total");

    areaCarrinho.innerHTML = "";

    carrinho.forEach(function(item) {
        const subtotal = item.preco * item.quantidade;

        areaCarrinho.innerHTML += `
            <div class="item-carrinho">
                <h3>${item.nome}</h3>

                <p>Quantidade: ${item.quantidade}</p>

                <p>Preço unitário: ${formatarMoeda(item.preco)}</p>

                <p>Subtotal: ${formatarMoeda(subtotal)}</p>

                <button onclick="diminuirQuantidade(${item.id})">
                    - 1
                </button>

                <button onclick="removerItem(${item.id})">
                    Remover
                </button>
            </div>
        `;
    });

    // Mostra o total atualizado
    campoTotal.textContent = formatarMoeda(calcularTotal());
}


function diminuirQuantidade(idProduto) {
    const item = carrinho.find(function(item) {
        return item.id === idProduto;
    });

    if (!item) {
        return;
    }

    item.quantidade--;

    // Remove o produto se a quantidade chegar a zero
    if (item.quantidade <= 0) {
        removerItem(idProduto);
        return;
    }

    mostrarCarrinho();
}



function removerItem(idProduto) {
    const indice = carrinho.findIndex(function(item) {
        return item.id === idProduto;
    });

    if (indice !== -1) {
        carrinho.splice(indice, 1);
    }

    mostrarCarrinho();
}




function salvarFiados() {
    localStorage.setItem("fiados", JSON.stringify(fiados));
}





function mostrarFiados() {
    const areaFiados = document.getElementById("fiados");
    areaFiados.innerHTML = "";

    const clientesDevedores = fiados.filter(function(cliente) {
        return cliente.saldoDevedor > 0;
    });

    if (clientesDevedores.length === 0) {
        areaFiados.textContent = "Nenhuma dívida registrada.";
        return;
    }

    clientesDevedores.forEach(function(cliente) {
        const indice = fiados.indexOf(cliente);

        areaFiados.innerHTML += `
            <div class="cliente-fiado">
                <h3>${cliente.nome}</h3>
                <p>Saldo devedor: ${formatarMoeda(cliente.saldoDevedor)}</p>
                <button onclick="quitarDivida(${indice})">
                    Quitar Dívida
                </button>
            </div>
        `;
    });
}





function quitarDivida(indice) {
    const cliente = fiados[indice];

    if (!cliente) {
        return;
    }

    const confirmar = confirm(
        "Confirma o pagamento da dívida de " +
        cliente.nome + " no valor de " +
        formatarMoeda(cliente.saldoDevedor) + "?"
    );

    if (!confirmar) {
        return;
    }

    // Registra o pagamento integral da dívida
    cliente.saldoDevedor = 0;

    
    salvarFiados();
    mostrarFiados();

    alert("Dívida quitada com sucesso!");
}




function salvarVendas() {
    localStorage.setItem("vendas", JSON.stringify(vendas));
}




function finalizarPedido() {

    // Não permite finalizar uma comanda vazia
    if (carrinho.length === 0) {
        alert("Adicione pelo menos um produto ao pedido.");
        return;
    }

    const total = calcularTotal();

    // Escolhe a forma de pagamento
    const opcao = prompt(
        "Como deseja finalizar o pedido?\n\n" +
        "1 - Pagamento imediato\n" +
        "2 - Fiado\n" +
        "0 - Cancelar"
    );

    if (opcao === null || opcao === "0") {
        return;
    }

    if (opcao !== "1" && opcao !== "2") {
        alert("Opção inválida. Tente novamente.");
        return;
    }

    // Cria uma cópia dos itens para registrar a venda
    const itensPedido = carrinho.map(function(item) {
        return {
            id: item.id,
            nome: item.nome,
            preco: item.preco,
            quantidade: item.quantidade
        };
    });

    if (opcao === "1") {

        // Registra uma venda com pagamento imediato
        vendas.push({
            itens: itensPedido,
            total: total,
            formaPagamento: "imediato",
            data: new Date().toISOString()
        });

        salvarVendas();

        carrinho.length = 0;

        mostrarCarrinho();

        alert(
            "Venda registrada com sucesso!\n" +
            "Total pago: " + formatarMoeda(total)
        );

    } else {

        // Solicita o nome do cliente que ficará devendo
        const nomeInformado = prompt(
            "Digite o nome do cliente:"
        );

        if (nomeInformado === null || nomeInformado.trim() === "") {
            alert("Fiado cancelado. O pedido continua na comanda.");
            return;
        }

        const nome = nomeInformado.trim();

        // Procura o cliente na caderneta, sem diferenciar maiúsculas
        const clienteExistente = fiados.find(function(cliente) {
            return cliente.nome.toLowerCase() === nome.toLowerCase();
        });

        if (clienteExistente) {

            // Soma a nova compra à dívida existente
            clienteExistente.saldoDevedor += total;

        } else {

            // Cadastra um novo cliente devedor
            fiados.push({
                nome: nome,
                saldoDevedor: total
            });
        }

        salvarFiados();

        // Registra a venda a prazo
        vendas.push({
            itens: itensPedido,
            total: total,
            formaPagamento: "fiado",
            cliente: nome,
            data: new Date().toISOString()
        });

        salvarVendas();

        carrinho.length = 0;

        mostrarCarrinho();
        mostrarFiados();

        alert(
            "Fiado registrado com sucesso!\n" +
            "Cliente: " + nome + "\n" +
            "Valor: " + formatarMoeda(total)
        );
    }
}




document.getElementById("finalizar").addEventListener(
    "click",
    finalizarPedido
);




mostrarCardapio();
mostrarCarrinho();
mostrarFiados();

