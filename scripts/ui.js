function $(q) {
    return document.querySelector(q);
}
function $$(q) {
    return document.querySelectorAll(q);
}

[...$$('input[type=number]')].forEach(element => {
    element.min = 0;
    element.max = 10000;
    element.step = 0.01;
    element.oninput = function () {
        this.value = (!isNaN(this.value) && Math.abs(this.value) >= 0) ? Math.abs(this.value) : 0;
    };
});

[...$$('option')].forEach(element => {
    element.value = element.value.replace(/ +(?= )/g, '')
});

function clear() {
    [...$$('input[type=number]')].forEach(element => {
        element.value = '0';
    })
    update_sigma();
}
$("#clear").addEventListener('click', clear)

function correct_metals() {
    let possible_metals = Object.keys(sigma_dopusk_table);

    let html_options = possible_metals.map(el => `<option value="${el}">${el}</option>`).join('\n');
    $('#metal').innerHTML = html_options;
}
correct_metals();

function correct_metal_grades() {
    let possible_metal_grades = Object.keys(sigma_dopusk_table[$('#metal').value]);

    possible_metal_grades = possible_metal_grades.filter((el) => el.slice(0, 11) != 'Температура')

    let html_options = possible_metal_grades.map(el => `<option value="${el}">${el}</option>`).join('\n');
    $('#metal_grade').innerHTML = html_options;
}
$('#metal').addEventListener('change', correct_metal_grades);
correct_metal_grades();


function correct_tee() {
    [...$$('.tee_shtamp')].forEach(el => el.style.display = 'none')

    if ($('#tee_type').value == 'штампосварной') {
        [...$$('.tee_shtamp')].forEach(el => el.style.display = 'block')
    }
}
$('#tee_type').addEventListener('change', correct_tee);
correct_tee();


function correct_plug() {
    [...$$('.plug_correct')].forEach(el => el.style.display = 'none')

    if ($('#plug_type').value == 'плоская круглая внутритрубная') {
        [...$$('.plug_d')].forEach(el => el.style.display = 'block');
    }
    if ($('#plug_type').value == 'плоская круглая торцевая') {
        [...$$('.plug_torcevaya')].forEach(el => el.style.display = 'block');
        [...$$('.plug_d')].forEach(el => el.style.display = 'block')
    }
    if ($('#plug_type').value == 'плоская фланцевая') {
        [...$$('.plug_flancevaya')].forEach(el => el.style.display = 'block')
    }
    if ($('#plug_type').value == 'плоская межфланцевая') {
        [...$$('.plug_mezhflancevaya')].forEach(el => el.style.display = 'block')
    }

    if ($('#plug_type').value.search('эллиптическая') != -1) {
        [...$$('.plug_eleptic')].forEach(el => el.style.display = 'block')
    }
    if ($('#plug_type').value.search('плоская круглая') != -1 || $('#plug_type').value.search('меж') != -1) {
        [...$$('.plug_D')].forEach(el => el.style.display = 'block')
    }
}
$('#plug_type').addEventListener('change', correct_plug);
correct_plug();

function update_sigma() {
    $('#sigma_dopusk').value = get_sigma_dopusk(
        $('#metal').value,
        $('#metal_grade').value,
        Number($('#t').value)
    )
}
[$('#metal'), $('#metal_grade'), $('#t')].forEach(el => {
    el.addEventListener('change', update_sigma)
})
update_sigma()



$('#gost_open').addEventListener('click', () => {
    file_route = $('#GOST').value;
    let params = `scrollbars=no,resizable=yes,status=no,location=no,toolbar=no,menubar=no, width=1000,height=800,left=100,top=100`;
    window.open(file_route, 'newwindow', params)
})