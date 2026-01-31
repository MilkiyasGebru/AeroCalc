import { fft } from "fft-js";

function nextPow2(n: number): number {
    return 2 ** Math.ceil(Math.log2(n));
}

function zeroPad(arr: number[], N: number): number[] {
    return arr.concat(Array(N - arr.length).fill(0));
}


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

function mean(arr: number[]): number {
    return arr.reduce((sum, x) => sum + x, 0) / arr.length;
}

function normalizePsd(psd_across: number[], f_across: number[], width: number, height: number, UH : number): {
    "psd": number[],
    "normalizedFrequency": number[],
}{

    const f_normalized: number[] = f_across.map(f => {
        return f*width/UH
    });
    const psd_across_normalized = f_across.map((f,index)=>{
        return psd_across[index]*f/(0.5*1.2929*UH**2*width*height**2)**2
    })
    return {"psd": psd_across_normalized, "normalizedFrequency": f_normalized}

}

export function calculate_experimental_psd_normalized(M: number[], width_depth: number, height: number, UH:number, f_expt: number): {
    "psd": number[],
    "normalizedFrequency": number[],
}{
    const meanM : number = mean(M)
    const window = hamming(3000);
    const mZeroMean = M.map(x => 1000 * (x - meanM));
    const { psd, freqs } =
        pwelchMatlab(mZeroMean, f_expt, window);
    return normalizePsd(psd, freqs, width_depth, height, UH);
}




