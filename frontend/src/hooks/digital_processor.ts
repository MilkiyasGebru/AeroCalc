import { fft } from "fft-js";
//
// const U_H_expt: number = 1;
// const Height : number = 33.7;
// const Width: number = 42;
// const Depth: number = 30;
// const f_expt: number =0.183;

function nextPow2(n: number): number {
    return 2 ** Math.ceil(Math.log2(n));
}

function zeroPad(arr: number[], N: number): number[] {
    return arr.concat(Array(N - arr.length).fill(0));
}


// export function hamming(N: number): number[] {
//     if (N === 1) return [1];
//     return Array.from({ length: N }, (_, n) => {
//         return 0.54 - 0.46 * Math.cos((2 * Math.PI * n) / (N - 1));
//     });
// }

function hamming(N: number) {
    return Array.from({ length: N }, (_, n) =>
        0.54 - 0.46 * Math.cos((2 * Math.PI * n) / N)
    );
}

function pwelchMatlab(x: number[], fs: number, window:number[]) {

    const L = window.length;
    const noverlap = Math.floor(L / 2);
    const step = L - noverlap;

    const nfft = nextPow2(L); // ✅ REQUIRED for fft-js
    const half = Math.floor(nfft / 2);

    const U = window.reduce((s, w) => s + w * w, 0);

    const psd = Array(half + 1).fill(0);
    let segments = 0;

    for (let i = 0; i + L <= x.length; i += step) {
        let segment = x
            .slice(i, i + L)
            .map((v, n) => v * window[n]);

        // ✅ zero-pad to power of 2
        segment = zeroPad(segment, nfft);

        const X = fft(segment);

        for (let k = 0; k <= half; k++) {
            let mag2 = X[k][0] ** 2 + X[k][1] ** 2;
            if (k !== 0 && k !== half){ mag2 *= 2;}
            psd[k] += mag2;
        }

        segments++;
    }

    for (let k = 0; k <= half; k++) {
        psd[k] /= (segments * fs  * U);
    }

    const freqs = psd.map((_, k) => (k * fs) / nfft);
    console.log("PSD in pwelch", psd)
    return { psd, freqs };
}
// const MX: number[] = [1, 2, 3, 4]

function mean(arr: number[]): number {
    return arr.reduce((sum, x) => sum + x, 0) / arr.length;
}

// const meanMx : number = mean(MX)
// const window = hamming(3000);
// const mxZeroMean = MX.map(x => 1000 * (x - meanMx));
// export const { psd: psd_across, freqs: f_across } =
//     pwelchMatlab(mxZeroMean, f_expt, window);

function normalizePsd(psd_across: number[], f_across: number[], width: number, height: number, UH : number){

    const f_normalized_across: number[] = f_across.map(f => {
        return f*width/UH
    });
    console.log("The normalize f across has a length of ",f_normalized_across.length)
    const psd_across_normalized = f_across.map((f,index)=>{
        return psd_across[index]*f/(0.5*1.2929*UH**2*width*height**2)**2
    })
    return psd_across_normalized

}
// const psd_across_normalized: number[] =normalizePsd(psd_across, f_across, Width, Height, 1)

export function calculate_experimental_psd_normalized(M: number[], width_depth: number, height: number, UH:number, f_expt: number): number[]{
    console.log("Original M is ", M)
    const meanM : number = mean(M)
    console.log("Mean is ",meanM)
    const window = hamming(3000);
    console.log("Window", window)
    const mZeroMean = M.map(x => 1000 * (x - meanM));
    console.log("Zero Mean", mZeroMean)
    const { psd, freqs } =
        pwelchMatlab(mZeroMean, f_expt, window);
    console.log("PSD is ",psd)
    return normalizePsd(psd, freqs, width_depth, height, UH);
}




