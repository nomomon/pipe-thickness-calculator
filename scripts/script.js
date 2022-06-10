function format(n, d = 3) {
    return (Math.round(n * Math.pow(10, d)) / Math.pow(10, d)).toFixed(3);
}
function formatType(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function solve_pipe() {
    let metal = $('#metal').value,
        metal_grade = $('#metal_grade').value,
        c = Number($('#c').value),
        p = Number($('#p').value),
        t = Number($('#t').value),
        phi_y = Number($('#phi_y').value),
        D_a = Number($('#pipe_D_a').value);

    const { s, p_raschet } = pipe_thickness({ D_a, c, p, metal, metal_grade, t, phi_y });

    $('#pipe_s').innerText = format(s);
    $('#pipe_p').innerText = format(p_raschet);
}

function solve_tap() {
    let metal = $('#metal').value,
        metal_grade = $('#metal_grade').value,
        tap_type = $('#tap_type').value,
        c = Number($('#c').value),
        p = Number($('#p').value),
        t = Number($('#t').value),
        phi_y = Number($('#phi_y').value),
        R = Number($('#tap_R').value),
        D_a = Number($('#tap_D_a').value);

    const { s, p_raschet } = tap_thickness({ tap_type, D_a, R, c, p, metal, metal_grade, t, phi_y });

    $('#tap_s').innerText = format(s);
    $('#tap_p').innerText = format(p_raschet);
}

function solve_transiter() {
    let metal = $('#metal').value,
        metal_grade = $('#metal_grade').value,
        transiter_type = $('#transiter_type').value,
        c = Number($('#c').value),
        p = Number($('#p').value),
        t = Number($('#t').value),
        phi_y = Number($('#phi_y').value),
        l = Number($('#transiter_l').value),
        D_1 = Number($('#transiter_D_1').value),
        D_2 = Number($('#transiter_D_2').value);

    const { s, p_raschet } = transiter_thickness({ transiter_type, D_1, D_2, l, c, p, metal, metal_grade, t, phi_y });

    $('#transiter_s').innerText = `бол. ${format(s[0])}\nмен. ${format(s[1])}`;
    $('#transiter_p').innerText = format(p_raschet);
}

function solve_tee() {
    let metal = $('#metal').value,
        metal_grade = $('#metal_grade').value,
        tee_type = $('#tee_type').value,
        c = Number($('#c').value),
        p = Number($('#p').value),
        t = Number($('#t').value),
        phi_y = Number($('#phi_y').value),
        r_i = Number($('#tee_r_i').value),
        d = Number($('#tee_d').value),
        D_a = Number($('#tee_D_a').value);

    const { s, p_raschet } = tee_thickness({ tee_type, D_a, d, c, p, metal, metal_grade, t, phi_y });

    $('#tee_s').innerText = format(s);
    $('#tee_p').innerText = format(p_raschet);
}

function solve_plug() {
    let metal = $('#metal').value,
        metal_grade = $('#metal_grade').value,
        plug_type = $('#plug_type').value,
        c = Number($('#c').value),
        p = Number($('#p').value),
        t = Number($('#t').value),
        phi_y = Number($('#phi_y').value),
        d = Number($('#plug_d').value),
        r_i = Number($('#plug_r_i').value),
        D = Number($('#plug_D').value),
        D_b = Number($('#plug_D_b').value),
        b = Number($('#plug_b').value),
        h = Number($('#plug_h').value),
        D_a = Number($('#plug_D_a').value);

    const { s, p_raschet } = plug_thickness({ plug_type, D_a, d, r_i, D, D_b, b, h, c, p, metal, metal_grade, t, phi_y });

    $('#plug_s').innerText = format(s);
    $('#plug_p').innerText = format(p_raschet);
}

function solve() {
    try {
        solve_pipe();
    }
    catch (e) {
        console.error('не получилось решить трубопровод\n', e)
    }
    try {
        solve_tap();
    }
    catch (e) {
        console.error('не получилось решить отвод\n', e)
    }
    try {
        solve_transiter();
    }
    catch (e) {
        console.error('не получилось решить переход\n', e)
    }
    try {
        solve_tee();
    }
    catch (e) {
        console.error('не получилось решить тройник\n', e)
    }
    try {
        solve_plug();
    }
    catch (e) {
        console.error('не получилось решить заглушку\n', e)
    }
}

function get_sol_params() {
    metal = $('#metal').value;
    metal_grade = $('#metal_grade').value;
    c = Number($('#c').value);
    p = Number($('#p').value);
    t = Number($('#t').value);
    phi_y = Number($('#phi_y').value);

    D_a = Number($('#pipe_D_a').value);

    const pipe = pipe_thickness({ D_a, c, p, metal, metal_grade, t, phi_y }, true);

    tap_type = $('#tap_type').value;
    R = Number($('#tap_R').value);
    D_a = Number($('#tap_D_a').value);

    const tap = tap_thickness({ tap_type, D_a, R, c, p, metal, metal_grade, t, phi_y }, true);

    transiter_type = $('#transiter_type').value;
    l = Number($('#transiter_l').value);
    D_1 = Number($('#transiter_D_1').value);
    D_2 = Number($('#transiter_D_2').value);

    const transiter = transiter_thickness({ transiter_type, D_1, D_2, l, c, p, metal, metal_grade, t, phi_y }, true);

    tee_type = $('#tee_type').value;
    r_i = Number($('#tee_r_i').value);
    d = Number($('#tee_d').value);
    D_a = Number($('#tee_D_a').value);

    const tee = tee_thickness({ tee_type, D_a, d, c, p, metal, metal_grade, t, phi_y }, true);

    d = Number($('#plug_d').value);
    r_i = Number($('#plug_r_i').value);
    D = Number($('#plug_D').value);
    D_b = Number($('#plug_D_b').value);
    b = Number($('#plug_b').value);
    h = Number($('#plug_h').value);
    D_a = Number($('#plug_D_a').value);

    const plug = plug_thickness({ plug_type, D_a, d, r_i, D, D_b, b, h, c, p, metal, metal_grade, t, phi_y }, true);

    return { metal, metal_grade, metal_gear: metal_grade, p, c, t, ...pipe, ...tap, ...transiter, ...tee, ...plug, sigma: get_sigma_dopusk(metal, metal_grade, t), phi_y }
}