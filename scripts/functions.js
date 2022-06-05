const arctan = Math.atan,
    cos = Math.cos,
    sqrt = Math.sqrt,
    max = Math.max,
    min = Math.min;

const phi_y = .8;

const deg = (radians) => radians * 180 / Math.PI;

function min_thickness(D_a) {
    if (D_a <= 25) {
        return 1.0;
    }
    if (D_a <= 57) {
        return 1.5;
    }
    if (D_a <= 114) {
        return 2.0;
    }
    if (D_a <= 219) {
        return 2.5;
    }
    if (D_a <= 325) {
        return 3.0;
    }
    if (D_a <= 377) {
        return 3.5;
    }
    if (D_a > 426) {
        return 4.0;
    }
    // интерполяция для D_a в промежутке(377, 426]
    return (4.0 - 3.5) / (426 - 377) * (D_a - 377) + 3.5;
}

function get_sigma_dopusk(metal, metal_grade, t) {
    if (!metal || !metal_grade) {
        throw `${(!metal) ? 'Метал' : 'Тип метала'} не задан`
    }
    let sigmas = sigma_dopusk_table[metal][metal_grade];
    let temps = sigma_dopusk_table[metal]['Температура'];

    // обрать массив на NaN если они есть
    let first_nan = sigmas.findIndex(Number.isNaN);
    if (first_nan != -1) {
        sigmas = sigmas.slice(0, first_nan)
        temps = temps.slice(0, first_nan)
    }

    // если температура меньше/больше минимума/максимума
    // то выдаем их
    if (t < temps[0]) return sigmas[0];
    if (t > temps[temps.length - 1]) return sigmas[temps.length - 1];

    // иначе интерполяция
    for (let i = 1; i < temps.length - 1; i++) {
        if (temps[i + 1] >= t && temps[i] <= t) {
            return (temps[i + 1] - t) / (temps[i + 1] - temps[i]) * sigmas[i] +
                (t - temps[i]) / (temps[i + 1] - temps[i]) * sigmas[i + 1];
        }
    }
}

function get_k_i(D_a, R, s_R, phi_y, tap_type) {
    if (['гнутый', 'крутоизогнутый'].includes(tap_type)) {
        if (R / D_a <= 1) {
            return 1.3;
        }
        else if (R / D_a >= 2) {
            return 1;
        }
        else {
            return 1 + (1.3 - 1) / (1 - 2) * (1 - R / D_a);
        }
    }
    else if (['секторный'].includes(tap_type)) {
        return (4 * R / (D_a - s_R) - 1) / (4 * R / (D_a - s_R) - 2)
    }
    else {
        return (4 * R / (D_a - s_R) - 1) / (4 * R / (D_a - s_R) - 2) * 1 / phi_y
    }
}

function pipe_thickness({ D_a, c, p, metal, metal_grade, t }, sols = false, phi_y_1 = false) {

    let s = min_thickness(D_a) + c;
    let sigma_dopusk = get_sigma_dopusk(metal, metal_grade, t);

    let s_R = p * D_a / (2 * phi_y * sigma_dopusk + p);
    if (!phi_y_1) s_R = p * D_a / (2 * sigma_dopusk + p);

    s = max(s, s_R + c);

    let p_raschet = 2 * phi_y * sigma_dopusk * (s - c) / (D_a - (s - c));
    if (!phi_y_1) p_raschet = 2 * sigma_dopusk * (s - c) / (D_a - (s - c));

    if (!sols) return { s, p_raschet };

    return { pipe_D_a: format(D_a), pipe_s_R: format(s_R), pipe_s: format(s), pipe_p: format(p_raschet) }
}

function tap_thickness({ tap_type, D_a, R, c, p, metal, metal_grade, t }, sols = false) {

    let s = min_thickness(D_a) + c;
    let sigma_dopusk = get_sigma_dopusk(metal, metal_grade, t);

    let { s: s_R } = pipe_thickness({ D_a, c, p, metal, metal_grade, t }, false, true);

    let k_i = get_k_i(D_a, R, s_R, phi_y, tap_type);

    let s_RO = s_R * k_i;

    s = max(s, s_RO + c);

    let p_raschet = 2 * phi_y * (s - c) * sigma_dopusk / (D_a * k_i - (s - c));

    if (!sols) return { s, p_raschet };

    return { tap_D_a: format(D_a), tap_k_i: format(k_i), tap_R: format(R), tap_s_RO: format(s_RO), tap_s: format(s), tap_p: format(p_raschet), tap_type: formatType(tap_type) }
}

function transiter_thickness({ transiter_type, D_1, D_2, l, c, p, metal, metal_grade, t }, sols = false) {
    let k;
    if (transiter_type == 'эксцентрический') {
        k = 1;
    }
    if (transiter_type == 'концентрический') {
        k = 2;
    }

    let alpha = arctan((D_1 - D_2) / (k * l));

    let sigma_dopusk = get_sigma_dopusk(metal, metal_grade, t);

    let s_1 = min_thickness(D_1) + c;
    let s_2 = min_thickness(D_2) + c;

    let s_RP1 = p * D_1 / (2 * phi_y * sigma_dopusk * cos(alpha) + p);
    let s_RP2 = p * D_2 / (2 * phi_y * sigma_dopusk * cos(alpha) + p);

    s_1 = max(s_1, s_RP1 + c);
    s_2 = max(s_2, s_RP2 + c);

    p_raschet = 2 * phi_y * sigma_dopusk * cos(alpha) * (s_2 - c) / (D_1 - (s_1 - c))

    if (!sols) return { 's': [s_1, s_2], p_raschet };

    return { transiter_D_1: format(D_1), transiter_D_2: format(D_2), transiter_k: k, transiter_alpha: format(deg(alpha)), transiter_s_RP1: format(s_RP1), transiter_s_RP2: format(s_RP2), transiter_s_1: format(s_1), transiter_s_2: format(s_2), transiter_p: format(p_raschet), transiter_type: formatType(transiter_type) }
}

function tee_thickness({ tee_type, D_a, d, c, p, metal, metal_grade, t }, sols = false) {
    let s = min_thickness(D_a) + c;
    let sigma_dopusk = get_sigma_dopusk(metal, metal_grade, t);

    let sum_A = 0;
    let denom = sqrt((D_a - s) * (s));
    let phi_d = 2 / (1.75 + d / denom) * (1 + sum_A / (2 * (s) * denom));

    let s_RM = p * D_a / (2 * min(phi_d, phi_y) * sigma_dopusk + p);
    let s_R = p * d / (2 * phi_y * sigma_dopusk + p);

    s = max(s, s_R + c, s_RM + c);

    let p_raschet = 2 * sigma_dopusk * min(phi_d, phi_y) * (s - c) / (D_a - (s - c));

    if (!sols) return { s, p_raschet };

    return { tee_D_a: format(D_a), tee_s_RM: format(s_RM), tee_s: format(s), tee_p: format(p_raschet), tee_type: formatType(tee_type) }
}

function plug_thickness({ plug_type, D_a, d, r_i, D, D_b, b, h, c, p, metal, metal_grade, t }, sols = false) {
    let sigma_dopusk = get_sigma_dopusk(metal, metal_grade, t);

    let m_0 = (d == 0) ? 1 : 1 / sqrt(1 + d / D + (d / D) * (d / D));
    let phi_L = .8;

    let p_raschet, s_R3, s;

    if (plug_type == 'плоская круглая внутритрубная') {
        s = min_thickness(D) + c;
        s_R3 = .53 / m_0 * D * sqrt(p / (sigma_dopusk * phi_L));
        s = max(s, s_R3 + c);
        p_raschet = (m_0 * m_0 * (s - c) * (s - c) / (.28 * D * D)) * phi_L * sigma_dopusk;
    }
    else if (plug_type == 'плоская круглая торцевая') {
        s = min_thickness(D) + c;
        s_R3 = .35 / m_0 * (D - r_i) * sqrt(p / (sigma_dopusk * phi_y));
        s = max(s, s_R3 + c);
        p_raschet = (m_0 * m_0 * (s - c) * (s - c) / (.12 * (D - r_i) * (D - r_i))) * phi_y * sigma_dopusk;
    }
    else if (plug_type == 'плоская межфланцевая') {
        s = min_thickness(D) + c;
        s_R3 = 0.41 * (D + b) * sqrt(p / sigma_dopusk);
        s = max(s, s_R3 + c);
        p_raschet = (s - c) * (s - c) / (.17 * (D + b) * (D + b)) * sigma_dopusk;
    }
    else if (plug_type == 'плоская фланцевая') {
        s = min_thickness(D_b) + c;
        s_R3 = .5 * D_b * sqrt(p / sigma_dopusk);
        s = max(s, s_R3 + c);
        p_raschet = (s - c) * (s - c) / (.25 * D_b * D_b) * sigma_dopusk;
    }
    else if (plug_type == 'эллиптическая без центрального отверстия') {
        s = min_thickness(D_a) + c;
        s_R3 = p * D_a / (4 * sigma_dopusk * phi_y + p) * D_a / (2 * h);

        let { s: s_R } = pipe_thickness({ D_a, c, p, metal, metal_grade, t });
        s_R3 = (phi_y == 1) ? max(s_R, s_R3) : s_R3;

        s = max(s, s_R3 + c);
        p_raschet = 8 * (s - c) * h / (D_a * D_a - 2 * h * (s - c)) * phi_y * sigma_dopusk;
    }
    else if (plug_type == 'эллиптическая c центральным отверстием') {
        s = min_thickness(D_a) + c;

        let sum_A = 0;
        let denom = sqrt((D_a - s) * (s));
        let phi_d = 2 / (1.75 + d / denom) * (1 + sum_A / (2 * (s) * denom));

        s_R3 = p * D_a / (4 * min(phi_y, phi_d) * sigma_dopusk + p) * D_a / (2 * h);

        s = max(s, s_R3 + c);
        p_raschet = 8 * (s - c) * h / (D_a * D_a - 2 * h * (s - c)) * min(phi_y, phi_d) * sigma_dopusk;
    }

    if (!sols) return { s, p_raschet };

    return { plug_D_a: format(D_a), plug_D_b: format(D_b), plug_D: format(D), plug_b: format(b), plug_h: format(h), plug_r_i: format(r_i), plug_s_R3: format(s_R3), plug_s: format(s), plug_p: format(p_raschet), plug_type: formatType(plug_type) }
}