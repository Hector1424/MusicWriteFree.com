$(document).ready(function () {

    $('#infoButton').click(function() {
        $('#songTempoList').toggle(); // Esto mostrará u ocultará el listado
    });

    // Ocultar el listado al hacer clic fuera de él
    $(document).click(function(event) {
        var target = $(event.target);
        if (!target.closest('#songTempoList').length && !target.is('#infoButton')) {
            $('#songTempoList').hide();
        }
    });

    // Evento de clic para cada elemento de la lista de canciones
    $('#songTempoList li').click(function() {
        var bpm = $(this).data('bpm'); // Obtener el BPM del atributo data-bpm
        $('#selectTempo').val(bpm + ' bpm').change(); // Establecer el valor y disparar el evento change
        $('#songTempoList').hide(); // Ocultar la lista
    });


    const selectorNotas = $('#selectorNotas');
    const contenedorFiltroNotas = $('#contenedorFiltroNotas');
    const notasCromaticasS = ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si", "Do"];
    const notasCromaticasB = ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"];
    var tamanoLetra = '12px';
    let metronomoInterval; // Variable para almacenar el intervalo del metrónomo
    let metronomoActivo = false; // Indica si el metrónomo está activo
    // Cargar los sonidos
    var sonidoTickFuerte = new Audio('tick.mp3');
    var sonidoTickDebil = new Audio('tick.mp3');



    
      // Crear el menú desplegable para el tamaño de letra
    const selectTamanioLetra = $('<select>')
        .attr('id', 'selectTamanioLetra')
        .addClass('selector-tamanio-letra')
        .attr('title', 'Tamaño de Letra') // Tooltip text

    // Añadir opciones al menú desplegable
    const tamanios = ["12px", "13px", "14px", "15px", "16px", "17px", "18px", "19px", "20px"];
    tamanios.forEach(function(tam) {
        selectTamanioLetra.append($('<option>').val(tam).text(tam));
    });

    // Crear el menú desplegable para el tempo
    const selectTempo = $('<select>')
        .attr('id', 'selectTempo')
        .addClass('selector-tempo')
        .attr('title', 'Seleccionar Tempo'); // Texto de tooltip

    // Añadir opciones al menú desplegable
    // const tempos = ["60 bpm", "70 bpm", "80 bpm", /* ... otros tempos ... */ "200 bpm"];

    // Valores mínimo y máximo para el tempo
    const tempoMin = 25;
    const tempoMax = 125;

    // Crear un arreglo vacío para almacenar los tempos
    const tempos = [];

    // Llenar el arreglo con valores desde tempoMin hasta tempoMax
    for (let bpm = tempoMin; bpm <= tempoMax; bpm++) {
        tempos.push(bpm + ' bpm');
    }

    tempos.forEach(function(tempo) {
        selectTempo.append($('<option>').val(tempo).text(tempo));
    });




    $('#filtroNotas').on('keyup', function() {
        var texto = $(this).val().toLowerCase();
        $('#selectorNotas option').filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(texto) > -1);
        });
    });

    // Crear el input de tipo file y la etiqueta label que actuará como botón
    const inputCargarArchivo = $('<input>')
        .attr('type', 'file')
        .attr('id', 'file-input')
        .addClass('file-input');

    const labelCargarArchivo = $('<label>')
        .attr('for', 'file-input')
        .attr('title', 'Cargar desde PC') // Tooltip text
        .addClass('file-input-label')
        .html('<i class="fas fa-file-import"></i>');

    // Añadir el listener para el cambio (cuando se selecciona un archivo)
    inputCargarArchivo.change(function(e) {
        var archivo = e.target.files[0];
        if (!archivo) {
            return;
        }

        var lector = new FileReader();

        lector.onload = function(e) {
            var contenido = e.target.result;
        
            // Crear un elemento contenedor temporal y establecer su contenido HTML
            var tempDiv = $('<div>').html(contenido);
        
            // Variables para almacenar los valores de los inputs
            var valorTitulo = '';
            var valorSubtitulo = '';
            var valoresRenglones = []; // Array para almacenar los valores de los renglones


            // Realizar operaciones en el contenedor temporal
            tempDiv.find('span').each(function() {
                var valor = $(this).text();
                var esInputTitulo = $(this).is('#titulo-cancion-text');
                var esInputSubtitulo = $(this).is('#subtitulo-cancion-text');
                var esInputRenglon = $(this).is('.letra-input');

                if(esInputTitulo){
                    console.log('titulo detectado: ', valor)
                    var id = 'titulo-cancion-text';
                    var nuevoInput = $('<input>')
                        .attr('type', 'text')
                        .val(valor)
                        .attr('id', 'titulo-cancion-text')
                    $(this).replaceWith(nuevoInput);
                    valorTitulo = valor;
                }

                if(esInputSubtitulo){
                    console.log('subtitulo detectado: ', valor)
                    var id = 'subtitulo-cancion-text';
                    var nuevoInput = $('<input>')
                        .attr('type', 'text')
                        .val(valor)
                        .attr('id', 'subtitulo-cancion-text')
                    $(this).replaceWith(nuevoInput);
                    valorSubtitulo = valor;
                }

                if(esInputRenglon){
                    console.log('renglon detectado: ', valor)
                    var nuevoInput = $('<input>')
                        .attr('type', 'text')
                        .val(valor)
                        .addClass('letra-input');
                    $(this).replaceWith(nuevoInput);
                    valoresRenglones.push(valor);
                }


            });
        
            // Establecer el contenido modificado en el contenedor del editor
            $('#editor-container').html(tempDiv.html());

            $('#titulo-cancion-text').val(valorTitulo)
            $('#subtitulo-cancion-text').val(valorSubtitulo)

            // Asignar los valores a los inputs de los renglones
            var renglonInputs = $('#editor-container').find('.letra-input'); // Asegúrate de que esta sea la clase correcta
            renglonInputs.each(function(index) {
                console.log('renglon encontrado: ', index)
                if (index < valoresRenglones.length) {
                    $(this).val(valoresRenglones[index]);
                }
            });

        };
        
        lector.readAsText(archivo);
        

    });


    agregarRenglon(null); // Agrega el primer renglón al cargar la página

    const botonSubir = $('<button>')
            .text('+ 1/2')
            .attr('title', 'Subir 1 Semitono') // Tooltip text
            .click(subirSemitonos)
            .addClass(' btn-control-semitono');
    const botonBajar = $('<button>')
            .text('- 1/2')
            .attr('title', 'Bajar 1 Semitono') // Tooltip text
            .click(bajarSemitonos)
            .addClass(' btn-control-semitono');
    const imprimir = $('<button>')
            .text('izq')
            .attr('title', 'Imprimir') // Tooltip text
            .html('<i class="fa fa-print"></i>')
            .addClass('btn-control-imprimir')
            .click(function(){ 
                Imprimir('editor-container');
            });
    const botonGuardar = $('<button>')
            .text('')
            .attr('title', 'Guardar en PC') // Tooltip text
            .html('<i class="fa fa-save"></i>')
            .addClass('btn-control-guardar')
            .click(function(){
                guardarContenido('editor-container');
            });


    function toggleLed() {
        $('#led-metronomo').toggleClass('led-on');
    }


    function actualizarMetronomo() {
        if (metronomoActivo) {
            clearInterval(metronomoInterval); // Detiene el intervalo actual
            iniciarMetronomo(); // Inicia un nuevo intervalo con el nuevo tempo
        }
    }


    // function iniciarMetronomo() {
    //     const tempo = parseInt($('#selectTempo').val().split(" ")[0]);
    //     const intervalo = 60000 / tempo; // Intervalo completo del metrónomo
    //     metronomoInterval = setInterval(function() {
    //         toggleLed();
    //         setTimeout(function() {
    //             toggleLed();
    //         }, intervalo * 0.2); // Apagar el LED después de un 10% del intervalo
    //     }, intervalo);
    // }


    function iniciarMetronomo() {
        const tempo = parseInt($('#selectTempo').val().split(" ")[0]);
        const intervalo = 60000 / tempo; // Intervalo completo del metrónomo
        let contador = 0; // Contador para alternar entre tick fuerte y débil
    
        metronomoInterval = setInterval(function() {
            if (contador % 4 === 0) { // Ejemplo: tick fuerte cada 4 ticks
                sonidoTickFuerte.play();
            } else {
                sonidoTickDebil.play();
            }
            toggleLed();
            setTimeout(function() {
                toggleLed();
            }, intervalo * 0.1); // Apagar el LED después de un 10% del intervalo
            contador++;
        }, intervalo);
    }

    
    const metronomoPlayControl = $('<button>')
    .attr('id', 'metronomoPlayControl')
    .attr('title', 'Iniciar Metronomo') // Tooltip text
    .html('<i class="fa fa-circle-play"></i>')
    .addClass('btn-control-metronomo')
    .click(function() {
        if (metronomoActivo) {
            clearInterval(metronomoInterval);
            metronomoActivo = false;
            $('#led-metronomo').removeClass('led-on');
            $(this).html('<i class="fa fa-circle-play"></i>'); // Cambiar a icono de play
            $(this).removeClass('btn-verde'); // Remover clase de color verde
        } else {
            metronomoActivo = true;
            iniciarMetronomo();
            $(this).html('<i class="fa fa-circle-stop"></i>'); // Cambiar a icono de pause
            $(this).addClass('btn-verde'); // Aplicar clase de color verde
            $(this).attr('title', 'Detener Metronomo');
        }
    });


    $('#editor-controls-container').append(selectTamanioLetra ,botonBajar, botonSubir, inputCargarArchivo, labelCargarArchivo, botonGuardar, imprimir);

    $('#tempo-controls').append(metronomoPlayControl, selectTempo);


    // Controlador de eventos para cambiar el tamaño de la letra
    selectTamanioLetra.change(function() {
        var nuevoTamanio = $(this).val();
        // Asumiendo que .letra-input es la clase de los elementos a los que quieres cambiar el tamaño de letra
        $('.letra-input').css('font-size', nuevoTamanio);
        $('.nota').css('font-size', nuevoTamanio);
        tamanoLetra = nuevoTamanio;
    });

    // Controlador de eventos para el cambio de tempo
    $('#selectTempo').change(actualizarMetronomo);


    // // Opcional: Agregar un controlador de eventos para el cambio de tempo
    // selectTempo.change(function() {
    //     var tempoSeleccionado = $(this).val();
    //     // Aquí puedes agregar la lógica para manejar el cambio de tempo
    // });


    function agregarRenglon(renglonAnterior) {
        const renglonContainer = $('<div>')
                .addClass('renglon-container');
        const renglon = $('<div>')
                .addClass('renglon');
        const notasDiv = $('<div>')
                .addClass('notas-div')
                .css('position', 'relative')
                .attr('title', 'Agregar Acorde') // Tooltip text
        const inputLetra = $('<input>')
                .attr('type', 'text')
                .addClass('letra-input')
                .css('font-size', tamanoLetra);
        const renglon_controls = $('<div>')
                .addClass('renglon_controls');

        const buttonDeleteRow = $('<button>')
                .attr('title', 'Eliminar Renglon') // Tooltip text
                .html('<i class="fa fa-trash"></i>')
                .addClass('btn-delete')

        renglon_controls.append(buttonDeleteRow);

        notasDiv.click(function (e) {
            if (!$(e.target).is('.nota')) {
                const posX = e.pageX - $(this).offset().left;
                mostrarSelectorNotas(posX, $(this), null);
            }
        });



        renglon.append(notasDiv, inputLetra);
        renglonContainer.append(renglon, renglon_controls);

        if (renglonAnterior) {
            renglonAnterior.after(renglonContainer);
        } else {
            $('#renglones').prepend(renglonContainer);
        }

        inputLetra.focus();

    }

    function mostrarSelectorNotas(posX, notasDiv, spanNota) {
        // notasDiv.append(selectorNotas)
        notasDiv.append(contenedorFiltroNotas)
        

        // selectorNotas.css({
        contenedorFiltroNotas.css({
            display: 'block',
            position: 'absolute',
            left: posX
        })

    // Enfocar automáticamente en el campo de filtro cuando aparece el contenedor
    $('#filtroNotas').focus().val('');
        selectorNotas.off('change').change(function () {
            const notaSeleccionada = $(this).val();
            if (notaSeleccionada !== 'espacio') {
                if (!spanNota) {
                    spanNota = $('<span>')
                        .addClass('nota').css({
                        position: 'absolute',
                        left: posX,
                    }).click(function (e) {
                        mostrarSelectorNotas($(this).position().left, notasDiv, $(this));
                        e.stopPropagation();
                    }).attr('title', 'Seleccionar otro Acorde') // Tooltip text


                    notasDiv.append(spanNota);
                }
                spanNota.text(notaSeleccionada);
                spanNota.css('font-size', tamanoLetra)


            } else if (spanNota) {
                spanNota.remove();
            }
            // selectorNotas.hide();
            contenedorFiltroNotas.hide();
        });

        console.log('tamaño leta a asignar: ', tamanoLetra)

        return false;
    }


    // Delegar evento keypress para los inputs de los renglones
    $('#editor-container').on('keypress', '.letra-input', function(event) {
        var keycode = event.keyCode || event.which;
        if (keycode == '13') { // 13 es el código para la tecla Enter
            agregarRenglon($(this).closest('.renglon-container'));
        }
    });
    


    // // Delegar evento para el botón de eliminar
    // $('#editor-container').on('click', '.btn-delete', function() {
    //     $(this).closest('.renglon-container').remove();
    // });
    
    // Delegar evento para el botón de eliminar
    $('#editor-container').on('click', '.btn-delete', function() {
        // Verificar si hay más de un renglón antes de eliminar
        var totalRenglones = $('.renglon-container').length;
        if (totalRenglones > 1) {
            $(this).closest('.renglon-container').remove();
        } else {
            alert("Debe haber al menos un renglón en la pantalla.");
        }
    });



    // Delegar eventos para los clicks en notas y div de notas
    $('#editor-container').on('click', '.nota, .notas-div', function(e) {
        if (!$(e.target).is('.nota')) {
            const posX = e.pageX - $(this).offset().left;
            mostrarSelectorNotas(posX, $(this), null);
        } else {
            // Manejo del evento cuando se hace click en una nota
            const posX = $(e.target).position().left;
            mostrarSelectorNotas(posX, $(this).parent(), $(e.target));
        }
    });



    function subirSemitonos() {
        $('.nota').each(function () {
            let textoCompleto = $(this).text();
            let match = textoCompleto.match(/^(Do#?|Re#?|Mi#?|Fa#?|Sol#?|La#?|Si#?)([0-9m]*)$/); // Ajustado para tu notación
    
            if (match) {
                let nota = match[1];
                let modificador = match[2];
                let indice = notasCromaticasS.indexOf(nota);
                if (indice !== -1) {
                    let nuevaNota = notasCromaticasS[(indice + 1) % notasCromaticasS.length];
                    $(this).text(nuevaNota + modificador);
                }
            }
        });
    }
    
    function bajarSemitonos() {
        $('.nota').each(function () {
            let textoCompleto = $(this).text();
            let match = textoCompleto.match(/^(Do#?|Re#?|Mi#?|Fa#?|Sol#?|La#?|Si#?)([0-9m]*)$/); // Ajustado para tu notación
    
            if (match) {
                let nota = match[1];
                let modificador = match[2];
                let indice = notasCromaticasB.indexOf(nota);
                if (indice !== -1) {
                    let nuevaNota = notasCromaticasB[(indice - 1 + notasCromaticasB.length) % notasCromaticasB.length];
                    $(this).text(nuevaNota + modificador);
                }
            }
        });
    }
    
    // function guardarContenido(idDiv){

    //     var divParaImprimir = document.getElementById(idDiv).cloneNode(true);
    
    //     // Reemplaza cada input con un span que contiene su valor actual
    //     $(divParaImprimir).find('input').each(function() {
    //         var valor = $(this).val();
    //         var id = $(this).attr('id'); // Obtener el ID del input
    //         var esInputTitulo = $(this).is('#titulo-cancion-text'); // Reemplaza con el ID real de tu input especial
    //         var esInputSubtitulo = $(this).is('#subtitulo-cancion-text'); // Reemplaza con el ID real de tu input especial
    //         var esInputRenglon = $(this).is('.letra-input');
    //         var nuevoSpan = $('<span>').text(valor).attr('id', id);
            
    //         nuevoSpan.css('font-size', '14px');
    //         if (esInputTitulo) {
    //             nuevoSpan.css('font-weight', 'bold'); // Aplica negrita al input especial
    //             nuevoSpan.css('color', 'blue');
    //             nuevoSpan.css('font-size', '19px');

    //         }
    //         if (esInputSubtitulo) {
    //             nuevoSpan.css('color', 'blue');
    //             nuevoSpan.css('font-size', '17px');
    //         }

    //         if(esInputRenglon){
    //             nuevoSpan.addClass('letra-input')
    //         }


    //         $(this).replaceWith(nuevoSpan);
    //         // $(this).replaceWith('<span>' + valor + '</span>');
    //     });

    //     var contenido = divParaImprimir.innerHTML;
    //     var blob = new Blob([contenido], {type: 'text/html'});
    //     var enlace = document.createElement('a');
    //     enlace.href = URL.createObjectURL(blob);
    //     enlace.download = 'contenido.html';
    
    //     // Simula un clic en el enlace para descargar el archivo
    //     document.body.appendChild(enlace);
    //     enlace.click();
    //     document.body.removeChild(enlace);
    // }

    function guardarContenido(idDiv) {
        var divParaGuardar = document.getElementById(idDiv).cloneNode(true);
    
        // Reemplaza cada input con un span que contiene su valor actual
        $(divParaGuardar).find('input').each(function() {
            var valor = $(this).val();
            var id = $(this).attr('id'); // Obtener el ID del input
            var esInputTitulo = $(this).is('#titulo-cancion-text'); // Reemplaza con el ID real de tu input especial
            var esInputSubtitulo = $(this).is('#subtitulo-cancion-text'); // Reemplaza con el ID real de tu input especial
            var esInputRenglon = $(this).is('.letra-input');
            var nuevoSpan = $('<span>').text(valor).attr('id', id);
    
            nuevoSpan.css('font-size', '14px');
            if (esInputTitulo) {
                nuevoSpan.css('font-weight', 'bold'); // Aplica negrita al input especial
                nuevoSpan.css('color', 'blue');
                nuevoSpan.css('font-size', '19px');
            }
            if (esInputSubtitulo) {
                nuevoSpan.css('color', 'blue');
                nuevoSpan.css('font-size', '17px');
            }
            if (esInputRenglon) {
                nuevoSpan.addClass('letra-input');
            }
    
            $(this).replaceWith(nuevoSpan);
        });
    
        var contenido = divParaGuardar.innerHTML;
        var blob = new Blob([contenido], {type: 'text/html'});
    
        // Crear un enlace y simular un clic para la descarga
        var enlace = document.createElement('a');
        enlace.href = URL.createObjectURL(blob);
    
        // Usar un prompt para permitir al usuario elegir el nombre del archivo
        var nombreArchivo = prompt("Ingrese el nombre del archivo para guardar:", "miArchivo.html");
        if (nombreArchivo) {
            enlace.download = nombreArchivo;
        } else {
            enlace.download = 'miArchivo.html'; // Nombre por defecto si el usuario no ingresa uno
        }
    
        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);
    }
    

 

    function cargarContenido(){

    }


    

    function Imprimir(idDiv) {
        // Clona el div para no alterar el original
        var divParaImprimir = document.getElementById(idDiv).cloneNode(true);
    
        // Reemplaza cada input con un span que contiene su valor actual
        $(divParaImprimir).find('input').each(function() {
            var valor = $(this).val();
            var esInputTitulo = $(this).is('#titulo-cancion-text'); // Reemplaza con el ID real de tu input especial
            var esInputSubtitulo = $(this).is('#subtitulo-cancion-text'); // Reemplaza con el ID real de tu input especial
            var nuevoSpan = $('<span>').text(valor);
            
            nuevoSpan.addClass('letra-input');
            nuevoSpan.css('border', '0px');
            // nuevoSpan.css('font-size', '14px');
            if (esInputTitulo) {
                nuevoSpan.css('font-weight', 'bold'); // Aplica negrita al input especial
                nuevoSpan.css('color', 'blue');
                nuevoSpan.css('font-size', '19px');

            }
            if (esInputSubtitulo) {
                nuevoSpan.css('color', 'blue');
                nuevoSpan.css('font-size', '17px');
            }


            $(this).replaceWith(nuevoSpan);
            // $(this).replaceWith('<span>' + valor + '</span>');
        });

         // Elimina todos los botones del clon
        $(divParaImprimir).find('button').remove();
    
        var contenido = divParaImprimir.innerHTML;
        var ventanaImpresion = window.open('', '_blank', 'height=400,width=800');
    
        ventanaImpresion.document.write(`
            <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Editor de Canciones</title>
                    <link rel="stylesheet" href="estilos.css">
                    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
                    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
                    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
                </head>
                <body>
                    ${contenido}
                </body>
            </html>`
        );
    
        ventanaImpresion.document.close();
        ventanaImpresion.focus();
    
        ventanaImpresion.onload = function() {
            ventanaImpresion.print();
            ventanaImpresion.close();
        };
    }
    



    $(document).click(function (e) {
        if (!$(e.target).is('.notas-div, #contenedorFiltroNotas, .nota')) {
            contenedorFiltroNotas.hide();
        }
    });
});


