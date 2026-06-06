const elementoHome = {
    sectionHome: document.getElementById("home"),
    inputImagem: document.getElementById("input-imagem"),
    nomeImagem: document.getElementById('nome-arquivo'),
    sliderArray: document.querySelectorAll('input[type="range"]'),
    inputEscala: document.getElementById('escala-input'),
    inputResolucao: document.getElementById('resolucao-input'),
    converterBtn: document.getElementById('converter-btn'),
    previewUpload: document.getElementById('preview-upload'),
};

const elementoPreview = {
    sectionPreview: document.getElementById("preview"),
    comparacaoSlider: document.getElementById('comparacao-input'),
    imagensContainer: document.getElementById('imagem-container'),
    imagemOriginal: document.getElementById('img-original'),
    imagemPreview: document.getElementById('img-preview'),
    downloadBtn: document.getElementById('download-btn'),
    pesoInicial: document.querySelector('#comparacao-peso .antes'),
    pesoFinal: document.querySelector('#comparacao-peso .depois'),
    tipoInicial: document.querySelector('#comparacao-tipo-arquivo .antes'),
    tipoFinal: document.querySelector('#comparacao-tipo-arquivo .depois'),
    pxInicial: document.querySelector('#comparacao-px .antes'),
    pxFinal: document.querySelector('#comparacao-px .depois'),
};

// Mostra um preview do arquivo ao escolher uma imagem
let imagemSrc;
let urlOriginalAtual;

elementoHome.inputImagem.addEventListener('change', (event) => {
    imagemSrc = event.target.files[0];

    if (urlOriginalAtual) URL.revokeObjectURL(urlOriginalAtual);

    elementoHome.previewUpload.src = urlOriginalAtual = URL.createObjectURL(imagemSrc);
    elementoHome.nomeImagem.textContent = imagemSrc.name;
});

// Atualiza o background dos sliders
elementoHome.sliderArray.forEach(slider => {
    let timer;

    slider.addEventListener('input', () => {
        if (timer) return;

        timer = requestAnimationFrame(() => {
            slider.style.setProperty('--porcentagem', `${slider.value}%`);
            
            if (slider.id === elementoPreview.comparacaoSlider.id) elementoPreview.imagemPreview.style.setProperty('--porcentagemDivisao', `${100 - slider.value}%`);

            timer = null;
        });
    });
});

elementoHome.converterBtn.addEventListener('click', () => { coletandoValores() })

const imgVazia = 'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=';
let imagemInfos;

function coletandoValores() {
    if (elementoHome.converterBtn.classList.contains('erro')) elementoHome.converterBtn.classList.remove('erro');

    if (!imagemSrc) {
        setTimeout(() => {
            elementoHome.converterBtn.classList.add('erro');
        }, 100)

        return;
    };

    imagemInfos = {
        arquivo: imagemSrc,
        escala: elementoHome.inputEscala.value / 100,
        resolucao: elementoHome.inputResolucao.value / 100,
        tipoEntrada: imagemSrc.type.split('image/')[1],
        tipoSaida: document.querySelector('#btns-container input:checked').id,
    };

    if (elementoPreview.imagemOriginal.src !== urlOriginalAtual) elementoPreview.imagemOriginal.src = urlOriginalAtual;

    console.log(urlOriginalAtual)
    console.log(elementoPreview.imagemOriginal.src)

    // Inicia a conversão
    converterImagem();

    if (!elementoHome.sectionHome.classList.contains('show')) {
        elementoPreview.sectionPreview.classList.add('show');
        elementoHome.sectionHome.classList.add('show');
    }

    // Reset
    elementoPreview.imagemPreview.src = imgVazia;
    elementoPreview.imagemPreview.style.setProperty('--porcentagemDivisao', '50%');
    elementoPreview.comparacaoSlider.value = '50';

    elementoHome.previewUpload.classList.add('reset');
    setTimeout(() => {
        elementoHome.previewUpload.src = imgVazia;
        elementoHome.previewUpload.classList.remove('reset');
    }, 400)
}

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

let urlConvertidaAtual;
let conversaoID = 0;
let bitmapAtual;
let arquivoBitmapAtual;

async function converterImagem() {
    if (!elementoPreview.downloadBtn.classList.contains('convertendo')) elementoPreview.downloadBtn.classList.add('convertendo');
    elementoPreview.pesoFinal.textContent = '----';
    elementoPreview.tipoFinal.textContent = '----';
    elementoPreview.pxFinal.textContent = `----`;

    const idAtual = ++conversaoID;

    if (urlConvertidaAtual) URL.revokeObjectURL(urlConvertidaAtual);

    if (arquivoBitmapAtual !== imagemInfos.arquivo) {

        if (bitmapAtual) bitmapAtual.close();

        bitmapAtual = await createImageBitmap(imagemInfos.arquivo);

        arquivoBitmapAtual = imagemInfos.arquivo;

        elementoPreview.pxInicial.textContent = `${bitmapAtual.width}x${bitmapAtual.height}`;
    }

    const bitmap = bitmapAtual;

    canvas.width = bitmap.width * imagemInfos.escala;
    canvas.height = bitmap.height * imagemInfos.escala;

    ctx.drawImage(
        bitmap,
        0,
        0,
        canvas.width,
        canvas.height
    );

    canvas.toBlob(
        (blobFinal) => {
            if (!blobFinal || idAtual !== conversaoID) {
                if (!blobFinal) alert('Falha ao converter a imagem');

                return;
            };

            const tamanhoOriginal = conversaoKbParaMb(imagemInfos.arquivo.size);
            const tamanhoFinal = conversaoKbParaMb(blobFinal.size);

            const urlFinal = urlConvertidaAtual = URL.createObjectURL(blobFinal);

            elementoPreview.downloadBtn.href = urlFinal;
            elementoPreview.downloadBtn.download = `${imagemInfos.arquivo.name.split(".")[0]}.${imagemInfos.tipoSaida}`;

            elementoPreview.pesoInicial.textContent = tamanhoOriginal;
            elementoPreview.pesoFinal.textContent = tamanhoFinal;

            elementoPreview.tipoInicial.textContent = imagemInfos.tipoEntrada;
            elementoPreview.tipoFinal.textContent = imagemInfos.tipoSaida;

            elementoPreview.pxFinal.textContent = `${canvas.width}x${canvas.height}`;

            elementoPreview.imagemPreview.src = urlFinal;

            elementoPreview.imagemPreview.onload = () => {
                // Adapta o tamanho da barra de comparação pro tamanho da imagem
                elementoPreview.comparacaoSlider.style.setProperty('--tamanho', getComputedStyle(elementoPreview.imagensContainer).width);

                window.scrollTo({
                    top: 1000,
                    behavior: 'smooth'
                });
            };

            // bitmap.close();

            if (elementoPreview.downloadBtn.classList.contains('convertendo')) elementoPreview.downloadBtn.classList.remove('convertendo');
        },
        `image/${imagemInfos.tipoSaida}`,
        imagemInfos.resolucao
    );
};

function conversaoKbParaMb(valor) {
    let tamanho = (valor / 1024).toFixed(2);

    if (tamanho >= 1024) tamanho = (tamanho / 1024).toFixed(2) + 'MB';
    else tamanho += 'KB';

    return tamanho;
}

window.addEventListener('beforeunload', () => {

    if (bitmapAtual) bitmapAtual.close();

    if (urlOriginalAtual) URL.revokeObjectURL(urlOriginalAtual);

    if (urlConvertidaAtual) URL.revokeObjectURL(urlConvertidaAtual);
});