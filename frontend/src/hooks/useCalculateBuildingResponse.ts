
interface BuildingResponseParameter {
    width: number,
    height: number,
    depth: number,
    mean_speed: number,
    initial_frequency: number,
    final_frequency: number,
    delta_frequency: number,
}

interface VandWResult {
    v1: number;
    w1: number;
    v2: number;
    w2: number;
    v3: number;
    w3: number;
}

export function GenerateFrequencies(initial_frequency: number, final_frequency: number, delta_frequency: number) : number[]{

    const frequencies : number[] = [];
    let current : number = initial_frequency;

    while (current <= final_frequency) {

        frequencies.push(current);
        current += delta_frequency;
    }

    return frequencies;
}

export function useCalculateBuildingResponse({width, height, depth, mean_speed, initial_frequency, final_frequency, delta_frequency} : BuildingResponseParameter){
    return width*height*depth*mean_speed*initial_frequency*final_frequency*delta_frequency;

}

function CalculateK(index : number, numbers: number[][], alpha_bd: number, alpha_h: number) : number{
    return numbers[index][0] * Math.pow(alpha_bd, numbers[index][1]) + numbers[index][2]*alpha_h**numbers[index][3] + numbers[index][4];

}

function CalculateVandW( numbers: number[][], alpha_bd: number, IH: number) : VandWResult{
    const v1: number = numbers[0][0]*((alpha_bd)**numbers[0][1]-(alpha_bd)**numbers[0][2])
    const w1: number = numbers[1][0]*(alpha_bd)**numbers[1][1] + numbers[1][2];
    const v2: number = numbers[2][0]*IH*(alpha_bd)**numbers[2][1] + numbers[2][2];
    const w2: number = numbers[3][0]*Math.sqrt(IH);
    const v3: number = numbers[4][0]*(alpha_bd)**numbers[4][1] + numbers[4][2];
    const w3: number = numbers[5][0]*(alpha_bd)**numbers[5][1] + numbers[5][2];

    return {v1, w1, v2, w2, v3, w3}

}

function CalculateFB(numbers: number[][], number_index: number, frequencies: number[]) : number[]{
    return frequencies.map(frequency => {
        const [ c1, c2, c3, c4] = numbers[number_index];
        const c5 : number = (number_index == 6)?c1:numbers[number_index][4]
        return c1*frequency/(1+c2*(c5*frequency)**c3)**c4;
    })
}

function CalculateFV(fs: number[], v2: number, v3:number): number[] {

    return fs.map(frequency => {
        return 1/(v2*Math.sqrt(2*Math.PI))*Math.exp(-0.5*((Math.log(frequency/v3)+0.5*v2**2)/v2)**2)
    })

}

function CalculateFW(frequencies: number[], w2: number, w3: number): number[] {
    return frequencies.map(frequency => {
        return 1/(w2*Math.sqrt(2*Math.PI))*Math.exp(-0.5*((Math.log(frequency/w3)+0.5*w2**2)/w2)**2)
    })
}

function CreateDiagonalMatrix(size: number, value: number): number[][]{

    const matrix = []
    for (let i = 0; i < size; i++){
        matrix.push(new Array(size).fill(0))
        matrix[i][i] = value
    }
    return matrix

}

function CreateDiagonalMatrixFromArray(arr: number[]): number[][]{
    const matrix: number[][] = []
    for (let i = 0; i < arr.length; i++) {
         matrix.push(new Array(arr.length).fill(0))
        matrix[i][i] = arr[i]
    }
    return matrix;
}

function ExtractDiagonalArrayFromMatrix(matrix: number[][]){
    const arr : number[] = []
    for (let i=0; i < matrix.length; i++ ){
        arr.push(matrix[i][i])
    }
    return arr
}

export function CalculateAcrossPsdResponse(width:number, height:number, depth:number, frequencies : number[]) : number[] {
    const alpha_bd: number = width / depth;
    const alpha_h: number = height / (Math.sqrt(width * depth));

    let numbers: number[][] | null = null;

    if (alpha_h < 1) {
        numbers = [

            [0.03, -5.84, 0.008, 0.22, -0.006],
            [0.06, -0.05, 0.28, 0.07, -0.25],
            [0.3, 1.19, -0.89, -1.12, 1.70],
            [-5.20, -6.30, -0.07, 0.97, 3.16]
        ]
    } else if ((alpha_h >= 1) && (alpha_h < 3) && (alpha_bd < 2.5)) {
        numbers = [
            [0.01, -5.8, 0.005, -3.2, 0.004],
            [-0.45, -0.27, -1.02, -0.04, 1.51],
            [0.22, -9.81, 1.14, -3.22, 0.60],
            [3.19, -0.05, 9.66, -0.08, -10.34]
        ]
    } else if ((alpha_h >= 1) && (alpha_h < 3) && (alpha_bd >= 2.5)) {
        numbers = [
            [0.003, -0.58, 0.000, 1.35, -0.001],
            [0.000, 6.83, -2.19, 0.000, 2.29],
            [0.32, 0.31, -0.73, 0.11, 0.76],
            [-1.1, 0.07, -0.013, 2.8, 4.65]
        ]
    } else if ((alpha_h >= 3) && (alpha_bd < 2.5)) {
        numbers = [
            [0.016, -1.24, 8.60, -8.56, -0.005],
            [-1.00, -0.02, 0.09, -1.8, 1.08],
            [-0.037, -8.28, -0.5, -0.08, -0.10],
            [0.38, 0.33, 7.03, -3.17, 1.41]
        ]
    } else if ((alpha_h >= 3) && (alpha_bd >= 2.5)) {
        numbers = [
            [0.001, -0.625, 0.000, 1.230, 0.000],
            [0.000, 7.71, -2.19, -0.012, 2.25],
            [0.39, 0.68, -0.85, 0.045, 0.69],
            [-1.4, 0.5, -0.00, 2.9, 4.96]
        ]
    }

    if (!numbers) {
        throw new Error("Numbers is Null in the across psd response calculation");
    }

    const K1: number = CalculateK(0, numbers, alpha_bd, alpha_h)
    const K2: number = CalculateK(1, numbers, alpha_bd, alpha_h);
    const K3: number = CalculateK(2, numbers, alpha_bd, alpha_h);
    const K4: number = CalculateK(3, numbers, alpha_bd, alpha_h);

    const across_psd: number[] = frequencies.map(frequency => {
        return K1 * (frequency / K2) ** (K4) / (((1 - (frequency / K2) ** 2) ** 2) + K3 ** 2 * (frequency / K2) ** 2)
    })

    return across_psd
}

export function CalculateTorsionPsdResponse(width:number, height:number, depth:number, mean_speed:number, frequencies : number[]) : number[] {
    const alpha_bd: number = width / depth;
    const alpha_h: number = height / (Math.sqrt(width * depth));
    const EgI: number = 1;
    const Ir: number = 0.1*(height/350)**(-0.15-0.05);
    const IH: number = Ir * EgI;
    const f_non_norm : number[] = frequencies.map(frequency => {
        return frequency*mean_speed/width;
    })
    let numbers : number[][] | null = null;
    let torsion_psd : number[] | null = null;
    if (alpha_h < 1) {

        numbers = [
            [ -17.2, -10,  0.6, 0.0, 0.0],
            [ 7.0,    0.0, 0.0, 0.0, 0.0],
            [0.002, 0.0, 0.002, 0.0, 0.0],
            [0.3, 0.36, 1.8, 3.5, 4.2]
        ]


        const w1: number = numbers[0][0] * alpha_bd**numbers[0][1] + numbers[0][2];
        const w2: number = numbers[1][0]*Math.sqrt(IH);
        const w3: number = numbers[2][0]*alpha_bd**numbers[2][1] + numbers[2][2];


        // const FB: number[] = f_non_norm.map(frequency => {
        //     const [ c1, c2, c3, c4, c5] = numbers![3];
        //     return c1*frequency/(1+c2*(c5*frequency)**c3)**c4;
        // })
        const FB: number[] = CalculateFB(numbers, 3, f_non_norm)

        // const FW: number[] = f_non_norm.map(frequency => {
        //     return 1/(w2*Math.sqrt(2*Math.PI))*Math.exp(-0.5*((Math.log(frequency/w3)+0.5*w2**2)/w2)**2)
        // })

        const FW: number[] = CalculateFW(f_non_norm, w2, w3)

        torsion_psd = FB.map((value, index) => {
            return 0.02*value + w1*FW[index]
        })




    }

    else if (alpha_h >= 1 && alpha_h < 3) {

        numbers = [
            [-0.38, -0.5, 0, 0, 0],
            [0.1, -0.5, 0, 0, 0],
            [0.56, 1, 0, 0, 0],
            [5.5, 0, 0, 0, 0],
            [0.8, 0.2, 0, 0, 0],
            [0.2, 0.3, 0, 0, 0],
            [18, 0.46, 1.8, 2.3, 8]
        ]

        const fs: number[] = f_non_norm.map(frequency => {
            return 7.3*frequency*width*(1 + 0.38*alpha_bd**(-1.5)**0.89/mean_speed)
        })

        const {v1, v2, v3, w1, w2, w3} = CalculateVandW(numbers, alpha_bd, IH)

        // const FB: number[] = f_non_norm.map(frequency => {
        //     const [ c1, c2, c3, c4, c5] = numbers![6];
        //     return c1*frequency/(1+c2*(c5*frequency)**c3)**c4;
        // })

        const FB: number[] = CalculateFB(numbers, 6, f_non_norm)
        const FV: number[] = CalculateFV(fs, v2, v3)
        const FW: number[] = CalculateFW(f_non_norm, w2, w3)

        torsion_psd = FB.map((FB_value, index)=> {
            return (0.035*FB_value + v1*FV[index] + w1*FW[index])*0.05
        })

    }
    else if (alpha_h >= 3){
        numbers = [
            [-2.0, -2, -1.0, 0],
            [0.04, 0.5, 0, 0],
            [0.5, 1, 0, 0],
            [1.75, 0, 0, 0],
            [0.8, 0.2, 0, 0],
            [0.24, 0.4, 0, 0],
            [18, 0.46, 0.9, 5]
        ]
        const fs: number[] = f_non_norm.map(frequency => {
            return 8.3*frequency*width*(1 + 0.38*alpha_bd**(-1.5))**0.89/mean_speed
        })

        const {v1, v2, v3, w1, w2, w3} = CalculateVandW(numbers, alpha_bd, IH);

        const FB: number[] = CalculateFB(numbers, 6, frequencies)
        const FV: number[] = CalculateFV(fs, v2, v3)
        const FW: number[] = CalculateFW(frequencies, w2, w3)



        torsion_psd = FB.map((FB_value, index)=>{
            return (0.8*FB_value + v1*FV[index] + w1*FW[index])*(0.8*alpha_bd/alpha_h)**2
        })

    }

    if (!torsion_psd){
        throw new Error("Torsion PSD value can not be NULL")
    }

    return torsion_psd;

}

export function CalculateFD(width: number, height: number, depth: number, mean_speed: number, Tone:number, totalFloors:number, damping:number, frequencies: number[], across_psds: number[], torsion_psds: number[]) : number[]{
    const f_eqns: number[] = frequencies.map(frequency => {
        return frequency*mean_speed/width;
    })
    // const T1 = 6.127169106;
    const story_m: number = 150*(width*height*depth)/totalFloors
    const mass: number[] = [story_m, story_m, story_m*(width**2 + depth**2)/12]
    let Nmodes: number = 3;
    const z = CreateDiagonalMatrix(Nmodes, damping)
    const omega = CreateDiagonalMatrix(Nmodes, 2*Math.PI/Tone)
    const mx: number[] = new Array(totalFloors).fill(mass[0]);
    const my: number[] = new Array(totalFloors).fill(mass[1]);
    const mz: number[] = new Array(totalFloors).fill(mass[2]);
    const M: number[][] = CreateDiagonalMatrixFromArray([...mx, ...my, ...mz])

    const phi_linear: number[] = Array.from({length: totalFloors}, (_,i)=>{
        let start = Math.round(height / totalFloors)
        const val = start + i * (height - start) / (totalFloors - 1);
        return val/height;
    })

    const psd_Proposed_x: number[] = across_psds.map((across_psd, index) => {
        return across_psd * (0.5*1.2929*mean_speed**2*width*height**2)**2/f_eqns[index];
    })

    // console.log("Psd proposed x", psd_Proposed_x)

    const psd_Proposed_t: number[] = torsion_psds.map((torsion_psd, index) => {
        return torsion_psd * (0.5*1.2929*mean_speed**2*width*depth**2)**2/f_eqns[index];
    })

    console.log(psd_Proposed_t[0])
    // console.log("Psd proposed t", psd_Proposed_t)
    const omegas: number[] = f_eqns.map(frequency => 2*Math.PI*frequency)

    Nmodes = omegas.length;

    const mass_per_h_init: number[] = ExtractDiagonalArrayFromMatrix(M)
    const mass_per_h: number[] = [mass_per_h_init[0], mass_per_h_init[totalFloors], mass_per_h_init[2*totalFloors]];
    // console.log(mass_per_h)
    const omega_o : number[] = ExtractDiagonalArrayFromMatrix(omega)

    const zeta: number[] = ExtractDiagonalArrayFromMatrix(z)

    const sum_phi_sq: number = phi_linear.reduce((total, val) => total + val**2, 0)

    const mass_gen: number[] = mass_per_h.map(mh => mh*sum_phi_sq)

    const multiplier_for_Eqs:number[][] = Array.from(
        {length: frequencies.length}, ()=>[0,0,0]
    )
    const multiplier_bg_for_Eqs:number[][] = Array.from(
        {length: frequencies.length}, ()=>[0,0,0]
    )
    // console.log("Frequencies length is ", frequencies.length)
    // console.log("MBE",multiplier_for_Eqs)
    // console.log("Mass gen", mass_gen)
    // return 3
    // return 3
    for (let i=0; i< 3; i++) {
        let beta: number[] = omegas.map(o => o/omega_o[i])
        // console.log("Beta ",beta)
        let chi_sq: number[] = beta.map((b_value)=> {
            return (1-b_value**2)**2 + 4*zeta[i]**2*b_value**2
        })
        // console.log("Chi", chi_sq)

        if (i == 2){

            const normal_values: number[] = chi_sq.map(chi_sq_value => 1/(omega_o[i]**4*mass_gen[i]**2*chi_sq_value))
            // console.log("Normal Values is", normal_values)
            // return 4
            for (let index = 0; index < normal_values.length; index++) {
                multiplier_for_Eqs[index][i] = normal_values[index]
            }
            const big_value: number = 1/(omega_o[i]**4*mass_gen[i]**2)
            for (let index = 0; index < normal_values.length; index++) {
                multiplier_bg_for_Eqs[index][i] = big_value
            }

        }
        else {
            const normal_values: number[] = chi_sq.map(chi_sq_value => 1/(omega_o[i]**4*mass_gen[i]**2*height**2*chi_sq_value))
            for (let index = 0; index < normal_values.length; index++) {
                multiplier_for_Eqs[index][i] = normal_values[index]
            }
            const big_value: number = 1/(omega_o[i]**4*mass_gen[i]**2*height**2)
            for (let index = 0; index < normal_values.length; index++) {
                multiplier_bg_for_Eqs[index][i] = big_value
            }
        }

    }


    // return 4;
    const Sqz_proposed: number[] = psd_Proposed_t.map((value, index)=>{
        return value * multiplier_for_Eqs[index][2]
    })
    const Sqz_bg_proposed: number[] = psd_Proposed_t.map((value, index)=>{
        return value * multiplier_bg_for_Eqs[index][2]
    })

    const Sqz_proposed_r = Sqz_proposed.map((value, index)=> Math.max(value - Sqz_bg_proposed[index],0))
    const diff_frequencies: number[] = [];
    const intermediate_area: number[] = [];
    const trap:number[] = []
    for (let i=0; i < f_eqns.length; i++){
        intermediate_area.push((2*Math.PI*f_eqns[i])**2*Sqz_proposed_r[i])
    }

    for (let i=1; i< f_eqns.length; i++) {
        diff_frequencies.push((f_eqns[i] - f_eqns[i-1])/2)
    }
    for (let i=1; i < intermediate_area.length; i++) {
        trap.push(intermediate_area[i] + intermediate_area[i-1])
    }

    const rms_vr_proposed = Math.sqrt(trap.map((value, index)=>value*diff_frequencies[index]).reduce((total, val) => total + val, 0))*1000
    const Sqy_Proposed = psd_Proposed_x.map((value, index)=> value*multiplier_for_Eqs[index][1])
    const Sqy_Proposed_bg = psd_Proposed_x.map((value, index)=> value*multiplier_bg_for_Eqs[index][1])

    const Sqy_Proposed_r = Sqy_Proposed.map((value, index)=> Math.max(0, value - Sqy_Proposed_bg[index]))

    const intermediate_yarea: number[] = []
    for (let i=0; i < f_eqns.length; i++){
        intermediate_yarea.push((2*Math.PI*f_eqns[i])**4*Sqy_Proposed_r[i])
    }
    const trap_y: number[] = []
    for (let i=1; i < intermediate_area.length; i++) {
        trap_y.push(intermediate_yarea[i] + intermediate_yarea[i-1])
    }

    const rms_a_r_Proposed = Math.sqrt(trap_y.map((value, index)=>value*diff_frequencies[index]).reduce((total, val) => total + val, 0))*1000/9.81


    return [rms_vr_proposed,rms_a_r_Proposed]



}