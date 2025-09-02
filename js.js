const midia = document.getElementById("media"),
    tamanho = document.getElementById("tamanho"),
    resolucao = document.getElementById("resolucao"),
    texto_tamanho_reducao = document.getElementById("tamanho_texto"),
    texto_conversao = document.getElementById("tipo_texto"),
    sliders = document.querySelectorAll('input[type="range"]'),
    container_conversao_BTN = document.getElementById('tipos_de_conversao'),
    conversao_BTNs = container_conversao_BTN.querySelectorAll('button'),
    preview = document.getElementById('preview'),
    comparacao_input = document.getElementById('comparacao'),
    container_preview = document.getElementById('container_preview');

let original_imagem = document.getElementById('original')

// Percebe quando algum arquivo é escolhido
midia.addEventListener('change', (event) => { document.querySelector('#campo_arquivo p').textContent = event.target.files[0].name; });

// Atualizam os textos de porcentagem
function atualizandoResolucao(valor) { document.querySelector('#resolucao_span p').textContent = valor + '%'; };

function atualizandoTamanho(valor) { document.querySelector('#tamanho_span p').textContent = valor + '%'; };

function atualizandoComparacao(valor) { preview.style.width = `${100 - valor}%`; };

// Muda o fundo dos sliders
sliders.forEach(slider => {
    slider.addEventListener('input', function () {
        const valPercent = (this.value - this.min) / (this.max - this.min) * 100;
        this.style.background = `linear-gradient(110deg, #3426d1 0%, #6a1eb9 ${valPercent}%, grey ${valPercent}%)`;
    });

    // Atualiza o gradiente ao carregar a página
    const valPercent = (slider.value - slider.min) / (slider.max - slider.min) * 100;
    slider.style.background = `linear-gradient(110deg, #3426d1 0%, #6a1eb9 ${valPercent}%, grey ${valPercent}%)`;
});

// Botões para escolher o tipo de conversão
container_conversao_BTN.addEventListener('click', (click) => {
    const btn = click.target.closest('button');

    conversao_BTNs.forEach((el) => { el.classList.remove('selecionado') });

    btn.classList.add('selecionado');
})

// Coleta a imagem e as informações
function coletandoValores() {
    // Reseta o slider de comparação
    preview.style.width = `50%`;
    comparacao_input.value = '50%';

    // Notificação
    document.getElementById('baixar_imagem').textContent = 'Convertendo...';

    const arquivo = midia.files[0],
        escala = tamanho.value / 100,
        qualidade = resolucao.value / 100,
        tipo_saida = container_conversao_BTN.querySelector('.selecionado').getAttribute('tipo'),
        tipo_entrada = arquivo.type.split('image/')[1];

    // Prepara a visualização da imagem original
    original_imagem.src = URL.createObjectURL(arquivo);

    // Inicia a conversão
    convertendoParaWebp(arquivo, escala, qualidade, arquivo.name.split(".")[0], arquivo.size, tipo_saida, tipo_entrada);

    // Inicia a animação de abrir a segunda section
    container_preview.style.display = 'flex';

    setTimeout(() => {
        container_preview.style.width = '100%';
        container_preview.style.padding = '3%';
        comparacao_input.style.display = 'block';
        document.getElementById('comparacao_label').style.display = 'block';
    }, 100);
};

// Converte
function convertendoParaWebp(arquivo, escala, qualidade, nome_do_arquivo, tamanho_original, tipo_saida, tipo_entrada) {
    console.log('convertendo...')
    const img = new Image();
    img.src = URL.createObjectURL(arquivo);

    img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width * escala;
        canvas.height = img.height * escala;

        canvas
            .getContext("2d")
            .drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
            (blobFinal) => {
                let tamanhoOriginalEmKB = (tamanho_original / 1024).toFixed(2);
                let tamanhoEmKB = (blobFinal.size / 1024).toFixed(2);

                if (tamanhoOriginalEmKB >= 1024) tamanhoOriginalEmKB = (tamanhoOriginalEmKB / 1024).toFixed(2) + 'MB';
                else { tamanhoOriginalEmKB += 'KB' };

                if (tamanhoEmKB >= 1024) tamanhoEmKB = (tamanhoEmKB / 1024).toFixed(2) + 'MB';
                else { tamanhoEmKB += 'KB' };

                const urlFinal = URL.createObjectURL(blobFinal);

                const a = document.getElementById("baixar_imagem");
                a.href = urlFinal;
                a.download = `${nome_do_arquivo}.${tipo_saida}`;
                a.innerHTML = `<svg><use href='#icon_download'/></svg> ${nome_do_arquivo}`;

                preview.src = urlFinal;
                texto_tamanho_reducao.innerHTML = `${tamanhoOriginalEmKB} <svg><use href="#icon_seta" /></svg> ${tamanhoEmKB}`
                texto_conversao.innerHTML = `${tipo_entrada}<svg><use href="#icon_seta" /></svg>${tipo_saida}`


                document.getElementById('image_continer').style.height = '100%'

                setTimeout(() => {
                    // Tira a invisibilidade dos itens da segunda Section
                    comparacao_input.style.opacity = '1';
                    document.getElementById('comparacao_label').style.opacity = '1';

                    // Adapta o tamanho da barra de comparação pro tamanho da imagem
                    comparacao_input.style.width = getComputedStyle(original_imagem).width;
                    window.scrollTo({
                        top: 1000,
                        behavior: 'smooth'
                    });
                }, 300);
            },
            `image/${tipo_saida}`,
            qualidade
        );
    };
};